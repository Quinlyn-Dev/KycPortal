import { apiClient } from './api'

export interface Customer {
  id: number
  
  // BAGIAN 1: DETAIL COUNTERPARTY
  customerCode: string // Nomor Formulir Registrasi
  customerName: string // Nama Terdaftar
  
  // Alamat
  address: string // Alamat Pengiriman
  registeredAddress?: string // Alamat Terdaftar
  correspondenceAddress?: string // Alamat Surat Menyurat
  
  // Tanggal dan Tempat Pendirian
  establishmentDate?: string // Tanggal Pendirian Badan Usaha
  establishmentCountry?: string // Negara Tempat Pendirian Badan Usaha
  registrationNumber?: string // Nomor Registrasi Badan Usaha
  
  // Kontak
  phoneNumber: string
  email: string
  website?: string
  facsimile?: string
  
  // Dokumen legal
  npwp?: string
  nib?: string
  taxAddress?: string
  identityCardNumber?: string // Kartu Identitas (KTP)
  
  // Status dan Sifat Bisnis
  isPKP?: boolean
  businessNature?: string // Sifat Bisnis
  isManufacturer?: boolean
  isDistributor?: boolean
  auditor?: string
  
  // Lampiran Dokumen
  hasAttachmentIndonesia?: boolean
  hasAttachmentForeign?: boolean
  hasAttachmentSKT?: boolean
  hasAttachmentNPWP?: boolean
  hasAttachmentNIB?: boolean
  hasAttachmentTDP?: boolean
  hasAttachmentSIUP?: boolean
  hasAttachmentProfit?: boolean
  hasAttachmentBalanceSheet?: boolean
  hasAttachmentCashFlow?: boolean
  hasAttachmentTaxReturn?: boolean
  hasAttachmentOther?: boolean
  
  // BAGIAN 2: KONTAK INFORMASI
  commercialPicName?: string
  commercialPicPosition?: string
  commercialPicPhone?: string
  commercialPicEmail?: string
  financePicName?: string
  financePicEmail?: string
  financePicPhone?: string
  referenceBankName?: string
  referenceBankAddress?: string
  referenceBankAccountNumber?: string
  
  // FORM PERNYATAAN
  registrationSubmissionDate?: string
  submitterNamePosition?: string
  companySignatureStamp?: string
  
  // PERSETUJUAN DEPARTEMEN INTERNAL
  commercialReviewerName?: string
  commercialReviewerDate?: string
  gmApprovalName?: string
  gmApprovalDate?: string
  
  // PERSETUJUAN DEPARTEMEN KEUANGAN DAN IT
  transactionCurrency?: string
  financeDivision?: string
  buyerVendorType?: string
  sapAccountType?: string
  creditLimitAmount?: string
  financeNotes?: string
  financeReviewerName?: string
  financeReviewerDate?: string
  financeGmSignature?: string
  financeGmApprovalName?: string
  financeGmApprovalDate?: string
  sapAccountNumber?: string
  itRegistrationDate?: string
  acknowledgedBy?: string
  acknowledgedByDate?: string
  
  ownerName?: string
  ownerPosition?: string
  ownerPhone?: string
  ownerEmail?: string
  
  // BAGIAN 3: BANK UTAMA
  primaryBankName?: string
  bankAddress?: string
  bankAccountNumber?: string
  bankAccountName?: string
  bankPhoneNumber?: string
  bankContactPerson?: string
  bankEmail?: string
  
  // BAGIAN 4: KEGIATAN PERUSAHAAN
  employeeMale?: number
  employeeFemale?: number
  businessType?: string
  businessDescription?: string
  creditCheckType?: string
  creditTerm?: string
  productsServices?: string
  
  // BAGIAN 5: PERUSAHAAN RELASI
  parentCompanyName?: string
  parentCompanyAddress?: string
  affiliatedCompanyName?: string // Field yang hilang!
  affiliatedCompanyDetails?: string // Field yang hilang!
  
  // Penerima Manfaat Sebenarnya
  beneficialOwners?: string // Field yang hilang!
  
  // BAGIAN 6: VOLUME USAHA TAHUNAN
  revenue2021?: number
  revenue2022?: number
  revenue2023?: number
  volumeBreakdown2021?: string
  volumeBreakdown2022?: string
  volumeBreakdown2023?: string
  
  // BAGIAN 7: KONTAK INTERNAL
  internalContactName?: string
  internalContactEmail?: string
  internalContactPhone?: string
  
  // BAGIAN 8: DIREKTUR / MITRA / PENANDATANGAN RESMI
  authorizedSignatories?: string // JSON array
  
  // BAGIAN 9: POTENSI KEGIATAN USAHA
  businessPotential?: string
  
  // BAGIAN 10: KUANTITAS DAN FREKUENSI YANG DIHARAPKAN
  expectedQuantityFrequency?: string
  
  // Syarat Pembayaran
  paymentTerms?: string
  
  // EXISTING FIELDS
  kycStatus: string
  requiredApprovalLevels?: number
  createdAt: string
  updatedAt?: string
  createdBy?: number
  createdByName?: string
  submittedByName?: string
  submittedAt?: string
  approvedByLevel1Name?: string
  approvedAtLevel1?: string
  approvedByLevel2Name?: string
  approvedAtLevel2?: string
  approvedByLevel3Name?: string
  approvedAtLevel3?: string
  rejectedByName?: string
  rejectedAt?: string
  rejectionReason?: string
}

export interface CreateCustomerRequest {
  // BAGIAN 1: DETAIL COUNTERPARTY
  customerCode: string // Nomor Formulir Registrasi
  customerName: string // Nama Terdaftar
  address: string // Alamat Pengiriman
  registeredAddress?: string // Alamat Terdaftar
  correspondenceAddress?: string // Alamat Surat Menyurat
  establishmentDate?: string // Tanggal Pendirian Badan Usaha
  establishmentCountry?: string // Negara Tempat Pendirian Badan Usaha
  registrationNumber?: string // Nomor Registrasi Badan Usaha
  phoneNumber: string
  email: string
  website?: string
  facsimile?: string
  npwp?: string
  nib?: string
  taxAddress?: string
  identityCardNumber?: string // Kartu Identitas (KTP)
  isPKP?: boolean
  businessNature?: string // Sifat Bisnis
  isManufacturer?: boolean
  isDistributor?: boolean
  auditor?: string
  hasAttachmentIndonesia?: boolean
  hasAttachmentForeign?: boolean
  hasAttachmentSKT?: boolean
  hasAttachmentNPWP?: boolean
  hasAttachmentNIB?: boolean
  hasAttachmentTDP?: boolean
  hasAttachmentSIUP?: boolean
  hasAttachmentProfit?: boolean
  hasAttachmentBalanceSheet?: boolean
  hasAttachmentCashFlow?: boolean
  hasAttachmentTaxReturn?: boolean
  hasAttachmentOther?: boolean
  
  // BAGIAN 2: KONTAK INFORMASI
  commercialPicName?: string
  commercialPicPosition?: string
  commercialPicPhone?: string
  commercialPicEmail?: string
  financePicName?: string
  financePicEmail?: string
  financePicPhone?: string
  referenceBankName?: string
  referenceBankAddress?: string
  referenceBankAccountNumber?: string
  
  // FORM PERNYATAAN
  registrationSubmissionDate?: string
  submitterNamePosition?: string
  companySignatureStamp?: string
  
  // PERSETUJUAN DEPARTEMEN INTERNAL
  commercialReviewerName?: string
  commercialReviewerDate?: string
  gmApprovalName?: string
  gmApprovalDate?: string
  
  // PERSETUJUAN DEPARTEMEN KEUANGAN DAN IT
  transactionCurrency?: string
  financeDivision?: string
  buyerVendorType?: string
  sapAccountType?: string
  creditLimitAmount?: string
  financeNotes?: string
  financeReviewerName?: string
  financeReviewerDate?: string
  financeGmSignature?: string
  financeGmApprovalName?: string
  financeGmApprovalDate?: string
  sapAccountNumber?: string
  itRegistrationDate?: string
  acknowledgedBy?: string
  acknowledgedByDate?: string
  
  ownerName?: string
  ownerPosition?: string
  ownerPhone?: string
  ownerEmail?: string
  
  // BAGIAN 3: BANK UTAMA
  primaryBankName?: string
  bankAddress?: string
  bankAccountNumber?: string
  bankAccountName?: string
  bankPhoneNumber?: string
  bankContactPerson?: string
  bankEmail?: string
  
  // BAGIAN 4: KEGIATAN PERUSAHAAN
  employeeMale?: number
  employeeFemale?: number
  businessType?: string
  businessDescription?: string
  creditCheckType?: string
  creditTerm?: string
  productsServices?: string
  
  // BAGIAN 5: PERUSAHAAN RELASI
  parentCompanyName?: string // Perusahaan Pemilik
  parentCompanyAddress?: string
  affiliatedCompanyName?: string // Perusahaan Afiliasi
  affiliatedCompanyDetails?: string
  beneficialOwners?: string // Penerima Manfaat Sebenarnya (JSON)
  
  // BAGIAN 6: VOLUME USAHA TAHUNAN
  revenue2021?: number
  revenue2022?: number
  revenue2023?: number
  volumeBreakdown2021?: string
  volumeBreakdown2022?: string
  volumeBreakdown2023?: string
  
  // BAGIAN 7: KONTAK INTERNAL
  internalContactName?: string
  internalContactEmail?: string
  internalContactPhone?: string
  
  // BAGIAN 8: DIREKTUR / MITRA / PENANDATANGAN RESMI
  authorizedSignatories?: string // JSON array
  
  // BAGIAN 9: POTENSI KEGIATAN USAHA
  businessPotential?: string
  
  // BAGIAN 10: KUANTITAS DAN FREKUENSI YANG DIHARAPKAN
  expectedQuantityFrequency?: string
  
  // Syarat Pembayaran
  paymentTerms?: string
  
  divisionId: number
  requiredApprovalLevels?: number
}

export const customerService = {
  // Get all customers
  async getAll(): Promise<Customer[]> {
    const response = await apiClient.get<Customer[]>('/customers')
    return response.data
  },

  // Get customer by ID
  async getById(id: number): Promise<Customer> {
    const response = await apiClient.get<Customer>(`/customers/${id}`)
    return response.data
  },

  // Create new customer
  async create(data: CreateCustomerRequest): Promise<Customer> {
    const response = await apiClient.post<Customer>('/customers', data)
    return response.data
  },

  // Update customer
  async update(id: number, data: CreateCustomerRequest): Promise<void> {
    await apiClient.put(`/customers/${id}`, data)
  },

  // Delete customer
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/customers/${id}`)
  },

  // Update KYC status
  async updateKYCStatus(id: number, status: string): Promise<void> {
    await apiClient.patch(`/customers/${id}/kyc-status`, JSON.stringify(status), {
      headers: {
        'Content-Type': 'application/json'
      }
    })
  },

  // Sync to SAP
  async syncToSAP(id: number): Promise<void> {
    await apiClient.post(`/customers/${id}/sync-sap`)
  },

  // Submit customer for approval
  async submit(id: number): Promise<void> {
    await apiClient.post(`/customers/${id}/submit`)
  }
}
