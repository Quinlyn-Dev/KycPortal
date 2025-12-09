using KYC.Core.Entities;
using KYC.Infrastructure.Data;
using KYC.Shared.DTOs;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;

namespace KYC.Infrastructure.Services;

public class AuthService
{
    private readonly ApplicationDbContext _context;
    private readonly JwtService _jwtService;

    public AuthService(ApplicationDbContext context, JwtService jwtService)
    {
        _context = context;
        _jwtService = jwtService;
    }

    public async Task<LoginResponse?> Login(LoginRequest request)
    {
        var user = await _context.Users
            .Include(u => u.Role)
            .Include(u => u.UserApprovals)
                .ThenInclude(ua => ua.Division)
            .FirstOrDefaultAsync(u => u.Email == request.Email && u.IsActive);

        if (user == null)
            return null;

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return null;

        var token = _jwtService.GenerateToken(user);

        return new LoginResponse
        {
            Token = token,
            User = new UserDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                FullName = user.FullName,
                RoleName = user.Role.RoleName,
                RoleId = user.RoleId,
                IsActive = user.IsActive,
                UserApprovals = user.UserApprovals.Select(ua => new UserApprovalDto
                {
                    Id = ua.Id,
                    UserId = ua.UserId,
                    DivisionId = ua.DivisionId,
                    DivisionCode = ua.Division.DivisionCode,
                    DivisionName = ua.Division.DivisionName,
                    ApprovalLevel = ua.ApprovalLevel,
                    IsActive = ua.IsActive
                }).ToList()
            }
        };
    }

    public async Task<UserDto?> CreateUser(CreateUserRequest request)
    {
        if (await _context.Users.AnyAsync(u => u.Email == request.Email || u.Username == request.Username))
            return null;

        var user = new User
        {
            Username = request.Username,
            Email = request.Email,
            FullName = request.FullName,
            RoleId = request.RoleId,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password)
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        // Add user approvals if provided
        if (request.UserApprovals != null && request.UserApprovals.Any())
        {
            foreach (var approvalDto in request.UserApprovals)
            {
                var userApproval = new UserApproval
                {
                    UserId = user.Id,
                    DivisionId = approvalDto.DivisionId,
                    ApprovalLevel = approvalDto.ApprovalLevel,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                _context.UserApprovals.Add(userApproval);
            }
            await _context.SaveChangesAsync();
        }

        var createdUser = await _context.Users
            .Include(u => u.Role)
            .Include(u => u.UserApprovals)
                .ThenInclude(ua => ua.Division)
            .FirstAsync(u => u.Id == user.Id);

        return new UserDto
        {
            Id = createdUser.Id,
            Username = createdUser.Username,
            Email = createdUser.Email,
            FullName = createdUser.FullName,
            RoleName = createdUser.Role.RoleName,
            RoleId = createdUser.RoleId,
            IsActive = createdUser.IsActive,
            UserApprovals = createdUser.UserApprovals.Select(ua => new UserApprovalDto
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
    }

    public async Task<bool> ChangePassword(int userId, string currentPassword, string newPassword)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
            return false;

        if (!BCrypt.Net.BCrypt.Verify(currentPassword, user.PasswordHash))
            return false;

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
        await _context.SaveChangesAsync();

        return true;
    }
}
