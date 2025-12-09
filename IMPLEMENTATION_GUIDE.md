# KYC FORM UPDATE - COMPLETE IMPLEMENTATION GUIDE

## 📋 PERUBAHAN YANG DILAKUKAN

### 1. Backend (C#/.NET)
✅ **Entities Updated:**
- `KYC.Core/Entities/Customer.cs` - Added 40+ new fields for GCU form
- `KYC.Core/Entities/Vendor.cs` - Added 40+ new fields for GCU form

✅ **DTOs Updated:**
- `KYC.Shared/DTOs/CreateCustomerRequest.cs` - Complete form fields
- `KYC.Shared/DTOs/CreateVendorRequest.cs` - Complete form fields

✅ **Migration Created:**
- `KYC.Infrastructure/Migrations/20241205000001_AddExtendedKYCFields.cs`

### 2. Frontend (React/TypeScript)
✅ **Services Updated:**
- `frontend/src/services/customerService.ts` - Extended Customer & CreateCustomerRequest interfaces
- `frontend/src/services/vendorService.ts` - Extended Vendor & CreateVendorRequest interfaces

✅ **Pages Created:**
- `frontend/src/pages/CreateCustomerPageNew.tsx` - Complete 7-section GCU form

---

## 🏗️ STRUKTUR FORM GCU (7 BAGIAN)

### BAGIAN 1: DETAIL COUNTERPARTY
- Nama & Kode Customer/Vendor
- Alamat lengkap (Kelurahan, Kecamatan, Kota, Provinsi, Kode Pos)
- Kontak (Telepon, Email, Website)
- Dokumen Legal (NPWP, NIB, Alamat NPWP)
- Status Perusahaan (PKP, Kantor Cabang, Pabrik, Distributor, Anak Perusahaan, Afiliasi)

### BAGIAN 2: PERWAKILAN SAHMA (Owner/Management)
- Nama, Jabatan, Telepon, Email

### BAGIAN 3: REFERENSI BANK
- Nama Bank, Alamat Bank
- Nomor Rekening, Nama Pemilik Rekening
- Telepon Bank, Contact Person, Email

### BAGIAN 4: KEGIATAN PERUSAHAAN
- Jumlah Karyawan (Pria/Wanita)
- Jenis Usaha, Deskripsi Usaha
- Credit Check Type, Term Credit
- Produk atau Jasa

### BAGIAN 5: PERUSAHAAN RELASI
- Nama Perusahaan Induk/Cabang/Sister
- Alamat Perusahaan Terkait

### BAGIAN 6: VOLUME USAHA TAHUNAN
- Revenue 2021, 2022, 2023
- Volume Breakdown per tahun (JSON format)

### BAGIAN 7: KONTAK INTERNAL
- Nama, Email, Telepon (Person in Charge)

---

## 🚀 LANGKAH INSTALASI & MIGRASI

### Step 1: Backup Database (PENTING!)
```powershell
# Backup database sebelum migrasi
cd c:\laragon\www\KYC\backend\KYC.API
dotnet ef database --help
# Atau backup manual melalui SQL Server Management Studio
```

### Step 2: Run Migration
```powershell
cd c:\laragon\www\KYC\backend\KYC.API

# Option A: Add migration (jika belum ada)
dotnet ef migrations add AddExtendedKYCFields --project ..\KYC.Infrastructure --startup-project .

# Option B: Update database dengan migration yang sudah dibuat
dotnet ef database update --project ..\KYC.Infrastructure --startup-project .
```

### Step 3: Verify Database Schema
```sql
-- Cek kolom baru di tabel Customers
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Customers'
ORDER BY ORDINAL_POSITION;

-- Cek kolom baru di tabel Vendors
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Vendors'
ORDER BY ORDINAL_POSITION;
```

### Step 4: Update Frontend Route
```typescript
// File: frontend/src/App.tsx atau router config
// Ganti route CreateCustomerPage lama dengan yang baru:

// SEBELUM:
// import CreateCustomerPage from './pages/CreateCustomerPage'

// SETELAH:
import CreateCustomerPageNew from './pages/CreateCustomerPageNew'

// Update route:
<Route path="/customers/create" element={<CreateCustomerPageNew />} />
```

### Step 5: Test Backend API
```powershell
# Start backend
cd c:\laragon\www\KYC\backend\KYC.API
dotnet run

# Test endpoint dengan Postman atau curl
# POST http://localhost:5000/api/customers
# Body: JSON dengan field baru
```

### Step 6: Test Frontend
```powershell
cd c:\laragon\www\KYC\frontend
npm run dev

# Buka browser: http://localhost:5174/customers/create
# Test form dengan data lengkap
```

---

## 📝 FIELD MAPPING (OLD → NEW)

### Customer/Vendor Fields Added:
| Section | Field | Type | Required |
|---------|-------|------|----------|
| Address | SubDistrict, District, City, Province, PostalCode | string | Yes |
| Contact | Website | string | No |
| Legal | NPWP, NIB, TaxAddress | string | No |
| Status | IsPKP, HasBranchOffice, IsManufacturer, etc. | boolean | No |
| Owner | OwnerName, OwnerPosition, OwnerPhone, OwnerEmail | string | No |
| Bank | BankName, BankAddress, BankAccountNumber, etc. | string | No |
| Business | EmployeeMale, EmployeeFemale, BusinessType, etc. | int/string | No |
| Parent | ParentCompanyName, ParentCompanyAddress | string | No |
| Revenue | Revenue2021/2022/2023, VolumeBreakdown | decimal/string | No |
| Internal | InternalContactName, Email, Phone | string | No |

---

## ⚠️ CATATAN PENTING

1. **Database Migration**: Pastikan backup database sebelum run migration
2. **Required Fields**: Hanya field Customer Code/Name, Address, Contact yang mandatory
3. **Vendor Form**: Perlu dibuat CreateVendorPageNew.tsx dengan struktur serupa
4. **Update Existing Records**: Record lama akan memiliki NULL di field baru (aman)
5. **API Controllers**: Tidak perlu diubah karena menggunakan DTOs yang sudah diupdate
6. **Validation**: Tambahkan validasi di backend jika diperlukan (e.g., NPWP format)

---

## 🐛 TROUBLESHOOTING

### Migration Error
```powershell
# Jika error saat migration:
dotnet ef migrations remove --project ..\KYC.Infrastructure --startup-project .
# Lalu re-add migration
dotnet ef migrations add AddExtendedKYCFields --project ..\KYC.Infrastructure --startup-project .
```

### TypeScript Errors
```bash
# Clear cache dan rebuild
cd c:\laragon\www\KYC\frontend
rm -rf node_modules
rm package-lock.json
npm install
npm run dev
```

### API 400 Bad Request
- Check request body matches CreateCustomerRequest DTO
- Verify divisionId exists in database
- Check required fields are not null/empty

---

## 📦 FILES MODIFIED/CREATED

### Backend:
1. `backend/KYC.Core/Entities/Customer.cs` - ✅ Modified
2. `backend/KYC.Core/Entities/Vendor.cs` - ✅ Modified
3. `backend/KYC.Shared/DTOs/CreateCustomerRequest.cs` - ✅ Modified
4. `backend/KYC.Shared/DTOs/CreateVendorRequest.cs` - ✅ Modified
5. `backend/KYC.Infrastructure/Migrations/20241205000001_AddExtendedKYCFields.cs` - ✅ Created

### Frontend:
1. `frontend/src/services/customerService.ts` - ✅ Modified
2. `frontend/src/services/vendorService.ts` - ✅ Modified
3. `frontend/src/pages/CreateCustomerPageNew.tsx` - ✅ Created
4. `frontend/src/pages/CreateVendorPageNew.tsx` - ⏳ TODO (sama seperti Customer)

---

## ✅ NEXT STEPS

1. **Run Database Migration** (Step 2 di atas)
2. **Update Router** untuk menggunakan CreateCustomerPageNew
3. **Create Vendor Form** (clone dari Customer, ganti interface)
4. **Test End-to-End** dari form submit sampai database
5. **Update Detail/Edit Pages** untuk menampilkan field baru
6. **Optional**: Buat PDF export dengan field lengkap

---

## 📞 SUPPORT
Jika ada masalah saat implementasi, check:
- Console errors (browser F12)
- Backend logs (dotnet console)
- Database schema (SQL query)
- Network tab untuk API responses

Done! 🎉
