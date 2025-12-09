import { apiClient } from './api'

export interface Vendor {
  id: number
  
  // BAGIAN 1: DETAIL COUNTERPARTY
  vendorCode: string
  vendorName: string
  address: string
  subDistrict: string
  district: string
  city: string
  province: string
  postalCode: string
  phoneNumber: string
  email: string
  website?: string
  npwp?: string
  nib?: string
  taxAddress?: string
  isPKP?: boolean
  hasBranchOffice?: boolean
  isManufacturer?: boolean
  isDistributor?: boolean
  isSubsidiary?: boolean
  isAffiliatedCompany?: boolean
  
  // BAGIAN 2: PERWAKILAN SAHMA
  ownerName?: string
  ownerPosition?: string
  ownerPhone?: string
  ownerEmail?: string
  
  // BAGIAN 3: REFERENSI BANK
  bankName?: string
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
  
  // EXISTING FIELDS
  kycStatus: string
  divisionId?: number
  createdAt: string
  updatedAt?: string
  createdBy?: number
  createdByName?: string
}

export interface CreateVendorRequest {
  // BAGIAN 1: DETAIL COUNTERPARTY
  vendorCode: string
  vendorName: string
  address: string
  subDistrict: string
  district: string
  city: string
  province: string
  postalCode: string
  phoneNumber: string
  email: string
  website?: string
  npwp?: string
  nib?: string
  taxAddress?: string
  isPKP?: boolean
  hasBranchOffice?: boolean
  isManufacturer?: boolean
  isDistributor?: boolean
  isSubsidiary?: boolean
  isAffiliatedCompany?: boolean
  
  // BAGIAN 2: PERWAKILAN SAHMA
  ownerName?: string
  ownerPosition?: string
  ownerPhone?: string
  ownerEmail?: string
  
  // BAGIAN 3: REFERENSI BANK
  bankName?: string
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
  
  divisionId?: number
  requiredApprovalLevels?: number
}

export const vendorService = {
  async getAll(): Promise<Vendor[]> {
    const resp = await apiClient.get<Vendor[]>('/vendors')
    return resp.data
  },

  async getById(id: number): Promise<Vendor> {
    const resp = await apiClient.get<Vendor>(`/vendors/${id}`)
    return resp.data
  },

  async create(data: CreateVendorRequest): Promise<Vendor> {
    const resp = await apiClient.post<Vendor>('/vendors', data)
    return resp.data
  }
,

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/vendors/${id}`)
  }
}
