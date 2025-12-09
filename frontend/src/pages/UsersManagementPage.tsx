import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService, UserDto, Role, DivisionDto } from '../services/authService'
import ActionButton from '../components/ActionButton'

export default function UsersManagementPage() {
  const navigate = useNavigate()
  const [users, setUsers] = useState<UserDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'regular' | 'approval' | 'it'>('regular')
  const [roles, setRoles] = useState<Role[]>([])
  const [divisions, setDivisions] = useState<DivisionDto[]>([])
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingUser, setEditingUser] = useState<UserDto | null>(null)
  const [validationErrors, setValidationErrors] = useState<{ fullName?: string; email?: string }>({})

  useEffect(() => {
    loadUsers()
    loadRoles()
    loadDivisions()
  }, [])

  const loadRoles = async () => {
    try {
      const r = await authService.getRoles()
      setRoles(r)
    } catch (err) {
      // silent
    }
  }

  const loadDivisions = async () => {
    try {
      const d = await authService.getDivisions()
      setDivisions(d)
    } catch (err) {
      // silent
    }
  }

  const loadUsers = async () => {
    try {
      setLoading(true)
      const data = await authService.getUsers()
      setUsers(data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const regularUsers = users.filter(u => u.roleName === 'User')
  const approvalUsers = users.filter(u => u.roleName === 'Manager')
  const itUsers = users.filter(u => u.roleName === 'IT')

  const getRoleBadgeColor = (roleName: string) => {
    switch (roleName) {
      case 'IT':
        return 'bg-purple-100 text-purple-800 border border-purple-200'
      case 'Manager':
        return 'bg-blue-100 text-blue-800 border border-blue-200'
      case 'User':
        return 'bg-green-100 text-green-800 border border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200'
    }
  }

  const getRoleIcon = (roleName: string) => {
    switch (roleName) {
      case 'IT':
        return '🔧'
      case 'Manager':
        return '👔'
      case 'User':
        return '👤'
      default:
        return '👥'
    }
  }

  const renderDivisionBadges = (user: UserDto) => {
    if (!user.userApprovals || user.userApprovals.length === 0) {
      return <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>—</span>
    }

    // show up to 3 badges
    const badges = user.userApprovals.slice(0, 3).map((ua, idx) => (
      <span key={idx} style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.35rem 0.6rem',
        borderRadius: '9999px',
        background: '#f1f5f9',
        border: '1px solid #e2e8f0',
        fontSize: '0.75rem',
        fontWeight: 600,
        color: '#0f172a'
      }}>
        {ua.divisionCode}
      </span>
    ))

    return (
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
        {badges}
        {user.userApprovals.length > 3 && (
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>+{user.userApprovals.length - 3}</span>
        )}
      </div>
    )
  }

  const openEdit = (user: UserDto) => {
    // clone to avoid mutating list directly
    const clone = JSON.parse(JSON.stringify(user)) as UserDto
    // ensure userApprovals exists
    clone.userApprovals = clone.userApprovals || []
    setEditingUser(clone)
    setShowEditModal(true)
  }

  const closeEdit = () => {
    setEditingUser(null)
    setShowEditModal(false)
  }

  const submitEdit = async () => {
    if (!editingUser) return

    // simple validation
    const errors: { fullName?: string; email?: string } = {}
    if (!editingUser.fullName || editingUser.fullName.trim().length === 0) {
      errors.fullName = 'Full name is required'
    }
    if (!editingUser.email || editingUser.email.trim().length === 0) {
      errors.email = 'Email is required'
    } else {
      // basic email regex
      const emailRe = /^\S+@\S+\.\S+$/
      if (!emailRe.test(editingUser.email)) {
        errors.email = 'Email tidak valid'
      }
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return
    }

    try {
      const payload: any = {
        fullName: editingUser.fullName,
        email: editingUser.email,
        roleId: editingUser.roleId,
        isActive: editingUser.isActive,
      }
      // include userApprovals for Manager/User/IT when present
      // include divisionCode/name as well so backend can reconcile changes
      if (editingUser.userApprovals && editingUser.userApprovals.length > 0) {
        payload.userApprovals = editingUser.userApprovals.map(ua => ({
          id: ua.id,
          divisionId: ua.divisionId,
          divisionCode: ua.divisionCode,
          divisionName: ua.divisionName,
          approvalLevel: ua.approvalLevel ?? 0,
          isActive: ua.isActive !== false
        }))
      } else {
        // explicitly send empty array to clear approvals if role changed to none
        payload.userApprovals = []
      }
      console.log('Sending update payload:', JSON.stringify(payload, null, 2))
      // if role is User but no approvals set, leave empty (backend may set)
      await authService.updateUser(editingUser.id, payload)
      await loadUsers()
      closeEdit()
      setValidationErrors({})
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update user')
    }
  }

  const onRoleChange = (newRoleId: number) => {
    if (!editingUser) return
    const newRole = roles.find(r => r.id === newRoleId)
    const clone = { ...editingUser, roleId: newRoleId }

    if (newRole?.roleName === 'IT') {
      // give full system access: all divisions with approvalLevel 0
      clone.userApprovals = divisions.map(d => ({ divisionId: d.id, divisionCode: d.divisionCode, divisionName: d.divisionName, approvalLevel: 0, isActive: true }))
    } else if (newRole?.roleName === 'User') {
      // keep only first division if exists, otherwise empty
      const first = (clone.userApprovals && clone.userApprovals[0]) ?? null
      clone.userApprovals = first ? [{ ...first, approvalLevel: 0, isActive: true }] : []
    } else if (newRole?.roleName === 'Manager') {
      // keep existing approvals or leave empty for manager to add
      clone.userApprovals = clone.userApprovals || []
    }

    setEditingUser(clone)
  }

  const toggleActive = async (user: UserDto) => {
    try {
      await authService.updateUser(user.id, { isActive: !user.isActive })
      await loadUsers()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal memperbarui status')
    }
  }

  if (loading) {
    return (
      <div className="main-content">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '400px' 
        }}>
          <div style={{ textAlign: 'center' }}>
            <div className="spinner" style={{ 
              width: '48px', 
              height: '48px', 
              margin: '0 auto 1rem' 
            }}></div>
            <p style={{ color: 'var(--text-secondary)' }}>Loading users...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="main-content">
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        marginBottom: '2rem',
        gap: '1rem'
      }}>
        <div>
          <h1 style={{ 
            fontSize: '1.875rem', 
            fontWeight: 700, 
            color: 'var(--text-primary)',
            marginBottom: '0.5rem'
          }}>
            User Management
          </h1>
          <p style={{ 
            color: 'var(--text-secondary)',
            fontSize: '0.875rem'
          }}>
            Manage all users and approval managers in the KYC system
          </p>
        </div>
        <button
          onClick={() => navigate('/dashboard/register-user')}
          aria-label="Register New User"
          style={{
            whiteSpace: 'nowrap',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.625rem 1rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            borderRadius: 8,
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.2)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)'
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.3)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(37, 99, 235, 0.2)'
          }}
        >
          <span style={{ fontSize: '1.125rem', lineHeight: 1, display: 'flex' }}>➕</span>
          <span>Register New User</span>
        </button>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {/* Tabs */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '2px solid var(--border-color)',
          padding: '0'
        }}>
          <button
            onClick={() => setActiveTab('regular')}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'regular' ? '3px solid #10b981' : '3px solid transparent',
              color: activeTab === 'regular' ? '#10b981' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.9375rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              marginBottom: '-2px'
            }}
          >
            <span style={{ marginRight: '0.5rem' }}>👤</span>
            Data Entry ({regularUsers.length})
          </button>
          <button
            onClick={() => setActiveTab('approval')}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'approval' ? '3px solid #3b82f6' : '3px solid transparent',
              color: activeTab === 'approval' ? '#3b82f6' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.9375rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              marginBottom: '-2px'
            }}
          >
            <span style={{ marginRight: '0.5rem' }}>✅</span>
            Approval Managers ({approvalUsers.length})
          </button>
          <button
            onClick={() => setActiveTab('it')}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'it' ? '3px solid #a855f7' : '3px solid transparent',
              color: activeTab === 'it' ? '#a855f7' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.9375rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              marginBottom: '-2px'
            }}
          >
            <span style={{ marginRight: '0.5rem' }}>⚙️</span>
            IT Admins ({itUsers.length})
          </button>
        </div>
      </div>

      {/* Regular Users Tab */}
      {activeTab === 'regular' && (
        <>
          {regularUsers.length === 0 ? (
            <div className="card" style={{ 
              textAlign: 'center', 
              padding: '3rem 2rem' 
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👤</div>
              <p style={{ 
                color: 'var(--text-secondary)',
                fontSize: '1rem'
              }}>
                No data entry users found
              </p>
            </div>
          ) : (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ 
                  width: '100%', 
                  borderCollapse: 'collapse',
                  fontSize: '0.875rem'
                }}>
                  <thead>
                      <tr style={{ 
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        color: 'white'
                      }}>
                        <th style={{ 
                          padding: '1rem 1.5rem', 
                          textAlign: 'left',
                          fontWeight: 600,
                          fontSize: '0.875rem'
                        }}>
                          Data Entry
                        </th>
                        <th style={{ 
                          padding: '1rem 1.5rem', 
                          textAlign: 'left',
                          fontWeight: 600,
                          fontSize: '0.875rem'
                        }}>
                          Email
                        </th>
                        <th style={{ 
                          padding: '1rem 1.5rem', 
                          textAlign: 'left',
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          width: '220px'
                        }}>
                          Division
                        </th>
                        <th style={{ 
                          padding: '1rem 1.5rem', 
                          textAlign: 'center',
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          width: '140px'
                        }}>
                          Role
                        </th>
                        <th style={{ 
                          padding: '1rem 1.5rem', 
                          textAlign: 'center',
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          width: '120px'
                        }}>
                          Status
                        </th>
                          <th style={{ 
                            padding: '1rem 1.5rem', 
                            textAlign: 'center',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            width: '160px'
                          }}>
                            Actions
                          </th>
                      </tr>
                  </thead>
                  <tbody>
                    {regularUsers.map((user, index) => (
                      <tr 
                        key={user.id}
                        style={{ 
                          borderBottom: index < regularUsers.length - 1 ? '1px solid var(--border-color)' : 'none',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f0fdf4'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '1rem 1.5rem' }}>
                          <div>
                            <div style={{ 
                              fontWeight: 600, 
                              color: 'var(--text-primary)',
                              marginBottom: '0.25rem'
                            }}>
                              {user.fullName}
                            </div>
                            <div style={{ 
                              color: 'var(--text-secondary)',
                              fontSize: '0.8125rem'
                            }}>
                              @{user.username}
                            </div>
                          </div>
                        </td>
                        <td style={{ 
                          padding: '1rem 1.5rem',
                          color: 'var(--text-primary)'
                        }}>
                          {user.email}
                        </td>
                        <td style={{ padding: '1rem 1.5rem', textAlign: 'left' }}>
                          {renderDivisionBadges(user)}
                        </td>
                        <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.375rem',
                            padding: '0.5rem 1rem',
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                            fontWeight: 600
                          }}
                          className={getRoleBadgeColor(user.roleName)}>
                            <span style={{ fontSize: '1.125rem' }}>{getRoleIcon(user.roleName)}</span>
                            <span>{user.roleName}</span>
                          </span>
                        </td>
                        <td style={{ 
                          padding: '1rem 1.5rem',
                          textAlign: 'center'
                        }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.4rem 0.85rem',
                            borderRadius: 9999,
                            fontSize: '0.875rem',
                            fontWeight: 700,
                            border: '1px solid',
                            background: user.isActive ? '#ecfdf5' : '#f3f4f6',
                            color: user.isActive ? '#065f46' : '#374151',
                            borderColor: user.isActive ? '#bbf7d0' : '#e5e7eb'
                          }}>
                            <span style={{ fontSize: '0.9rem' }}>{user.isActive ? '✓' : '✕'}</span>
                            <span>{user.isActive ? 'Active' : 'Inactive'}</span>
                          </span>
                        </td>
                        <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', alignItems: 'center' }}>
                            <ActionButton onClick={() => openEdit(user)} title={`Edit ${user.fullName}`} icon={<span style={{ fontSize: '0.95rem' }}>✏️</span>} label="Edit" />
                            <button
                              onClick={() => toggleActive(user)}
                              title={user.isActive ? 'Set Inactive' : 'Set Active'}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '0.35rem 0.7rem',
                                borderRadius: 8,
                                border: '1px solid',
                                background: user.isActive ? '#ecfdf5' : '#e5e7eb',
                                color: user.isActive ? '#065f46' : '#374151',
                                borderColor: user.isActive ? '#bbf7d0' : '#d1d5db',
                                fontWeight: 700,
                                fontSize: '0.875rem',
                                cursor: 'pointer'
                              }}
                            >
                              {user.isActive ? 'Active' : 'Inactive'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Approval Managers Tab */}
      {activeTab === 'approval' && (
        <>
          {approvalUsers.length === 0 ? (
            <div className="card" style={{ 
              textAlign: 'center', 
              padding: '3rem 2rem' 
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
              <p style={{ 
                color: 'var(--text-secondary)',
                fontSize: '1rem'
              }}>
                No approval managers found
              </p>
            </div>
          ) : (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ 
                  width: '100%', 
                  borderCollapse: 'collapse',
                  fontSize: '0.875rem'
                }}>
                  <thead>
                    <tr style={{ 
                      background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                      color: 'white'
                    }}>
                      <th style={{ 
                        padding: '1rem 1.5rem', 
                        textAlign: 'left',
                        fontWeight: 600,
                        fontSize: '0.875rem'
                      }}>
                        Manager
                      </th>
                      <th style={{ 
                        padding: '1rem 1.5rem', 
                        textAlign: 'left',
                        fontWeight: 600,
                        fontSize: '0.875rem'
                      }}>
                        Email
                      </th>
                      <th style={{ 
                        padding: '1rem 1.5rem', 
                        textAlign: 'left',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        width: '220px'
                      }}>
                        Division
                      </th>
                      <th style={{ 
                        padding: '1rem 1.5rem', 
                        textAlign: 'center',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        width: '200px'
                      }}>
                        Approval Access
                      </th>
                      <th style={{ 
                        padding: '1rem 1.5rem', 
                        textAlign: 'center',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        width: '120px'
                      }}>
                        Status
                      </th>
                      <th style={{ 
                        padding: '1rem 1.5rem', 
                        textAlign: 'center',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        width: '160px'
                      }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {approvalUsers.map((user, index) => (
                      <tr 
                        key={user.id}
                        style={{ 
                          borderBottom: index < approvalUsers.length - 1 ? '1px solid var(--border-color)' : 'none',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#eff6ff'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '1rem 1.5rem' }}>
                          <div>
                            <div style={{ 
                              fontWeight: 600, 
                              color: 'var(--text-primary)',
                              marginBottom: '0.25rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}>
                              <span style={{ fontSize: '1.25rem' }}>👔</span>
                              {user.fullName}
                            </div>
                            <div style={{ 
                              color: 'var(--text-secondary)',
                              fontSize: '0.8125rem'
                            }}>
                              @{user.username}
                            </div>
                          </div>
                        </td>
                        <td style={{ 
                          padding: '1rem 1.5rem',
                          color: 'var(--text-primary)'
                        }}>
                          {user.email}
                        </td>
                        <td style={{ padding: '1rem 1.5rem', textAlign: 'left' }}>
                          {renderDivisionBadges(user)}
                        </td>
                        <td style={{ 
                          padding: '1rem 1.5rem',
                          textAlign: 'center'
                        }}>
                          {user.userApprovals && user.userApprovals.length > 0 ? (
                            <div style={{ 
                              display: 'flex', 
                              flexWrap: 'wrap',
                              gap: '0.5rem',
                              justifyContent: 'center'
                            }}>
                              {user.userApprovals.map((ua, idx) => (
                                <span key={idx} style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.5rem',
                                  padding: '0.5rem 0.875rem',
                                  borderRadius: '8px',
                                  background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
                                  border: '1px solid #93c5fd',
                                  fontSize: '0.8125rem',
                                  fontWeight: 600,
                                  color: '#1e40af'
                                }}>
                                  <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                                    color: 'white',
                                    fontSize: '0.875rem',
                                    fontWeight: 700,
                                    boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)'
                                  }}>
                                    L{ua.approvalLevel}
                                  </span>
                                  <span>{ua.divisionCode}</span>
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span style={{ 
                              color: 'var(--text-secondary)',
                              fontSize: '0.875rem',
                              fontStyle: 'italic'
                            }}>
                              No approval access assigned
                            </span>
                          )}
                        </td>
                        <td style={{ 
                          padding: '1rem 1.5rem',
                          textAlign: 'center'
                        }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.375rem',
                            padding: '0.4rem 0.85rem',
                            borderRadius: 9999,
                            fontSize: '0.875rem',
                            fontWeight: 700,
                            border: '1px solid',
                            background: user.isActive ? '#ecfdf5' : '#f3f4f6',
                            color: user.isActive ? '#065f46' : '#374151',
                            borderColor: user.isActive ? '#bbf7d0' : '#e5e7eb'
                          }}>
                            <span style={{ fontSize: '0.9rem' }}>{user.isActive ? '✓' : '✕'}</span>
                            <span>{user.isActive ? 'Active' : 'Inactive'}</span>
                          </span>
                        </td>
                        <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', alignItems: 'center' }}>
                            <ActionButton onClick={() => openEdit(user)} title={`Edit ${user.fullName}`} icon={<span style={{ fontSize: '0.95rem' }}>✏️</span>} label="Edit" />
                            <button
                              onClick={() => toggleActive(user)}
                              title={user.isActive ? 'Set Inactive' : 'Set Active'}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '0.35rem 0.6rem',
                                borderRadius: 8,
                                border: '1px solid',
                                borderColor: user.isActive ? '#bbf7d0' : '#f1f5f9',
                                background: user.isActive ? '#ecfdf5' : '#fff',
                                color: user.isActive ? '#065f46' : '#334155',
                                fontWeight: 700,
                                fontSize: '0.875rem',
                                cursor: 'pointer'
                              }}
                            >
                              {user.isActive ? 'Active' : 'Inactive'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* IT Admins Tab */}
      {activeTab === 'it' && (
        <>
          {itUsers.length === 0 ? (
            <div className="card" style={{ 
              textAlign: 'center', 
              padding: '3rem 2rem' 
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚙️</div>
              <p style={{ 
                color: 'var(--text-secondary)',
                fontSize: '1rem'
              }}>
                No IT admins found
              </p>
            </div>
          ) : (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ 
                  width: '100%', 
                  borderCollapse: 'collapse',
                  fontSize: '0.875rem'
                }}>
                  <thead>
                    <tr style={{ 
                      background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
                      color: 'white'
                    }}>
                      <th style={{ 
                        padding: '1rem 1.5rem', 
                        textAlign: 'left',
                        fontWeight: 600,
                        fontSize: '0.875rem'
                      }}>
                        IT Admin
                      </th>
                      <th style={{ 
                        padding: '1rem 1.5rem', 
                        textAlign: 'left',
                        fontWeight: 600,
                        fontSize: '0.875rem'
                      }}>
                        Email
                      </th>
                      <th style={{ 
                        padding: '1rem 1.5rem', 
                        textAlign: 'left',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        width: '220px'
                      }}>
                        Division
                      </th>
                      <th style={{ 
                        padding: '1rem 1.5rem', 
                        textAlign: 'center',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        width: '180px'
                      }}>
                        Access Level
                      </th>
                      <th style={{ 
                        padding: '1rem 1.5rem', 
                        textAlign: 'center',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        width: '120px'
                      }}>
                        Status
                      </th>
                      <th style={{ 
                        padding: '1rem 1.5rem', 
                        textAlign: 'center',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        width: '160px'
                      }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {itUsers.map((user, index) => (
                      <tr 
                        key={user.id}
                        style={{ 
                          borderBottom: index < itUsers.length - 1 ? '1px solid var(--border-color)' : 'none',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#faf5ff'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '1rem 1.5rem' }}>
                          <div>
                            <div style={{ 
                              fontWeight: 600, 
                              color: 'var(--text-primary)',
                              marginBottom: '0.25rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}>
                              <span style={{ fontSize: '1.25rem' }}>🔧</span>
                              {user.fullName}
                            </div>
                            <div style={{ 
                              color: 'var(--text-secondary)',
                              fontSize: '0.8125rem'
                            }}>
                              @{user.username}
                            </div>
                          </div>
                        </td>
                        <td style={{ 
                          padding: '1rem 1.5rem',
                          color: 'var(--text-primary)'
                        }}>
                          {user.email}
                        </td>
                        <td style={{ padding: '1rem 1.5rem', textAlign: 'left' }}>
                          {renderDivisionBadges(user) }
                        </td>
                        <td style={{ 
                          padding: '1rem 1.5rem',
                          textAlign: 'center'
                        }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.625rem 1.25rem',
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, #fae8ff, #f3e8ff)',
                            border: '1px solid #d8b4fe',
                            fontSize: '0.875rem',
                            fontWeight: 700,
                            color: '#7c3aed'
                          }}>
                            <span style={{ fontSize: '1.125rem' }}>⭐</span>
                            <span>Full System Access</span>
                          </span>
                        </td>
                        <td style={{ 
                          padding: '1rem 1.5rem',
                          textAlign: 'center'
                        }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.375rem',
                            padding: '0.375rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.8125rem',
                            fontWeight: 600,
                            border: '1px solid'
                          }}
                          className={user.isActive 
                            ? 'bg-green-100 text-green-800 border-green-200' 
                            : 'bg-red-100 text-red-800 border-red-200'
                          }>
                            <span>{user.isActive ? '✓' : '✕'}</span>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', alignItems: 'center' }}>
                            <ActionButton onClick={() => openEdit(user)} title={`Edit ${user.fullName}`} icon={<span style={{ fontSize: '0.95rem' }}>✏️</span>} label="Edit" />
                            <button
                              onClick={() => toggleActive(user)}
                              title={user.isActive ? 'Set Inactive' : 'Set Active'}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '0.35rem 0.6rem',
                                borderRadius: 8,
                                border: '1px solid',
                                borderColor: user.isActive ? '#bbf7d0' : '#f1f5f9',
                                background: user.isActive ? '#ecfdf5' : '#fff',
                                color: user.isActive ? '#065f46' : '#334155',
                                fontWeight: 700,
                                fontSize: '0.875rem',
                                cursor: 'pointer'
                              }}
                            >
                              {user.isActive ? 'Active' : 'Inactive'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
      {/* Edit Modal */}
      {showEditModal && editingUser && (
        <div style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0,0,0,0.45)',
          zIndex: 60,
          padding: '2rem'
        }}>
          <div style={{ width: 720, background: '#fff', borderRadius: 12, padding: '1.25rem 1.5rem', boxShadow: '0 20px 50px rgba(2,6,23,0.35)', fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>Edit User</h3>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Update profile, role, and status for this user.</div>
              </div>
              <button onClick={closeEdit} aria-label="Close" style={{ background: 'transparent', border: 'none', fontSize: '1.25rem', lineHeight: 1, cursor: 'pointer', color: 'var(--text-secondary)' }}>✕</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Full Name</label>
                <input
                  value={editingUser.fullName}
                  onChange={(e) => { setEditingUser({ ...editingUser, fullName: e.target.value }); setValidationErrors(prev => ({ ...prev, fullName: undefined })) }}
                  style={{ padding: '0.6rem 0.8rem', borderRadius: 8, border: '1px solid #e6edf3', outline: 'none', fontSize: '0.95rem' }}
                />
                {validationErrors.fullName && (
                  <div style={{ color: '#b91c1c', fontSize: '0.8125rem', marginTop: '0.35rem' }}>{validationErrors.fullName}</div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Email</label>
                <input
                  value={editingUser.email}
                  onChange={(e) => { setEditingUser({ ...editingUser, email: e.target.value }); setValidationErrors(prev => ({ ...prev, email: undefined })) }}
                  style={{ padding: '0.6rem 0.8rem', borderRadius: 8, border: '1px solid #e6edf3', outline: 'none', fontSize: '0.95rem' }}
                />
                {validationErrors.email && (
                  <div style={{ color: '#b91c1c', fontSize: '0.8125rem', marginTop: '0.35rem' }}>{validationErrors.email}</div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Username</label>
                <input value={editingUser.username} disabled style={{ padding: '0.6rem 0.8rem', borderRadius: 8, border: '1px solid #f1f5f9', background: '#fafafa', color: 'var(--text-secondary)' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Role</label>
                <select value={editingUser.roleId} onChange={(e) => onRoleChange(Number(e.target.value))} style={{ padding: '0.55rem 0.7rem', borderRadius: 8, border: '1px solid #e6edf3' }}>
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>{r.roleName}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Status</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input type="radio" name="active" checked={editingUser.isActive} onChange={() => setEditingUser({ ...editingUser, isActive: true })} />
                    <span style={{ fontSize: '0.9rem' }}>Active</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input type="radio" name="active" checked={!editingUser.isActive} onChange={() => setEditingUser({ ...editingUser, isActive: false })} />
                    <span style={{ fontSize: '0.9rem' }}>Inactive</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Role-specific settings */}
            <div style={{ marginTop: '0.75rem' }}>
              {(() => {
                const selectedRole = roles.find(r => r.id === editingUser.roleId)
                const roleName = selectedRole?.roleName || ''
                if (roleName === 'User') {
                  return (
                    <div style={{ marginTop: '0.5rem' }}>
                      <label style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Division</label>
                      <select
                        value={editingUser.userApprovals && editingUser.userApprovals[0] ? editingUser.userApprovals[0].divisionId : ''}
                        onChange={(e) => {
                          const divId = Number(e.target.value)
                          const div = divisions.find(d => d.id === divId)
                          setEditingUser({
                            ...editingUser,
                            userApprovals: divId ? [{ divisionId: divId, divisionCode: div?.divisionCode, divisionName: div?.divisionName, approvalLevel: 0, isActive: true }] : []
                          })
                        }}
                        style={{ padding: '0.55rem 0.7rem', borderRadius: 8, border: '1px solid #e6edf3' }}
                      >
                        <option value="">-- Select Division --</option>
                        {divisions.map(d => (
                          <option key={d.id} value={d.id}>{d.divisionCode} — {d.divisionName}</option>
                        ))}
                      </select>
                    </div>
                  )
                }

                if (roleName === 'Manager') {
                  return (
                    <div style={{ marginTop: '0.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Approval Access</label>
                        <button onClick={() => {
                          // add empty approval row
                          const next = editingUser.userApprovals ? [...editingUser.userApprovals] : []
                          next.push({ divisionId: divisions[0]?.id || 0, divisionCode: divisions[0]?.divisionCode, divisionName: divisions[0]?.divisionName, approvalLevel: 1, isActive: true })
                          setEditingUser({ ...editingUser, userApprovals: next })
                        }} style={{ padding: '0.35rem 0.6rem', borderRadius: 6, border: '1px solid #d1fae5', background: '#ecfdf5', color: '#065f46', cursor: 'pointer' }}>+ Add</button>
                      </div>

                      <div style={{ display: 'grid', gap: '0.5rem' }}>
                        {(editingUser.userApprovals && editingUser.userApprovals.length > 0) ? editingUser.userApprovals.map((ua, idx) => (
                          <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <select value={ua.divisionId} onChange={(e) => {
                              const divId = Number(e.target.value)
                              const div = divisions.find(d => d.id === divId)
                              const next = [...(editingUser.userApprovals || [])]
                              next[idx] = { ...next[idx], divisionId: divId, divisionCode: div?.divisionCode, divisionName: div?.divisionName }
                              setEditingUser({ ...editingUser, userApprovals: next })
                            }} style={{ padding: '0.45rem 0.6rem', borderRadius: 8, border: '1px solid #e6edf3', minWidth: 220 }}>
                              {divisions.map(d => (
                                <option key={d.id} value={d.id}>{d.divisionCode} — {d.divisionName}</option>
                              ))}
                            </select>

                            <input type="number" min={1} value={ua.approvalLevel} onChange={(e) => {
                              const lvl = Number(e.target.value)
                              const next = [...(editingUser.userApprovals || [])]
                              next[idx] = { ...next[idx], approvalLevel: lvl }
                              setEditingUser({ ...editingUser, userApprovals: next })
                            }} style={{ width: 90, padding: '0.45rem 0.6rem', borderRadius: 8, border: '1px solid #e6edf3' }} />

                            <button onClick={() => {
                              const next = [...(editingUser.userApprovals || [])]
                              next.splice(idx, 1)
                              setEditingUser({ ...editingUser, userApprovals: next })
                            }} style={{ padding: '0.45rem 0.55rem', borderRadius: 8, border: '1px solid #f5c6cb', background: '#fff5f5', color: '#b91c1c', cursor: 'pointer' }}>Remove</button>
                          </div>
                        )) : (
                          <div style={{ color: 'var(--text-secondary)' }}>No approval entries. Click + Add to assign approvals to divisions.</div>
                        )}
                      </div>
                    </div>
                  )
                }

                // IT and others: show helper text
                return (
                  <div style={{ marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
                    {roleName === 'IT' ? 'Full system access (all divisions)' : 'No additional role-specific settings.'}
                  </div>
                )
              })()}
            </div>

            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={closeEdit} className="btn-ghost" style={{ padding: '0.6rem 1rem', borderRadius: 8, border: '1px solid #e6edf3', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>Cancel</button>
                <button onClick={submitEdit} disabled={!editingUser.fullName || !editingUser.email} className="btn-primary" style={{ padding: '0.6rem 1rem', borderRadius: 8, display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                  <span style={{ display: 'inline-block', width: 14, height: 14 }}>✅</span>
                  <span>Save changes</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
    </div>
  )
}
