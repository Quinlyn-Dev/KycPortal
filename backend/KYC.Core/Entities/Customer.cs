namespace KYC.Core.Entities;

public class Customer
{
    public int Id { get; set; }
    
    // BAGIAN 1: DETAIL COUNTERPARTY
    public string CustomerCode { get; set; } = string.Empty; // Nomor Formulir Registrasi
    public string CustomerName { get; set; } = string.Empty; // Nama Terdaftar
    
    // Alamat
    public string Address { get; set; } = string.Empty; // Alamat Pengiriman
    public string? RegisteredAddress { get; set; } // Alamat Terdaftar
    public string? CorrespondenceAddress { get; set; } // Alamat Surat Menyurat
    
    // Tanggal dan Tempat Pendirian
    public DateTime? EstablishmentDate { get; set; } // Tanggal Pendirian Badan Usaha
    public string? EstablishmentCountry { get; set; } // Negara Tempat Pendirian Badan Usaha
    public string? RegistrationNumber { get; set; } // Nomor Registrasi Badan Usaha
    
    // Kontak
    public string PhoneNumber { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Website { get; set; }
    public string? Facsimile { get; set; }
    
    // Dokumen legal
    public string? NPWP { get; set; }
    public string? NIB { get; set; } // Nomor Induk Berusaha
    public string? TaxAddress { get; set; } // Alamat NPWP
    public string? IdentityCardNumber { get; set; } // Kartu Identitas (KTP)
    
    // Status dan Sifat Bisnis
    public bool? IsPKP { get; set; } // Pengusaha Kena Pajak
    public string? BusinessNature { get; set; } // Sifat Bisnis (Indonesia, Asing Bersama, Asing 100%)
    public bool? IsManufacturer { get; set; } // Pabrik
    public bool? IsDistributor { get; set; }
    public string? Auditor { get; set; } // Auditor
    
    // Lainnya - Lampiran Dokumen
    public bool? HasAttachmentIndonesia { get; set; } // Akta Pendirian Badan Usaha
    public bool? HasAttachmentForeign { get; set; } // Akta Kepemilikan Asing
    public bool? HasAttachmentSKT { get; set; } // Surat Keterangan Terdaftar
    public bool? HasAttachmentNPWP { get; set; } // NPWP
    public bool? HasAttachmentNIB { get; set; } // NIB
    public bool? HasAttachmentTDP { get; set; } // Tanda Daftar Perusahaan
    public bool? HasAttachmentSIUP { get; set; } // SIUP
    public bool? HasAttachmentProfit { get; set; } // Laporan Laba/Rugi
    public bool? HasAttachmentBalanceSheet { get; set; } // Neraca
    public bool? HasAttachmentCashFlow { get; set; } // Arus Kas
    public bool? HasAttachmentTaxReturn { get; set; } // SPT
    public bool? HasAttachmentOther { get; set; } // Lain-lain
    
    // BAGIAN 2: KONTAK INFORMASI
    // REFERENSI PIC KOMERSIL
    public string? CommercialPicName { get; set; }
    public string? CommercialPicPosition { get; set; }
    public string? CommercialPicPhone { get; set; }
    public string? CommercialPicEmail { get; set; }
    
    // KEGIATAN PENAGIHAN - REFERENSI PIC DEPARTEMEN KEUANGAN
    public string? FinancePicName { get; set; }
    public string? FinancePicEmail { get; set; }
    public string? FinancePicPhone { get; set; }
    
    // REFERENSI BANK
    public string? ReferenceBankName { get; set; }
    public string? ReferenceBankAddress { get; set; }
    public string? ReferenceBankAccountNumber { get; set; }
    
    // PERSETUJUAN DEPARTEMEN INTERNAL
    public string? CommercialReviewerName { get; set; }
    public string? CommercialReviewerDate { get; set; }
    public string? GmApprovalName { get; set; }
    public string? GmApprovalDate { get; set; }
    
    // PERSETUJUAN DEPARTEMEN KEUANGAN DAN IT
    public string? TransactionCurrency { get; set; }
    public string? FinanceDivision { get; set; }
    public string? BuyerVendorType { get; set; }
    public string? SapAccountType { get; set; }
    public string? CreditLimitAmount { get; set; }
    public string? FinanceNotes { get; set; }
    public string? FinanceReviewerName { get; set; }
    public string? FinanceReviewerDate { get; set; }
    public string? FinanceGmSignature { get; set; }
    public string? FinanceGmApprovalName { get; set; }
    public string? FinanceGmApprovalDate { get; set; }
    public string? SapAccountNumber { get; set; }
    public string? ItRegistrationDate { get; set; }
    public string? AcknowledgedBy { get; set; }
    public string? AcknowledgedByDate { get; set; }
    
    // Form Pernyataan
    public string? RegistrationSubmissionDate { get; set; }
    public string? SubmitterNamePosition { get; set; }
    public string? CompanySignatureStamp { get; set; }
    
    public string? OwnerName { get; set; }
    public string? OwnerPosition { get; set; }
    public string? OwnerPhone { get; set; }
    public string? OwnerEmail { get; set; }
    
    // BAGIAN 3: BANK UTAMA
    public string? PrimaryBankName { get; set; } // Bank Utama
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
    public string? ParentCompanyName { get; set; } // Perusahaan Pemilik
    public string? ParentCompanyAddress { get; set; }
    public string? AffiliatedCompanyName { get; set; } // Perusahaan Afiliasi
    public string? AffiliatedCompanyDetails { get; set; } // Detail Afiliasi (bisa JSON untuk multiple entries)
    
    // Penerima Manfaat Sebenarnya (Beneficial Owners)
    public string? BeneficialOwners { get; set; } // JSON array: [{nama, persentase, jabatan, kewarganegaraan}]
    
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
    
    // BAGIAN 8: DIREKTUR / MITRA / PENANDATANGAN RESMI
    public string? AuthorizedSignatories { get; set; } // JSON array: [{nama, jabatan}]
    
    // BAGIAN 9: POTENSI KEGIATAN USAHA
    public string? BusinessPotential { get; set; } // Potensi kegiatan usaha
    
    // BAGIAN 10: KUANTITAS DAN FREKUENSI YANG DIHARAPKAN
    public string? ExpectedQuantityFrequency { get; set; } // Kuantitas dan Frekuensi yang Diharapkan
    
    // SYARAT PEMBAYARAN
    public string? PaymentTerms { get; set; } // Syarat Pembayaran yang Dimohonkan
    
    // EXISTING FIELDS
    public int DivisionId { get; set; }
    public string KYCStatus { get; set; } = "DRAFT";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
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
    
    // Ownership
    public int? CreatedBy { get; set; }
    public User? CreatedByUser { get; set; }
    
    // Navigation Properties
    public Division Division { get; set; } = null!;
    public User? SubmittedByUser { get; set; }
    public User? ApprovedByLevel1User { get; set; }
    public User? ApprovedByLevel2User { get; set; }
    public User? ApprovedByLevel3User { get; set; }
    public User? RejectedByUser { get; set; }
    public User? SyncedByITUser { get; set; }
    public ICollection<ApprovalHistory> ApprovalHistories { get; set; } = new List<ApprovalHistory>();
}
