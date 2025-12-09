namespace KYC.Shared.DTOs;

public class CreateCustomerRequest
{
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
    public string? NIB { get; set; }
    public string? TaxAddress { get; set; }
    public string? IdentityCardNumber { get; set; } // Kartu Identitas (KTP)
    
    // Status dan Sifat Bisnis
    public bool? IsPKP { get; set; }
    public string? BusinessNature { get; set; } // Sifat Bisnis
    public bool? IsManufacturer { get; set; }
    public bool? IsDistributor { get; set; }
    public string? Auditor { get; set; }
    
    // Lampiran Dokumen
    public bool? HasAttachmentIndonesia { get; set; }
    public bool? HasAttachmentForeign { get; set; }
    public bool? HasAttachmentSKT { get; set; }
    public bool? HasAttachmentNPWP { get; set; }
    public bool? HasAttachmentNIB { get; set; }
    public bool? HasAttachmentTDP { get; set; }
    public bool? HasAttachmentSIUP { get; set; }
    public bool? HasAttachmentProfit { get; set; }
    public bool? HasAttachmentBalanceSheet { get; set; }
    public bool? HasAttachmentCashFlow { get; set; }
    public bool? HasAttachmentTaxReturn { get; set; }
    public bool? HasAttachmentOther { get; set; }
    
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
    public string? PrimaryBankName { get; set; }
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
    public string? AffiliatedCompanyDetails { get; set; }
    public string? BeneficialOwners { get; set; } // Penerima Manfaat Sebenarnya (JSON)
    
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
    public string? AuthorizedSignatories { get; set; } // JSON array
    
    // BAGIAN 9: POTENSI KEGIATAN USAHA
    public string? BusinessPotential { get; set; }
    
    // BAGIAN 10: KUANTITAS DAN FREKUENSI YANG DIHARAPKAN
    public string? ExpectedQuantityFrequency { get; set; }
    
    // SYARAT PEMBAYARAN
    public string? PaymentTerms { get; set; }
    
    public int DivisionId { get; set; }
    public int? RequiredApprovalLevels { get; set; } = 2;
}
