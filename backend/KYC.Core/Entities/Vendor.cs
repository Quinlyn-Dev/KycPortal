using System;
using System.Collections.Generic;

namespace KYC.Core.Entities
{
    public class Vendor
    {
        public int Id { get; set; }
        
        // BAGIAN 1: DETAIL COUNTERPARTY
        public string VendorCode { get; set; } = null!;
        public string VendorName { get; set; } = null!;
        
        // Alamat lengkap
        public string Address { get; set; } = string.Empty;
        public string SubDistrict { get; set; } = string.Empty;
        public string District { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string Province { get; set; } = string.Empty;
        public string PostalCode { get; set; } = string.Empty;
        
        // Kontak
        public string PhoneNumber { get; set; } = string.Empty;
        public string Email { get; set; } = null!;
        public string? Website { get; set; }
        
        // Dokumen legal
        public string? NPWP { get; set; }
        public string? NIB { get; set; }
        public string? TaxAddress { get; set; }
        
        // Status perusahaan
        public bool? IsPKP { get; set; }
        public bool? HasBranchOffice { get; set; }
        public bool? IsManufacturer { get; set; }
        public bool? IsDistributor { get; set; }
        public bool? IsSubsidiary { get; set; }
        public bool? IsAffiliatedCompany { get; set; }
        
        // BAGIAN 2: PERWAKILAN SAHMA
        public string? OwnerName { get; set; }
        public string? OwnerPosition { get; set; }
        public string? OwnerPhone { get; set; }
        public string? OwnerEmail { get; set; }
        
        // BAGIAN 3: REFERENSI BANK
        public string? BankName { get; set; }
        public string? BankAddress { get; set; }
        public string? BankAccountNumber { get; set; }
        public string? BankAccountName { get; set; }
        public string? BankPhoneNumber { get; set; }
        public string? BankContactPerson { get; set; }
        public string? BankEmail { get; set; }
        
        // BAGIAN 4: KEGIATAN PERUSAHAAN
        public int? EmployeeMale { get; set; }
        public int? EmployeeFemale { get; set; }
        public string? BusinessType { get; set; }
        public string? BusinessDescription { get; set; }
        public string? CreditCheckType { get; set; }
        public string? CreditTerm { get; set; }
        public string? ProductsServices { get; set; }
        
        // BAGIAN 5: PERUSAHAAN RELASI
        public string? ParentCompanyName { get; set; }
        public string? ParentCompanyAddress { get; set; }
        
        // BAGIAN 6: VOLUME USAHA TAHUNAN
        public decimal? Revenue2021 { get; set; }
        public decimal? Revenue2022 { get; set; }
        public decimal? Revenue2023 { get; set; }
        public string? VolumeBreakdown2021 { get; set; }
        public string? VolumeBreakdown2022 { get; set; }
        public string? VolumeBreakdown2023 { get; set; }
        
        // BAGIAN 7: KONTAK INTERNAL
        public string? InternalContactName { get; set; }
        public string? InternalContactEmail { get; set; }
        public string? InternalContactPhone { get; set; }
        
        // EXISTING FIELDS
        public string KYCStatus { get; set; } = "DRAFT";
        public int? DivisionId { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        
        // SAP Integration
        public string? SAPBusinessPartnerId { get; set; }
        public bool IsSyncedToSAP { get; set; } = false;
        
        // Approval Fields
        public int? SubmittedBy { get; set; }
        public DateTime? SubmittedAt { get; set; }
        
        public int? ApprovedByLevel1 { get; set; }
        public DateTime? ApprovedAtLevel1 { get; set; }
        
        public int? ApprovedByLevel2 { get; set; }
        public DateTime? ApprovedAtLevel2 { get; set; }
        
        public int? ApprovedByLevel3 { get; set; }
        public DateTime? ApprovedAtLevel3 { get; set; }
        
        public int? RejectedBy { get; set; }
        public DateTime? RejectedAt { get; set; }
        public string? RejectionReason { get; set; }
        
        public int? SyncedByIT { get; set; }
        public DateTime? SyncedAt { get; set; }
        
        public int RequiredApprovalLevels { get; set; } = 2;

        // Navigation
        public User? CreatedByUser { get; set; }
        public Division? Division { get; set; }
        public User? SubmittedByUser { get; set; }
        public User? ApprovedByLevel1User { get; set; }
        public User? ApprovedByLevel2User { get; set; }
        public User? ApprovedByLevel3User { get; set; }
        public User? RejectedByUser { get; set; }
        public User? SyncedByITUser { get; set; }
        public ICollection<ApprovalHistory>? ApprovalHistories { get; set; }
    }
}
