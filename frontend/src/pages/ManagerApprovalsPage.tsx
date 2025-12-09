import { useState, useEffect } from 'react'
import { approvalService, CustomerDto } from '../services/approvalService'
import { authService, DivisionDto } from '../services/authService'
import { useToast } from '../context/ToastContext'

export default function ManagerApprovalsPage() {
  const [customers, setCustomers] = useState<CustomerDto[]>([])
  const [divisions, setDivisions] = useState<DivisionDto[]>([])
  const [selectedDivision, setSelectedDivision] = useState<number | undefined>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { push } = useToast()
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDto | null>(null)
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null)
  const [comments, setComments] = useState('')
  const [reason, setReason] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    if (divisions.length > 0) {
      loadCustomers()
    }
  }, [selectedDivision])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      const divisionsData = await authService.getDivisions()
      setDivisions(divisionsData)
      await loadCustomers()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const loadCustomers = async () => {
    try {
      setError('')
      const data = await approvalService.getPendingApprovals(selectedDivision)
      setCustomers(data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load customers')
    }
  }

  const handleApprove = async () => {
    if (!selectedCustomer) return

    try {
      setProcessing(true)
      setError('')
      console.log('[Approve] calling approve for id', selectedCustomer.id)
      const resp = await approvalService.approveCustomer(selectedCustomer.id, { comments })
      console.log('[Approve] api returned', resp)
      try {
        console.log('[Approve] about to push success toast')
        push({ type: 'success', message: 'Customer berhasil disetujui' })
      } catch (e) {
        console.error('[Approve] push failed', e)
      }
      setSelectedCustomer(null)
      setComments('')
      setActionType(null)
      await loadCustomers()
    } catch (err: any) {
      console.error('[Approve] error', err)
      const msg = err?.response?.data?.message || err?.message || 'Failed to approve customer'
      setError(msg)
      try {
        push({ type: 'error', message: msg })
      } catch {
        // ignore if toast not available
      }
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!selectedCustomer || !reason.trim()) {
      setError('Reason is required for rejection')
      return
    }

    try {
      setProcessing(true)
      setError('')
      console.log('[Reject] calling reject for id', selectedCustomer.id)
      const rresp = await approvalService.rejectCustomer(selectedCustomer.id, { reason })
      console.log('[Reject] api returned', rresp)
      try {
        console.log('[Reject] about to push success toast')
        push({ type: 'success', message: 'Customer berhasil ditolak' })
      } catch (e) {
        console.error('[Reject] push failed', e)
      }
      setSelectedCustomer(null)
      setReason('')
      setActionType(null)
      await loadCustomers()
    } catch (err: any) {
      console.error('[Reject] error', err)
      const msg = err?.response?.data?.message || err?.message || 'Failed to reject customer'
      setError(msg)
      try {
        push({ type: 'error', message: msg })
      } catch {
        // ignore
      }
    } finally {
      setProcessing(false)
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'APPROVED_L1':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'APPROVED_L2':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200'
      case 'APPROVED_L3':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'READY_FOR_SAP':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="main-content">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <div style={{ textAlign: 'center' }}>
            <div className="spinner" style={{ width: '48px', height: '48px', margin: '0 auto 1rem' }}></div>
            <p style={{ color: 'var(--text-secondary)' }}>Loading approvals...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="main-content">
      <div className="manager-container">
        <div className="manager-header">
          <div className="manager-icon">✅</div>
          <div className="manager-title">
            <h1>Approval Management</h1>
            <p>Review and process customer KYC submissions at your approval level</p>
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
            backdropFilter: 'blur(10px)'
          }}>
            {error}
          </div>
        )}

        {/* Division Filter */}
        <div className="manager-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <label style={{ fontWeight: 700, color: 'white', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Filter Division:
            </label>
            <select
              value={selectedDivision || ''}
              onChange={(e) => setSelectedDivision(e.target.value ? parseInt(e.target.value) : undefined)}
              style={{
                padding: '0.625rem 1.25rem',
                borderRadius: '8px',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                background: 'rgba(255, 255, 255, 0.15)',
                color: 'white',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <option value="" style={{ background: '#1e293b', color: 'white' }}>All Divisions</option>
              {divisions.map(div => (
                <option key={div.id} value={div.id} style={{ background: '#1e293b', color: 'white' }}>
                  {div.divisionCode} - {div.divisionName}
                </option>
              ))}
            </select>
            <div style={{ 
              marginLeft: 'auto', 
              padding: '0.5rem 1rem',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: 600
            }}>
              📋 {customers.length} Pending
            </div>
          </div>
        </div>

        {/* Customers Table */}
        {customers.length === 0 ? (
          <div className="manager-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.8 }}>✓</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: 'white' }}>
              All Clear!
            </h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '1rem' }}>
              No pending approvals at this time
            </p>
          </div>
        ) : (
          <div className="manager-table">
            <table>
              <thead>
                <tr>
                  <th>Customer Information</th>
                  <th>Division</th>
                  <th>Contact Details</th>
                  <th style={{ textAlign: 'center' }}>Current Status</th>
                  <th style={{ textAlign: 'center' }}>Your Level</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <td>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem', color: '#1f2937' }}>
                          {customer.customerName}
                        </div>
                        <div style={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: 500 }}>
                          {customer.customerCode}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-block',
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
                        color: 'white',
                        fontSize: '0.8125rem',
                        fontWeight: 700,
                        letterSpacing: '0.05em'
                      }}>
                        {customer.divisionCode}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.875rem' }}>
                        <div style={{ marginBottom: '0.25rem', fontWeight: 500 }}>{customer.email}</div>
                        <div style={{ color: '#6b7280' }}>{customer.phoneNumber}</div>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '0.5rem 0.875rem',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}
                      className={getStatusBadgeColor(customer.kycStatus)}>
                        {customer.kycStatus.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                        color: 'white',
                        fontSize: '1rem',
                        fontWeight: 900,
                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
                      }}>
                        {customer.currentApprovalLevel}
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.625rem', justifyContent: 'center' }}>
                        <button
                          onClick={() => {
                            setSelectedCustomer(customer)
                            setActionType('approve')
                            setError('')
                          }}
                          className="manager-btn-approve"
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCustomer(customer)
                            setActionType('reject')
                            setError('')
                          }}
                          className="manager-btn-reject"
                        >
                          ✕ Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Approval/Reject Modal */}
      {selectedCustomer && actionType && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{ 
              fontSize: '1.75rem', 
              fontWeight: 800, 
              marginBottom: '1.5rem',
              color: actionType === 'approve' ? 'var(--success-color)' : 'var(--error-color)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              {actionType === 'approve' ? '✓ Approve Customer' : '✕ Reject Customer'}
            </h2>
            
            <div style={{ 
              marginBottom: '1.5rem', 
              padding: '1.5rem', 
              background: 'var(--surface-light)', 
              borderRadius: '10px',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '1.125rem' }}>
                {selectedCustomer.customerName}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <span>📝 {selectedCustomer.customerCode}</span>
                <span>📊 {selectedCustomer.divisionCode}</span>
                <span>📧 {selectedCustomer.email}</span>
              </div>
            </div>

            {actionType === 'approve' ? (
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.75rem', 
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--text-primary)'
                }}>
                  Comments (Optional)
                </label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Add any notes or comments about this approval..."
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    border: '2px solid var(--border-color)',
                    borderRadius: '8px',
                    fontSize: '0.9375rem',
                    resize: 'vertical',
                    background: 'var(--background)',
                    color: 'var(--text-primary)',
                    transition: 'all 0.3s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--success-color)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                />
              </div>
            ) : (
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.75rem', 
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--text-primary)'
                }}>
                  Rejection Reason <span style={{ color: 'var(--error-color)' }}>*</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Please provide a detailed reason for rejection..."
                  rows={4}
                  required
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    border: '2px solid var(--border-color)',
                    borderRadius: '8px',
                    fontSize: '0.9375rem',
                    resize: 'vertical',
                    background: 'var(--background)',
                    color: 'var(--text-primary)',
                    transition: 'all 0.3s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--error-color)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                />
                {!reason.trim() && (
                  <p style={{ marginTop: '0.5rem', fontSize: '0.8125rem', color: 'var(--error-color)' }}>
                    Reason is required for rejection
                  </p>
                )}
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={actionType === 'approve' ? handleApprove : handleReject}
                disabled={processing || (actionType === 'reject' && !reason.trim())}
                style={{
                  flex: 1,
                  padding: '0.875rem 1.5rem',
                  fontSize: '0.9375rem',
                  fontWeight: 700,
                  background: actionType === 'approve' 
                    ? 'linear-gradient(135deg, #10b981, #059669)' 
                    : 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: processing || (actionType === 'reject' && !reason.trim()) ? 'not-allowed' : 'pointer',
                  opacity: processing || (actionType === 'reject' && !reason.trim()) ? 0.5 : 1,
                  transition: 'all 0.3s',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  boxShadow: actionType === 'approve'
                    ? '0 4px 12px rgba(16, 185, 129, 0.4)'
                    : '0 4px 12px rgba(239, 68, 68, 0.4)'
                }}
                onMouseEnter={(e) => {
                  if (!processing && !(actionType === 'reject' && !reason.trim())) {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                {processing ? '⏳ Processing...' : actionType === 'approve' ? '✓ Confirm Approval' : '✕ Confirm Rejection'}
              </button>
              <button
                onClick={() => {
                  setSelectedCustomer(null)
                  setActionType(null)
                  setComments('')
                  setReason('')
                  setError('')
                }}
                disabled={processing}
                style={{
                  flex: 1,
                  padding: '0.875rem 1.5rem',
                  fontSize: '0.9375rem',
                  fontWeight: 700,
                  background: 'var(--surface-light)',
                  color: 'var(--text-primary)',
                  border: '2px solid var(--border-color)',
                  borderRadius: '10px',
                  cursor: processing ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
                onMouseEnter={(e) => {
                  if (!processing) {
                    e.currentTarget.style.background = 'var(--surface)'
                    e.currentTarget.style.borderColor = 'var(--text-secondary)'
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--surface-light)'
                  e.currentTarget.style.borderColor = 'var(--border-color)'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
