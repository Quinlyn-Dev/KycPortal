using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using KYC.Core.Entities;
using KYC.Infrastructure.Data;
using KYC.Shared.DTOs;

namespace KYC.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ApprovalController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<ApprovalController> _logger;

    public ApprovalController(ApplicationDbContext context, ILogger<ApprovalController> logger)
    {
        _context = context;
        _logger = logger;
    }

    private int GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(userIdClaim, out var userId) ? userId : 0;
    }

    private string GetCurrentUserRole()
    {
        return User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value ?? "";
    }

    // Submit customer for approval (User role)
    [HttpPost("submit/{customerId}")]
    [Authorize(Roles = "User")]
    public async Task<IActionResult> SubmitForApproval(int customerId)
    {
        try
        {
            var customer = await _context.Customers.FindAsync(customerId);
            if (customer == null)
                return NotFound(new { message = "Customer tidak ditemukan" });

            if (customer.KYCStatus != "DRAFT")
                return BadRequest(new { message = "Customer sudah disubmit atau diproses" });

            var userId = GetCurrentUserId();
            customer.KYCStatus = "SUBMITTED";
            customer.SubmittedBy = userId;
            customer.SubmittedAt = DateTime.UtcNow;

            // Log to approval history
            var history = new ApprovalHistory
            {
                CustomerId = customerId,
                UserId = userId,
                Action = "SUBMIT",
                PreviousStatus = "DRAFT",
                NewStatus = "SUBMITTED",
                Comments = "Customer submitted for approval",
                CreatedAt = DateTime.UtcNow
            };
            _context.ApprovalHistories.Add(history);

            await _context.SaveChangesAsync();

            return Ok(new { message = "Customer berhasil disubmit untuk approval", customer });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error submitting customer for approval");
            return StatusCode(500, new { message = "Terjadi kesalahan" });
        }
    }

    // Get pending approvals for current manager
    [HttpGet("pending")]
    [Authorize(Roles = "Manager")]
    public async Task<IActionResult> GetPendingApprovals([FromQuery] int? divisionId = null)
    {
        try
        {
            var userId = GetCurrentUserId();
            var userApprovals = await _context.UserApprovals
                .Include(ua => ua.Division)
                .Where(ua => ua.UserId == userId && ua.IsActive)
                .ToListAsync();
            
            if (!userApprovals.Any())
                return BadRequest(new { message = "User tidak memiliki approval level untuk division manapun" });

            // Filter by divisionId if provided
            if (divisionId.HasValue)
            {
                userApprovals = userApprovals.Where(ua => ua.DivisionId == divisionId.Value).ToList();
                if (!userApprovals.Any())
                    return BadRequest(new { message = "User tidak memiliki approval level untuk division ini" });
            }

            var pendingCustomers = new List<object>();

            foreach (var userApproval in userApprovals)
            {
                var approvalLevel = userApproval.ApprovalLevel;
                var customers = await _context.Customers
                    .Include(c => c.Division)
                    .Include(c => c.SubmittedByUser)
                    .Include(c => c.ApprovedByLevel1User)
                    .Include(c => c.ApprovedByLevel2User)
                    .Include(c => c.ApprovedByLevel3User)
                    .Where(c => c.DivisionId == userApproval.DivisionId &&
                        ((approvalLevel == 1 && c.KYCStatus == "SUBMITTED") ||
                        (approvalLevel == 2 && c.KYCStatus == "APPROVED_L1" && c.RequiredApprovalLevels >= 2) ||
                        (approvalLevel == 3 && c.KYCStatus == "APPROVED_L2" && c.RequiredApprovalLevels >= 3)))
                    .ToListAsync();

                pendingCustomers.AddRange(customers.Select(c => new
                {
                    c.Id,
                    c.CustomerCode,
                    c.CustomerName,
                    c.Email,
                    c.PhoneNumber,
                    c.Address,
                    DivisionCode = c.Division.DivisionCode,
                    DivisionName = c.Division.DivisionName,
                    c.KYCStatus,
                    c.RequiredApprovalLevels,
                    CurrentApprovalLevel = approvalLevel,
                    SubmittedBy = c.SubmittedByUser?.FullName,
                    c.SubmittedAt,
                    ApprovedByLevel1 = c.ApprovedByLevel1User?.FullName,
                    c.ApprovedAtLevel1,
                    ApprovedByLevel2 = c.ApprovedByLevel2User?.FullName,
                    c.ApprovedAtLevel2
                }));
            }

            return Ok(pendingCustomers);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting pending approvals");
            return StatusCode(500, new { message = "Terjadi kesalahan" });
        }
    }

    // Approve customer
    [HttpPost("approve/{customerId}")]
    [Authorize(Roles = "Manager")]
    public async Task<IActionResult> ApproveCustomer(int customerId, [FromBody] ApprovalRequest request)
    {
        try
        {
            var customer = await _context.Customers
                .Include(c => c.Division)
                .FirstOrDefaultAsync(c => c.Id == customerId);
            if (customer == null)
                return NotFound(new { message = "Customer tidak ditemukan" });

            var userId = GetCurrentUserId();
            
            // Check if user has approval permission for this customer's division
            var userApproval = await _context.UserApprovals
                .FirstOrDefaultAsync(ua => ua.UserId == userId && 
                                          ua.DivisionId == customer.DivisionId && 
                                          ua.IsActive);
            
            if (userApproval == null)
                return BadRequest(new { message = $"User tidak memiliki approval level untuk division {customer.Division.DivisionName}" });

            var approvalLevel = userApproval.ApprovalLevel;
            var previousStatus = customer.KYCStatus;
            var newStatus = "";

            // Validate and update based on approval level
            switch (approvalLevel)
            {
                case 1:
                    if (customer.KYCStatus != "SUBMITTED")
                        return BadRequest(new { message = "Customer tidak dalam status SUBMITTED" });
                    
                    customer.ApprovedByLevel1 = userId;
                    customer.ApprovedAtLevel1 = DateTime.UtcNow;
                    newStatus = customer.RequiredApprovalLevels >= 2 ? "APPROVED_L1" : "READY_FOR_SAP";
                    break;

                case 2:
                    if (customer.KYCStatus != "APPROVED_L1")
                        return BadRequest(new { message = "Customer belum approved Level 1" });
                    if (customer.RequiredApprovalLevels < 2)
                        return BadRequest(new { message = "Customer tidak memerlukan approval Level 2" });
                    
                    customer.ApprovedByLevel2 = userId;
                    customer.ApprovedAtLevel2 = DateTime.UtcNow;
                    newStatus = customer.RequiredApprovalLevels >= 3 ? "APPROVED_L2" : "READY_FOR_SAP";
                    break;

                case 3:
                    if (customer.KYCStatus != "APPROVED_L2")
                        return BadRequest(new { message = "Customer belum approved Level 2" });
                    if (customer.RequiredApprovalLevels < 3)
                        return BadRequest(new { message = "Customer tidak memerlukan approval Level 3" });
                    
                    customer.ApprovedByLevel3 = userId;
                    customer.ApprovedAtLevel3 = DateTime.UtcNow;
                    newStatus = "READY_FOR_SAP";
                    break;

                default:
                    return BadRequest(new { message = "Invalid approval level" });
            }

            customer.KYCStatus = newStatus;

            // Log to approval history
            var history = new ApprovalHistory
            {
                CustomerId = customerId,
                UserId = userId,
                Action = $"APPROVE_L{approvalLevel}",
                PreviousStatus = previousStatus,
                NewStatus = newStatus,
                Comments = request.Comments ?? $"Approved by Manager Level {approvalLevel}",
                CreatedAt = DateTime.UtcNow
            };
            _context.ApprovalHistories.Add(history);

            await _context.SaveChangesAsync();

            _logger.LogInformation("Customer {CustomerId} approved by user {UserId} at level {Level}", customerId, userId, approvalLevel);

            // Return a lightweight DTO instead of the EF tracked entity to avoid serialization issues
            var result = new
            {
                message = $"Customer approved Level {approvalLevel}",
                customer = new
                {
                    customer.Id,
                    customer.CustomerCode,
                    customer.CustomerName,
                    customer.Email,
                    customer.KYCStatus,
                    customer.RequiredApprovalLevels,
                    customer.DivisionId,
                    customer.SubmittedAt,
                    customer.ApprovedAtLevel1,
                    customer.ApprovedAtLevel2,
                    customer.ApprovedAtLevel3
                }
            };

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error approving customer");
            return StatusCode(500, new { message = "Terjadi kesalahan" });
        }
    }

    // Reject customer
    [HttpPost("reject/{customerId}")]
    [Authorize(Roles = "Manager")]
    public async Task<IActionResult> RejectCustomer(int customerId, [FromBody] RejectRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.Reason))
                return BadRequest(new { message = "Alasan rejection harus diisi" });

            var customer = await _context.Customers.FindAsync(customerId);
            if (customer == null)
                return NotFound(new { message = "Customer tidak ditemukan" });

            if (customer.KYCStatus == "REJECTED" || customer.KYCStatus == "SYNCED_TO_SAP")
                return BadRequest(new { message = "Customer tidak bisa direject" });

            var userId = GetCurrentUserId();
            var previousStatus = customer.KYCStatus;

            customer.KYCStatus = "REJECTED";
            customer.RejectedBy = userId;
            customer.RejectedAt = DateTime.UtcNow;
            customer.RejectionReason = request.Reason;

            // Log to approval history
            var history = new ApprovalHistory
            {
                CustomerId = customerId,
                UserId = userId,
                Action = "REJECT",
                PreviousStatus = previousStatus,
                NewStatus = "REJECTED",
                Comments = request.Reason,
                CreatedAt = DateTime.UtcNow
            };
            _context.ApprovalHistories.Add(history);

            await _context.SaveChangesAsync();

            return Ok(new { message = "Customer rejected", customer });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error rejecting customer");
            return StatusCode(500, new { message = "Terjadi kesalahan" });
        }
    }

    // Get approval history for a customer
    [HttpGet("history/{customerId}")]
    public async Task<IActionResult> GetApprovalHistory(int customerId)
    {
        try
        {
            var history = await _context.ApprovalHistories
                .Include(h => h.User)
                .ThenInclude(u => u.Role)
                .Where(h => h.CustomerId == customerId)
                .OrderByDescending(h => h.CreatedAt)
                .Select(h => new
                {
                    h.Id,
                    h.Action,
                    h.PreviousStatus,
                    h.NewStatus,
                    h.Comments,
                    h.CreatedAt,
                    User = new
                    {
                        h.User.FullName,
                        h.User.Email,
                        RoleName = h.User.Role.RoleName
                    }
                })
                .ToListAsync();

            return Ok(history);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting approval history");
            return StatusCode(500, new { message = "Terjadi kesalahan" });
        }
    }

    // Get customers ready for SAP sync (IT role)
    [HttpGet("ready-for-sap")]
    [Authorize(Roles = "IT")]
    public async Task<IActionResult> GetReadyForSAP()
    {
        try
        {
            var customers = await _context.Customers
                .Include(c => c.SubmittedByUser)
                .Include(c => c.ApprovedByLevel1User)
                .Include(c => c.ApprovedByLevel2User)
                .Include(c => c.ApprovedByLevel3User)
                .Where(c => c.KYCStatus == "READY_FOR_SAP")
                .ToListAsync();

            var result = customers.Select(c => new
            {
                c.Id,
                c.CustomerCode,
                c.CustomerName,
                c.Email,
                c.PhoneNumber,
                c.Address,
                c.KYCStatus,
                SubmittedBy = c.SubmittedByUser?.FullName,
                ApprovedByLevel1 = c.ApprovedByLevel1User?.FullName,
                c.ApprovedAtLevel1,
                ApprovedByLevel2 = c.ApprovedByLevel2User?.FullName,
                c.ApprovedAtLevel2,
                ApprovedByLevel3 = c.ApprovedByLevel3User?.FullName,
                c.ApprovedAtLevel3
            });

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting customers ready for SAP");
            return StatusCode(500, new { message = "Terjadi kesalahan" });
        }
    }

    // Sync customer to SAP (IT role)
    [HttpPost("sync-to-sap/{customerId}")]
    [Authorize(Roles = "IT")]
    public async Task<IActionResult> SyncToSAP(int customerId)
    {
        try
        {
            var customer = await _context.Customers.FindAsync(customerId);
            if (customer == null)
                return NotFound(new { message = "Customer tidak ditemukan" });

            if (customer.KYCStatus != "READY_FOR_SAP")
                return BadRequest(new { message = "Customer belum siap untuk sync ke SAP" });

            var userId = GetCurrentUserId();

            // TODO: Implement actual SAP B1 Service Layer integration here
            // For now, just mark as synced

            customer.KYCStatus = "SYNCED_TO_SAP";
            customer.SyncedByIT = userId;
            customer.SyncedAt = DateTime.UtcNow;

            // Log to approval history
            var history = new ApprovalHistory
            {
                CustomerId = customerId,
                UserId = userId,
                Action = "SYNC_SAP",
                PreviousStatus = "READY_FOR_SAP",
                NewStatus = "SYNCED_TO_SAP",
                Comments = "Customer synced to SAP B1",
                CreatedAt = DateTime.UtcNow
            };
            _context.ApprovalHistories.Add(history);

            await _context.SaveChangesAsync();

            return Ok(new { message = "Customer berhasil di-sync ke SAP", customer });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error syncing to SAP");
            return StatusCode(500, new { message = "Terjadi kesalahan" });
        }
    }
}
