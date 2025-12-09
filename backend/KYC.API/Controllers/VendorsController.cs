using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using KYC.Core.Entities;
using KYC.Infrastructure.Data;
using KYC.Shared.DTOs;

namespace KYC.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VendorsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public VendorsController(ApplicationDbContext context)
    {
        _context = context;
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

    [HttpGet]
    public async Task<ActionResult<IEnumerable<VendorDto>>> GetVendors()
    {
        var role = GetCurrentUserRole();
        var query = _context.Vendors
            .Include(v => v.CreatedByUser)
            .Include(v => v.Division)
            .AsQueryable();

        var currentUserId = GetCurrentUserId();

        if (role == "Manager")
        {
            query = query.Where(v => v.KYCStatus != "DRAFT");
        }

        if (role != "IT" && role != "Manager")
        {
            query = query.Where(v => v.CreatedBy == currentUserId);
        }

        var vendors = await query.Select(v => new VendorDto
        {
            Id = v.Id,
            VendorCode = v.VendorCode,
            VendorName = v.VendorName,
            Email = v.Email,
            PhoneNumber = v.PhoneNumber,
            Address = v.Address,
            KYCStatus = v.KYCStatus,
            DivisionId = v.DivisionId,
            CreatedAt = v.CreatedAt,
            UpdatedAt = v.UpdatedAt,
            CreatedBy = v.CreatedBy,
            CreatedByName = v.CreatedByUser != null ? v.CreatedByUser.FullName : null
        }).ToListAsync();

        return Ok(vendors);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<VendorDto>> GetVendor(int id)
    {
        var v = await _context.Vendors.FindAsync(id);
        if (v == null) return NotFound(new { message = "Vendor not found" });

        var dto = new VendorDto
        {
            Id = v.Id,
            VendorCode = v.VendorCode,
            VendorName = v.VendorName,
            Email = v.Email,
            PhoneNumber = v.PhoneNumber,
            Address = v.Address,
            KYCStatus = v.KYCStatus,
            DivisionId = v.DivisionId,
            CreatedAt = v.CreatedAt,
            UpdatedAt = v.UpdatedAt,
            CreatedBy = v.CreatedBy,
            CreatedByName = v.CreatedByUser?.FullName
        };

        return Ok(dto);
    }

    [HttpPost]
    public async Task<ActionResult<VendorDto>> CreateVendor(CreateVendorRequest request)
    {
        if (await _context.Vendors.AnyAsync(x => x.VendorCode == request.VendorCode))
            return BadRequest(new { message = "Vendor code already exists" });

        if (await _context.Vendors.AnyAsync(x => x.Email == request.Email))
            return BadRequest(new { message = "Email already exists" });

        var userId = GetCurrentUserId();

        var v = new Vendor
        {
            VendorCode = request.VendorCode,
            VendorName = request.VendorName,
            Email = request.Email,
            PhoneNumber = request.PhoneNumber,
            Address = request.Address,
            DivisionId = request.DivisionId,
            KYCStatus = "DRAFT",
            CreatedAt = DateTime.UtcNow,
            CreatedBy = userId > 0 ? userId : null
        };

        _context.Vendors.Add(v);
        await _context.SaveChangesAsync();

        var dto = new VendorDto
        {
            Id = v.Id,
            VendorCode = v.VendorCode,
            VendorName = v.VendorName,
            Email = v.Email,
            PhoneNumber = v.PhoneNumber,
            Address = v.Address,
            KYCStatus = v.KYCStatus,
            DivisionId = v.DivisionId,
            CreatedAt = v.CreatedAt
        };

        return CreatedAtAction(nameof(GetVendor), new { id = v.Id }, dto);
    }

    // DELETE: api/vendors/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteVendor(int id)
    {
        var v = await _context.Vendors.FindAsync(id);
        if (v == null) return NotFound(new { message = "Vendor not found" });

        if (v.KYCStatus != "DRAFT" && v.KYCStatus != "REJECTED")
        {
            return BadRequest(new { message = "Cannot delete vendor that is in approval process or synced" });
        }

        _context.Vendors.Remove(v);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // Additional update/delete/submit endpoints can mirror CustomersController when needed
}
