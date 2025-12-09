namespace KYC.Shared.DTOs;

public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class LoginResponse
{
    public string Token { get; set; } = string.Empty;
    public UserDto User { get; set; } = null!;
}

public class UserDto
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string RoleName { get; set; } = string.Empty;
    public int RoleId { get; set; }
    public bool IsActive { get; set; }
    public List<UserApprovalDto>? UserApprovals { get; set; }
}

public class CreateUserRequest
{
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public int RoleId { get; set; }
    public List<UserApprovalDto>? UserApprovals { get; set; }
}

public class ApprovalRequest
{
    public string? Comments { get; set; }
}

public class RejectRequest
{
    public string Reason { get; set; } = string.Empty;
}

public class RoleDto
{
    public int Id { get; set; }
    public string RoleName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int? MaxApprovalLevel { get; set; }
}

public class DivisionDto
{
    public int Id { get; set; }
    public string DivisionCode { get; set; } = string.Empty;
    public string DivisionName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

public class UserApprovalDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int DivisionId { get; set; }
    public string DivisionCode { get; set; } = string.Empty;
    public string DivisionName { get; set; } = string.Empty;
    public int ApprovalLevel { get; set; }
    public bool IsActive { get; set; }
}

public class CreateUserApprovalRequest
{
    public int DivisionId { get; set; }
    public int ApprovalLevel { get; set; }
}
