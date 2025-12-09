using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using KYC.Core.Entities;
using KYC.Infrastructure.Data;
using KYC.Shared.DTOs;

namespace KYC.API.Controllers;

[ApiController]
[Route("api/[controller]")]
// [Authorize] // Temporarily disabled for testing
public class CustomersController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<CustomersController> _logger;

    public CustomersController(ApplicationDbContext context, ILogger<CustomersController> logger)
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

    private void MapRequestToCustomer(CreateCustomerRequest request, Customer customer)
    {
        // Basic Information
        customer.CustomerCode = request.CustomerCode;
        customer.CustomerName = request.CustomerName;
        customer.Email = request.Email;
        customer.PhoneNumber = request.PhoneNumber;
        customer.Address = request.Address;
        customer.RegisteredAddress = request.RegisteredAddress;
        customer.CorrespondenceAddress = request.CorrespondenceAddress;
        customer.EstablishmentDate = request.EstablishmentDate;
        customer.EstablishmentCountry = request.EstablishmentCountry;
        customer.RegistrationNumber = request.RegistrationNumber;
        customer.Website = request.Website;
        customer.Facsimile = request.Facsimile;
        customer.NPWP = request.NPWP;
        customer.NIB = request.NIB;
        customer.TaxAddress = request.TaxAddress;
        customer.IdentityCardNumber = request.IdentityCardNumber;
        customer.IsPKP = request.IsPKP;
        customer.BusinessNature = request.BusinessNature;
        customer.IsManufacturer = request.IsManufacturer;
        customer.IsDistributor = request.IsDistributor;
        customer.Auditor = request.Auditor;
        
        // Attachments
        customer.HasAttachmentIndonesia = request.HasAttachmentIndonesia;
        customer.HasAttachmentForeign = request.HasAttachmentForeign;
        customer.HasAttachmentSKT = request.HasAttachmentSKT;
        customer.HasAttachmentNPWP = request.HasAttachmentNPWP;
        customer.HasAttachmentNIB = request.HasAttachmentNIB;
        customer.HasAttachmentTDP = request.HasAttachmentTDP;
        customer.HasAttachmentSIUP = request.HasAttachmentSIUP;
        customer.HasAttachmentProfit = request.HasAttachmentProfit;
        customer.HasAttachmentBalanceSheet = request.HasAttachmentBalanceSheet;
        customer.HasAttachmentCashFlow = request.HasAttachmentCashFlow;
        customer.HasAttachmentTaxReturn = request.HasAttachmentTaxReturn;
        customer.HasAttachmentOther = request.HasAttachmentOther;
        
        // Contact Information
        customer.CommercialPicName = request.CommercialPicName;
        customer.CommercialPicPosition = request.CommercialPicPosition;
        customer.CommercialPicPhone = request.CommercialPicPhone;
        customer.CommercialPicEmail = request.CommercialPicEmail;
        customer.FinancePicName = request.FinancePicName;
        customer.FinancePicEmail = request.FinancePicEmail;
        customer.FinancePicPhone = request.FinancePicPhone;
        customer.ReferenceBankName = request.ReferenceBankName;
        customer.ReferenceBankAddress = request.ReferenceBankAddress;
        customer.ReferenceBankAccountNumber = request.ReferenceBankAccountNumber;
        
        // Internal Approval
        customer.CommercialReviewerName = request.CommercialReviewerName;
        customer.CommercialReviewerDate = request.CommercialReviewerDate;
        customer.GmApprovalName = request.GmApprovalName;
        customer.GmApprovalDate = request.GmApprovalDate;
        
        // Finance Department
        customer.TransactionCurrency = request.TransactionCurrency;
        customer.FinanceDivision = request.FinanceDivision;
        customer.BuyerVendorType = request.BuyerVendorType;
        customer.SapAccountType = request.SapAccountType;
        customer.CreditLimitAmount = request.CreditLimitAmount;
        customer.FinanceNotes = request.FinanceNotes;
        customer.FinanceReviewerName = request.FinanceReviewerName;
        customer.FinanceReviewerDate = request.FinanceReviewerDate;
        customer.FinanceGmSignature = request.FinanceGmSignature;
        customer.FinanceGmApprovalName = request.FinanceGmApprovalName;
        customer.FinanceGmApprovalDate = request.FinanceGmApprovalDate;
        customer.SapAccountNumber = request.SapAccountNumber;
        customer.ItRegistrationDate = request.ItRegistrationDate;
        customer.AcknowledgedBy = request.AcknowledgedBy;
        customer.AcknowledgedByDate = request.AcknowledgedByDate;
        
        // Form Pernyataan
        customer.RegistrationSubmissionDate = request.RegistrationSubmissionDate;
        customer.SubmitterNamePosition = request.SubmitterNamePosition;
        customer.CompanySignatureStamp = request.CompanySignatureStamp;
        customer.OwnerName = request.OwnerName;
        customer.OwnerPosition = request.OwnerPosition;
        customer.OwnerPhone = request.OwnerPhone;
        customer.OwnerEmail = request.OwnerEmail;
        
        // Bank Information
        customer.PrimaryBankName = request.PrimaryBankName;
        customer.BankAddress = request.BankAddress;
        customer.BankAccountNumber = request.BankAccountNumber;
        customer.BankAccountName = request.BankAccountName;
        customer.BankPhoneNumber = request.BankPhoneNumber;
        customer.BankContactPerson = request.BankContactPerson;
        customer.BankEmail = request.BankEmail;
        
        // Company Activity
        customer.EmployeeMale = request.EmployeeMale;
        customer.EmployeeFemale = request.EmployeeFemale;
        customer.BusinessType = request.BusinessType;
        customer.BusinessDescription = request.BusinessDescription;
        customer.CreditCheckType = request.CreditCheckType;
        customer.CreditTerm = request.CreditTerm;
        customer.ProductsServices = request.ProductsServices;
        
        // Related Companies
        customer.ParentCompanyName = request.ParentCompanyName;
        customer.ParentCompanyAddress = request.ParentCompanyAddress;
        customer.AffiliatedCompanyName = request.AffiliatedCompanyName;
        customer.AffiliatedCompanyDetails = request.AffiliatedCompanyDetails;
        customer.BeneficialOwners = request.BeneficialOwners;
        
        // Annual Business Volume
        customer.Revenue2021 = request.Revenue2021;
        customer.Revenue2022 = request.Revenue2022;
        customer.Revenue2023 = request.Revenue2023;
        customer.VolumeBreakdown2021 = request.VolumeBreakdown2021;
        customer.VolumeBreakdown2022 = request.VolumeBreakdown2022;
        customer.VolumeBreakdown2023 = request.VolumeBreakdown2023;
        
        // Internal Contact
        customer.InternalContactName = request.InternalContactName;
        customer.InternalContactEmail = request.InternalContactEmail;
        customer.InternalContactPhone = request.InternalContactPhone;
        
        // Other Information
        customer.AuthorizedSignatories = request.AuthorizedSignatories;
        customer.BusinessPotential = request.BusinessPotential;
        customer.ExpectedQuantityFrequency = request.ExpectedQuantityFrequency;
        customer.PaymentTerms = request.PaymentTerms;
    }

    // GET: api/customers
    [HttpGet]
    public async Task<ActionResult<IEnumerable<CustomerDto>>> GetCustomers()
    {
        // Apply role-based filtering: Managers should not see DRAFT customers
        var role = GetCurrentUserRole();

        var query = _context.Customers
            .Include(c => c.SubmittedByUser)
            .Include(c => c.CreatedByUser)
            .Include(c => c.ApprovedByLevel1User)
            .Include(c => c.RejectedByUser)
            .AsQueryable();

        var currentUserId = GetCurrentUserId();

        // Managers should not see DRAFT customers and non-IT users only see their own created customers
        if (role == "Manager")
        {
            query = query.Where(c => c.KYCStatus != "DRAFT");
        }

        // Only restrict to CreatedBy for regular users. Managers and IT can see broader lists.
        if (role != "IT" && role != "Manager")
        {
            // only show customers created by current user
            query = query.Where(c => c.CreatedBy == currentUserId);
        }

        var customers = await query
            .Select(c => new CustomerDto
            {
                Id = c.Id,
                CustomerCode = c.CustomerCode,
                CustomerName = c.CustomerName,
                Email = c.Email,
                PhoneNumber = c.PhoneNumber,
                Address = c.Address,
                KYCStatus = c.KYCStatus,
                CreatedAt = c.CreatedAt,
                UpdatedAt = c.UpdatedAt,
                SubmittedByName = c.SubmittedByUser != null ? c.SubmittedByUser.FullName : null,
                CreatedBy = c.CreatedBy,
                CreatedByName = c.CreatedByUser != null ? c.CreatedByUser.FullName : null,
                SubmittedAt = c.SubmittedAt,
                ApprovedByLevel1Name = c.ApprovedByLevel1User != null ? c.ApprovedByLevel1User.FullName : null,
                ApprovedAtLevel1 = c.ApprovedAtLevel1,
                RejectedByName = c.RejectedByUser != null ? c.RejectedByUser.FullName : null,
                RejectedAt = c.RejectedAt,
                RejectionReason = c.RejectionReason
            })
            .ToListAsync();

        return Ok(customers);
    }

    // GET: api/customers/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Customer>> GetCustomer(int id)
    {
        var customer = await _context.Customers.FindAsync(id);

        if (customer == null)
        {
            return NotFound(new { message = "Customer not found" });
        }

        // Return full Customer entity instead of limited CustomerDto
        return Ok(customer);
    }

    // POST: api/customers
    [HttpPost]
    // [Authorize(Roles = "User")] // Temporarily disabled
    public async Task<ActionResult<CustomerDto>> CreateCustomer(CreateCustomerRequest request)
    {
        // Check if customer code already exists
        if (await _context.Customers.AnyAsync(c => c.CustomerCode == request.CustomerCode))
        {
            return BadRequest(new { message = "Customer code already exists" });
        }

        // Check if email already exists
        if (await _context.Customers.AnyAsync(c => c.Email == request.Email))
        {
            return BadRequest(new { message = "Email already exists" });
        }

        var userId = GetCurrentUserId();
        
        var customer = new Customer
        {
            DivisionId = request.DivisionId,
            KYCStatus = "DRAFT",
            RequiredApprovalLevels = request.RequiredApprovalLevels ?? 2,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = userId > 0 ? userId : null
        };

        // Map all fields from request to customer
        MapRequestToCustomer(request, customer);

        _context.Customers.Add(customer);
        await _context.SaveChangesAsync();

        var customerDto = new CustomerDto
        {
            Id = customer.Id,
            CustomerCode = customer.CustomerCode,
            CustomerName = customer.CustomerName,
            Email = customer.Email,
            PhoneNumber = customer.PhoneNumber,
            Address = customer.Address,
            KYCStatus = customer.KYCStatus,
            CreatedAt = customer.CreatedAt
        };

        return CreatedAtAction(nameof(GetCustomer), new { id = customer.Id }, customerDto);
    }

    // PUT: api/customers/5
    [HttpPut("{id}")]
    // [Authorize(Roles = "User")] // Temporarily disabled
    public async Task<IActionResult> UpdateCustomer(int id, CreateCustomerRequest request)
    {
        var customer = await _context.Customers.FindAsync(id);

        if (customer == null)
        {
            return NotFound(new { message = "Customer not found" });
        }

        // Only allow updates if status is DRAFT
        if (customer.KYCStatus != "DRAFT")
        {
            return BadRequest(new { message = "Cannot update customer that is not in DRAFT status" });
        }

        // Check if customer code already exists for another customer
        if (await _context.Customers.AnyAsync(c => c.CustomerCode == request.CustomerCode && c.Id != id))
        {
            return BadRequest(new { message = "Customer code already exists" });
        }

        // Check if email already exists for another customer
        if (await _context.Customers.AnyAsync(c => c.Email == request.Email && c.Id != id))
        {
            return BadRequest(new { message = "Email already exists" });
        }

        // Map all fields from request to customer
        MapRequestToCustomer(request, customer);
        customer.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/customers/5
    [HttpDelete("{id}")]
    // [Authorize(Roles = "User,IT")] // Temporarily disabled
    public async Task<IActionResult> DeleteCustomer(int id)
    {
        var customer = await _context.Customers.FindAsync(id);

        if (customer == null)
        {
            return NotFound(new { message = "Customer not found" });
        }

        // Only allow deletion if status is DRAFT or REJECTED
        if (customer.KYCStatus != "DRAFT" && customer.KYCStatus != "REJECTED")
        {
            return BadRequest(new { message = "Cannot delete customer that is in approval process or synced" });
        }

        _context.Customers.Remove(customer);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // POST: api/customers/5/submit
    [HttpPost("{id}/submit")]
    // [Authorize(Roles = "User,IT")] // Temporarily disabled
    public async Task<IActionResult> SubmitCustomer(int id)
    {
        var customer = await _context.Customers.FindAsync(id);

        if (customer == null)
        {
            return NotFound(new { message = "Customer not found" });
        }

        // Only allow submission if status is DRAFT
        if (customer.KYCStatus != "DRAFT")
        {
            return BadRequest(new { message = "Customer is not in DRAFT status" });
        }

        var userId = GetCurrentUserId();
        customer.KYCStatus = "SUBMITTED";
        customer.SubmittedBy = userId > 0 ? userId : 1; // Default to user 1 if not authenticated
        customer.SubmittedAt = DateTime.UtcNow;
        customer.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new { message = "Customer submitted for approval successfully" });
    }

    // Remove old PATCH and POST sync-sap methods (now handled by ApprovalController)
}
