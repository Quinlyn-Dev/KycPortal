-- Script untuk mengatur MaxApprovalLevel secara dinamis
-- Contoh: untuk mendukung approval level yang berbeda-beda

-- Saat ini: Manager role memiliki 3 level approval (sudah di set oleh migration)
SELECT * FROM Roles;

-- Contoh: Jika nanti mau menambah role baru dengan approval level berbeda
-- INSERT INTO Roles (RoleName, Description, MaxApprovalLevel, CreatedAt, UpdatedAt) 
-- VALUES ('Supervisor', 'Level menengah dengan 2 level approval', 2, NOW(), NOW());

-- Contoh: Jika ingin mengubah Manager jadi 5 level approval
-- UPDATE Roles SET MaxApprovalLevel = 5 WHERE RoleName = 'Manager';

-- Contoh: Jika ingin menambah role "Director" dengan 1 level approval saja
-- INSERT INTO Roles (RoleName, Description, MaxApprovalLevel, CreatedAt, UpdatedAt) 
-- VALUES ('Director', 'Approval final dengan 1 level', 1, NOW(), NOW());

-- Verifikasi data users saat ini dengan approval level
SELECT 
    u.Id,
    u.FullName,
    u.Email,
    r.RoleName,
    u.ApprovalLevel,
    r.MaxApprovalLevel as 'Max Level for Role'
FROM Users u
JOIN Roles r ON u.RoleId = r.Id
ORDER BY r.Id, u.ApprovalLevel;
