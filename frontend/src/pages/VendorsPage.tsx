import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { vendorService, Vendor } from '../services/vendorService'
import '../styles/modern.css'

export default function VendorsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'draft' | 'in_progress' | 'completed' | 'rejected' | 'synced'>('draft')

  useEffect(() => {
    if (user?.role === 'Manager') {
      setActiveTab('in_progress')
    }
  }, [user])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const status = params.get('status')?.toUpperCase()
    if (!status) return

    switch (status) {
      case 'READY_FOR_SAP':
        setActiveTab('completed')
        break
      case 'SYNCED_TO_SAP':
        setActiveTab('synced')
        break
      case 'SUBMITTED':
        setActiveTab('in_progress')
        break
      case 'DRAFT':
        if (user?.role === 'Manager') setActiveTab('in_progress')
        else setActiveTab('draft')
        break
      case 'REJECTED':
        setActiveTab('rejected')
        break
      default:
        break
    }
  }, [location.search, user])

  useEffect(() => {
    loadVendors()
  }, [])

  const loadVendors = async () => {
    try {
      setLoading(true)
      const data = await vendorService.getAll()
      setVendors(data)
    } catch (error) {
      console.error('Failed to load vendors:', error)
    } finally {
      setLoading(false)
    }
  }

  const draftVendors = vendors.filter(c => c.kycStatus === 'DRAFT')
  const inProgressVendors = vendors.filter(c => ['SUBMITTED', 'APPROVED_L1', 'APPROVED_L2', 'APPROVED_L3'].includes(c.kycStatus))
  const completedVendors = vendors.filter(c => ['READY_FOR_SAP'].includes(c.kycStatus))
  const syncedVendors = vendors.filter(c => c.kycStatus === 'SYNCED_TO_SAP')
  const rejectedVendors = vendors.filter(c => c.kycStatus === 'REJECTED')

  const getFiltered = () => {
    switch (activeTab) {
      case 'draft':
        return draftVendors
      case 'in_progress':
        return inProgressVendors
      case 'completed':
        return completedVendors
      case 'synced':
        return syncedVendors
      case 'rejected':
        return rejectedVendors
      default:
        return vendors
    }
  }

  const filtered = getFiltered()

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this vendor?')) return
    try {
      await vendorService.delete(id)
      loadVendors()
    } catch (err) {
      console.error('Failed to delete vendor:', err)
      alert('Failed to delete vendor')
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'SUBMITTED':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'APPROVED_L1':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'APPROVED_L2':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200'
      case 'APPROVED_L3':
      case 'READY_FOR_SAP':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'SYNCED_TO_SAP':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="main-content">
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Vendor Management
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              View and manage all vendor KYC records
            </p>
          </div>
          {(user?.role === 'User' || user?.role === 'IT') && (
            <button
              onClick={() => navigate('/vendors/create')}
              style={{
                padding: '0.875rem 1.5rem',
                fontSize: '0.9375rem',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.3s',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.5)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)'
              }}
            >
              <span style={{ fontSize: '1.25rem' }}>➕</span>
              Create Vendor
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '2px solid var(--border-color)',
          padding: '0'
        }}>
          {user?.role !== 'Manager' && (
            <button
              onClick={() => setActiveTab('draft')}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'draft' ? '3px solid #9ca3af' : '3px solid transparent',
                color: activeTab === 'draft' ? '#374151' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.9375rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                marginBottom: '-2px'
              }}
            >
              <span style={{ marginRight: '0.5rem' }}>📝</span>
              Draft ({draftVendors.length})
            </button>
          )}
          <button
            onClick={() => setActiveTab('in_progress')}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'in_progress' ? '3px solid #f59e0b' : '3px solid transparent',
              color: activeTab === 'in_progress' ? '#f59e0b' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.9375rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              marginBottom: '-2px'
            }}
          >
            <span style={{ marginRight: '0.5rem' }}>⏳</span>
            In Progress ({inProgressVendors.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'completed' ? '3px solid #10b981' : '3px solid transparent',
              color: activeTab === 'completed' ? '#10b981' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.9375rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              marginBottom: '-2px'
            }}
          >
            <span style={{ marginRight: '0.5rem' }}>✅</span>
            Completed ({completedVendors.length})
          </button>
          <button
            onClick={() => setActiveTab('synced')}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'synced' ? '3px solid #7c3aed' : '3px solid transparent',
              color: activeTab === 'synced' ? '#7c3aed' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.9375rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              marginBottom: '-2px'
            }}
          >
            <span style={{ marginRight: '0.5rem' }}>🔄</span>
            Synced ({syncedVendors.length})
          </button>
          <button
            onClick={() => setActiveTab('rejected')}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'rejected' ? '3px solid #ef4444' : '3px solid transparent',
              color: activeTab === 'rejected' ? '#ef4444' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.9375rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              marginBottom: '-2px'
            }}
          >
            <span style={{ marginRight: '0.5rem' }}>❌</span>
            Rejected ({rejectedVendors.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
          <div className="spinner" style={{ width: '48px', height: '48px', margin: '0 auto 1rem' }}></div>
          <p style={{ color: 'var(--text-secondary)' }}>Loading vendors...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.5 }}>📋</div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            No Vendors in {activeTab.replace('_', ' ').toUpperCase()}
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            {activeTab === 'draft' && (user?.role === 'User' || user?.role === 'IT')
              ? 'Get started by creating your first vendor' 
              : `No vendors with ${activeTab.replace('_', ' ')} status`}
          </p>
          {activeTab === 'draft' && (user?.role === 'User' || user?.role === 'IT') && (
            <button
              onClick={() => navigate('/vendors/create')}
              style={{
                padding: '0.875rem 2rem',
                fontSize: '0.9375rem',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.3s',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              ➕ Create First Vendor
            </button>
          )}
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--surface-light)', borderBottom: '2px solid var(--border-color)' }}>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
                    Vendor
                  </th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
                    Contact
                  </th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'center', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
                    Status
                  </th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
                    Created By
                  </th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'center', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
                    Created
                  </th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'center', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((vendor, index) => (
                  <tr
                    key={vendor.id}
                    style={{
                      borderBottom: index < filtered.length - 1 ? '1px solid var(--border-color)' : 'none',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'var(--surface)'}
                  >
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                          {vendor.vendorName}
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                          {vendor.vendorCode}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ fontSize: '0.875rem' }}>
                        <div>{vendor.email}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                          {vendor.phoneNumber}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '0.375rem 0.75rem',
                        borderRadius: '6px',
                        border: '1px solid',
                        fontSize: '0.75rem',
                        fontWeight: 600
                      }}
                      className={getStatusBadgeColor(vendor.kycStatus)}>
                        {vendor.kycStatus.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ fontSize: '0.875rem' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {vendor.createdByName ?? '-'}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      {new Date(vendor.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <button
                          onClick={() => navigate(`/vendors/${vendor.id}`)}
                          style={{
                            padding: '0.5rem 1rem',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                          👁️ View
                        </button>
                        {(user?.role === 'User' || user?.role === 'IT') && vendor.kycStatus === 'DRAFT' && (
                          <button
                            onClick={() => navigate(`/vendors/${vendor.id}/edit`)}
                            style={{
                              padding: '0.5rem 1rem',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              background: 'linear-gradient(135deg, #10b981, #059669)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                          >
                            ✏️ Edit
                          </button>
                        )}
                        {(user?.role === 'User' || user?.role === 'IT') && (vendor.kycStatus === 'DRAFT' || vendor.kycStatus === 'REJECTED') && (
                          <button
                            onClick={() => handleDelete(vendor.id)}
                            style={{
                              padding: '0.5rem 1rem',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              background: 'transparent',
                              color: '#ef4444',
                              border: '1px solid #ef4444',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#ef4444'
                              e.currentTarget.style.color = 'white'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent'
                              e.currentTarget.style.color = '#ef4444'
                            }}
                          >
                            🗑️ Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
