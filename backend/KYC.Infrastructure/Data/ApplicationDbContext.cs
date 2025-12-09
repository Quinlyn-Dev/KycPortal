using Microsoft.EntityFrameworkCore;
using KYC.Core.Entities;

namespace KYC.Infrastructure.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) 
        : base(options)
    {
    }

    public DbSet<Customer> Customers { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<Role> Roles { get; set; }
    public DbSet<ApprovalHistory> ApprovalHistories { get; set; }
    public DbSet<Division> Divisions { get; set; }
    public DbSet<UserApproval> UserApprovals { get; set; }
    public DbSet<Vendor> Vendors { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Customer configuration
        modelBuilder.Entity<Customer>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.CustomerCode).IsRequired().HasMaxLength(50);
            entity.Property(e => e.CustomerName).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(100);
            entity.Property(e => e.PhoneNumber).HasMaxLength(20);
            entity.Property(e => e.KYCStatus).HasMaxLength(50);
            entity.HasIndex(e => e.CustomerCode).IsUnique();
            entity.HasIndex(e => e.Email).IsUnique();
            
            // Foreign keys
            entity.HasOne(e => e.SubmittedByUser)
                .WithMany()
                .HasForeignKey(e => e.SubmittedBy)
                .OnDelete(DeleteBehavior.Restrict);
                
            entity.HasOne(e => e.CreatedByUser)
                .WithMany()
                .HasForeignKey(e => e.CreatedBy)
                .OnDelete(DeleteBehavior.Restrict);
                
            entity.HasOne(e => e.ApprovedByLevel1User)
                .WithMany()
                .HasForeignKey(e => e.ApprovedByLevel1)
                .OnDelete(DeleteBehavior.Restrict);
                
            entity.HasOne(e => e.ApprovedByLevel2User)
                .WithMany()
                .HasForeignKey(e => e.ApprovedByLevel2)
                .OnDelete(DeleteBehavior.Restrict);
                
            entity.HasOne(e => e.ApprovedByLevel3User)
                .WithMany()
                .HasForeignKey(e => e.ApprovedByLevel3)
                .OnDelete(DeleteBehavior.Restrict);
                
            entity.HasOne(e => e.RejectedByUser)
                .WithMany()
                .HasForeignKey(e => e.RejectedBy)
                .OnDelete(DeleteBehavior.Restrict);
                
            entity.HasOne(e => e.SyncedByITUser)
                .WithMany()
                .HasForeignKey(e => e.SyncedByIT)
                .OnDelete(DeleteBehavior.Restrict);
                
            entity.HasOne(e => e.Division)
                .WithMany(d => d.Customers)
                .HasForeignKey(e => e.DivisionId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Vendor configuration (mirror Customer but separate table)
        modelBuilder.Entity<Vendor>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.VendorCode).IsRequired().HasMaxLength(50);
            entity.Property(e => e.VendorName).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(100);
            entity.Property(e => e.PhoneNumber).HasMaxLength(20);
            entity.Property(e => e.KYCStatus).HasMaxLength(50);
            entity.HasIndex(e => e.VendorCode).IsUnique();
            entity.HasIndex(e => e.Email).IsUnique();

            entity.HasOne(e => e.CreatedByUser)
                .WithMany()
                .HasForeignKey(e => e.CreatedBy)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Division)
                .WithMany()
                .HasForeignKey(e => e.DivisionId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // User configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Username).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(100);
            entity.Property(e => e.FullName).IsRequired().HasMaxLength(200);
            entity.HasIndex(e => e.Username).IsUnique();
            entity.HasIndex(e => e.Email).IsUnique();
            
            entity.HasOne(e => e.Role)
                .WithMany(r => r.Users)
                .HasForeignKey(e => e.RoleId);
        });

        // Role configuration
        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.RoleName).IsRequired().HasMaxLength(50);
            entity.HasIndex(e => e.RoleName).IsUnique();
            
            // Seed roles
            entity.HasData(
                new Role { Id = 1, RoleName = "User", Description = "Data Entry - Create and submit KYC" },
                new Role { Id = 2, RoleName = "Manager", Description = "Approver - Approve/Reject KYC (Level 1-3)" },
                new Role { Id = 3, RoleName = "IT", Description = "Administrator - Sync to SAP and full access" }
            );
        });

        // ApprovalHistory configuration
        modelBuilder.Entity<ApprovalHistory>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Action).IsRequired().HasMaxLength(50);
            entity.Property(e => e.NewStatus).IsRequired().HasMaxLength(50);
            
            entity.HasOne(e => e.Customer)
                .WithMany(c => c.ApprovalHistories)
                .HasForeignKey(e => e.CustomerId);
                
            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId);
        });

        // Division configuration
        modelBuilder.Entity<Division>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.DivisionCode).IsRequired().HasMaxLength(20);
            entity.Property(e => e.DivisionName).IsRequired().HasMaxLength(100);
            entity.HasIndex(e => e.DivisionCode).IsUnique();
            
            // Seed divisions
            entity.HasData(
                new Division 
                { 
                    Id = 1, 
                    DivisionCode = "FOOD", 
                    DivisionName = "Food Division", 
                    Description = "Food products and related customers",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new Division 
                { 
                    Id = 2, 
                    DivisionCode = "FEED", 
                    DivisionName = "Feed Division", 
                    Description = "Feed products and related customers",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                }
            );
        });

        // UserApproval configuration
        modelBuilder.Entity<UserApproval>(entity =>
        {
            entity.HasKey(e => e.Id);
            
            // Composite unique index: one user can only have one approval level per division
            entity.HasIndex(e => new { e.UserId, e.DivisionId, e.ApprovalLevel }).IsUnique();
            
            entity.HasOne(e => e.User)
                .WithMany(u => u.UserApprovals)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
                
            entity.HasOne(e => e.Division)
                .WithMany(d => d.UserApprovals)
                .HasForeignKey(e => e.DivisionId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
