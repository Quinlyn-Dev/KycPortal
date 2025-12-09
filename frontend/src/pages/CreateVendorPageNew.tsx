import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { vendorService, CreateVendorRequest } from '../services/vendorService'
import { authService, DivisionDto } from '../services/authService'
import '../styles/modern.css'

export default function CreateVendorPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [formData, setFormData] = useState<CreateVendorRequest>({
    // BAGIAN 1: DETAIL COUNTERPARTY
    vendorCode: '',
    vendorName: '',
    address: '',
    subDistrict: '',
    district: '',
    city: '',
    province: '',
    postalCode: '',
    phoneNumber: '',
    email: '',
    website: '',
    npwp: '',
    nib: '',
    taxAddress: '',
    isPKP: false,
    hasBranchOffice: false,
    isManufacturer: false,
    isDistributor: false,
    isSubsidiary: false,
    isAffiliatedCompany: false,
    
    // BAGIAN 2: PERWAKILAN SAHMA
    ownerName: '',
    ownerPosition: '',
    ownerPhone: '',
    ownerEmail: '',
    
    // BAGIAN 3: REFERENSI BANK
    bankName: '',
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
    
    divisionId: 0,
    requiredApprovalLevels: 2
  })
  
  const [divisions, setDivisions] = useState<DivisionDto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [maxApprovalLevels, setMaxApprovalLevels] = useState<number>(0)
  const [userDivision, setUserDivision] = useState<{ id: number; code: string; name: string } | null>(null)

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
          setFormData(prev => ({ ...prev, divisionId }))
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

        setFormData(prev => ({ ...prev, divisionId }))

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await vendorService.create(formData)
      setSuccess(true)
      setTimeout(() => {
        navigate('/Vendors')
      }, 1500)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create Vendor')
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
          Create New Vendor
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Fill in all required Vendor information
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
          Vendor created successfully! Redirecting...
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* BAGIAN 1: DETAIL COUNTERPARTY */}
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>📋 BAGIAN 1: DETAIL COUNTERPARTY</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={labelStyle}>Vendor Code *</label>
              <input
                type="text"
                name="vendorCode"
                value={formData.vendorCode}
                onChange={handleChange}
                required
                style={inputStyle}
                placeholder="PT AGLING ASSAH PUTRA MANDIRI"
              />
            </div>
            <div>
              <label style={labelStyle}>Vendor Name *</label>
              <input
                type="text"
                name="vendorName"
                value={formData.vendorName}
                onChange={handleChange}
                required
                style={inputStyle}
                placeholder="Company Name"
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Alamat Lengkap *</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              style={{...inputStyle, minHeight: '80px'}}
              placeholder="JL NT ANYAR 01/07RT 01/RW 07RT/RW,7"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={labelStyle}>Kelurahan *</label>
              <input
                type="text"
                name="subDistrict"
                value={formData.subDistrict}
                onChange={handleChange}
                required
                style={inputStyle}
                placeholder="PARAKANCANGGAH"
              />
            </div>
            <div>
              <label style={labelStyle}>Kecamatan *</label>
              <input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleChange}
                required
                style={inputStyle}
                placeholder="BEE PANGANDARAAN"
              />
            </div>
            <div>
              <label style={labelStyle}>Kota/Kabupaten *</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                style={inputStyle}
                placeholder="BANDUNG BARAT"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={labelStyle}>Provinsi *</label>
              <input
                type="text"
                name="province"
                value={formData.province}
                onChange={handleChange}
                required
                style={inputStyle}
                placeholder="JAWA BARAT"
              />
            </div>
            <div>
              <label style={labelStyle}>Kode Pos *</label>
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                required
                style={inputStyle}
                placeholder="15140"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={labelStyle}>Telepon *</label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                style={inputStyle}
                placeholder="+62 21 351 8039"
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
                placeholder="galihho.cavo@gmail.com"
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Website</label>
            <input
              type="text"
              name="website"
              value={formData.website}
              onChange={handleChange}
              style={inputStyle}
              placeholder="https://example.com"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={labelStyle}>NPWP</label>
              <input
                type="text"
                name="npwp"
                value={formData.npwp}
                onChange={handleChange}
                style={inputStyle}
                placeholder="123456108200001"
              />
            </div>
            <div>
              <label style={labelStyle}>NIB (Nomor Induk Berusaha)</label>
              <input
                type="text"
                name="nib"
                value={formData.nib}
                onChange={handleChange}
                style={inputStyle}
                placeholder="NIB Number"
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Alamat NPWP</label>
            <textarea
              name="taxAddress"
              value={formData.taxAddress}
              onChange={handleChange}
              style={{...inputStyle, minHeight: '60px'}}
              placeholder="Tax office address"
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ ...labelStyle, marginBottom: '0.75rem' }}>Status Perusahaan:</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <input
                  type="checkbox"
                  name="isPKP"
                  checked={formData.isPKP || false}
                  onChange={handleChange}
                />
                Pengusaha Kena Pajak (PKP)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <input
                  type="checkbox"
                  name="hasBranchOffice"
                  checked={formData.hasBranchOffice || false}
                  onChange={handleChange}
                />
                Kantor Cabang
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <input
                  type="checkbox"
                  name="isManufacturer"
                  checked={formData.isManufacturer || false}
                  onChange={handleChange}
                />
                Pabrik
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <input
                  type="checkbox"
                  name="isDistributor"
                  checked={formData.isDistributor || false}
                  onChange={handleChange}
                />
                Distributor
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <input
                  type="checkbox"
                  name="isSubsidiary"
                  checked={formData.isSubsidiary || false}
                  onChange={handleChange}
                />
                Anak Perusahaan
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <input
                  type="checkbox"
                  name="isAffiliatedCompany"
                  checked={formData.isAffiliatedCompany || false}
                  onChange={handleChange}
                />
                Perusahaan Afiliasi
              </label>
            </div>
          </div>
        </div>

        {/* BAGIAN 2: PERWAKILAN SAHMA */}
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>👤 BAGIAN 2: PERWAKILAN SAHMA (Owner/Management)</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Nama</label>
              <input
                type="text"
                name="ownerName"
                value={formData.ownerName}
                onChange={handleChange}
                style={inputStyle}
                placeholder="Owner Name"
              />
            </div>
            <div>
              <label style={labelStyle}>Jabatan</label>
              <input
                type="text"
                name="ownerPosition"
                value={formData.ownerPosition}
                onChange={handleChange}
                style={inputStyle}
                placeholder="Position"
              />
            </div>
            <div>
              <label style={labelStyle}>Telepon</label>
              <input
                type="tel"
                name="ownerPhone"
                value={formData.ownerPhone}
                onChange={handleChange}
                style={inputStyle}
                placeholder="Phone Number"
              />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                name="ownerEmail"
                value={formData.ownerEmail}
                onChange={handleChange}
                style={inputStyle}
                placeholder="Email"
              />
            </div>
          </div>
        </div>

        {/* BAGIAN 3: REFERENSI BANK */}
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>🏦 BAGIAN 3: REFERENSI BANK</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={labelStyle}>Nama Bank</label>
              <input
                type="text"
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
                style={inputStyle}
                placeholder="PT AGLING ASSAH PUTRA MANDIRI"
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

        {/* BAGIAN 4: KEGIATAN PERUSAHAAN */}
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>🏢 BAGIAN 4: KEGIATAN PERUSAHAAN</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={labelStyle}>Jumlah Karyawan (Pria)</label>
              <input
                type="number"
                name="employeeMale"
                value={formData.employeeMale || ''}
                onChange={handleChange}
                style={inputStyle}
                placeholder="0"
                min="0"
              />
            </div>
            <div>
              <label style={labelStyle}>Jumlah Karyawan (Wanita)</label>
              <input
                type="number"
                name="employeeFemale"
                value={formData.employeeFemale || ''}
                onChange={handleChange}
                style={inputStyle}
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={labelStyle}>Jenis Usaha</label>
              <input
                type="text"
                name="businessType"
                value={formData.businessType}
                onChange={handleChange}
                style={inputStyle}
                placeholder="Manufaktur / Trading / Service"
              />
            </div>
            <div>
              <label style={labelStyle}>Credit Check</label>
              <select
                name="creditCheckType"
                value={formData.creditCheckType}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="">Select...</option>
                <option value="Credit">Credit</option>
                <option value="COD">COD</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Term Credit</label>
            <input
              type="text"
              name="creditTerm"
              value={formData.creditTerm}
              onChange={handleChange}
              style={inputStyle}
              placeholder="e.g., NET 30, NET 60"
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Deskripsi Usaha</label>
            <textarea
              name="businessDescription"
              value={formData.businessDescription}
              onChange={handleChange}
              style={{...inputStyle, minHeight: '80px'}}
              placeholder="Describe the business activities"
            />
          </div>

          <div>
            <label style={labelStyle}>Produk atau Jasa</label>
            <textarea
              name="productsServices"
              value={formData.productsServices}
              onChange={handleChange}
              style={{...inputStyle, minHeight: '80px'}}
              placeholder="List products or services provided"
            />
          </div>
        </div>

        {/* BAGIAN 5: PERUSAHAAN RELASI */}
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>🏭 BAGIAN 5: PERUSAHAAN RELASI (Parent/Branch/Sister Company)</h2>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Nama Perusahaan Induk / Cabang / Sister</label>
            <input
              type="text"
              name="parentCompanyName"
              value={formData.parentCompanyName}
              onChange={handleChange}
              style={inputStyle}
              placeholder="Parent or Related Company Name"
            />
          </div>

          <div>
            <label style={labelStyle}>Alamat Perusahaan Terkait</label>
            <textarea
              name="parentCompanyAddress"
              value={formData.parentCompanyAddress}
              onChange={handleChange}
              style={{...inputStyle, minHeight: '60px'}}
              placeholder="Related Company Address"
            />
          </div>
        </div>

        {/* BAGIAN 6: VOLUME USAHA TAHUNAN */}
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>📊 BAGIAN 6: VOLUME USAHA TAHUNAN (2021, 2022, 2023)</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={labelStyle}>Revenue 2021</label>
              <input
                type="number"
                name="revenue2021"
                value={formData.revenue2021 || ''}
                onChange={handleChange}
                style={inputStyle}
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label style={labelStyle}>Revenue 2022</label>
              <input
                type="number"
                name="revenue2022"
                value={formData.revenue2022 || ''}
                onChange={handleChange}
                style={inputStyle}
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label style={labelStyle}>Revenue 2023</label>
              <input
                type="number"
                name="revenue2023"
                value={formData.revenue2023 || ''}
                onChange={handleChange}
                style={inputStyle}
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Volume Breakdown 2021 (JSON or list products)</label>
            <textarea
              name="volumeBreakdown2021"
              value={formData.volumeBreakdown2021}
              onChange={handleChange}
              style={{...inputStyle, minHeight: '60px'}}
              placeholder='e.g. [{"name": "Product A", "volume": 1000}]'
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Volume Breakdown 2022</label>
            <textarea
              name="volumeBreakdown2022"
              value={formData.volumeBreakdown2022}
              onChange={handleChange}
              style={{...inputStyle, minHeight: '60px'}}
              placeholder='e.g. [{"name": "Product A", "volume": 1200}]'
            />
          </div>

          <div>
            <label style={labelStyle}>Volume Breakdown 2023</label>
            <textarea
              name="volumeBreakdown2023"
              value={formData.volumeBreakdown2023}
              onChange={handleChange}
              style={{...inputStyle, minHeight: '60px'}}
              placeholder='e.g. [{"name": "Product A", "volume": 1500}]'
            />
          </div>
        </div>

        {/* BAGIAN 7: KONTAK INTERNAL */}
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>📞 BAGIAN 7: PERSON IN CHARGE / KONTAK INTERNAL</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Nama</label>
              <input
                type="text"
                name="internalContactName"
                value={formData.internalContactName}
                onChange={handleChange}
                style={inputStyle}
                placeholder="Internal Contact Name"
              />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                name="internalContactEmail"
                value={formData.internalContactEmail}
                onChange={handleChange}
                style={inputStyle}
                placeholder="Internal Contact Email"
              />
            </div>
            <div>
              <label style={labelStyle}>Telepon</label>
              <input
                type="tel"
                name="internalContactPhone"
                value={formData.internalContactPhone}
                onChange={handleChange}
                style={inputStyle}
                placeholder="Internal Contact Phone"
              />
            </div>
          </div>
        </div>

        {/* DIVISION & APPROVAL SETTINGS */}
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>⚙️ PENGATURAN DIVISI & APPROVAL</h2>
          
          {user?.role === 'IT' && divisions.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Division</label>
              <select
                name="divisionId"
                value={formData.divisionId}
                onChange={handleChange}
                required
                style={inputStyle}
              >
                <option value="0">Select Division</option>
                {divisions.map(div => (
                  <option key={div.id} value={div.id}>
                    {div.divisionName} ({div.divisionCode})
                  </option>
                ))}
              </select>
            </div>
          )}

          {userDivision && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Division</label>
              <input
                type="text"
                value={`${userDivision.name} (${userDivision.code})`}
                disabled
                style={{...inputStyle, background: '#f3f4f6', cursor: 'not-allowed'}}
              />
            </div>
          )}

          <div>
            <label style={labelStyle}>Required Approval Levels</label>
            <select
              name="requiredApprovalLevels"
              value={formData.requiredApprovalLevels || 0}
              onChange={handleChange}
              required
              style={inputStyle}
            >
              <option value="0">Select Level</option>
              {[...Array(maxApprovalLevels)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  Level {i + 1}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* SUBMIT BUTTONS */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={() => navigate('/Vendors')}
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
                Create Vendor
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

