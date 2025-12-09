-- Seed UserApprovals untuk existing users
-- Contoh: Manager bisa punya approval level berbeda per division

-- Verifikasi existing data
SELECT u.Id, u.FullName, u.Email, r.RoleName 
FROM Users u 
JOIN Roles r ON u.RoleId = r.Id;

SELECT * FROM Divisions;

-- CONTOH: Manager1 (manager1@kyc.com) - Level 1 untuk FOOD dan FEED
INSERT INTO UserApprovals (UserId, DivisionId, ApprovalLevel, IsActive, CreatedAt, UpdatedAt)
SELECT 
    u.Id as UserId,
    d.Id as DivisionId,
    1 as ApprovalLevel,
    1 as IsActive,
    NOW() as CreatedAt,
    NOW() as UpdatedAt
FROM Users u
CROSS JOIN Divisions d
WHERE u.Email = 'manager1@kyc.com'
AND d.DivisionCode IN ('FOOD', 'FEED')
ON DUPLICATE KEY UPDATE UpdatedAt = NOW();

-- Manager2 (manager2@kyc.com) - Level 2 untuk FOOD, Level 1 untuk FEED
INSERT INTO UserApprovals (UserId, DivisionId, ApprovalLevel, IsActive, CreatedAt, UpdatedAt)
VALUES 
(
    (SELECT Id FROM Users WHERE Email = 'manager2@kyc.com'),
    (SELECT Id FROM Divisions WHERE DivisionCode = 'FOOD'),
    2, -- Level 2 untuk FOOD
    1,
    NOW(),
    NOW()
),
(
    (SELECT Id FROM Users WHERE Email = 'manager2@kyc.com'),
    (SELECT Id FROM Divisions WHERE DivisionCode = 'FEED'),
    1, -- Level 1 untuk FEED
    1,
    NOW(),
    NOW()
)
ON DUPLICATE KEY UPDATE UpdatedAt = NOW();

-- Manager3 (manager3@kyc.com) - Level 3 untuk FOOD dan FEED
INSERT INTO UserApprovals (UserId, DivisionId, ApprovalLevel, IsActive, CreatedAt, UpdatedAt)
SELECT 
    u.Id as UserId,
    d.Id as DivisionId,
    3 as ApprovalLevel,
    1 as IsActive,
    NOW() as CreatedAt,
    NOW() as UpdatedAt
FROM Users u
CROSS JOIN Divisions d
WHERE u.Email = 'manager3@kyc.com'
AND d.DivisionCode IN ('FOOD', 'FEED')
ON DUPLICATE KEY UPDATE UpdatedAt = NOW();

-- Verifikasi hasil
SELECT 
    u.FullName,
    u.Email,
    r.RoleName,
    d.DivisionCode,
    d.DivisionName,
    ua.ApprovalLevel,
    ua.IsActive
FROM UserApprovals ua
JOIN Users u ON ua.UserId = u.Id
JOIN Roles r ON u.RoleId = r.Id
JOIN Divisions d ON ua.DivisionId = d.Id
ORDER BY u.Email, d.DivisionCode, ua.ApprovalLevel;
