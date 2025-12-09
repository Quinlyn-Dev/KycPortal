using KYC.API.Extensions;

try
{
    var builder = WebApplication.CreateBuilder(args);

    // Add services to the container
    builder.Services.AddControllers();
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen();

    // Add CORS
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("AllowFrontend",
            policy =>
            {
                policy.WithOrigins(
                        "http://localhost:5173", 
                        "http://localhost:5174", 
                        "http://localhost:5175", 
                        "http://localhost:3000"
                      )
                      .AllowAnyHeader()
                      .AllowAnyMethod()
                      .AllowCredentials();
            });
    });

    // Add Database Context
    builder.Services.AddDatabaseContext(builder.Configuration);

    // Add JWT Authentication
    builder.Services.AddJwtAuthentication(builder.Configuration);

    // Add Services
    builder.Services.AddApplicationServices();

    var app = builder.Build();

    // Configure the HTTP request pipeline
    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI();
    }

    // Comment out HTTPS redirection since we're running on HTTP only
    // app.UseHttpsRedirection();

    app.UseCors("AllowFrontend");

    app.UseAuthentication();
    app.UseAuthorization();

    app.MapControllers();

    // Add a simple health check endpoint
    app.MapGet("/health", () => Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow }));

    Console.WriteLine("Application configured successfully. Starting...");
    app.Run();
}
catch (Exception ex)
{
    Console.WriteLine($"FATAL ERROR: {ex.GetType().Name}");
    Console.WriteLine($"Message: {ex.Message}");
    Console.WriteLine($"StackTrace: {ex.StackTrace}");
    if (ex.InnerException != null)
    {
        Console.WriteLine($"Inner Exception: {ex.InnerException.Message}");
        Console.WriteLine($"Inner StackTrace: {ex.InnerException.StackTrace}");
    }
    throw;
}
