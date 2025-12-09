namespace KYC.Shared.DTOs;

public class CustomerDto
{
    public int Id { get; set; }
    public string CustomerCode { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string KYCStatus { get; set; } = "DRAFT";
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public int RequiredApprovalLevels { get; set; }
    
    // Approval Info
    public string? SubmittedByName { get; set; }
    public DateTime? SubmittedAt { get; set; }
    public string? ApprovedByLevel1Name { get; set; }
    public DateTime? ApprovedAtLevel1 { get; set; }
    public string? ApprovedByLevel2Name { get; set; }
    public DateTime? ApprovedAtLevel2 { get; set; }
    public string? ApprovedByLevel3Name { get; set; }
    public DateTime? ApprovedAtLevel3 { get; set; }
    public string? RejectedByName { get; set; }
    public DateTime? RejectedAt { get; set; }
    public string? RejectionReason { get; set; }
    public string? SyncedByITName { get; set; }
    public DateTime? SyncedAt { get; set; }
    
    // Owner info
    public int? CreatedBy { get; set; }
    public string? CreatedByName { get; set; }
}
