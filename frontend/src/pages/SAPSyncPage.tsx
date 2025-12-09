import { useState, useEffect } from 'react'
import { approvalService } from '../services/approvalService'
import '../styles/modern.css'

interface CustomerForSAP {
  id: number
  customerCode: string
  customerName: string
  email: string
  phoneNumber: string
  address: string
  kycStatus: string
  submittedBy?: string
  approvedByLevel1?: string
  approvedAtLevel1?: string
  approvedByLevel2?: string
  approvedAtLevel2?: string
  approvedByLevel3?: string
  approvedAtLevel3?: string
}

export default function SAPSyncPage() {
  const [customers, setCustomers] = useState<CustomerForSAP[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState<number | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerForSAP | null>(null)

  useEffect(() => {
    loadCustomers()
  }, [])

  const loadCustomers = async () => {
    try {
      setLoading(true)
      const data = await approvalService.getReadyForSAP()
      setCustomers(data)
    } catch (error) {
      console.error('Failed to load customers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSyncClick = (customer: CustomerForSAP) => {
    setSelectedCustomer(customer)
    setShowConfirm(true)
  }

  const handleConfirmSync = async () => {
    if (!selectedCustomer) return

    try {
      setSyncing(selectedCustomer.id)
      await approvalService.syncToSAP(selectedCustomer.id)
      
      // Show success message
      alert('✓ Customer berhasil di-sync ke SAP B1!')
      
      // Reload customers
      await loadCustomers()
      setShowConfirm(false)
      setSelectedCustomer(null)
    } catch (error: any) {
      console.error('Failed to sync:', error)
      alert(error.response?.data?.message || 'Gagal sync ke SAP')
    } finally {
      setSyncing(null)
    }
  }

  return (
    <div className="main-content">
      <div style={{ 
        padding: '2rem',
        background: 'var(--background)',
        minHeight: '100vh'
      }}>
        {/* Header */}
        <div style={{
          background: 'var(--surface)',
          padding: '1.5rem 2rem',
          borderRadius: '10px',
          marginBottom: '2rem',
          border: '1px solid var(--border)',
          borderLeft: '4px solid #a855f7'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <div style={{ 
              fontSize: '2rem',
              background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              🔄
            </div>
            <h1 style={{ fontSize: '1.875rem', color: '#a855f7', fontWeight: 700 }}>
              SAP B1 Sync
            </h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
            Sync approved customers to SAP Business One
          </p>
        </div>

        {loading ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '4rem',
            background: 'white',
            borderRadius: '10px',
            border: '1px solid var(--border)'
          }}>
            <div style={{ 
              width: '50px', 
              height: '50px', 
              border: '4px solid var(--border)',
              borderTop: '4px solid #a855f7',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto'
            }}></div>
            <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading customers...</p>
          </div>
        ) : customers.length === 0 ? (
          <div style={{
            background: 'var(--surface)',
            padding: '3rem',
            borderRadius: '10px',
            textAlign: 'center',
            border: '1px solid var(--border)'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.3 }}>📋</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              No Customers Ready
            </h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              All approved customers have been synced to SAP
            </p>
          </div>
        ) : (
          <div style={{
            background: 'var(--surface)',
            borderRadius: '10px',
            overflow: 'hidden',
            border: '1px solid var(--border)'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ 
                  background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
                  color: 'white'
                }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, fontSize: '0.875rem' }}>
                    Customer Code
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, fontSize: '0.875rem' }}>
                    Customer Name
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, fontSize: '0.875rem' }}>
                    Email
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, fontSize: '0.875rem' }}>
                    Phone
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, fontSize: '0.875rem' }}>
                    Approved By
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, fontSize: '0.875rem' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer, index) => (
                  <tr 
                    key={customer.id}
                    style={{ 
                      borderBottom: '1px solid var(--border)',
                      background: index % 2 === 0 ? 'var(--surface)' : 'var(--surface-light)',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = index % 2 === 0 ? 'var(--surface)' : 'var(--surface-light)'}
                  >
                    <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {customer.customerCode}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-primary)' }}>
                      {customer.customerName}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      {customer.email}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      {customer.phoneNumber}
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        {customer.approvedByLevel1 && (
                          <div style={{ color: 'var(--text-secondary)' }}>
                            L1: {customer.approvedByLevel1}
                          </div>
                        )}
                        {customer.approvedByLevel2 && (
                          <div style={{ color: 'var(--text-secondary)' }}>
                            L2: {customer.approvedByLevel2}
                          </div>
                        )}
                        {customer.approvedByLevel3 && (
                          <div style={{ color: 'var(--text-secondary)' }}>
                            L3: {customer.approvedByLevel3}
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <button
                        onClick={() => handleSyncClick(customer)}
                        disabled={syncing !== null}
                        style={{
                          padding: '0.5rem 1rem',
                          background: syncing === customer.id 
                            ? 'var(--surface-light)' 
                            : 'linear-gradient(135deg, #a855f7, #7c3aed)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          cursor: syncing !== null ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s',
                          opacity: syncing !== null && syncing !== customer.id ? 0.5 : 1
                        }}
                        onMouseEnter={(e) => {
                          if (syncing === null) {
                            e.currentTarget.style.transform = 'translateY(-1px)'
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(168, 85, 247, 0.4)'
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)'
                          e.currentTarget.style.boxShadow = 'none'
                        }}
                      >
                        {syncing === customer.id ? '⏳ Syncing...' : '🔄 Sync to SAP'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Confirmation Modal */}
        {showConfirm && selectedCustomer && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}>
            <div style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '12px',
              maxWidth: '500px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            }}>
              <h2 style={{ 
                fontSize: '1.5rem', 
                marginBottom: '1rem', 
                color: 'var(--text-primary)',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span>⚠️</span> Confirm SAP Sync
              </h2>
              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
                  Are you sure you want to sync this customer to SAP B1?
                </p>
                <div style={{
                  background: 'var(--surface-light)',
                  padding: '1rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border)'
                }}>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <strong style={{ color: 'var(--text-primary)' }}>Customer Code:</strong>
                    <span style={{ marginLeft: '0.5rem', color: 'var(--text-secondary)' }}>
                      {selectedCustomer.customerCode}
                    </span>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text-primary)' }}>Customer Name:</strong>
                    <span style={{ marginLeft: '0.5rem', color: 'var(--text-secondary)' }}>
                      {selectedCustomer.customerName}
                    </span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    setShowConfirm(false)
                    setSelectedCustomer(null)
                  }}
                  disabled={syncing !== null}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'white',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '0.9375rem',
                    fontWeight: 600,
                    cursor: syncing !== null ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmSync}
                  disabled={syncing !== null}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.9375rem',
                    fontWeight: 600,
                    cursor: syncing !== null ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {syncing !== null ? '⏳ Syncing...' : '✓ Confirm Sync'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
