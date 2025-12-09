import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { customerService, CreateCustomerRequest, Customer } from '../services/customerService'
import { SignaturePad } from '../components/SignaturePad'
import '../styles/modern.css'

export default function EditCustomerPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [formData, setFormData] = useState<CreateCustomerRequest>({
    customerCode: '',
    customerName: '',
    email: '',
    phoneNumber: '',
    address: '',
    divisionId: 0,
    requiredApprovalLevels: 2
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [maxApprovalLevels, setMaxApprovalLevels] = useState<number>(0)
  const [userDivision, setUserDivision] = useState<{ id: number; code: string; name: string } | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])

  useEffect(() => {
    if (id) {
      loadData(parseInt(id))
    }
  }, [id])

  const loadData = async (customerId: number) => {
    try {
      setLoading(true)
      const customerData = await customerService.getById(customerId)
      
      if (customerData.kycStatus !== 'DRAFT') {
        setError('Only customers with DRAFT status can be edited')
        setTimeout(() => navigate('/customers'), 2000)
        return
      }

      setCustomer(customerData)
      
      // Get user's division
      if (user?.userApprovals && user.userApprovals.length > 0) {
        const firstApproval = user.userApprovals[0]
        const divisionId = firstApproval.divisionId
        
        setUserDivision({
          id: divisionId,
          code: firstApproval.divisionCode,
          name: firstApproval.divisionName
        })
        
        // Fetch max approval levels for division
        const response = await fetch(`http://localhost:5000/api/admin/divisions/${divisionId}/max-approval-levels`)
        const data = await response.json()
        setMaxApprovalLevels(data.maxApprovalLevels)
        
        // Pre-fill form with customer data
        setFormData({
          ...customerData,
          divisionId,
          requiredApprovalLevels: data.maxApprovalLevels
        })
      } else {
        setError('User tidak memiliki divisi yang terdaftar')
      }
    } catch (err: any) {
      setError('Failed to load customer data')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target

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
    if (!id) return

    setSaving(true)
    setError('')

    try {
      await customerService.update(parseInt(id), formData)
      setSuccess(true)
      setTimeout(() => {
        navigate(`/customers/${id}`)
      }, 1500)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update customer')
    } finally {
      setSaving(false)
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

  if (loading) {
    return (
      <div className="main-content">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <div style={{ textAlign: 'center' }}>
            <div className="spinner" style={{ width: '48px', height: '48px', margin: '0 auto 1rem' }}></div>
            <p style={{ color: 'var(--text-secondary)' }}>Loading customer data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="main-content">
        <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.5 }}>⚠️</div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            Customer Not Found
          </h3>
          <button
            onClick={() => navigate('/customers')}
            style={{
              marginTop: '1.5rem',
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #2563eb, #1e40af)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            ← Back to Customers
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="main-content">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          Edit Customer
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Update customer information (DRAFT status only)
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

      {loading && (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          color: 'var(--text-secondary)'
        }}>
          Loading customer data...
        </div>
      )}

      {!loading && (
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
                disabled={saving}
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
                disabled={saving}
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
              disabled={saving}
              style={{...inputStyle, minHeight: '60px'}}
              placeholder="JL NR AHMAD DAHLAN, KPGM/BANGUN UTAMA..."
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Alamat Terdaftar */**</label>
            <textarea
              name="registeredAddress"
              value={formData.registeredAddress || ''}
              onChange={handleChange}
              disabled={saving}
              style={{...inputStyle, minHeight: '60px'}}
              placeholder="JL TIN MALANG NO. 770 RT 006 / RW 004..."
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Alamat Surat Menyurat */**</label>
            <textarea
              name="correspondenceAddress"
              value={formData.correspondenceAddress || ''}
              onChange={handleChange}
              disabled={saving}
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
                value={formData.establishmentDate || ''}
                onChange={handleChange}
                disabled={saving}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Negara Tempat Pendirian Badan Usaha *</label>
              <select
                name="establishmentCountry"
                value={formData.establishmentCountry || ''}
                onChange={handleChange}
                disabled={saving}
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
                value={formData.registrationNumber || ''}
                onChange={handleChange}
                disabled={saving}
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
                disabled={saving}
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
                disabled={saving}
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
                value={formData.website || ''}
                onChange={handleChange}
                disabled={saving}
                style={inputStyle}
                placeholder="0813 8267 5353"
              />
            </div>
            <div>
              <label style={labelStyle}>Facsimile *</label>
              <input
                type="text"
                name="facsimile"
                value={formData.facsimile || ''}
                onChange={handleChange}
                disabled={saving}
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
                value={formData.npwp || ''}
                onChange={handleChange}
                disabled={saving}
                style={inputStyle}
                placeholder="04.1 255 904.2 354.000"
              />
            </div>
            <div>
              <label style={labelStyle}>NIB */**</label>
              <input
                type="text"
                name="nib"
                value={formData.nib || ''}
                onChange={handleChange}
                disabled={saving}
                style={inputStyle}
                placeholder="NIB Number"
              />
            </div>
            <div>
              <label style={labelStyle}>Kartu Identitas (KTP) **</label>
              <input
                type="text"
                name="identityCardNumber"
                value={formData.identityCardNumber || ''}
                onChange={handleChange}
                disabled={saving}
                style={inputStyle}
                placeholder="3171021080200001"
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Alamat NPWP **</label>
            <textarea
              name="taxAddress"
              value={formData.taxAddress || ''}
              onChange={handleChange}
              disabled={saving}
              style={{...inputStyle, minHeight: '60px'}}
              placeholder="Tax office address"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={labelStyle}>Sifat Bisnis */**</label>
              <select
                name="businessNature"
                value={formData.businessNature || ''}
                onChange={handleChange}
                disabled={saving}
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
                value={formData.auditor || ''}
                onChange={handleChange}
                disabled={saving}
                style={inputStyle}
                placeholder="BANK BCA"
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Perusahaan Pemilik *</label>
            <textarea
              name="parentCompanyName"
              value={formData.parentCompanyName || ''}
              onChange={handleChange}
              disabled={saving}
              style={{...inputStyle, minHeight: '80px'}}
              placeholder="Masukkan nama perusahaan pemilik (bisa multiple)"
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Perusahaan Afiliasi *</label>
            <textarea
              name="affiliatedCompanyDetails"
              value={formData.affiliatedCompanyDetails || ''}
              onChange={handleChange}
              disabled={saving}
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
              value={formData.beneficialOwners || ''}
              onChange={handleChange}
              disabled={saving}
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
              value={formData.authorizedSignatories || ''}
              onChange={handleChange}
              disabled={saving}
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
              value={formData.businessPotential || ''}
              onChange={handleChange}
              disabled={saving}
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
              value={formData.expectedQuantityFrequency || ''}
              onChange={handleChange}
              disabled={saving}
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
              disabled={saving}
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
                  disabled={saving}
                />
                Akta Pendirian Badan Usaha *
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <input
                  type="checkbox"
                  name="hasAttachmentSKT"
                  checked={formData.hasAttachmentSKT || false}
                  onChange={handleChange}
                  disabled={saving}
                />
                Akta Kepengurusan *
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <input
                  type="checkbox"
                  name="hasAttachmentForeign"
                  checked={formData.hasAttachmentForeign || false}
                  onChange={handleChange}
                  disabled={saving}
                />
                Sertifikat Perseroan *
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <input
                  type="checkbox"
                  name="hasAttachmentTDP"
                  checked={formData.hasAttachmentTDP || false}
                  onChange={handleChange}
                  disabled={saving}
                />
                Kartu Identitas (KTP) **
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <input
                  type="checkbox"
                  name="hasAttachmentNPWP"
                  checked={formData.hasAttachmentNPWP || false}
                  onChange={handleChange}
                  disabled={saving}
                />
                NPWP
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <input
                  type="checkbox"
                  name="hasAttachmentNIB"
                  checked={formData.hasAttachmentNIB || false}
                  onChange={handleChange}
                  disabled={saving}
                />
                NIB */**
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <input
                  type="checkbox"
                  name="hasAttachmentProfit"
                  checked={formData.hasAttachmentProfit || false}
                  onChange={handleChange}
                  disabled={saving}
                />
                Presentasi Profil Badan Usaha *
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <input
                  type="checkbox"
                  name="hasAttachmentBalanceSheet"
                  checked={formData.hasAttachmentBalanceSheet || false}
                  onChange={handleChange}
                  disabled={saving}
                />
                Lap. Keuangan Diaudit (3th Terakhir) *
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <input
                  type="checkbox"
                  name="hasAttachmentCashFlow"
                  checked={formData.hasAttachmentCashFlow || false}
                  onChange={handleChange}
                  disabled={saving}
                />
                Surat Referensi Bank *
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <input
                  type="checkbox"
                  name="hasAttachmentTaxReturn"
                  checked={formData.hasAttachmentTaxReturn || false}
                  onChange={handleChange}
                  disabled={saving}
                />
                Rekening Koran */**
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <input
                  type="checkbox"
                  name="hasAttachmentSIUP"
                  checked={formData.hasAttachmentSIUP || false}
                  onChange={handleChange}
                  disabled={saving}
                />
                Bagan Organisasi *
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <input
                  type="checkbox"
                  name="hasAttachmentOther"
                  checked={formData.hasAttachmentOther || false}
                  onChange={handleChange}
                  disabled={saving}
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
                disabled={saving}
                style={{
                  ...inputStyle,
                  padding: '0.75rem',
                  cursor: saving ? 'not-allowed' : 'pointer'
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
                          disabled={saving}
                          style={{
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '4px',
                            cursor: saving ? 'not-allowed' : 'pointer',
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
                  value={formData.commercialPicName || ''}
                  onChange={handleChange}
                  disabled={saving}
                  style={inputStyle}
                  placeholder="Nama"
                />
              </div>
              <div>
                <label style={labelStyle}>Posisi</label>
                <input
                  type="text"
                  name="commercialPicPosition"
                  value={formData.commercialPicPosition || ''}
                  onChange={handleChange}
                  disabled={saving}
                  style={inputStyle}
                  placeholder="Posisi"
                />
              </div>
              <div>
                <label style={labelStyle}>Telepon</label>
                <input
                  type="tel"
                  name="commercialPicPhone"
                  value={formData.commercialPicPhone || ''}
                  onChange={handleChange}
                  disabled={saving}
                  style={inputStyle}
                  placeholder="Telepon"
                />
              </div>
              <div>
                <label style={labelStyle}>E-mail</label>
                <input
                  type="email"
                  name="commercialPicEmail"
                  value={formData.commercialPicEmail || ''}
                  onChange={handleChange}
                  disabled={saving}
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
                  value={formData.financePicName || ''}
                  onChange={handleChange}
                  disabled={saving}
                  style={inputStyle}
                  placeholder="Nama"
                />
              </div>
              <div>
                <label style={labelStyle}>E-mail</label>
                <input
                  type="email"
                  name="financePicEmail"
                  value={formData.financePicEmail || ''}
                  onChange={handleChange}
                  disabled={saving}
                  style={inputStyle}
                  placeholder="E-mail"
                />
              </div>
              <div>
                <label style={labelStyle}>Telepon</label>
                <input
                  type="tel"
                  name="financePicPhone"
                  value={formData.financePicPhone || ''}
                  onChange={handleChange}
                  disabled={saving}
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
                  value={formData.referenceBankName || ''}
                  onChange={handleChange}
                  disabled={saving}
                  style={inputStyle}
                  placeholder="PT AGUNG ABADI PUTRA MANDIRI (BANK BCA)"
                />
              </div>
              <div>
                <label style={labelStyle}>Alamat</label>
                <input
                  type="text"
                  name="referenceBankAddress"
                  value={formData.referenceBankAddress || ''}
                  onChange={handleChange}
                  disabled={saving}
                  style={inputStyle}
                  placeholder="PAYAKUMBUH"
                />
              </div>
              <div>
                <label style={labelStyle}>Nomor Akun</label>
                <input
                  type="text"
                  name="referenceBankAccountNumber"
                  value={formData.referenceBankAccountNumber || ''}
                  onChange={handleChange}
                  disabled={saving}
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
                  value={formData.registrationSubmissionDate || ''}
                  onChange={handleChange}
                  disabled={saving}
                  style={inputStyle}
                  placeholder="19 May 25"
                />
              </div>
              <div style={{ textAlign: 'left' }}>
                <label style={labelStyle}>Nama / Posisi</label>
                <input
                  type="text"
                  name="submitterNamePosition"
                  value={formData.submitterNamePosition || ''}
                  onChange={handleChange}
                  disabled={saving}
                  style={inputStyle}
                  placeholder="PT AGUNG ABADI PUTRA MANDIRI"
                />
              </div>
              <div style={{ textAlign: 'left' }}>
                <SignaturePad
                  label="Tanda Tangan/ Cap Perseroan (Wajib)"
                  value={formData.companySignatureStamp || ''}
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
                  value={formData.commercialReviewerName || ''}
                  onChange={handleChange}
                  disabled={saving}
                  style={inputStyle}
                  placeholder="Diana"
                />
              </div>
              <div>
                <label style={labelStyle}>Persetujuan Oleh Level GM (tanggal)</label>
                <input
                  type="text"
                  name="gmApprovalName"
                  value={formData.gmApprovalName || ''}
                  onChange={handleChange}
                  disabled={saving}
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
                  value={formData.transactionCurrency || ''}
                  onChange={handleChange}
                  disabled={saving}
                  style={inputStyle}
                  placeholder="IDR"
                />
              </div>
              <div>
                <label style={labelStyle}>Divisi</label>
                <input
                  type="text"
                  name="financeDivision"
                  value={formData.financeDivision || ''}
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
                    value={formData.buyerVendorType || ''}
                    onChange={handleChange}
                    disabled={saving}
                    style={inputStyle}
                    placeholder="Farm"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Tipe Akun SAP</label>
                  <input
                    type="text"
                    name="sapAccountType"
                    value={formData.sapAccountType || ''}
                    onChange={handleChange}
                    disabled={saving}
                    style={inputStyle}
                    placeholder=""
                  />
                </div>
              </div>
              <div>
                <SignaturePad
                  label="Tanda Tangan"
                  value={formData.financeGmSignature || ''}
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
                  value={formData.creditLimitAmount || ''}
                  onChange={handleChange}
                  disabled={saving}
                  style={inputStyle}
                  placeholder="CBD"
                />
              </div>
              <div>
                <label style={labelStyle}>Persetujuan Oleh Level GM (tanggal)</label>
                <input
                  type="text"
                  name="financeGmApprovalName"
                  value={formData.financeGmApprovalName || ''}
                  onChange={handleChange}
                  disabled={saving}
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
                value={formData.financeGmApprovalDate || ''}
                onChange={handleChange}
                disabled={saving}
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Catatan</label>
              <textarea
                name="financeNotes"
                value={formData.financeNotes || ''}
                onChange={handleChange}
                disabled={saving}
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
                  value={formData.financeReviewerName || ''}
                  onChange={handleChange}
                  disabled={saving}
                  style={inputStyle}
                  placeholder=""
                />
              </div>
              <div>
                <label style={labelStyle}>Tanggal</label>
                <input
                  type="date"
                  name="financeReviewerDate"
                  value={formData.financeReviewerDate || ''}
                  onChange={handleChange}
                  disabled={saving}
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
                  value={formData.sapAccountNumber || ''}
                  onChange={handleChange}
                  disabled={saving}
                  style={inputStyle}
                  placeholder=""
                />
              </div>
              <div>
                <label style={labelStyle}>Tanggal Registrasi Dari Departemen IT</label>
                <input
                  type="text"
                  name="itRegistrationDate"
                  value={formData.itRegistrationDate || ''}
                  onChange={handleChange}
                  disabled={saving}
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
                  value={formData.acknowledgedBy || ''}
                  onChange={handleChange}
                  disabled={saving}
                  style={inputStyle}
                  placeholder=""
                />
              </div>
              <div>
                <label style={labelStyle}>Tanggal</label>
                <input
                  type="date"
                  name="acknowledgedByDate"
                  value={formData.acknowledgedByDate || ''}
                  onChange={handleChange}
                  disabled={saving}
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
                value={formData.primaryBankName || ''}
                onChange={handleChange}
                disabled={saving}
                style={inputStyle}
                placeholder="BANK BCA"
              />
            </div>
            <div>
              <label style={labelStyle}>Nama Pemilik Rekening</label>
              <input
                type="text"
                name="bankAccountName"
                value={formData.bankAccountName || ''}
                onChange={handleChange}
                disabled={saving}
                style={inputStyle}
                placeholder="Account Holder Name"
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Alamat Bank</label>
            <textarea
              name="bankAddress"
              value={formData.bankAddress || ''}
              onChange={handleChange}
              disabled={saving}
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
                value={formData.bankAccountNumber || ''}
                onChange={handleChange}
                disabled={saving}
                style={inputStyle}
                placeholder="1234567890"
              />
            </div>
            <div>
              <label style={labelStyle}>Telepon Bank</label>
              <input
                type="tel"
                name="bankPhoneNumber"
                value={formData.bankPhoneNumber || ''}
                onChange={handleChange}
                disabled={saving}
                style={inputStyle}
                placeholder="Bank Phone"
              />
            </div>
            <div>
              <label style={labelStyle}>Contact Person</label>
              <input
                type="text"
                name="bankContactPerson"
                value={formData.bankContactPerson || ''}
                onChange={handleChange}
                disabled={saving}
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
            onClick={() => navigate(`/customers/${id}`)}
            disabled={saving}
            style={{
              padding: '0.875rem 1.5rem',
              fontSize: '0.9375rem',
              fontWeight: 600,
              background: 'white',
              color: '#6b7280',
              border: '1px solid #e5e7eb',
              borderRadius: '10px',
              cursor: saving ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: '0.875rem 1.5rem',
              fontSize: '0.9375rem',
              fontWeight: 700,
              background: saving ? '#9ca3af' : 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: saving ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
              boxShadow: saving ? 'none' : '0 4px 12px rgba(16, 185, 129, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {saving ? (
              <>
                <span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></span>
                Updating...
              </>
            ) : (
              <>
                <span>✓</span>
                Update Customer
              </>
            )}
          </button>
        </div>
        </form>
      )}
    </div>
  )
}

