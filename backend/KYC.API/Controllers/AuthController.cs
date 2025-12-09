using Microsoft.AspNetCore.Mvc;
using KYC.Infrastructure.Services;
using KYC.Shared.DTOs;

namespace KYC.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(AuthService authService, ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        try
        {
            var result = await _authService.Login(request);
            
            if (result == null)
                return Unauthorized(new { message = "Email atau password salah" });

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during login");
            return StatusCode(500, new { message = "Terjadi kesalahan saat login" });
        }
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] CreateUserRequest request)
    {
        try
        {
            var result = await _authService.CreateUser(request);
            
            if (result == null)
                return BadRequest(new { message = "Email atau username sudah digunakan" });

            return Ok(new { message = "User berhasil dibuat", user = result });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during registration");
            return StatusCode(500, new { message = "Terjadi kesalahan saat registrasi" });
        }
    }

    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        try
        {
            var userId = int.Parse(User.FindFirst("sub")?.Value ?? "0");
            
            if (userId == 0)
                return Unauthorized();

            var result = await _authService.ChangePassword(userId, request.CurrentPassword, request.NewPassword);
            
            if (!result)
                return BadRequest(new { message = "Password lama tidak sesuai" });

            return Ok(new { message = "Password berhasil diubah" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during password change");
            return StatusCode(500, new { message = "Terjadi kesalahan saat mengubah password" });
        }
    }
}

public class ChangePasswordRequest
{
    public string CurrentPassword { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}
