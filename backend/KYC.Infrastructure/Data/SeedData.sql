-- Seed Data untuk KYC Database
-- Pastikan database kyc_db sudah ada dan migrations sudah dijalankan

USE kyc_db;

-- Insert IT Administrator (Full Access)
-- Password: Admin123!
INSERT INTO Users (Username, Email, PasswordHash, FullName, RoleId, ApprovalLevel, IsActive, CreatedAt)
VALUES (
    'admin',
    'admin@kyc.com',
    '$2a$11$XklTgH1WBpFxC60isn4MXetMW3Yep4lPNSc0NcwujPG2g3hQ25MCq',
    'IT Administrator',
    3, -- IT Role
    NULL,
    1,
    NOW()
);

-- Insert Manager Level 1
-- Password: Manager123!
INSERT INTO Users (Username, Email, PasswordHash, FullName, RoleId, ApprovalLevel, IsActive, CreatedAt)
VALUES (
    'manager1',
    'manager1@kyc.com',
    '$2a$11$V9tS4utee9Y/IVL0KGxDyO3N9ZL9VXlrXFuF8bSR.wf4aBkCQawwC',
    'Manager Level 1',
    2, -- Manager Role
    1, -- Approval Level 1
    1,
    NOW()
);

-- Insert Manager Level 2
-- Password: Manager123!
INSERT INTO Users (Username, Email, PasswordHash, FullName, RoleId, ApprovalLevel, IsActive, CreatedAt)
VALUES (
    'manager2',
    'manager2@kyc.com',
    '$2a$11$V9tS4utee9Y/IVL0KGxDyO3N9ZL9VXlrXFuF8bSR.wf4aBkCQawwC',
    'Manager Level 2',
    2, -- Manager Role
    2, -- Approval Level 2
    1,
    NOW()
);

-- Insert Manager Level 3
-- Password: Manager123!
INSERT INTO Users (Username, Email, PasswordHash, FullName, RoleId, ApprovalLevel, IsActive, CreatedAt)
VALUES (
    'manager3',
    'manager3@kyc.com',
    '$2a$11$V9tS4utee9Y/IVL0KGxDyO3N9ZL9VXlrXFuF8bSR.wf4aBkCQawwC',
    'Manager Level 3',
    2, -- Manager Role
    3, -- Approval Level 3
    1,
    NOW()
);

-- Insert Data Entry User
-- Password: User123!
INSERT INTO Users (Username, Email, PasswordHash, FullName, RoleId, ApprovalLevel, IsActive, CreatedAt)
VALUES (
    'user1',
    'user1@kyc.com',
    '$2a$11$9tdS3.LoPnMvuieyna54UOe4zz67RaZ7/ZKajggEmOgoi2q9l.WJG',
    'Data Entry User',
    1, -- User Role
    NULL,
    1,
    NOW()
);

-- Verify inserted users
SELECT 
    u.Id,
    u.Username,
    u.Email,
    u.FullName,
    r.RoleName,
    u.ApprovalLevel,
    u.IsActive
FROM Users u
JOIN Roles r ON u.RoleId = r.Id
ORDER BY u.RoleId DESC, u.ApprovalLevel ASC;
