# Migration Complete - Extended KYC Fields

## ✅ Status: SUKSES

Migration **20251205030123_FinalExtendedKYCFields** telah berhasil diterapkan ke database `kyc_db`.

## Field Baru yang Ditambahkan

### 1. Detail Counterparty (Section 1)
- SubDistrict (Kelurahan)
- District (Kecamatan)
- City (Kota)
- Province (Provinsi)
- PostalCode (Kode Pos)
- Website
- NPWP
- NIB
- TaxAddress (Alamat NPWP)
- IsPKP (checkbox)
- HasBranchOffice (checkbox)
- IsManufacturer (checkbox)
- IsDistributor (checkbox)
- IsSubsidiary (checkbox)
- IsAffiliatedCompany (checkbox)

### 2. Perwakilan Sahma (Section 2)
- OwnerName (Nama Pemilik/Direktur)
- OwnerPosition (Jabatan)
- OwnerPhone (Telepon)
- OwnerEmail (Email)

### 3. Referensi Bank (Section 3)
- BankName
- BankAddress
- BankAccountNumber
- BankAccountName
- BankPhoneNumber
- BankContactPerson
- BankEmail

### 4. Kegiatan Perusahaan (Section 4)
- EmployeeMale (Jumlah karyawan pria)
- EmployeeFemale (Jumlah karyawan wanita)
- BusinessType (Jenis usaha)
- BusinessDescription (Keterangan usaha)
- CreditCheckType (Pemeriksaan kredit)
- CreditTerm (Jangka waktu)
- ProductsServices (Produk/jasa yang dijual)

### 5. Perusahaan Relasi (Section 5)
- ParentCompanyName (Nama perusahaan induk)
- ParentCompanyAddress (Alamat perusahaan induk)

### 6. Volume Usaha Tahunan (Section 6)
- Revenue2021 (Omzet tahun 2021)
- Revenue2022 (Omzet tahun 2022)
- Revenue2023 (Omzet tahun 2023)
- VolumeBreakdown2021 (JSON rincian 2021)
- VolumeBreakdown2022 (JSON rincian 2022)
- VolumeBreakdown2023 (JSON rincian 2023)

### 7. Kontak Internal (Section 7)
- InternalContactName (Nama PIC internal)
- InternalContactEmail (Email PIC)
- InternalContactPhone (Telepon PIC)

## Approval Workflow Fields (Vendor Only)
- ApprovedByLevel1, ApprovedByLevel2, ApprovedByLevel3
- ApprovedAtLevel1, ApprovedAtLevel2, ApprovedAtLevel3
- RejectedBy, RejectedAt
- SubmittedBy, SubmittedAt
- SyncedByIT, SyncedAt
- SAPBusinessPartnerId
- IsSyncedToSAP

## Verifikasi Database

```sql
-- Cek kolom Customers
DESCRIBE kyc_db.Customers;

-- Cek kolom Vendors
DESCRIBE kyc_db.Vendors;

-- Contoh query data
SELECT CustomerCode, Name, SubDistrict, City, NPWP, BankName 
FROM kyc_db.Customers;
```

## URL Testing

- **Backend API**: http://localhost:5000
- **Frontend**: http://localhost:5173
- **Customer Form**: http://localhost:5173/customers/create
- **Vendor Form**: http://localhost:5173/vendors/create

## Cara Menggunakan Form Baru

1. Buka browser ke http://localhost:5173/customers/create
2. Isi field-field wajib:
   - Customer Code
   - Customer Name
   - Address
   - SubDistrict, District, City, Province, PostalCode
   - Phone
   - Email
   - Division (auto-populated from user)
   - Required Approval Level

3. Isi field-field optional sesuai kebutuhan di 7 section
4. Klik **Create Customer**
5. Data akan tersimpan ke database dengan semua field baru

## File-File Yang Diupdate

### Backend
- `KYC.Core/Entities/Customer.cs` - Added 45+ properties
- `KYC.Core/Entities/Vendor.cs` - Added 45+ properties
- `KYC.Shared/DTOs/CreateCustomerRequest.cs` - Updated DTO
- `KYC.Shared/DTOs/CreateVendorRequest.cs` - Updated DTO
- `KYC.Infrastructure/Migrations/20251205030123_FinalExtendedKYCFields.cs` - Migration file

### Frontend
- `frontend/src/services/customerService.ts` - Updated interfaces
- `frontend/src/services/vendorService.ts` - Updated interfaces
- `frontend/src/pages/CreateCustomerPageNew.tsx` - New 7-section form
- `frontend/src/pages/CreateVendorPageNew.tsx` - New 7-section form
- `frontend/src/App.tsx` - Updated router

## Next Steps (Optional Improvements)

1. **Update Edit Pages**: Add new fields to EditCustomerPage and EditVendorPage
2. **Update Detail Pages**: Show all sections in view/detail pages
3. **Table Columns**: Add some key fields to list tables (NPWP, City, Bank, etc.)
4. **Validation**: Add format validation for NPWP (15 digits), NIB, etc.
5. **API Documentation**: Update Swagger docs with new fields

## Troubleshooting

### Migration Issues
Jika ada masalah dengan migration, jalankan:
```bash
cd c:\laragon\www\KYC\backend\KYC.API
dotnet ef migrations remove --project ..\KYC.Infrastructure --startup-project .
dotnet clean
dotnet build
dotnet ef migrations add NewMigrationName --project ..\KYC.Infrastructure --startup-project .
dotnet ef database update --project ..\KYC.Infrastructure --startup-project .
```

### Build Errors
Jika ada error saat build:
```bash
dotnet clean
dotnet build
```

### Database Connection
Pastikan MySQL/MariaDB di Laragon sudah running dan connection string di `appsettings.json` sudah benar.

## Kesimpulan

✅ Migration berhasil diterapkan  
✅ Database schema updated  
✅ Backend API updated  
✅ Frontend forms updated  
✅ Application running successfully  

Form Customer dan Vendor sekarang sudah lengkap dengan 7 section sesuai format GCU (Know Your Customer).
