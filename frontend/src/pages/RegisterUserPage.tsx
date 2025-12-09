import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService, RegisterUserRequest, Role, DivisionDto, UserApprovalDto } from '../services/authService'

export default function RegisterUserPage() {
  const navigate = useNavigate()
  const [roles, setRoles] = useState<Role[]>([])
  const [divisions, setDivisions] = useState<DivisionDto[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    roleId: 1,
  })

  const [userApprovals, setUserApprovals] = useState<UserApprovalDto[]>([])
  const [selectedDivision, setSelectedDivision] = useState<number>(0)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoadingData(true)
      const [rolesData, divisionsData] = await Promise.all([
        authService.getRoles(),
        authService.getDivisions()
      ])
      setRoles(rolesData)
      setDivisions(divisionsData)
    } catch (err: any) {
      console.error('Failed to load data:', err)
      setError('Failed to load roles and divisions')
    } finally {
      setLoadingData(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'roleId' ? parseInt(value) : value
    }))
  }

  const handleAddApproval = (divisionId: number, approvalLevel: number) => {
    // Check if already exists
    const existing = userApprovals.find(ua => ua.divisionId === divisionId && ua.approvalLevel === approvalLevel)
    if (existing) {
      setError('Approval level ini sudah ditambahkan untuk division ini')
      return
    }

    const division = divisions.find(d => d.id === divisionId)
    if (!division) return

    setUserApprovals([...userApprovals, {
      divisionId,
      divisionCode: division.divisionCode,
      divisionName: division.divisionName,
      approvalLevel,
      isActive: true
    }])
    setError('')
  }

  const handleRemoveApproval = (divisionId: number, approvalLevel: number) => {
    setUserApprovals(userApprovals.filter(ua => 
      !(ua.divisionId === divisionId && ua.approvalLevel === approvalLevel)
    ))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const selectedRole = roles.find(r => r.id === formData.roleId)
      
      let userApprovalsData: UserApprovalDto[] | undefined = undefined

      if (selectedRole?.roleName === 'Manager') {
        userApprovalsData = userApprovals
      } else if (selectedRole?.roleName === 'User' && selectedDivision > 0) {
        // For User role, create single approval entry with level 0 (data entry only)
        const division = divisions.find(d => d.id === selectedDivision)
        if (division) {
          userApprovalsData = [{
            divisionId: selectedDivision,
            divisionCode: division.divisionCode,
            divisionName: division.divisionName,
            approvalLevel: 0, // Level 0 indicates data entry role
            isActive: true
          }]
        }
      } else if (selectedRole?.roleName === 'IT') {
        // System Admin: grant access to all divisions (approvalLevel 0 indicates admin/full-access for creation)
        userApprovalsData = divisions.map(d => ({
          divisionId: d.id,
          divisionCode: d.divisionCode,
          divisionName: d.divisionName,
          approvalLevel: 0,
          isActive: true
        }))
      }

      const userData: RegisterUserRequest = {
        ...formData,
        userApprovals: userApprovalsData
      }
      
      await authService.register(userData)
      setSuccess(`User ${formData.fullName} berhasil didaftarkan!`)
      
      setFormData({
        username: '',
        email: '',
        password: '',
        fullName: '',
        roleId: 1,
      })
      setUserApprovals([])
      setSelectedDivision(0)

      setTimeout(() => {
        navigate('/dashboard/users')
      }, 2000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const selectedRole = roles.find(r => r.id === formData.roleId)
  const isManagerRole = selectedRole?.roleName === 'Manager'

  if (loadingData) {
    return (
      <div className="main-content">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <div style={{ textAlign: 'center' }}>
            <div className="spinner" style={{ width: '48px', height: '48px', margin: '0 auto 1rem' }}></div>
            <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="main-content">
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          background: 'white',
          padding: '1.5rem 2rem',
          borderRadius: '10px',
          marginBottom: '2rem',
          border: '1px solid var(--border)',
          borderLeft: '4px solid var(--primary-color)'
        }}>
          <button
            onClick={() => navigate('/dashboard/users')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary-color)',
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
            ← Back to Users
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <div style={{ 
              fontSize: '2rem',
              background: 'linear-gradient(135deg, var(--primary-color), var(--primary-hover))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              ➕
            </div>
            <h1 style={{ fontSize: '1.875rem', color: 'var(--text-primary)', fontWeight: 700 }}>
              Register New User
            </h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
            Create a new user account with role-based access control
          </p>
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
            fontSize: '0.875rem',
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
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderLeft: '4px solid #10b981',
            padding: '1rem 1.25rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            color: '#059669',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <span style={{ fontSize: '1.25rem' }}>✓</span>
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Basic Information Section */}
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
              <span style={{ fontSize: '1.25rem' }}>👤</span>
              Basic Information
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="form-group">
                <label htmlFor="fullName" style={{ 
                  fontSize: '0.875rem', 
                  fontWeight: 600, 
                  color: 'var(--text-primary)',
                  marginBottom: '0.5rem',
                  display: 'block'
                }}>
                  Full Name *
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="e.g. John Doe"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    fontSize: '0.9375rem',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    transition: 'all 0.2s'
                  }}
                />
              </div>

              <div className="form-group">
                <label htmlFor="username" style={{ 
                  fontSize: '0.875rem', 
                  fontWeight: 600, 
                  color: 'var(--text-primary)',
                  marginBottom: '0.5rem',
                  display: 'block'
                }}>
                  Username *
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="e.g. johndoe"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    fontSize: '0.9375rem',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    transition: 'all 0.2s'
                  }}
                />
                <small style={{ 
                  display: 'block', 
                  marginTop: '0.375rem', 
                  color: 'var(--text-secondary)', 
                  fontSize: '0.8125rem' 
                }}>
                  Used for login
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="email" style={{ 
                  fontSize: '0.875rem', 
                  fontWeight: 600, 
                  color: 'var(--text-primary)',
                  marginBottom: '0.5rem',
                  display: 'block'
                }}>
                  Email Address *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="e.g. john@example.com"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    fontSize: '0.9375rem',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    transition: 'all 0.2s'
                  }}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password" style={{ 
                  fontSize: '0.875rem', 
                  fontWeight: 600, 
                  color: 'var(--text-primary)',
                  marginBottom: '0.5rem',
                  display: 'block'
                }}>
                  Password *
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Minimum 6 characters"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    fontSize: '0.9375rem',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    transition: 'all 0.2s'
                  }}
                />
                <small style={{ 
                  display: 'block', 
                  marginTop: '0.375rem', 
                  color: 'var(--text-secondary)', 
                  fontSize: '0.8125rem' 
                }}>
                  Minimum 6 characters
                </small>
              </div>
            </div>
          </div>

          {/* Role Selection Section */}
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
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span style={{ fontSize: '1.25rem' }}>🔐</span>
              Role & Access Control
            </h2>
            <p style={{ 
              fontSize: '0.875rem', 
              color: 'var(--text-secondary)', 
              marginBottom: '1.5rem',
              lineHeight: 1.6
            }}>
              Select user role *
            </p>

            {/* Role Selection Cards */}
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1rem'
            }}>
              {roles.map(role => {
                const isSelected = formData.roleId === role.id
                const roleConfig = {
                  'User': { 
                    emoji: '🌱', 
                    color: '#10b981', 
                    bg: '#f0fdf4', 
                    border: '#10b981',
                    title: 'Data Entry',
                    desc: 'Create customer documents'
                  },
                  'Manager': { 
                    emoji: '⭐', 
                    color: '#3b82f6', 
                    bg: '#eff6ff', 
                    border: '#3b82f6',
                    title: 'Approval Manager',
                    desc: 'Approve customer workflows'
                  },
                  'IT': { 
                    emoji: '⚙️', 
                    color: '#a855f7', 
                    bg: '#faf5ff', 
                    border: '#a855f7',
                    title: 'System Admin',
                    desc: 'Full system access & SAP sync'
                  }
                }
                const config = roleConfig[role.roleName as keyof typeof roleConfig] || roleConfig['User']

                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, roleId: role.id }))}
                    disabled={loading}
                    style={{
                      padding: '1.25rem',
                      borderRadius: '10px',
                      background: isSelected ? config.bg : '#f8fafc',
                      border: isSelected ? `3px solid ${config.border}` : '2px solid var(--border)',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s',
                      textAlign: 'left',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      if (!loading && !isSelected) {
                        e.currentTarget.style.transform = 'translateY(-4px)'
                        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)'
                        e.currentTarget.style.borderColor = config.border
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = 'none'
                        e.currentTarget.style.borderColor = 'var(--border)'
                      }
                    }}
                  >
                    {isSelected && (
                      <div style={{
                        position: 'absolute',
                        top: '0.5rem',
                        right: '0.5rem',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: config.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '0.75rem',
                        fontWeight: 700
                      }}>
                        ✓
                      </div>
                    )}
                    <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{config.emoji}</div>
                    <div style={{ 
                      fontWeight: 700, 
                      fontSize: '0.9375rem', 
                      color: isSelected ? config.color : 'var(--text-primary)',
                      marginBottom: '0.5rem',
                      transition: 'color 0.2s'
                    }}>
                      {config.title}
                    </div>
                    <div style={{ 
                      fontSize: '0.8125rem', 
                      color: 'var(--text-secondary)',
                      lineHeight: 1.5
                    }}>
                      {config.desc}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Division Selection - Only for User Role */}
          {selectedRole?.roleName === 'User' && (
            <div style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '10px',
              marginBottom: '1.5rem',
              border: '2px solid #10b981',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)'
            }}>
              <h2 style={{ 
                fontSize: '1.125rem', 
                fontWeight: 700, 
                color: '#10b981', 
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span style={{ fontSize: '1.25rem' }}>🏢</span>
                Division Assignment
              </h2>
              <p style={{ 
                fontSize: '0.875rem', 
                color: 'var(--text-secondary)', 
                marginBottom: '1.5rem',
                lineHeight: 1.6
              }}>
                Select which division this user will work in. They will only be able to create customers for their assigned division.
              </p>

              <div className="form-group">
                <label htmlFor="userDivision" style={{ 
                  fontSize: '0.875rem', 
                  fontWeight: 600, 
                  color: 'var(--text-primary)',
                  marginBottom: '0.5rem',
                  display: 'block'
                }}>
                  Select Division *
                </label>
                <select 
                  id="userDivision"
                  value={selectedDivision}
                  onChange={(e) => setSelectedDivision(parseInt(e.target.value))}
                  required
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    fontSize: '0.9375rem',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    background: 'white',
                    cursor: 'pointer'
                  }}
                >
                  <option value={0}>Select Division</option>
                  {divisions.map(div => (
                    <option key={div.id} value={div.id}>
                      {div.divisionCode} - {div.divisionName}
                    </option>
                  ))}
                </select>
              </div>

              {selectedDivision > 0 && (
                <div style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
                  borderRadius: '8px',
                  border: '1px solid #6ee7b7',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  <span style={{ fontSize: '1.25rem' }}>✓</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#047857' }}>
                      Division Selected
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#059669' }}>
                      User will create customers in: {divisions.find(d => d.id === selectedDivision)?.divisionName}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Approval Levels Section - Only for Manager */}
          {isManagerRole && (
            <div style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '10px',
              marginBottom: '1.5rem',
              border: '2px solid #3b82f6',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)'
            }}>
              <h2 style={{ 
                fontSize: '1.125rem', 
                fontWeight: 700, 
                color: '#3b82f6', 
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span style={{ fontSize: '1.25rem' }}>✅</span>
                Approval Configuration
              </h2>
              <p style={{ 
                fontSize: '0.875rem', 
                color: 'var(--text-secondary)', 
                marginBottom: '1.5rem',
                lineHeight: 1.6
              }}>
                Configure which divisions and approval levels this manager can access. 
                For example: Level 1 for FOOD division, Level 2 for FEED division.
              </p>

              {/* Approval List */}
              {userApprovals.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <strong style={{ 
                    fontSize: '0.875rem', 
                    display: 'block', 
                    marginBottom: '0.75rem',
                    color: 'var(--text-primary)'
                  }}>
                    Configured Approvals ({userApprovals.length}):
                  </strong>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                    {userApprovals.map((ua, index) => (
                      <div key={index} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '1rem',
                        background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
                        borderRadius: '8px',
                        border: '1px solid #93c5fd'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                            color: 'white',
                            fontSize: '0.875rem',
                            fontWeight: 700,
                            boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)'
                          }}>
                            L{ua.approvalLevel}
                          </span>
                          <div>
                            <div style={{ 
                              fontSize: '0.875rem', 
                              fontWeight: 700, 
                              color: '#1e40af' 
                            }}>
                              {ua.divisionCode}
                            </div>
                            <div style={{ 
                              fontSize: '0.75rem', 
                              color: '#3b82f6' 
                            }}>
                              {ua.divisionName}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveApproval(ua.divisionId, ua.approvalLevel)}
                          style={{
                            padding: '0.375rem 0.75rem',
                            fontSize: '0.75rem',
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: 600,
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#dc2626'}
                          onMouseLeave={(e) => e.currentTarget.style.background = '#ef4444'}
                        >
                          ✕ Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Approval Form */}
              <div style={{ 
                padding: '1.5rem',
                background: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid var(--border)'
              }}>
                <strong style={{ 
                  fontSize: '0.875rem', 
                  display: 'block', 
                  marginBottom: '1rem',
                  color: 'var(--text-primary)'
                }}>
                  Add New Approval Access:
                </strong>
                <ApprovalLevelSelector
                  divisions={divisions}
                  onAdd={handleAddApproval}
                />
              </div>
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
            <button 
              type="submit" 
              disabled={loading || (selectedRole?.roleName === 'User' && selectedDivision === 0)} 
              style={{
                flex: 1,
                padding: '0.875rem 2rem',
                fontSize: '0.9375rem',
                fontWeight: 700,
                background: loading ? '#e2e8f0' : 'linear-gradient(135deg, #2563eb, #1e40af)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: loading ? 'none' : '0 4px 12px rgba(37, 99, 235, 0.3)'
              }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              {loading ? (
                <>
                  <span className="spinner" style={{ width: '16px', height: '16px' }}></span>
                  Registering...
                </>
              ) : (
                <>
                  <span>✓</span>
                  Register User
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard/users')}
              disabled={loading}
              style={{
                flex: 1,
                padding: '0.875rem 2rem',
                fontSize: '0.9375rem',
                fontWeight: 700,
                background: 'white',
                color: 'var(--text-secondary)',
                border: '2px solid var(--border)',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.background = '#f8fafc')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Approval Level Selector Component
function ApprovalLevelSelector({ 
  divisions, 
  onAdd 
}: { 
  divisions: DivisionDto[]
  onAdd: (divisionId: number, approvalLevel: number) => void
}) {
  const [selectedDivision, setSelectedDivision] = useState<number>(0)
  const [selectedLevel, setSelectedLevel] = useState<number>(1)

  const handleAdd = () => {
    if (selectedDivision === 0) return
    onAdd(selectedDivision, selectedLevel)
    setSelectedDivision(0)
    setSelectedLevel(1)
  }

  return (
    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
      <div style={{ flex: 1 }}>
        <label style={{ 
          fontSize: '0.8125rem', 
          fontWeight: 600,
          display: 'block', 
          marginBottom: '0.5rem',
          color: 'var(--text-primary)'
        }}>
          Division
        </label>
        <select 
          value={selectedDivision}
          onChange={(e) => setSelectedDivision(parseInt(e.target.value))}
          style={{ 
            width: '100%', 
            padding: '0.75rem 1rem', 
            fontSize: '0.875rem',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            background: 'white',
            cursor: 'pointer'
          }}
        >
          <option value={0}>Select Division</option>
          {divisions.map(div => (
            <option key={div.id} value={div.id}>
              {div.divisionCode} - {div.divisionName}
            </option>
          ))}
        </select>
      </div>
      <div style={{ flex: 1 }}>
        <label style={{ 
          fontSize: '0.8125rem', 
          fontWeight: 600,
          display: 'block', 
          marginBottom: '0.5rem',
          color: 'var(--text-primary)'
        }}>
          Approval Level
        </label>
        <select
          value={selectedLevel}
          onChange={(e) => setSelectedLevel(parseInt(e.target.value))}
          style={{ 
            width: '100%', 
            padding: '0.75rem 1rem', 
            fontSize: '0.875rem',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            background: 'white',
            cursor: 'pointer'
          }}
        >
          {[1, 2, 3, 4, 5].map(level => (
            <option key={level} value={level}>Level {level}</option>
          ))}
        </select>
      </div>
      <button
        type="button"
        onClick={handleAdd}
        disabled={selectedDivision === 0}
        style={{
          padding: '0.75rem 1.5rem',
          fontSize: '0.875rem',
          fontWeight: 700,
          background: selectedDivision === 0 ? 'var(--border)' : 'linear-gradient(135deg, #3b82f6, #2563eb)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: selectedDivision === 0 ? 'not-allowed' : 'pointer',
          opacity: selectedDivision === 0 ? 0.5 : 1,
          transition: 'all 0.2s',
          whiteSpace: 'nowrap'
        }}
        onMouseEnter={(e) => selectedDivision !== 0 && (e.currentTarget.style.transform = 'translateY(-1px)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
      >
        + Add
      </button>
    </div>
  )
}
