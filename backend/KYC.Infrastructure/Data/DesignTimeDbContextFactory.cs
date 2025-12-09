using System;
using System.IO;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace KYC.Infrastructure.Data;

// This factory helps `dotnet ef` discover and create the ApplicationDbContext
// during design-time (migrations). It reads the connection string from the
// KYC.API appsettings.json or from environment variables.
public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        // Try to determine environment
        var env = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Development";

        // Build configuration pointing at the API project where appsettings.json resides
        var basePath = Path.Combine(Directory.GetCurrentDirectory(), "..", "KYC.API");
        var builder = new ConfigurationBuilder()
            .SetBasePath(basePath)
            .AddJsonFile("appsettings.json", optional: true, reloadOnChange: false)
            .AddJsonFile($"appsettings.{env}.json", optional: true, reloadOnChange: false)
            .AddEnvironmentVariables();

        var config = builder.Build();

        // Prefer the MySQL connection string key first (explicit), then fall back to
        // environment variables, then to the DefaultConnection. This ensures we don't
        // accidentally pick an MSSQL LocalDB connection string when the app uses MySQL.
        var connectionString = config.GetConnectionString("MySQL")
                               ?? Environment.GetEnvironmentVariable("KYC_CONNECTION_STRING")
                               ?? config.GetConnectionString("DefaultConnection")
                               ?? Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection");

        if (string.IsNullOrEmpty(connectionString))
            throw new InvalidOperationException("Could not find a database connection string. Set 'ConnectionStrings:MySQL' in KYC.API/appsettings.json or set environment variable 'KYC_CONNECTION_STRING'.");

        // If the resolved connection string looks like a SQL Server/LocalDB connection
        // (for example contains 'Trusted_Connection' or 'Data Source=(localdb)'), tell
        // the developer to provide a MySQL connection string instead, because this
        // factory configures the MySQL provider.
        var lower = connectionString.ToLowerInvariant();
        if (lower.Contains("trusted_connection") || lower.Contains("(localdb)") || lower.Contains("data source="))
        {
            throw new InvalidOperationException("The resolved connection string appears to be for SQL Server/LocalDB. For design-time migrations this project uses MySQL. Please set 'ConnectionStrings:MySQL' in KYC.API/appsettings.json or set the environment variable 'KYC_CONNECTION_STRING' to a valid MySQL connection string.");
        }

        var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
        // Use MySQL provider - detect server version automatically
        optionsBuilder.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString));

        return new ApplicationDbContext(optionsBuilder.Options);
    }
}
