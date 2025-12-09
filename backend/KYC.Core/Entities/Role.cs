namespace KYC.Core.Entities;

public class Role
{
    public int Id { get; set; }
    public string RoleName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int? MaxApprovalLevel { get; set; } // Null = no approval levels (User/IT roles), 1-N = max levels for Manager
    
    // Navigation
    public ICollection<User> Users { get; set; } = new List<User>();
}
