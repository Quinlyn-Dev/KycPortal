using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using KYC.Infrastructure.Data;
using KYC.Infrastructure.Services;
using KYC.Shared.DTOs;
using KYC.Core.Entities;

namespace KYC.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "IT")]
public class AdminController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly AuthService _authService;
    private readonly ILogger<AdminController> _logger;

    public AdminController(ApplicationDbContext context, AuthService authService, ILogger<AdminController> logger)
    {
        _context = context;
        _authService = authService;
        _logger = logger;
    }

    // Get all users
    [HttpGet("users")]
    public async Task<IActionResult> GetAllUsers()
    {
        try
        {
            var users = await _context.Users
                .Include(u => u.Role)
                .Include(u => u.UserApprovals)
                    .ThenInclude(ua => ua.Division)
                .OrderBy(u => u.CreatedAt)
                .ToListAsync();

            var userDtos = users.Select(u => new UserDto
            {
                Id = u.Id,
                Username = u.Username,
                Email = u.Email,
                FullName = u.FullName,
                RoleName = u.Role.RoleName,
                RoleId = u.RoleId,
                IsActive = u.IsActive,
                UserApprovals = u.UserApprovals.Select(ua => new UserApprovalDto
                {
                    Id = ua.Id,
                    UserId = ua.UserId,
                    DivisionId = ua.DivisionId,
                    DivisionCode = ua.Division.DivisionCode,
                    DivisionName = ua.Division.DivisionName,
                    ApprovalLevel = ua.ApprovalLevel,
                    IsActive = ua.IsActive
                }).ToList()
            }).ToList();

            return Ok(userDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all users");
            return StatusCode(500, new { message = "Terjadi kesalahan" });
        }
    }

    // Get all roles (public - for registration dropdown)
    [HttpGet("roles")]
    [AllowAnonymous]
    public async Task<IActionResult> GetAllRoles()
    {
        try
        {
            var roles = await _context.Roles
                .Select(r => new RoleDto
                {
                    Id = r.Id,
                    RoleName = r.RoleName,
                    Description = r.Description,
                    MaxApprovalLevel = r.MaxApprovalLevel
                })
                .ToListAsync();
            return Ok(roles);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting roles");
            return StatusCode(500, new { message = "Terjadi kesalahan" });
        }
    }

    // Get all divisions (public - for registration dropdown)
    [HttpGet("divisions")]
    [AllowAnonymous]
    public async Task<IActionResult> GetAllDivisions()
    {
        try
        {
            var divisions = await _context.Divisions
                .Where(d => d.IsActive)
                .Select(d => new DivisionDto
                {
                    Id = d.Id,
                    DivisionCode = d.DivisionCode,
                    DivisionName = d.DivisionName,
                    Description = d.Description
                })
                .ToListAsync();
            return Ok(divisions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting divisions");
            return StatusCode(500, new { message = "Terjadi kesalahan" });
        }
    }

    // Get max approval levels for a division
    [HttpGet("divisions/{divisionId}/max-approval-levels")]
    [AllowAnonymous]
    public async Task<IActionResult> GetMaxApprovalLevels(int divisionId)
    {
        try
        {
            var maxLevel = await _context.UserApprovals
                .Where(ua => ua.DivisionId == divisionId && ua.IsActive)
                .Select(ua => ua.ApprovalLevel)
                .DefaultIfEmpty(0)
                .MaxAsync();
            
            return Ok(new { maxApprovalLevels = maxLevel });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting max approval levels");
            return StatusCode(500, new { message = "Terjadi kesalahan" });
        }
    }

    // Register new user (Admin only)
    [HttpPost("users/register")]
    public async Task<IActionResult> RegisterUser([FromBody] CreateUserRequest request)
    {
        try
        {
            // Validate role
            var role = await _context.Roles.FindAsync(request.RoleId);
            if (role == null)
                return BadRequest(new { message = "Role tidak valid" });

            // Validate user approvals if provided
            if (request.UserApprovals != null && request.UserApprovals.Any())
            {
                foreach (var approval in request.UserApprovals)
                {
                    var divisionExists = await _context.Divisions.AnyAsync(d => d.Id == approval.DivisionId && d.IsActive);
                    if (!divisionExists)
                        return BadRequest(new { message = $"Division dengan ID {approval.DivisionId} tidak valid" });
                        
                    if (approval.ApprovalLevel < 1)
                        return BadRequest(new { message = "Approval level minimal 1" });
                }
            }

            var result = await _authService.CreateUser(request);
            
            if (result == null)
                return BadRequest(new { message = "Email atau username sudah digunakan" });

            return Ok(new { message = "User berhasil dibuat", user = result });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error registering user");
            return StatusCode(500, new { message = "Terjadi kesalahan saat registrasi" });
        }
    }

    // Update user
    [HttpPut("users/{id}")]
    public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserRequest request)
    {
        try
        {
            _logger.LogInformation($"UpdateUser called for ID: {id}, UserApprovals count: {request.UserApprovals?.Count ?? 0}");
            if (request.UserApprovals != null)
            {
                foreach (var ua in request.UserApprovals)
                {
                    _logger.LogInformation($"  - DivisionId: {ua.DivisionId}, ApprovalLevel: {ua.ApprovalLevel}, IsActive: {ua.IsActive}");
                }
            }

            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound(new { message = "User tidak ditemukan" });

            // Update fields if provided
            if (!string.IsNullOrWhiteSpace(request.FullName))
                user.FullName = request.FullName;

            if (!string.IsNullOrWhiteSpace(request.Email))
            {
                // Check if email is already used by another user
                var emailExists = await _context.Users.AnyAsync(u => u.Email == request.Email && u.Id != id);
                if (emailExists)
                    return BadRequest(new { message = "Email sudah digunakan" });
                user.Email = request.Email;
            }

            if (request.RoleId.HasValue)
            {
                var role = await _context.Roles.FindAsync(request.RoleId.Value);
                if (role == null)
                    return BadRequest(new { message = "Role tidak valid" });
                user.RoleId = request.RoleId.Value;
            }

            if (request.IsActive.HasValue)
                user.IsActive = request.IsActive.Value;

            await _context.SaveChangesAsync();
            _logger.LogInformation($"User basic fields updated for ID: {id}");

            // If user approvals provided, replace existing approvals with provided list
            if (request.UserApprovals != null)
            {
                _logger.LogInformation($"Processing {request.UserApprovals.Count} user approvals...");
                
                // remove existing approvals for this user
                var existing = await _context.UserApprovals.Where(ua => ua.UserId == id).ToListAsync();
                _logger.LogInformation($"Found {existing.Count} existing approvals to remove");
                if (existing.Any()) 
                {
                    _context.UserApprovals.RemoveRange(existing);
                    await _context.SaveChangesAsync();
                    _logger.LogInformation("Existing approvals removed");
                }

                // add new approvals from request
                foreach (var uaDto in request.UserApprovals)
                {
                    // validate division
                    var division = await _context.Divisions.FindAsync(uaDto.DivisionId);
                    if (division == null)
                    {
                        _logger.LogError($"Division {uaDto.DivisionId} not found");
                        return BadRequest(new { message = $"Division dengan ID {uaDto.DivisionId} tidak valid" });
                    }

                    var ua = new UserApproval
                    {
                        UserId = id,
                        DivisionId = uaDto.DivisionId,
                        ApprovalLevel = uaDto.ApprovalLevel,
                        IsActive = uaDto.IsActive,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    _context.UserApprovals.Add(ua);
                    _logger.LogInformation($"Added approval: UserId={id}, DivisionId={uaDto.DivisionId}, Level={uaDto.ApprovalLevel}");
                }

                await _context.SaveChangesAsync();
                _logger.LogInformation("All new approvals saved to database");
            }

            var updatedUser = await _context.Users
                .Include(u => u.Role)
                .Include(u => u.UserApprovals)
                    .ThenInclude(ua => ua.Division)
                .FirstAsync(u => u.Id == id);

            var userDto = new UserDto
            {
                Id = updatedUser.Id,
                Username = updatedUser.Username,
                Email = updatedUser.Email,
                FullName = updatedUser.FullName,
                RoleName = updatedUser.Role.RoleName,
                RoleId = updatedUser.RoleId,
                IsActive = updatedUser.IsActive,
                UserApprovals = updatedUser.UserApprovals.Select(ua => new UserApprovalDto
                {
                    Id = ua.Id,
                    UserId = ua.UserId,
                    DivisionId = ua.DivisionId,
                    DivisionCode = ua.Division.DivisionCode,
                    DivisionName = ua.Division.DivisionName,
                    ApprovalLevel = ua.ApprovalLevel,
                    IsActive = ua.IsActive
                }).ToList()
            };

            return Ok(new { message = "User berhasil diupdate", user = userDto });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user");
            return StatusCode(500, new { message = "Terjadi kesalahan" });
        }
    }

    // Delete user (soft delete by setting IsActive = false)
    [HttpDelete("users/{id}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        try
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound(new { message = "User tidak ditemukan" });

            // Prevent deleting self
            var currentUserId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
            if (id == currentUserId)
                return BadRequest(new { message = "Tidak dapat menghapus user sendiri" });

            // Perform hard delete safely:
            // 1. Remove approval histories referencing this user
            var histories = await _context.ApprovalHistories.Where(h => h.UserId == id).ToListAsync();
            if (histories.Any()) _context.ApprovalHistories.RemoveRange(histories);

            // 2. Nullify FK references in Customers that point to this user
            var affectedCustomers = await _context.Customers
                .Where(c => c.SubmittedBy == id || c.ApprovedByLevel1 == id || c.ApprovedByLevel2 == id || c.ApprovedByLevel3 == id || c.RejectedBy == id || c.SyncedByIT == id)
                .ToListAsync();

            foreach (var c in affectedCustomers)
            {
                if (c.SubmittedBy == id) c.SubmittedBy = null;
                if (c.ApprovedByLevel1 == id) c.ApprovedByLevel1 = null;
                if (c.ApprovedByLevel2 == id) c.ApprovedByLevel2 = null;
                if (c.ApprovedByLevel3 == id) c.ApprovedByLevel3 = null;
                if (c.RejectedBy == id) c.RejectedBy = null;
                if (c.SyncedByIT == id) c.SyncedByIT = null;
            }

            // 3. Remove UserApprovals for the user
            var approvals = await _context.UserApprovals.Where(ua => ua.UserId == id).ToListAsync();
            if (approvals.Any()) _context.UserApprovals.RemoveRange(approvals);

            // 4. Finally remove the user
            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = "User berhasil dihapus" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting user");
            return StatusCode(500, new { message = "Terjadi kesalahan" });
        }
    }

    // Get dashboard statistics
    [HttpGet("dashboard/stats")]
    public async Task<IActionResult> GetDashboardStats()
    {
        try
        {
            var totalCustomers = await _context.Customers.CountAsync();
            var pendingApproval = await _context.Customers
                .CountAsync(c => c.KYCStatus == "SUBMITTED" || 
                                 c.KYCStatus == "APPROVED_L1" || 
                                 c.KYCStatus == "APPROVED_L2");
            var readyForSAP = await _context.Customers.CountAsync(c => c.KYCStatus == "READY_FOR_SAP");
            var syncedToSAP = await _context.Customers.CountAsync(c => c.KYCStatus == "SYNCED_TO_SAP");
            var rejected = await _context.Customers.CountAsync(c => c.KYCStatus == "REJECTED");

            var totalUsers = await _context.Users.CountAsync(u => u.IsActive);
            var activeManagers = await _context.Users.CountAsync(u => u.IsActive && u.RoleId == 2);

            return Ok(new
            {
                customers = new
                {
                    total = totalCustomers,
                    pendingApproval,
                    readyForSAP,
                    syncedToSAP,
                    rejected
                },
                users = new
                {
                    total = totalUsers,
                    activeManagers
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting dashboard stats");
            return StatusCode(500, new { message = "Terjadi kesalahan" });
        }
    }
}

public class UpdateUserRequest
{
    public string? FullName { get; set; }
    public string? Email { get; set; }
    public int? RoleId { get; set; }
    public int? ApprovalLevel { get; set; }
    public bool? IsActive { get; set; }
    public List<UserApprovalDto>? UserApprovals { get; set; }
}
