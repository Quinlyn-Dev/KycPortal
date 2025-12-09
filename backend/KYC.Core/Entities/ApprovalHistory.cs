namespace KYC.Core.Entities;

public class ApprovalHistory
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public int UserId { get; set; }
    public string Action { get; set; } = string.Empty; // SUBMIT, APPROVE_L1, APPROVE_L2, APPROVE_L3, REJECT, SYNC_SAP
    public string? PreviousStatus { get; set; }
    public string NewStatus { get; set; } = string.Empty;
    public string? Comments { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation
    public Customer Customer { get; set; } = null!;
    public User User { get; set; } = null!;
}
