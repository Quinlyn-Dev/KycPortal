using System;
using BCrypt.Net;

namespace KYC.Tools
{
    class PasswordHasher
    {
        static void Main(string[] args)
        {
            Console.WriteLine("=== KYC Password Hash Generator ===\n");

            // Generate hashes for default users
            var passwords = new[]
            {
                new { Label = "Admin (Admin123!)", Password = "Admin123!" },
                new { Label = "Manager (Manager123!)", Password = "Manager123!" },
                new { Label = "User (User123!)", Password = "User123!" }
            };

            foreach (var pwd in passwords)
            {
                string hash = BCrypt.Net.BCrypt.HashPassword(pwd.Password);
                Console.WriteLine($"{pwd.Label}:");
                Console.WriteLine($"  Password: {pwd.Password}");
                Console.WriteLine($"  Hash: {hash}");
                Console.WriteLine();
            }

            Console.WriteLine("\n=== SQL Insert Statements ===\n");
            
            string adminHash = BCrypt.Net.BCrypt.HashPassword("Admin123!");
            string managerHash = BCrypt.Net.BCrypt.HashPassword("Manager123!");
            string userHash = BCrypt.Net.BCrypt.HashPassword("User123!");

            Console.WriteLine($@"
-- IT Administrator
INSERT INTO Users (Username, Email, PasswordHash, FullName, RoleId, ApprovalLevel, IsActive, CreatedAt)
VALUES ('admin', 'admin@kyc.com', '{adminHash}', 'IT Administrator', 3, NULL, 1, NOW());

-- Manager Level 1
INSERT INTO Users (Username, Email, PasswordHash, FullName, RoleId, ApprovalLevel, IsActive, CreatedAt)
VALUES ('manager1', 'manager1@kyc.com', '{managerHash}', 'Manager Level 1', 2, 1, 1, NOW());

-- Manager Level 2
INSERT INTO Users (Username, Email, PasswordHash, FullName, RoleId, ApprovalLevel, IsActive, CreatedAt)
VALUES ('manager2', 'manager2@kyc.com', '{managerHash}', 'Manager Level 2', 2, 2, 1, NOW());

-- Manager Level 3
INSERT INTO Users (Username, Email, PasswordHash, FullName, RoleId, ApprovalLevel, IsActive, CreatedAt)
VALUES ('manager3', 'manager3@kyc.com', '{managerHash}', 'Manager Level 3', 2, 3, 1, NOW());

-- Data Entry User
INSERT INTO Users (Username, Email, PasswordHash, FullName, RoleId, ApprovalLevel, IsActive, CreatedAt)
VALUES ('user1', 'user1@kyc.com', '{userHash}', 'Data Entry User', 1, NULL, 1, NOW());
");

            Console.WriteLine("\nPress any key to exit...");
            Console.ReadKey();
        }
    }
}
