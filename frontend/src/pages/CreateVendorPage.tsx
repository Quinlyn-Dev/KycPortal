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
    vendorCode: '',
    vendorName: '',
    email: '',
    phoneNumber: '',
    address: '',
    divisionId: 0,
    requiredApprovalLevels: 0
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
    const { name, value } = e.target
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

    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await vendorService.create(formData)
      setSuccess(true)
      setTimeout(() => {
        navigate('/vendors')
      }, 1500)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create vendor')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFormData({
      vendorCode: '',
      vendorName: '',
      email: '',
      phoneNumber: '',
      address: '',
      divisionId: userDivision?.id || 0,
      requiredApprovalLevels: maxApprovalLevels
    })
    setError('')
    setSuccess(false)
  }

  return (
    <div className="main-content">
      <div className="user-container">
        <div className="user-header">
          <div className="user-icon">📝</div>
          <div className="user-title">
            <h1>Create New Vendor</h1>
            <p>Register a new vendor for KYC approval process</p>
          </div>
        </div>

        {error && (
          <div style={{
            padding: '1rem 1.5rem',
            marginBottom: '1.5rem',
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '10px',
            color: '#fca5a5',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <span style={{ fontSize: '1.25rem' }}>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={{
            padding: '1rem 1.5rem',
            marginBottom: '1.5rem',
            background: 'rgba(16, 185, 129, 0.2)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            borderRadius: '10px',
            color: '#6ee7b7',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <span style={{ fontSize: '1.25rem' }}>✓</span>
            <span>Vendor created successfully! Redirecting...</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="user-card">
            <h2 style={{ 
              fontSize: '1.25rem', 
              fontWeight: 700, 
              marginBottom: '1.5rem',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span>📋</span> Vendor Information
            </h2>

            <div className="user-form-grid">
              <div className="user-form-group">
                <label htmlFor="vendorCode">
                  Vendor Code <span style={{ color: '#fca5a5' }}>*</span>
                </label>
                <input
                  type="text"
                  id="vendorCode"
                  name="vendorCode"
                  value={formData.vendorCode}
                  onChange={handleChange}
                  placeholder="e.g., VEND001"
                  required
                />
              </div>

              <div className="user-form-group">
                <label htmlFor="vendorName">
                  Vendor Name <span style={{ color: '#fca5a5' }}>*</span>
                </label>
                <input
                  type="text"
                  id="vendorName"
                  name="vendorName"
                  value={formData.vendorName}
                  onChange={handleChange}
                  placeholder="Full company/vendor name"
                  required
                />
              </div>

              <div className="user-form-group">
                <label htmlFor="email">
                  Email Address <span style={{ color: '#fca5a5' }}>*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="vendor@example.com"
                  required
                />
              </div>

              <div className="user-form-group">
                <label htmlFor="phoneNumber">
                  Phone Number <span style={{ color: '#fca5a5' }}>*</span>
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="+62 123 4567 8900"
                  required
                />
              </div>

              <div className="user-form-group" style={{ gridColumn: '1 / -1' }}>
                <label htmlFor="address">
                  Address <span style={{ color: '#fca5a5' }}>*</span>
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Full business address"
                  rows={3}
                  required
                />
              </div>

              {user?.role === 'IT' ? (
                <div className="user-form-group">
                  <label htmlFor="divisionId">
                    Division <span style={{ color: '#fca5a5' }}>*</span>
                  </label>
                  <select
                    id="divisionId"
                    name="divisionId"
                    value={formData.divisionId}
                    onChange={handleChange}
                    required
                  >
                    <option value={0} disabled>Select Division</option>
                    {divisions.map(div => (
                      <option key={div.id} value={div.id}>
                        {div.divisionCode} - {div.divisionName}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="user-form-group">
                  <label>
                    Division
                  </label>
                  <div style={{
                    padding: '0.875rem 1rem',
                    background: 'rgba(99, 102, 241, 0.1)',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    borderRadius: '8px',
                    color: '#a5b4fc',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontWeight: 600
                  }}>
                    <span style={{ fontSize: '1.25rem' }}>🏢</span>
                    {userDivision ? (
                      <span>{userDivision.code} - {userDivision.name}</span>
                    ) : (
                      <span>Loading...</span>
                    )}
                  </div>
                </div>
              )}

              <div className="user-form-group">
                <label>
                  Required Approval Levels
                </label>
                <div style={{
                  padding: '0.875rem 1rem',
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '8px',
                  color: '#93c5fd',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span style={{ fontSize: '1.25rem' }}>ℹ️</span>
                  {maxApprovalLevels > 0 ? (
                    <span>
                      Akan melewati <strong>{maxApprovalLevels} level approval</strong> berurutan (Level 1 → Level {maxApprovalLevels})
                    </span>
                  ) : (
                    <span>Pilih divisi untuk melihat jumlah approval levels</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            justifyContent: 'flex-end',
            marginTop: '1.5rem'
          }}>
            <button
              type="button"
              onClick={handleReset}
              disabled={loading}
              className="user-btn-secondary"
            >
              🔄 Reset Form
            </button>
            <button
              type="submit"
              disabled={loading || !userDivision}
              className="user-btn-primary"
            >
              {loading ? '⏳ Creating...' : '✓ Create Vendor'}
            </button>
          </div>
        </form>

        <div className="user-card" style={{ marginTop: '2rem' }}>
          <h3 style={{ 
            fontSize: '1rem', 
            fontWeight: 700, 
            marginBottom: '1rem',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span>💡</span> Important Notes
          </h3>
          <ul style={{ 
            color: 'rgba(255, 255, 255, 0.8)', 
            fontSize: '0.875rem',
            lineHeight: '1.8',
            paddingLeft: '1.5rem'
          }}>
            <li>Vendor code must be unique</li>
            <li>Email address must be valid and unique</li>
            <li>Once created, vendor will be in DRAFT status</li>
            <li>You can submit for approval after verifying all information</li>
            <li>Approval akan berjalan berurutan sesuai level yang tersedia di divisi (Level 1 → Level 3)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
