namespace KYC.Core.Entities;

public class UserApproval
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int DivisionId { get; set; }
    public int ApprovalLevel { get; set; } // 1, 2, 3, etc.
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation
    public User User { get; set; } = null!;
    public Division Division { get; set; } = null!;
}
