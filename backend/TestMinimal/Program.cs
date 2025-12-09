using Microsoft.AspNetCore.Builder;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/", () => "Hello World!");
app.MapGet("/health", () => new { status = "OK", time = System.DateTime.Now });

System.Console.WriteLine("Starting minimal API on http://localhost:5555");
app.Run("http://localhost:5555");
