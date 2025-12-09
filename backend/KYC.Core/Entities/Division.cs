namespace KYC.Core.Entities;

public class Division
{
    public int Id { get; set; }
    public string DivisionCode { get; set; } = string.Empty; // FOOD, FEED
    public string DivisionName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation
    public ICollection<Customer> Customers { get; set; } = new List<Customer>();
    public ICollection<UserApproval> UserApprovals { get; set; } = new List<UserApproval>();
}
