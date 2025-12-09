import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { customerService, CreateCustomerRequest } from '../services/customerService'
import { authService, DivisionDto } from '../services/authService'
import { SignaturePad } from '../components/SignaturePad'
import '../styles/modern.css'

export default function CreateCustomerPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [formData, setFormData] = useState<CreateCustomerRequest>({
    // BAGIAN 1: DETAIL COUNTERPARTY
    customerCode: '',
    customerName: '',
    address: '',
    registeredAddress: '',
    correspondenceAddress: '',
    establishmentDate: '',
    establishmentCountry: '',
    registrationNumber: '',
    phoneNumber: '',
    email: '',
    website: '',
    facsimile: '',
    npwp: '',
    nib: '',
    taxAddress: '',
    identityCardNumber: '',
    isPKP: false,
    businessNature: '',
    isManufacturer: false,
    isDistributor: false,
    auditor: '',
    hasAttachmentIndonesia: false,
    hasAttachmentForeign: false,
    hasAttachmentSKT: false,
    hasAttachmentNPWP: false,
    hasAttachmentNIB: false,
    hasAttachmentTDP: false,
    hasAttachmentSIUP: false,
    hasAttachmentProfit: false,
    hasAttachmentBalanceSheet: false,
    hasAttachmentCashFlow: false,
    hasAttachmentTaxReturn: false,
    hasAttachmentOther: false,
    
    // BAGIAN 2: PERWAKILAN SAHMA
    // BAGIAN 2: KONTAK INFORMASI
    commercialPicName: '',
    commercialPicPosition: '',
    commercialPicPhone: '',
    commercialPicEmail: '',
    financePicName: '',
    financePicEmail: '',
    financePicPhone: '',
    referenceBankName: '',
    referenceBankAddress: '',
    referenceBankAccountNumber: '',
    
    // PERSETUJUAN DEPARTEMEN INTERNAL
    commercialReviewerName: '',
    commercialReviewerDate: '',
    gmApprovalName: '',
    gmApprovalDate: '',
    
    // PERSETUJUAN DEPARTEMEN KEUANGAN DAN IT
    transactionCurrency: '',
    financeDivision: '',
    buyerVendorType: '',
    sapAccountType: '',
    creditLimitAmount: '',
    financeNotes: '',
    financeReviewerName: '',
    financeReviewerDate: '',
    financeGmSignature: '',
    financeGmApprovalName: '',
    financeGmApprovalDate: '',
    sapAccountNumber: '',
    itRegistrationDate: '',
    acknowledgedBy: '',
    acknowledgedByDate: '',
    
    // Form Pernyataan
    registrationSubmissionDate: '',
    submitterNamePosition: '',
    companySignatureStamp: '',
    
    ownerName: '',
    ownerPosition: '',
    ownerPhone: '',
    ownerEmail: '',
    
    // BAGIAN 3: BANK UTAMA
    primaryBankName: '',
    bankAddress: '',
    bankAccountNumber: '',
    bankAccountName: '',
    bankPhoneNumber: '',
    bankContactPerson: '',
    bankEmail: '',
    
    // BAGIAN 4: KEGIATAN PERUSAHAAN
    employeeMale: undefined,
    employeeFemale: undefined,
    businessType: '',
    businessDescription: '',
    creditCheckType: '',
    creditTerm: '',
    productsServices: '',
    
    // BAGIAN 5: PERUSAHAAN RELASI
    parentCompanyName: '',
    parentCompanyAddress: '',
    affiliatedCompanyName: '',
    affiliatedCompanyDetails: '',
    beneficialOwners: '',
    
    // BAGIAN 6: VOLUME USAHA TAHUNAN
    revenue2021: undefined,
    revenue2022: undefined,
    revenue2023: undefined,
    volumeBreakdown2021: '',
    volumeBreakdown2022: '',
    volumeBreakdown2023: '',
    
    // BAGIAN 7: KONTAK INTERNAL
    internalContactName: '',
    internalContactEmail: '',
    internalContactPhone: '',
    
    // BAGIAN 8: DIREKTUR / MITRA / PENANDATANGAN RESMI
    authorizedSignatories: '',
    
    // BAGIAN 9: POTENSI KEGIATAN USAHA
    businessPotential: '',
    
    // BAGIAN 10: KUANTITAS DAN FREKUENSI YANG DIHARAPKAN
    expectedQuantityFrequency: '',
    
    // Syarat Pembayaran
    paymentTerms: '',
    
    divisionId: 0,
    requiredApprovalLevels: 2
  })
  
  const [divisions, setDivisions] = useState<DivisionDto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [maxApprovalLevels, setMaxApprovalLevels] = useState<number>(0)
  const [userDivision, setUserDivision] = useState<{ id: number; code: string; name: string } | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])

  useEffect(() => {
    loadUserDivision()
  }, [])

  const loadUserDivision = async () => {
    try {
      if (user?.role === 'IT') {
        const divs = await authService.getDivisions()
        setDivisions(divs)
        if (divs.length > 0) {
          const divisionId = divs[0].id
          const divisionCode = divs[0].divisionCode
          setFormData(prev => ({ 
            ...prev, 
            divisionId,
            financeDivision: divisionCode // Auto-fill finance division for IT
          }))
          const resp = await fetch(`http://localhost:5000/api/admin/divisions/${divisionId}/max-approval-levels`)
          const data = await resp.json()
          setMaxApprovalLevels(data.maxApprovalLevels)
          setFormData(prev => ({ ...prev, requiredApprovalLevels: data.maxApprovalLevels }))
        }
        setUserDivision(null)
        return
      }

      if (user?.userApprovals && user.userApprovals.length > 0) {
        const firstApproval = user.userApprovals[0]
        const divisionId = firstApproval.divisionId

        setUserDivision({
          id: divisionId,
          code: firstApproval.divisionCode,
          name: firstApproval.divisionName
        })

        setFormData(prev => ({ 
          ...prev, 
          divisionId,
          financeDivision: firstApproval.divisionCode // Auto-fill finance division
        }))

        const response = await fetch(`http://localhost:5000/api/admin/divisions/${divisionId}/max-approval-levels`)
        const data = await response.json()
        setMaxApprovalLevels(data.maxApprovalLevels)
        setFormData(prev => ({
          ...prev,
          requiredApprovalLevels: data.maxApprovalLevels
        }))
      } else {
        setError('User tidak memiliki divisi yang terdaftar')
      }
    } catch (err: any) {
      setError('Failed to load user division')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    
    if (name === 'divisionId' && user?.role === 'IT') {
      const divisionId = parseInt(value)
      setFormData(prev => ({ ...prev, divisionId }))
      if (divisionId > 0) {
        fetch(`http://localhost:5000/api/admin/divisions/${divisionId}/max-approval-levels`)
          .then(r => r.json())
          .then(d => {
            setMaxApprovalLevels(d.maxApprovalLevels)
            setFormData(prev => ({ ...prev, requiredApprovalLevels: d.maxApprovalLevels }))
          })
          .catch(err => console.error('Failed to fetch max approval levels', err))
      }
      return
    }

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else if (type === 'number') {
      const numValue = value === '' ? undefined : Number(value)
      setFormData(prev => ({ ...prev, [name]: numValue }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setUploadedFiles(prev => [...prev, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await customerService.create(formData)
      setSuccess(true)
      setTimeout(() => {
        navigate('/customers')
      }, 1500)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create customer')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '0.9375rem',
    transition: 'all 0.2s'
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: 600,
    fontSize: '0.875rem',
    color: 'var(--text-primary)'
  }

  const sectionStyle: React.CSSProperties = {
    background: 'white',
    padding: '1.5rem',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    marginBottom: '1.5rem'
  }

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: '1.125rem',
    fontWeight: 700,
    color: '#2563eb',
    marginBottom: '1rem',
    paddingBottom: '0.75rem',
    borderBottom: '2px solid #e5e7eb'
  }

  return (
    <div className="main-content">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          Create New Customer
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Fill in all required customer information
        </p>
      </div>

      {error && (
        <div style={{ 
          padding: '1rem', 
          background: '#fef2f2', 
          border: '1px solid #fecaca', 
          borderRadius: '8px',
          color: '#991b1b',
          marginBottom: '1rem'
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ 
          padding: '1rem', 
          background: '#f0fdf4', 
          border: '1px solid #bbf7d0', 
          borderRadius: '8px',
          color: '#166534',
          marginBottom: '1rem'
        }}>
          Customer created successfully! Redirecting...
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* BAGIAN 1: DETAIL COUNTERPARTY */}
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>📋 BAGIAN 1: DETAIL COUNTERPARTY</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={labelStyle}>Nomor Formulir Registrasi *</label>
              <input
                type="text"
                name="customerCode"
                value={formData.customerCode}
                onChange={handleChange}
                required
                style={inputStyle}
                placeholder="EXAMPLE/TSD/01/VIII/2015/0"
              />
            </div>
            <div>
              <label style={labelStyle}>Nama Terdaftar */**</label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                required
                style={inputStyle}
                placeholder="PT AGUNG ANRAH PUTRA MANDIRI"
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Alamat Pengiriman */**</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              style={{...inputStyle, minHeight: '60px'}}
              placeholder="JL NR AHMAD DAHLAN, KPGM/BANGUN UTAMA..."
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Alamat Terdaftar */**</label>
            <textarea
              name="registeredAddress"
              value={formData.registeredAddress}
              onChange={handleChange}
              style={{...inputStyle, minHeight: '60px'}}
              placeholder="JL TIN MALANG NO. 770 RT 006 / RW 004..."
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Alamat Surat Menyurat */**</label>
            <textarea
              name="correspondenceAddress"
              value={formData.correspondenceAddress}
              onChange={handleChange}
              style={{...inputStyle, minHeight: '60px'}}
              placeholder="JL TIN MALANG NO. 77 RT 006 RW..."
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={labelStyle}>Tanggal Pendirian Badan Usaha *</label>
              <input
                type="date"
                name="establishmentDate"
                value={formData.establishmentDate}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Negara Tempat Pendirian Badan Usaha *</label>
              <select
                name="establishmentCountry"
                value={formData.establishmentCountry}
                onChange={handleChange}
                style={inputStyle}>
                <option value="">Pilih Negara</option>
                <option value="Indonesia">Indonesia</option>
                <option value="Asing Bersama">Asing Bersama</option>
                <option value="Asing 100%">Asing 100%</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Nomor Registrasi Badan Usaha *</label>
              <input
                type="text"
                name="registrationNumber"
                value={formData.registrationNumber}
                onChange={handleChange}
                style={inputStyle}
                placeholder="1170210988023201"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={labelStyle}>Telepon */**</label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                style={inputStyle}
                placeholder="0913 3031 9037"
              />
            </div>
            <div>
              <label style={labelStyle}>E-mail *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                style={inputStyle}
                placeholder="galihan.apin@gmail.com"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={labelStyle}>Website */**</label>
              <input
                type="text"
                name="website"
                value={formData.website}
                onChange={handleChange}
                style={inputStyle}
                placeholder="0813 8267 5353"
              />
            </div>
            <div>
              <label style={labelStyle}>Facsimile *</label>
              <input
                type="text"
                name="facsimile"
                value={formData.facsimile}
                onChange={handleChange}
                style={inputStyle}
                placeholder="0813 3265 4121"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={labelStyle}>Nomor Pokok Wajib Pajak (NPWP) */**</label>
              <input
                type="text"
                name="npwp"
                value={formData.npwp}
                onChange={handleChange}
                style={inputStyle}
                placeholder="04.1 255 904.2 354.000"
              />
            </div>
            <div>
              <label style={labelStyle}>NIB */**</label>
              <input
                type="text"
                name="nib"
                value={formData.nib}
                onChange={handleChange}
                style={inputStyle}
                placeholder="NIB Number"
              />
            </div>
            <div>
              <label style={labelStyle}>Kartu Identitas (KTP) **</label>
              <input
                type="text"
                name="identityCardNumber"
                value={formData.identityCardNumber}
                onChange={handleChange}
                style={inputStyle}
                placeholder="3171021080200001"
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Alamat NPWP **</label>
            <textarea
              name="taxAddress"
              value={formData.taxAddress}
              onChange={handleChange}
              style={{...inputStyle, minHeight: '60px'}}
              placeholder="Tax office address"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={labelStyle}>Sifat Bisnis */**</label>
              <select
                name="businessNature"
                value={formData.businessNature}
                onChange={handleChange}
                style={inputStyle}>
                <option value="">Pilih Sifat Bisnis</option>
                <option value="Indonesia">Indonesia</option>
                <option value="Asing Bersama">Asing Bersama</option>
                <option value="Asing 100%">Asing 100%</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Auditor *</label>
              <input
                type="text"
                name="auditor"
                value={formData.auditor}
                onChange={handleChange}
                style={inputStyle}
                placeholder="BANK BCA"
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Perusahaan Pemilik *</label>
            <textarea
              name="parentCompanyName"
              value={formData.parentCompanyName}
              onChange={handleChange}
              style={{...inputStyle, minHeight: '80px'}}
              placeholder="Masukkan nama perusahaan pemilik (bisa multiple)"
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Perusahaan Afiliasi *</label>
            <textarea
              name="affiliatedCompanyDetails"
              value={formData.affiliatedCompanyDetails}
              onChange={handleChange}
              style={{...inputStyle, minHeight: '100px'}}
              placeholder="Format: 1&#10;2&#10;3&#10;4"
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Penerima Manfaat Sebenarnya */**</label>
            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.5rem' }}>
              Dokumen identifikasi diverifikasi bagi Penerima Sebenarnya Manfaat 15%
            </div>
            <textarea
              name="beneficialOwners"
              value={formData.beneficialOwners}
              onChange={handleChange}
              style={{...inputStyle, minHeight: '120px'}}
              placeholder="Format per baris: Nama | Persentase&#10;1&#10;2&#10;3&#10;4&#10;5"
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Direktur / Mitra / Penandatangan Resmi */**</label>
            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.5rem' }}>
              (Sebutkan jabatan lengkap)
            </div>
            <textarea
              name="authorizedSignatories"
              value={formData.authorizedSignatories}
              onChange={handleChange}
              style={{...inputStyle, minHeight: '100px'}}
              placeholder="Format: Nama | Jabatan&#10;1&#10;2&#10;3&#10;4"
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Potensi Kegiatan Usaha */**</label>
            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.5rem' }}>
              Harap jelaskan potensi kegiatan bisnis
            </div>
            <textarea
              name="businessPotential"
              value={formData.businessPotential}
              onChange={handleChange}
              style={{...inputStyle, minHeight: '80px'}}
              placeholder="Jelaskan potensi kegiatan bisnis..."
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Kuantitas dan Frekuensi yang Diharapkan */**</label>
            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.5rem' }}>
              Harap berikan rincian berdasarkan komoditas
            </div>
            <textarea
              name="expectedQuantityFrequency"
              value={formData.expectedQuantityFrequency}
              onChange={handleChange}
              style={{...inputStyle, minHeight: '80px'}}
              placeholder="Rincian kuantitas dan frekuensi..."
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Syarat Pembayaran yang Dimohonkan */**</label>
            <input
              type="text"
              name="paymentTerms"
              value={formData.paymentTerms || ''}
              onChange={handleChange}
              style={inputStyle}
              placeholder="Contoh: Net 30, COD, dll"
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ ...labelStyle, marginBottom: '0.75rem' }}>Lampiran Dokumen:</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <input
                  type="checkbox"
                  name="hasAttachmentIndonesia"
                  checked={formData.hasAttachmentIndonesia || false}
                  onChange={handleChange}
                />
                Akta Pendirian Badan Usaha *
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <input
                  type="checkbox"
                  name="hasAttachmentSKT"
                  checked={formData.hasAttachmentSKT || false}
                  onChange={handleChange}
                />
                Akta Kepengurusan *
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <input
                  type="checkbox"
                  name="hasAttachmentForeign"
                  checked={formData.hasAttachmentForeign || false}
                  onChange={handleChange}
                />
                Sertifikat Perseroan *
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <input
                  type="checkbox"
                  name="hasAttachmentTDP"
                  checked={formData.hasAttachmentTDP || false}
                  onChange={handleChange}
                />
                Kartu Identitas (KTP) **
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <input
                  type="checkbox"
                  name="hasAttachmentNPWP"
                  checked={formData.hasAttachmentNPWP || false}
                  onChange={handleChange}
                />
                NPWP
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <input
                  type="checkbox"
                  name="hasAttachmentNIB"
                  checked={formData.hasAttachmentNIB || false}
                  onChange={handleChange}
                />
                NIB */**
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <input
                  type="checkbox"
                  name="hasAttachmentProfit"
                  checked={formData.hasAttachmentProfit || false}
                  onChange={handleChange}
                />
                Presentasi Profil Badan Usaha *
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <input
                  type="checkbox"
                  name="hasAttachmentBalanceSheet"
                  checked={formData.hasAttachmentBalanceSheet || false}
                  onChange={handleChange}
                />
                Lap. Keuangan Diaudit (3th Terakhir) *
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <input
                  type="checkbox"
                  name="hasAttachmentCashFlow"
                  checked={formData.hasAttachmentCashFlow || false}
                  onChange={handleChange}
                />
                Surat Referensi Bank *
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <input
                  type="checkbox"
                  name="hasAttachmentTaxReturn"
                  checked={formData.hasAttachmentTaxReturn || false}
                  onChange={handleChange}
                />
                Rekening Koran */**
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <input
                  type="checkbox"
                  name="hasAttachmentSIUP"
                  checked={formData.hasAttachmentSIUP || false}
                  onChange={handleChange}
                />
                Bagan Organisasi *
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <input
                  type="checkbox"
                  name="hasAttachmentOther"
                  checked={formData.hasAttachmentOther || false}
                  onChange={handleChange}
                />
                Lain-lain
              </label>
            </div>

            {/* Upload Dokumen */}
            <div style={{ marginTop: '2rem', marginBottom: '1rem' }}>
              <label style={labelStyle}>Upload Dokumen Pendukung</label>
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                style={{
                  ...inputStyle,
                  padding: '0.75rem',
                  cursor: 'pointer'
                }}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls"
              />
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
                Format yang didukung: PDF, DOC, DOCX, JPG, PNG, XLSX, XLS
              </p>
              
              {uploadedFiles.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                    File yang dipilih ({uploadedFiles.length}):
                  </h4>
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {uploadedFiles.map((file, index) => (
                      <li key={index} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.5rem',
                        backgroundColor: '#f3f4f6',
                        borderRadius: '4px',
                        marginBottom: '0.5rem'
                      }}>
                        <span style={{ fontSize: '0.875rem' }}>
                          {file.name} ({(file.size / 1024).toFixed(2)} KB)
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          style={{
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.875rem'
                          }}
                        >
                          Hapus
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* BAGIAN 2: KONTAK INFORMASI */}
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>📞 BAGIAN 2: KONTAK INFORMASI</h2>
          
          {/* REFERENSI PIC KOMERSIL */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '0.75rem', color: '#1e40af' }}>
              REFERENSI PIC KOMERSIL
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Nama/Referensi</label>
                <input
                  type="text"
                  name="commercialPicName"
                  value={formData.commercialPicName}
                  onChange={handleChange}
                  style={inputStyle}
                  placeholder="Nama"
                />
              </div>
              <div>
                <label style={labelStyle}>Posisi</label>
                <input
                  type="text"
                  name="commercialPicPosition"
                  value={formData.commercialPicPosition}
                  onChange={handleChange}
                  style={inputStyle}
                  placeholder="Posisi"
                />
              </div>
              <div>
                <label style={labelStyle}>Telepon</label>
                <input
                  type="tel"
                  name="commercialPicPhone"
                  value={formData.commercialPicPhone}
                  onChange={handleChange}
                  style={inputStyle}
                  placeholder="Telepon"
                />
              </div>
              <div>
                <label style={labelStyle}>E-mail</label>
                <input
                  type="email"
                  name="commercialPicEmail"
                  value={formData.commercialPicEmail}
                  onChange={handleChange}
                  style={inputStyle}
                  placeholder="E-mail"
                />
              </div>
            </div>
          </div>

          {/* KEGIATAN PENAGIHAN - REFERENSI PIC DEPARTEMEN KEUANGAN */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '0.75rem', color: '#1e40af' }}>
              KEGIATAN PENAGIHAN
            </h3>
            <h4 style={{ fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.75rem', color: '#4b5563' }}>
              REFERENSI PIC DEPARTEMEN KEUANGAN
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Nama/Referensi</label>
                <input
                  type="text"
                  name="financePicName"
                  value={formData.financePicName}
                  onChange={handleChange}
                  style={inputStyle}
                  placeholder="Nama"
                />
              </div>
              <div>
                <label style={labelStyle}>E-mail</label>
                <input
                  type="email"
                  name="financePicEmail"
                  value={formData.financePicEmail}
                  onChange={handleChange}
                  style={inputStyle}
                  placeholder="E-mail"
                />
              </div>
              <div>
                <label style={labelStyle}>Telepon</label>
                <input
                  type="tel"
                  name="financePicPhone"
                  value={formData.financePicPhone}
                  onChange={handleChange}
                  style={inputStyle}
                  placeholder="Telepon"
                />
              </div>
            </div>
          </div>

          {/* REFERENSI BANK */}
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '0.75rem', color: '#1e40af' }}>
              REFERENSI BANK
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Nama Bank</label>
                <input
                  type="text"
                  name="referenceBankName"
                  value={formData.referenceBankName}
                  onChange={handleChange}
                  style={inputStyle}
                  placeholder="PT AGUNG ABADI PUTRA MANDIRI (BANK BCA)"
                />
              </div>
              <div>
                <label style={labelStyle}>Alamat</label>
                <input
                  type="text"
                  name="referenceBankAddress"
                  value={formData.referenceBankAddress}
                  onChange={handleChange}
                  style={inputStyle}
                  placeholder="PAYAKUMBUH"
                />
              </div>
              <div>
                <label style={labelStyle}>Nomor Akun</label>
                <input
                  type="text"
                  name="referenceBankAccountNumber"
                  value={formData.referenceBankAccountNumber}
                  onChange={handleChange}
                  style={inputStyle}
                  placeholder="614-5614582"
                />
              </div>
            </div>
          </div>

          {/* Informasi Email dan Pernyataan */}
          <div style={{ marginTop: '2rem', marginBottom: '1.5rem', textAlign: 'center' }}>
            <p style={{ fontSize: '0.85rem', color: '#dc2626', fontStyle: 'italic', marginBottom: '1rem' }}>
              Silakan kirimkan formulir dan dokumen pendukung melalui email ke: <strong>grains@gcu.co.id</strong>
            </p>
            <p style={{ fontSize: '0.85rem', color: '#374151', textAlign: 'center', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              Dengan ini saya menyatakan bahwa yang menandatangani di bawah ini adalah orang yang berwenang sesuai akta dan informasi yang diberikan adalah benar
            </p>
            
            {/* Form Tanggal, Nama/Posisi, Tanda Tangan */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '1.5rem' }}>
              <div style={{ textAlign: 'left' }}>
                <label style={labelStyle}>Tanggal Pengajuan Registrasi</label>
                <input
                  type="date"
                  name="registrationSubmissionDate"
                  value={formData.registrationSubmissionDate}
                  onChange={handleChange}
                  style={inputStyle}
                  placeholder="19 May 25"
                />
              </div>
              <div style={{ textAlign: 'left' }}>
                <label style={labelStyle}>Nama / Posisi</label>
                <input
                  type="text"
                  name="submitterNamePosition"
                  value={formData.submitterNamePosition}
                  onChange={handleChange}
                  style={inputStyle}
                  placeholder="PT AGUNG ABADI PUTRA MANDIRI"
                />
              </div>
              <div style={{ textAlign: 'left' }}>
                <SignaturePad
                  label="Tanda Tangan/ Cap Perseroan (Wajib)"
                  value={formData.companySignatureStamp}
                  onChange={(sig) => setFormData(prev => ({ ...prev, companySignatureStamp: sig }))}
                  width={350}
                  height={120}
                />
              </div>
            </div>
          </div>

          {/* PERSETUJUAN DEPARTEMEN INTERNAL */}
          <div style={{ marginBottom: '1.5rem', marginTop: '2rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '0.75rem', color: '#ffffff', backgroundColor: '#1e3a8a', padding: '0.5rem 1rem' }}>
              PERSETUJUAN DEPARTEMEN INTERNAL
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Peninjau PIC Komersil/Penjualan (tanggal)</label>
                <input
                  type="text"
                  name="commercialReviewerName"
                  value={formData.commercialReviewerName}
                  onChange={handleChange}
                  style={inputStyle}
                  placeholder="Diana"
                />
              </div>
              <div>
                <label style={labelStyle}>Persetujuan Oleh Level GM (tanggal)</label>
                <input
                  type="text"
                  name="gmApprovalName"
                  value={formData.gmApprovalName}
                  onChange={handleChange}
                  style={inputStyle}
                  placeholder="Marima"
                />
              </div>
            </div>
          </div>

          {/* PERSETUJUAN DEPARTEMEN KEUANGAN DAN IT */}
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '0.75rem', color: '#ffffff', backgroundColor: '#1e3a8a', padding: '0.5rem 1rem' }}>
              PERSETUJUAN DEPARTEMEN KEUANGAN DAN IT
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={labelStyle}>Kurs Transaksi</label>
                <input
                  type="text"
                  name="transactionCurrency"
                  value={formData.transactionCurrency}
                  onChange={handleChange}
                  style={inputStyle}
                  placeholder="IDR"
                />
              </div>
              <div>
                <label style={labelStyle}>Divisi</label>
                <input
                  type="text"
                  name="financeDivision"
                  value={formData.financeDivision}
                  disabled
                  style={{...inputStyle, background: '#f3f4f6', cursor: 'not-allowed'}}
                  placeholder="Auto-filled from user division"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Tipe Pembeli/ Vendor</label>
                  <input
                    type="text"
                    name="buyerVendorType"
                    value={formData.buyerVendorType}
                    onChange={handleChange}
                    style={inputStyle}
                    placeholder="Farm"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Tipe Akun SAP</label>
                  <input
                    type="text"
                    name="sapAccountType"
                    value={formData.sapAccountType}
                    onChange={handleChange}
                    style={inputStyle}
                    placeholder=""
                  />
                </div>
              </div>
              <div>
                <SignaturePad
                  label="Tanda Tangan"
                  value={formData.financeGmSignature}
                  onChange={(value) => setFormData(prev => ({ ...prev, financeGmSignature: value }))}
                  width={400}
                  height={150}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={labelStyle}>Kredit Limit Yang Diberikan (dalam Rp.)</label>
                <input
                  type="text"
                  name="creditLimitAmount"
                  value={formData.creditLimitAmount}
                  onChange={handleChange}
                  style={inputStyle}
                  placeholder="CBD"
                />
              </div>
              <div>
                <label style={labelStyle}>Persetujuan Oleh Level GM (tanggal)</label>
                <input
                  type="text"
                  name="financeGmApprovalName"
                  value={formData.financeGmApprovalName}
                  onChange={handleChange}
                  style={inputStyle}
                  placeholder=""
                />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Tanggal</label>
              <input
                type="date"
                name="financeGmApprovalDate"
                value={formData.financeGmApprovalDate}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Catatan</label>
              <textarea
                name="financeNotes"
                value={formData.financeNotes}
                onChange={handleChange}
                style={{...inputStyle, minHeight: '80px'}}
                placeholder="Catatan"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={labelStyle}>Peninjau Dari Departemen Keuangan (tanggal)</label>
                <input
                  type="text"
                  name="financeReviewerName"
                  value={formData.financeReviewerName}
                  onChange={handleChange}
                  style={inputStyle}
                  placeholder=""
                />
              </div>
              <div>
                <label style={labelStyle}>Tanggal</label>
                <input
                  type="date"
                  name="financeReviewerDate"
                  value={formData.financeReviewerDate}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Nomor Akun SAP</label>
                <input
                  type="text"
                  name="sapAccountNumber"
                  value={formData.sapAccountNumber}
                  onChange={handleChange}
                  style={inputStyle}
                  placeholder=""
                />
              </div>
              <div>
                <label style={labelStyle}>Tanggal Registrasi Dari Departemen IT</label>
                <input
                  type="text"
                  name="itRegistrationDate"
                  value={formData.itRegistrationDate}
                  onChange={handleChange}
                  style={inputStyle}
                  placeholder=""
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginTop: '1rem' }}>
              <div>
                <label style={labelStyle}>Diketahui Oleh (tanggal)</label>
                <input
                  type="text"
                  name="acknowledgedBy"
                  value={formData.acknowledgedBy}
                  onChange={handleChange}
                  style={inputStyle}
                  placeholder=""
                />
              </div>
              <div>
                <label style={labelStyle}>Tanggal</label>
                <input
                  type="date"
                  name="acknowledgedByDate"
                  value={formData.acknowledgedByDate}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>
        </div>

        {/* BAGIAN 3: BANK UTAMA */}
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>🏦 BAGIAN 3: BANK UTAMA</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={labelStyle}>Bank Utama */**</label>
              <input
                type="text"
                name="primaryBankName"
                value={formData.primaryBankName}
                onChange={handleChange}
                style={inputStyle}
                placeholder="BANK BCA"
              />
            </div>
            <div>
              <label style={labelStyle}>Nama Pemilik Rekening</label>
              <input
                type="text"
                name="bankAccountName"
                value={formData.bankAccountName}
                onChange={handleChange}
                style={inputStyle}
                placeholder="Account Holder Name"
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Alamat Bank</label>
            <textarea
              name="bankAddress"
              value={formData.bankAddress}
              onChange={handleChange}
              style={{...inputStyle, minHeight: '60px'}}
              placeholder="Bank Address"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Nomor Rekening</label>
              <input
                type="text"
                name="bankAccountNumber"
                value={formData.bankAccountNumber}
                onChange={handleChange}
                style={inputStyle}
                placeholder="1234567890"
              />
            </div>
            <div>
              <label style={labelStyle}>Telepon Bank</label>
              <input
                type="tel"
                name="bankPhoneNumber"
                value={formData.bankPhoneNumber}
                onChange={handleChange}
                style={inputStyle}
                placeholder="Bank Phone"
              />
            </div>
            <div>
              <label style={labelStyle}>Contact Person</label>
              <input
                type="text"
                name="bankContactPerson"
                value={formData.bankContactPerson}
                onChange={handleChange}
                style={inputStyle}
                placeholder="Contact Name"
              />
            </div>
          </div>
        </div>

        {/* SUBMIT BUTTONS */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={() => navigate('/customers')}
            disabled={loading}
            style={{
              padding: '0.875rem 1.5rem',
              fontSize: '0.9375rem',
              fontWeight: 600,
              background: 'white',
              color: '#6b7280',
              border: '1px solid #e5e7eb',
              borderRadius: '10px',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '0.875rem 1.5rem',
              fontSize: '0.9375rem',
              fontWeight: 700,
              background: loading ? '#9ca3af' : 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
              boxShadow: loading ? 'none' : '0 4px 12px rgba(16, 185, 129, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {loading ? (
              <>
                <span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></span>
                Creating...
              </>
            ) : (
              <>
                <span>✓</span>
                Create Customer
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
