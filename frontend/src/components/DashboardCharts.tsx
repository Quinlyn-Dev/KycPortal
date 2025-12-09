import { useState } from 'react'
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface DashboardChartsProps {
  statusData: Array<{ name: string; value: number; color: string }>
  trendData: Array<{ month: string; Approved: number; Pending: number; Rejected: number }>
  userStatusData?: Array<{ name: string; created: number; approved: number; pending: number; rejected: number }>
  approvalStatusData?: Array<{ level: string; approved: number; pending: number; rejected: number; managers?: string[] }>
  recentActivity?: Array<{ id: string; title: string; time: string; status?: string; kycStatus?: string }>
}

export function DashboardCharts({ statusData, trendData, userStatusData, approvalStatusData, recentActivity }: DashboardChartsProps) {
  const [modalOpen, setModalOpen] = useState(false)
  // User Status Data - use prop if provided, otherwise empty
  const displayUserStatusData = userStatusData ?? []
  const displayApprovalStatusData = approvalStatusData ?? []
  // Display full recentActivity array; UI will show 6 in-place and full list in modal
  const displayedActivity = (recentActivity ?? []).slice(0, 6)

  const getStatusColor = (status: string | undefined) => {
    if (!status) return '#6b7280'
    const s = status.toLowerCase()
    if (s.includes('ready') || s.includes('synced') || s.includes('approved')) return '#065f46'
    if (s.includes('pending') || s.includes('submitted')) return '#92400e'
    if (s.includes('rejected')) return '#991b1b'
    return '#1d4ed8'
  }

  const getStatusBg = (status: string | undefined) => {
    if (!status) return '#f3f4f6'
    const s = status.toLowerCase()
    if (s.includes('ready') || s.includes('synced') || s.includes('approved')) return '#ecfdf5'
    if (s.includes('pending') || s.includes('submitted')) return '#fff7ed'
    if (s.includes('rejected')) return '#fff1f2'
    return '#eff6ff'
  }

  const renderStatusBadge = (status?: string) => {
    const label = status ? String(status) : '—'
    const color = getStatusColor(status)
    const bg = getStatusBg(status)
    return (
      <span style={{
        display: 'inline-block',
        padding: '0.25rem 0.6rem',
        borderRadius: '9999px',
        backgroundColor: bg,
        color,
        fontWeight: 700,
        fontSize: '0.78rem',
        textTransform: 'capitalize',
        border: `1px solid ${bg === '#f3f4f6' ? 'transparent' : bg}`
      }}>{label}</span>
    )
  }

  return (
    <>
      {/* Section 2: Monthly Trends */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* Trend Dokumen - Line Chart */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ 
            fontSize: '1.125rem', 
            fontWeight: 700, 
            marginBottom: '1.5rem',
            color: '#3b82f6'
          }}>
            📈 Monthly Trends
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="month" 
                stroke="#6b7280"
                style={{ fontSize: '0.75rem' }}
              />
              <YAxis 
                stroke="#6b7280"
                style={{ fontSize: '0.75rem' }}
              />
              <Tooltip 
                contentStyle={{ 
                  background: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '0.875rem'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '0.875rem' }} />
              <Line 
                type="monotone" 
                dataKey="Approved" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ fill: '#10b981', r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="Pending" 
                stroke="#f59e0b" 
                strokeWidth={3}
                dot={{ fill: '#f59e0b', r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="Rejected" 
                stroke="#ef4444" 
                strokeWidth={3}
                dot={{ fill: '#ef4444', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Section 1: Status & User Activity */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* Status Dokumen - Donut Chart */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ 
            fontSize: '1.125rem', 
            fontWeight: 700, 
            marginBottom: '1.5rem',
            color: '#3b82f6'
          }}>
            📊 Status Dokumen
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '1.5rem',
            marginTop: '1rem',
            flexWrap: 'wrap'
          }}>
            {statusData.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ 
                  width: '12px', 
                  height: '12px', 
                  borderRadius: '3px',
                  background: item.color 
                }}></div>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity - Table */}
        <div className="card" style={{ padding: '1rem', gridColumn: 'span 1' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <h3 style={{ 
              fontSize: '1rem', 
              fontWeight: 700, 
              margin: 0,
              color: 'var(--primary-color)'
            }}>
              📝 Recent Activity
            </h3>
            <button onClick={() => setModalOpen(true)} style={{
              background: 'transparent',
              border: '1px solid var(--border)',
              padding: '0.35rem 0.75rem',
              borderRadius: '6px',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              fontWeight: 600
            }}>Show more</button>
          </div>
          {displayedActivity && displayedActivity.length > 0 ? (
            <div style={{ border: '1px solid var(--border)', borderRadius: '8px', backgroundColor: 'var(--surface-light)' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.8rem'
              }}>
                <thead style={{ backgroundColor: 'var(--surface-light)' }}>
                  <tr style={{ borderBottom: '2px solid var(--border)' }}>
                    <th style={{ padding: '0.5rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Activity</th>
                    <th style={{ padding: '0.5rem', textAlign: 'center', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Status</th>
                    <th style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedActivity.map((activity: any, idx: number) => {
                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--surface)' }}>
                        <td style={{ padding: '0.5rem', color: 'var(--text-primary)', fontWeight: 500, fontSize: '0.8rem' }}>{activity.title}</td>
                        <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                          {renderStatusBadge(activity.status)}
                        </td>
                        <td style={{ padding: '0.5rem', textAlign: 'right', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{activity.time}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ 
              padding: '2rem', 
              textAlign: 'center', 
              color: 'var(--text-secondary)' 
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem', opacity: 0.5 }}>📭</div>
              <p>No recent activity</p>
            </div>
          )}
          {/* Modal: full recent activity */}
          {modalOpen && (
            <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60 }} onClick={() => setModalOpen(false)}>
              <div role="dialog" aria-modal="true" style={{ width: '90%', maxWidth: '900px', background: 'var(--surface)', borderRadius: 10, padding: '1rem', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>📝 Recent Activity — All</h3>
                  <button onClick={() => setModalOpen(false)} style={{ background: 'transparent', border: 'none', fontSize: '1rem', cursor: 'pointer', color: 'var(--text-primary)' }}>✕</button>
                </div>
                <div style={{ maxHeight: '70vh', overflowY: 'auto', borderTop: '1px solid var(--border)', paddingTop: '0.5rem' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead style={{ position: 'sticky', top: 0, backgroundColor: 'var(--surface)', zIndex: 12 }}>
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 700, color: 'var(--text-primary)' }}>Activity</th>
                        <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 700, color: 'var(--text-primary)' }}>Status</th>
                        <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 700, color: 'var(--text-primary)' }}>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(recentActivity ?? []).map((activity: any, idx: number) => {
                        return (
                          <tr key={idx} style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--surface)' }}>
                            <td style={{ padding: '0.75rem', color: 'var(--text-primary)', fontWeight: 500 }}>{activity.title}</td>
                            <td style={{ padding: '0.75rem', textAlign: 'center' }}>{renderStatusBadge(activity.status)}</td>
                            <td style={{ padding: '0.75rem', textAlign: 'right', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{activity.time}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Section 3: Approval Status Details */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <h3 style={{ 
          fontSize: '1.125rem', 
          fontWeight: 700, 
          marginBottom: '1.5rem',
          color: 'var(--primary-color)'
        }}>
          ✓ Approval Status Details
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: 'var(--surface-light)' }}>
              <tr>
                <th style={{ 
                  padding: '0.875rem', 
                  textAlign: 'left',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  borderBottom: '1px solid var(--border)'
                }}>
                  Approval Level
                </th>
                <th style={{ 
                  padding: '0.875rem', 
                  textAlign: 'left',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  borderBottom: '1px solid var(--border)'
                }}>
                  Manager(s)
                </th>
                <th style={{ 
                  padding: '0.875rem', 
                  textAlign: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  borderBottom: '1px solid var(--border)'
                }}>
                  Approved
                </th>
                <th style={{ 
                  padding: '0.875rem', 
                  textAlign: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  borderBottom: '1px solid var(--border)'
                }}>
                  Pending
                </th>
                <th style={{ 
                  padding: '0.875rem', 
                  textAlign: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  borderBottom: '1px solid var(--border)'
                }}>
                  Rejected
                </th>
                <th style={{ 
                  padding: '0.875rem', 
                  textAlign: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  borderBottom: '1px solid var(--border)'
                }}>
                  Approval Rate
                </th>
              </tr>
            </thead>
            <tbody>
              {displayApprovalStatusData.map((approval, idx) => {
                const total = approval.approved + approval.pending + approval.rejected
                const rate = total > 0 ? Math.round((approval.approved / total) * 100) : 0
                return (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 600 }}>
                      {approval.level}
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                      {approval.managers && approval.managers.length > 0 ? (
                        <div>
                          {approval.managers.map((manager, midx) => (
                            <div key={midx} style={{ marginBottom: midx < approval.managers!.length - 1 ? '0.25rem' : '0' }}>
                              • {manager}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span style={{ color: '#d1d5db' }}>-</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.75rem',
                        background: 'rgba(16, 185, 129, 0.1)',
                        color: '#10b981',
                        borderRadius: '4px',
                        fontWeight: 600
                      }}>
                        {approval.approved}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.75rem',
                        background: 'rgba(245, 158, 11, 0.1)',
                        color: '#f59e0b',
                        borderRadius: '4px',
                        fontWeight: 600
                      }}>
                        {approval.pending}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.75rem',
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        borderRadius: '4px',
                        fontWeight: 600
                      }}>
                        {approval.rejected}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem' }}>
                      <div style={{ 
                        background: 'rgba(0,0,0,0.05)',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        height: '6px',
                        marginBottom: '0.25rem'
                      }}>
                        <div style={{ 
                          background: rate > 80 ? '#10b981' : rate > 60 ? '#f59e0b' : '#ef4444',
                          height: '100%',
                          width: `${rate}%`,
                          transition: 'width 0.3s'
                        }}></div>
                      </div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                        {rate}%
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 5: User Status Details */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <h3 style={{ 
          fontSize: '1.125rem', 
          fontWeight: 700, 
          marginBottom: '1.5rem',
            color: 'var(--primary-color)'
        }}>
          👤 User Status Details
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: 'var(--surface-light)' }}>
              <tr>
                <th style={{ 
                  padding: '0.875rem', 
                  textAlign: 'left',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  borderBottom: '1px solid var(--border)'
                }}>
                  User
                </th>
                <th style={{ 
                  padding: '0.875rem', 
                  textAlign: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  borderBottom: '1px solid var(--border)'
                }}>
                  Total Created
                </th>
                <th style={{ 
                  padding: '0.875rem', 
                  textAlign: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  borderBottom: '1px solid var(--border)'
                }}>
                  Approved
                </th>
                <th style={{ 
                  padding: '0.875rem', 
                  textAlign: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  borderBottom: '1px solid var(--border)'
                }}>
                  Pending
                </th>
                <th style={{ 
                  padding: '0.875rem', 
                  textAlign: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  borderBottom: '1px solid var(--border)'
                }}>
                  Rejected
                </th>
                <th style={{ 
                  padding: '0.875rem', 
                  textAlign: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  borderBottom: '1px solid var(--border)'
                }}>
                  Approval Rate
                </th>
              </tr>
            </thead>
            <tbody>
              {displayUserStatusData.map((user, idx) => {
                const rate = Math.round((user.approved / user.created) * 100)
                return (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 600 }}>
                      {user.name}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem' }}>
                      {user.created}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.75rem',
                        background: 'rgba(16, 185, 129, 0.1)',
                        color: '#10b981',
                        borderRadius: '4px',
                        fontWeight: 600
                      }}>
                        {user.approved}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.75rem',
                        background: 'rgba(245, 158, 11, 0.1)',
                        color: '#f59e0b',
                        borderRadius: '4px',
                        fontWeight: 600
                      }}>
                        {user.pending}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.75rem',
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        borderRadius: '4px',
                        fontWeight: 600
                      }}>
                        {user.rejected}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem' }}>
                      <div style={{ 
                        background: 'rgba(0,0,0,0.05)',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        height: '6px',
                        marginBottom: '0.25rem'
                      }}>
                        <div style={{ 
                          background: rate > 80 ? '#10b981' : rate > 60 ? '#f59e0b' : '#ef4444',
                          height: '100%',
                          width: `${rate}%`,
                          transition: 'width 0.3s'
                        }}></div>
                      </div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                        {rate}%
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
