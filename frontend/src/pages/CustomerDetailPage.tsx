import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { customerService, Customer } from '../services/customerService'
import { approvalService } from '../services/approvalService'
import { useAuth } from '../context/AuthContext'
import '../styles/modern.css'

export default function CustomerDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [history, setHistory] = useState<any[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  useEffect(() => {
    if (id) {
      loadCustomer(parseInt(id))
    }
  }, [id])

  const loadCustomer = async (customerId: number) => {
    try {
      setLoading(true)
      const data = await customerService.getById(customerId)
      setCustomer(data)
      // Load history if not draft
      if (data.kycStatus !== 'DRAFT') {
        loadHistory(customerId)
      }
    } catch (error) {
      console.error('Failed to load customer:', error)
      setError('Failed to load customer details')
    } finally {
      setLoading(false)
    }
  }

  const loadHistory = async (customerId: number) => {
    try {
      setLoadingHistory(true)
      const data = await approvalService.getApprovalHistory(customerId)
      setHistory(data)
    } catch (error) {
      console.error('Failed to load approval history:', error)
    } finally {
      setLoadingHistory(false)
    }
  }

  const handleSubmit = async () => {
    if (!customer || !id) return
    
    if (!window.confirm('Submit customer for approval? This action cannot be undone.')) return

    try {
      setSubmitting(true)
      await customerService.submit(parseInt(id))
      alert('✓ Customer successfully submitted for approval!')
      navigate('/customers')
    } catch (error: any) {
      console.error('Failed to submit customer:', error)
      setError(error.response?.data?.message || 'Failed to submit customer')
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return { bg: '#f3f4f6', text: '#374151', border: '#d1d5db' }
      case 'SUBMITTED':
        return { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' }
      case 'APPROVED_L1':
        return { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' }
      case 'APPROVED_L2':
        return { bg: '#e0e7ff', text: '#3730a3', border: '#a5b4fc' }
      case 'APPROVED_L3':
      case 'READY_FOR_SAP':
        return { bg: '#d1fae5', text: '#065f46', border: '#6ee7b7' }
      case 'SYNCED_TO_SAP':
        return { bg: '#f3e8ff', text: '#6b21a8', border: '#d8b4fe' }
      case 'REJECTED':
        return { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' }
      default:
        return { bg: '#f3f4f6', text: '#374151', border: '#d1d5db' }
    }
  }

  if (loading) {
    return (
      <div className="main-content">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <div style={{ textAlign: 'center' }}>
            <div className="spinner" style={{ width: '48px', height: '48px', margin: '0 auto 1rem' }}></div>
            <p style={{ color: 'var(--text-secondary)' }}>Loading customer details...</p>
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

  const statusColor = getStatusBadgeColor(customer.kycStatus)
  const canSubmit = customer.kycStatus === 'DRAFT' && (user?.role === 'User' || user?.role === 'IT')
  const canEdit = customer.kycStatus === 'DRAFT' && (user?.role === 'User' || user?.role === 'IT')

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

  const labelStyle: React.CSSProperties = {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    display: 'block',
    marginBottom: '0.5rem'
  }

  const valueStyle: React.CSSProperties = {
    padding: '0.875rem 1rem',
    background: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    fontSize: '0.9375rem',
    color: '#1f2937'
  }

  return (
    <div className="main-content">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={() => navigate('/customers')}
          style={{
            background: 'none',
            border: 'none',
            color: '#3b82f6',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem',
            padding: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(-4px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
        >
          ← Back to Customers
        </button>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Customer Details
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              View customer information and approval status
            </p>
          </div>
          <span style={{
            padding: '0.75rem 1.25rem',
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: 700,
            background: statusColor.bg,
            color: statusColor.text,
            border: `2px solid ${statusColor.border}`
          }}>
            {customer.kycStatus.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderLeft: '4px solid #ef4444',
            padding: '1rem 1.25rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            color: '#dc2626',
            fontSize: '0.875rem'
          }}>
            {error}
          </div>
        )}

      {/* BAGIAN 1: DETAIL COUNTERPARTY */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>
          📋 BAGIAN 1: DETAIL COUNTERPARTY
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
          <div>
            <label style={labelStyle}>Nomor Formulir Registrasi</label>
            <div style={valueStyle}>{customer.customerCode}</div>
          </div>

          <div>
            <label style={labelStyle}>Nama Terdaftar</label>
            <div style={valueStyle}>{customer.customerName}</div>
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <label style={labelStyle}>Alamat Pengiriman</label>
            <div style={{...valueStyle, minHeight: '4rem'}}>{customer.address}</div>
          </div>

          {customer.registeredAddress && (
            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Alamat Terdaftar</label>
              <div style={{...valueStyle, minHeight: '4rem'}}>{customer.registeredAddress}</div>
            </div>
          )}

          {customer.correspondenceAddress && (
            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Alamat Surat Menyurat</label>
              <div style={{...valueStyle, minHeight: '4rem'}}>{customer.correspondenceAddress}</div>
            </div>
          )}

          {customer.establishmentDate && (
            <div>
              <label style={labelStyle}>Tanggal Pendirian Badan Usaha</label>
              <div style={valueStyle}>{customer.establishmentDate}</div>
            </div>
          )}

          {customer.establishmentCountry && (
            <div>
              <label style={labelStyle}>Negara Tempat Pendirian Badan Usaha</label>
              <div style={valueStyle}>{customer.establishmentCountry}</div>
            </div>
          )}

          {customer.registrationNumber && (
            <div>
              <label style={labelStyle}>Nomor Registrasi Badan Usaha</label>
              <div style={valueStyle}>{customer.registrationNumber}</div>
            </div>
          )}

          <div>
            <label style={labelStyle}>Telepon</label>
            <div style={valueStyle}>{customer.phoneNumber}</div>
          </div>

          <div>
            <label style={labelStyle}>E-mail</label>
            <div style={valueStyle}>{customer.email}</div>
          </div>

          {customer.website && (
            <div>
              <label style={labelStyle}>Website</label>
              <div style={valueStyle}>{customer.website}</div>
            </div>
          )}

          {customer.facsimile && (
            <div>
              <label style={labelStyle}>Facsimile</label>
              <div style={valueStyle}>{customer.facsimile}</div>
            </div>
          )}

          {customer.npwp && (
            <div>
              <label style={labelStyle}>Nomor Pokok Wajib Pajak (NPWP)</label>
              <div style={valueStyle}>{customer.npwp}</div>
            </div>
          )}

          {customer.nib && (
            <div>
              <label style={labelStyle}>NIB</label>
              <div style={valueStyle}>{customer.nib}</div>
            </div>
          )}

          {customer.identityCardNumber && (
            <div>
              <label style={labelStyle}>Kartu Identitas (KTP)</label>
              <div style={valueStyle}>{customer.identityCardNumber}</div>
            </div>
          )}

          {customer.taxAddress && (
            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Alamat NPWP</label>
              <div style={{...valueStyle, minHeight: '3rem'}}>{customer.taxAddress}</div>
            </div>
          )}

          {customer.businessNature && (
            <div>
              <label style={labelStyle}>Sifat Bisnis</label>
              <div style={valueStyle}>{customer.businessNature}</div>
            </div>
          )}

          {customer.auditor && (
            <div>
              <label style={labelStyle}>Auditor</label>
              <div style={valueStyle}>{customer.auditor}</div>
            </div>
          )}

          {customer.parentCompanyName && (
            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Perusahaan Pemilik</label>
              <div style={{...valueStyle, minHeight: '4rem', whiteSpace: 'pre-wrap'}}>{customer.parentCompanyName}</div>
            </div>
          )}

          {customer.affiliatedCompanyDetails && (
            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Perusahaan Afiliasi</label>
              <div style={{...valueStyle, minHeight: '5rem', whiteSpace: 'pre-wrap'}}>{customer.affiliatedCompanyDetails}</div>
            </div>
          )}

          {customer.beneficialOwners && (
            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Penerima Manfaat Sebenarnya</label>
              <div style={{...valueStyle, minHeight: '6rem', whiteSpace: 'pre-wrap'}}>{customer.beneficialOwners}</div>
            </div>
          )}

          {customer.authorizedSignatories && (
            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Direktur / Mitra / Penandatangan Resmi</label>
              <div style={{...valueStyle, minHeight: '5rem', whiteSpace: 'pre-wrap'}}>{customer.authorizedSignatories}</div>
            </div>
          )}

          {customer.businessPotential && (
            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Potensi Kegiatan Usaha</label>
              <div style={{...valueStyle, minHeight: '4rem', whiteSpace: 'pre-wrap'}}>{customer.businessPotential}</div>
            </div>
          )}

          {customer.expectedQuantityFrequency && (
            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Kuantitas dan Frekuensi yang Diharapkan</label>
              <div style={{...valueStyle, minHeight: '4rem', whiteSpace: 'pre-wrap'}}>{customer.expectedQuantityFrequency}</div>
            </div>
          )}

          {customer.paymentTerms && (
            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Syarat Pembayaran yang Dimohonkan</label>
              <div style={valueStyle}>{customer.paymentTerms}</div>
            </div>
          )}

          <div>
            <label style={labelStyle}>Created Date</label>
            <div style={valueStyle}>{new Date(customer.createdAt).toLocaleString()}</div>
          </div>

          <div>
            <label style={labelStyle}>Required Approval Levels</label>
            <div style={valueStyle}>Level {customer.requiredApprovalLevels || 2}</div>
          </div>
        </div>

        {/* Document Attachments */}
        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '1rem', color: '#1e40af' }}>
            Lampiran Dokumen
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            {customer.hasAttachmentIndonesia && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <span style={{ color: '#10b981' }}>✓</span> Akta Pendirian Badan Usaha
              </div>
            )}
            {customer.hasAttachmentSKT && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <span style={{ color: '#10b981' }}>✓</span> Akta Kepengurusan
              </div>
            )}
            {customer.hasAttachmentForeign && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <span style={{ color: '#10b981' }}>✓</span> Sertifikat Perseroan
              </div>
            )}
            {customer.hasAttachmentTDP && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <span style={{ color: '#10b981' }}>✓</span> Kartu Identitas (KTP)
              </div>
            )}
            {customer.hasAttachmentNPWP && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <span style={{ color: '#10b981' }}>✓</span> NPWP
              </div>
            )}
            {customer.hasAttachmentNIB && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <span style={{ color: '#10b981' }}>✓</span> NIB
              </div>
            )}
            {customer.hasAttachmentProfit && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <span style={{ color: '#10b981' }}>✓</span> Presentasi Profil Badan Usaha
              </div>
            )}
            {customer.hasAttachmentBalanceSheet && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <span style={{ color: '#10b981' }}>✓</span> Lap. Keuangan Diaudit (3th Terakhir)
              </div>
            )}
            {customer.hasAttachmentCashFlow && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <span style={{ color: '#10b981' }}>✓</span> Surat Referensi Bank
              </div>
            )}
            {customer.hasAttachmentTaxReturn && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <span style={{ color: '#10b981' }}>✓</span> Rekening Koran
              </div>
            )}
            {customer.hasAttachmentSIUP && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <span style={{ color: '#10b981' }}>✓</span> Bagan Organisasi
              </div>
            )}
            {customer.hasAttachmentOther && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <span style={{ color: '#10b981' }}>✓</span> Lain-lain
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BAGIAN 2: KONTAK INFORMASI */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>
          📞 BAGIAN 2: KONTAK INFORMASI
        </h2>

        {/* Referensi PIC Komersil */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '1rem', color: '#1e40af' }}>
            REFERENSI PIC KOMERSIL
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
            {customer.commercialPicName && (
              <div>
                <label style={labelStyle}>Nama/Referensi</label>
                <div style={valueStyle}>{customer.commercialPicName}</div>
              </div>
            )}
            {customer.commercialPicPosition && (
              <div>
                <label style={labelStyle}>Posisi</label>
                <div style={valueStyle}>{customer.commercialPicPosition}</div>
              </div>
            )}
            {customer.commercialPicPhone && (
              <div>
                <label style={labelStyle}>Telepon</label>
                <div style={valueStyle}>{customer.commercialPicPhone}</div>
              </div>
            )}
            {customer.commercialPicEmail && (
              <div>
                <label style={labelStyle}>E-mail</label>
                <div style={valueStyle}>{customer.commercialPicEmail}</div>
              </div>
            )}
          </div>
        </div>

        {/* Kegiatan Penagihan - PIC Keuangan */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '1rem', color: '#1e40af' }}>
            KEGIATAN PENAGIHAN - REFERENSI PIC DEPARTEMEN KEUANGAN
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
            {customer.financePicName && (
              <div>
                <label style={labelStyle}>Nama/Referensi</label>
                <div style={valueStyle}>{customer.financePicName}</div>
              </div>
            )}
            {customer.financePicEmail && (
              <div>
                <label style={labelStyle}>E-mail</label>
                <div style={valueStyle}>{customer.financePicEmail}</div>
              </div>
            )}
            {customer.financePicPhone && (
              <div>
                <label style={labelStyle}>Telepon</label>
                <div style={valueStyle}>{customer.financePicPhone}</div>
              </div>
            )}
          </div>
        </div>

        {/* Referensi Bank */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '1rem', color: '#1e40af' }}>
            REFERENSI BANK
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
            {customer.referenceBankName && (
              <div>
                <label style={labelStyle}>Nama Bank</label>
                <div style={valueStyle}>{customer.referenceBankName}</div>
              </div>
            )}
            {customer.referenceBankAddress && (
              <div>
                <label style={labelStyle}>Alamat</label>
                <div style={valueStyle}>{customer.referenceBankAddress}</div>
              </div>
            )}
            {customer.referenceBankAccountNumber && (
              <div>
                <label style={labelStyle}>Nomor Akun</label>
                <div style={valueStyle}>{customer.referenceBankAccountNumber}</div>
              </div>
            )}
          </div>
        </div>

        {/* Form Pernyataan */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '1rem', color: '#1e40af' }}>
            FORM PERNYATAAN
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
            {customer.registrationSubmissionDate && (
              <div>
                <label style={labelStyle}>Tanggal Pengajuan Registrasi</label>
                <div style={valueStyle}>{customer.registrationSubmissionDate}</div>
              </div>
            )}
            {customer.submitterNamePosition && (
              <div>
                <label style={labelStyle}>Nama / Posisi</label>
                <div style={valueStyle}>{customer.submitterNamePosition}</div>
              </div>
            )}
            {customer.companySignatureStamp && (
              <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>Tanda Tangan/ Cap Perseroan</label>
                <div style={{...valueStyle, padding: '1rem'}}>
                  <img src={customer.companySignatureStamp} alt="Company Signature" style={{ maxWidth: '350px', height: 'auto', display: 'block' }} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Persetujuan Departemen Internal */}
        <div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '1rem', color: '#ffffff', backgroundColor: '#1e3a8a', padding: '0.5rem 1rem', borderRadius: '6px' }}>
            PERSETUJUAN DEPARTEMEN INTERNAL
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
            {customer.commercialReviewerName && (
              <div>
                <label style={labelStyle}>Peninjau PIC Komersil/Penjualan</label>
                <div style={valueStyle}>
                  {customer.commercialReviewerName}
                  {customer.commercialReviewerDate && ` (${customer.commercialReviewerDate})`}
                </div>
              </div>
            )}
            {customer.gmApprovalName && (
              <div>
                <label style={labelStyle}>Persetujuan Oleh Level GM</label>
                <div style={valueStyle}>
                  {customer.gmApprovalName}
                  {customer.gmApprovalDate && ` (${customer.gmApprovalDate})`}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BAGIAN 3: PERSETUJUAN DEPARTEMEN KEUANGAN DAN IT */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>
          💼 BAGIAN 3: PERSETUJUAN DEPARTEMEN KEUANGAN DAN IT
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
          {customer.transactionCurrency && (
            <div>
              <label style={labelStyle}>Kurs Transaksi</label>
              <div style={valueStyle}>{customer.transactionCurrency}</div>
            </div>
          )}

          {customer.financeDivision && (
            <div>
              <label style={labelStyle}>Divisi</label>
              <div style={valueStyle}>{customer.financeDivision}</div>
            </div>
          )}

          {customer.buyerVendorType && (
            <div>
              <label style={labelStyle}>Tipe Pembeli/Vendor</label>
              <div style={valueStyle}>{customer.buyerVendorType}</div>
            </div>
          )}

          {customer.sapAccountType && (
            <div>
              <label style={labelStyle}>Tipe Akun SAP</label>
              <div style={valueStyle}>{customer.sapAccountType}</div>
            </div>
          )}

          {customer.financeGmSignature && (
            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Tanda Tangan Finance GM</label>
              <div style={{...valueStyle, padding: '1rem'}}>
                <img src={customer.financeGmSignature} alt="Finance GM Signature" style={{ maxWidth: '400px', height: 'auto', display: 'block' }} />
              </div>
            </div>
          )}

          {customer.creditLimitAmount && (
            <div>
              <label style={labelStyle}>Kredit Limit Yang Diberikan (dalam Rp.)</label>
              <div style={valueStyle}>{customer.creditLimitAmount}</div>
            </div>
          )}

          {customer.financeGmApprovalName && (
            <div>
              <label style={labelStyle}>Persetujuan Oleh Level GM</label>
              <div style={valueStyle}>
                {customer.financeGmApprovalName}
                {customer.financeGmApprovalDate && ` (${customer.financeGmApprovalDate})`}
              </div>
            </div>
          )}

          {customer.financeNotes && (
            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Catatan</label>
              <div style={{...valueStyle, minHeight: '4rem', whiteSpace: 'pre-wrap'}}>{customer.financeNotes}</div>
            </div>
          )}

          {customer.financeReviewerName && (
            <div>
              <label style={labelStyle}>Peninjau Dari Departemen Keuangan</label>
              <div style={valueStyle}>
                {customer.financeReviewerName}
                {customer.financeReviewerDate && ` (${customer.financeReviewerDate})`}
              </div>
            </div>
          )}

          {customer.sapAccountNumber && (
            <div>
              <label style={labelStyle}>Nomor Akun SAP</label>
              <div style={valueStyle}>{customer.sapAccountNumber}</div>
            </div>
          )}

          {customer.itRegistrationDate && (
            <div>
              <label style={labelStyle}>Tanggal Registrasi Dari Departemen IT</label>
              <div style={valueStyle}>{customer.itRegistrationDate}</div>
            </div>
          )}

          {customer.acknowledgedBy && (
            <div>
              <label style={labelStyle}>Diketahui Oleh</label>
              <div style={valueStyle}>
                {customer.acknowledgedBy}
                {customer.acknowledgedByDate && ` (${customer.acknowledgedByDate})`}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* BAGIAN 4: BANK UTAMA */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>
          🏦 BAGIAN 4: BANK UTAMA
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
            {customer.primaryBankName && (
              <div>
                <label style={labelStyle}>Bank Utama</label>
                <div style={valueStyle}>{customer.primaryBankName}</div>
              </div>
            )}

            {customer.bankAccountName && (
              <div>
                <label style={labelStyle}>Nama Pemilik Rekening</label>
                <div style={valueStyle}>{customer.bankAccountName}</div>
              </div>
            )}

            {customer.bankAddress && (
              <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>Alamat Bank</label>
                <div style={{...valueStyle, minHeight: '3rem'}}>{customer.bankAddress}</div>
              </div>
            )}

            {customer.bankAccountNumber && (
              <div>
                <label style={labelStyle}>Nomor Rekening</label>
                <div style={valueStyle}>{customer.bankAccountNumber}</div>
              </div>
            )}

            {customer.bankPhoneNumber && (
              <div>
                <label style={labelStyle}>Telepon Bank</label>
                <div style={valueStyle}>{customer.bankPhoneNumber}</div>
              </div>
            )}

            {customer.bankContactPerson && (
              <div>
                <label style={labelStyle}>Contact Person</label>
                <div style={valueStyle}>{customer.bankContactPerson}</div>
              </div>
            )}
          </div>
      </div>

      {/* Approval History */}
      {customer.kycStatus !== 'DRAFT' && (
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '10px',
            marginBottom: '1.5rem',
            border: '1px solid var(--border)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{
              fontSize: '1.125rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span style={{ fontSize: '1.25rem' }}>📜</span>
              Approval History
            </h2>

            {loadingHistory ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                <div className="spinner" style={{ width: '24px', height: '24px', margin: '0 auto 0.5rem' }}></div>
                Loading history...
              </div>
            ) : history.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                No approval history yet
              </div>
            ) : (
              <div style={{ position: 'relative', paddingLeft: '2rem' }}>
                {/* Timeline line */}
                <div style={{
                  position: 'absolute',
                  left: '0.5rem',
                  top: '1rem',
                  bottom: '1rem',
                  width: '2px',
                  background: 'linear-gradient(to bottom, #3b82f6, #10b981)',
                  opacity: 0.3
                }}></div>

                {history.map((item, index) => {
                  const isApprove = item.action.includes('APPROVE')
                  const isReject = item.action === 'REJECT'
                  
                  return (
                    <div key={item.id} style={{
                      position: 'relative',
                      marginBottom: index < history.length - 1 ? '1.5rem' : 0,
                      paddingLeft: '1.5rem'
                    }}>
                      {/* Timeline dot */}
                      <div style={{
                        position: 'absolute',
                        left: '-1.5rem',
                        top: '0.25rem',
                        width: '1rem',
                        height: '1rem',
                        borderRadius: '50%',
                        background: isReject ? '#ef4444' : isApprove ? '#10b981' : '#3b82f6',
                        border: '3px solid white',
                        boxShadow: '0 0 0 2px ' + (isReject ? '#ef4444' : isApprove ? '#10b981' : '#3b82f6')
                      }}></div>

                      <div style={{
                        background: '#f8fafc',
                        padding: '1rem 1.25rem',
                        borderRadius: '8px',
                        border: '1px solid var(--border)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                              {item.action.replace(/_/g, ' ')}
                            </div>
                            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                              by <strong>{item.user?.fullName || 'Unknown'}</strong> ({item.user?.roleName || 'N/A'})
                            </div>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                            {new Date(item.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <div style={{
                          fontSize: '0.8125rem',
                          padding: '0.5rem 0.75rem',
                          background: 'white',
                          borderRadius: '6px',
                          border: '1px solid var(--border)',
                          display: 'inline-block'
                        }}>
                          <strong>Status:</strong> {item.previousStatus} → <strong>{item.newStatus}</strong>
                        </div>
                        {item.comments && (
                          <div style={{
                            marginTop: '0.75rem',
                            padding: '0.75rem',
                            background: 'white',
                            borderRadius: '6px',
                            border: '1px solid var(--border)',
                            fontSize: '0.875rem',
                            color: 'var(--text-primary)',
                            fontStyle: 'italic'
                          }}>
                            💬 {item.comments}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '10px',
          border: '1px solid var(--border)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          display: 'flex',
          gap: '1rem'
        }}>
          {canEdit && (
            <button
              onClick={() => navigate(`/customers/${customer.id}/edit`)}
              style={{
                flex: 1,
                padding: '0.875rem 2rem',
                fontSize: '0.9375rem',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <span>✏️</span>
              Edit Customer
            </button>
          )}
          {canSubmit && (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={{
                flex: 1,
                padding: '0.875rem 2rem',
                fontSize: '0.9375rem',
                fontWeight: 700,
                background: submitting ? '#e2e8f0' : 'linear-gradient(135deg, #2563eb, #1e40af)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: submitting ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: submitting ? 'none' : '0 4px 12px rgba(37, 99, 235, 0.3)'
              }}
              onMouseEnter={(e) => !submitting && (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              {submitting ? (
                <>
                  <span className="spinner" style={{ width: '16px', height: '16px' }}></span>
                  Submitting...
                </>
              ) : (
                <>
                  <span>📤</span>
                  Submit for Approval
                </>
              )}
            </button>
          )}
          <button
            onClick={() => navigate('/customers')}
            style={{
              flex: canSubmit || canEdit ? 0.5 : 1,
              padding: '0.875rem 2rem',
              fontSize: '0.9375rem',
              fontWeight: 700,
              background: 'white',
              color: 'var(--text-secondary)',
              border: '2px solid var(--border)',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}
          >
            Close
          </button>
        </div>
    </div>
  )
}
