# KYC System - Default Users

## ✅ Users telah berhasil dibuat di database!

### 🔐 Default User Accounts

| Role | Username | Email | Password | Approval Level | Access Rights |
|------|----------|-------|----------|----------------|---------------|
| **IT Administrator** | `admin` | admin@kyc.com | `Admin123!` | - | Full system access, user management, SAP sync |
| **Manager Level 1** | `manager1` | manager1@kyc.com | `Manager123!` | 1 | First level approval |
| **Manager Level 2** | `manager2` | manager2@kyc.com | `Manager123!` | 2 | Second level approval |
| **Manager Level 3** | `manager3` | manager3@kyc.com | `Manager123!` | 3 | Third level approval (final) |
| **Data Entry** | `user1` | user1@kyc.com | `User123!` | - | Create & edit customers (DRAFT only) |

---

## 🚀 Cara Login

### 1. **Login sebagai IT Administrator** (Recommended untuk setup awal)
   - Email: `admin@kyc.com`
   - Password: `Admin123!`
   - Akses: Full control system

### 2. **Login sebagai Manager** (untuk approval workflow)
   - **Level 1**: manager1@kyc.com / Manager123!
   - **Level 2**: manager2@kyc.com / Manager123!
   - **Level 3**: manager3@kyc.com / Manager123!

### 3. **Login sebagai Data Entry** (untuk input customer)
   - Email: `user1@kyc.com`
   - Password: `User123!`

---

## 📋 Approval Workflow

```
[User] Data Entry
   ↓ Creates & Submits Customer (Status: SUBMITTED)
   
[Manager L1] First Approval
   ↓ Approves (Status: APPROVED_L1)
   
[Manager L2] Second Approval
   ↓ Approves (Status: APPROVED_L2)
   
[Manager L3] Final Approval
   ↓ Approves (Status: APPROVED_L3 / READY_FOR_SAP)
   
[IT Admin] SAP Sync
   ↓ Syncs to SAP (Status: SYNCED_TO_SAP)
```

---

## 🔧 Password Hash Generation

Passwords di-hash menggunakan **BCrypt** dengan work factor 11.
Untuk generate hash baru, gunakan tool:

```powershell
cd c:\laragon\www\KYC\backend\Tools\PasswordHasher
dotnet run
```

---

## 📊 Database Verification

Users sudah tersimpan di database `kyc_db` table `Users`.

Untuk verify, jalankan query:
```sql
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
```

---

## ⚠️ Security Notes

1. **Ganti password default** setelah first login untuk production
2. IT Administrator memiliki **full access** ke semua fitur
3. Password minimal 6 karakter (enforced di frontend & backend)
4. JWT token expired setelah 60 menit
5. Inactive users tidak bisa login (IsActive = 0)

---

## 🎯 Next Steps

1. ✅ Backend running: `http://localhost:5000`
2. ✅ Database seeded dengan default users
3. ⏳ Start frontend: `npm run dev` di folder frontend
4. ⏳ Login dengan admin@kyc.com
5. ⏳ Test approval workflow
6. ⏳ Create manager approval pages
7. ⏳ Create IT SAP sync page
