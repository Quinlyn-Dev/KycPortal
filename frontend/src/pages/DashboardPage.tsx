import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { customerService } from '../services/customerService'
import { apiClient } from '../services/api'
import { DashboardCharts } from '../components/DashboardCharts'
import '../styles/modern.css'

interface DashboardStats {
  totalCustomers: number
  pendingKYC: number
  approvedKYC: number
  syncedToSAP: number
}

function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    pendingKYC: 0,
    approvedKYC: 0,
    syncedToSAP: 0
  })
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [userStatusData, setUserStatusData] = useState<any[]>([])
  const [approvalStatusData, setApprovalStatusData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      // If user is IT, call admin stats endpoint (requires IT role)
      if (user?.role === 'IT') {
        const resp = await apiClient.get('/admin/dashboard/stats')
        const data = resp.data

        const totalCustomers = data?.customers?.total ?? 0
        const pendingKYC = data?.customers?.pendingApproval ?? 0
        const approvedKYC = data?.customers?.readyForSAP ?? 0
        const syncedToSAP = data?.customers?.syncedToSAP ?? 0

        setStats({
          totalCustomers,
          pendingKYC,
          approvedKYC,
          syncedToSAP
        })

        // recent activity: best-effort sample
        try {
          const customers = await customerService.getAll()
          // Sort by createdAt newest first, then limit to 5, and map to activity
          const activity = customers
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map((customer, index) => {
              let statusDisplay = customer.kycStatus
              // Map KYC status to readable format
              if (customer.kycStatus === 'DRAFT') statusDisplay = 'Draft'
              else if (customer.kycStatus === 'SUBMITTED') statusDisplay = 'Submitted'
              else if (customer.kycStatus === 'APPROVED_L1') statusDisplay = 'Approval 1'
              else if (customer.kycStatus === 'APPROVED_L2') statusDisplay = 'Approval 2'
              else if (customer.kycStatus === 'APPROVED_L3') statusDisplay = 'Approval 3'
              else if (customer.kycStatus === 'READY_FOR_SAP') statusDisplay = 'Ready for SAP'
              else if (customer.kycStatus === 'SYNCED_TO_SAP') statusDisplay = 'Synced to SAP'
              else if (customer.kycStatus === 'REJECTED') statusDisplay = 'Rejected'
              
              return {
                id: index,
                title: `Customer ${customer.customerName}`,
                time: new Date(customer.createdAt).toLocaleDateString(),
                type: 'customer',
                status: statusDisplay,
                kycStatus: customer.kycStatus
              }
            })
          setRecentActivity(activity)
        } catch (e) {
          setRecentActivity([])
        }
      } else {
        // Non-IT users: fetch customers visible to the user and compute aggregates client-side
        const customers = await customerService.getAll()

        const totalCustomers = customers.length
        const pendingKYC = customers.filter(c => ['SUBMITTED', 'APPROVED_L1', 'APPROVED_L2'].includes(c.kycStatus)).length
        const approvedKYC = customers.filter(c => c.kycStatus === 'READY_FOR_SAP').length
        const syncedToSAP = customers.filter(c => c.kycStatus === 'SYNCED_TO_SAP').length

        setStats({
          totalCustomers,
          pendingKYC,
          approvedKYC,
          syncedToSAP
        })

        const activity = customers
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .map((customer, index) => {
            let statusDisplay = customer.kycStatus
            // Map KYC status to readable format
            if (customer.kycStatus === 'DRAFT') statusDisplay = 'Draft'
            else if (customer.kycStatus === 'SUBMITTED') statusDisplay = 'Submitted'
            else if (customer.kycStatus === 'APPROVED_L1') statusDisplay = 'Approval 1'
            else if (customer.kycStatus === 'APPROVED_L2') statusDisplay = 'Approval 2'
            else if (customer.kycStatus === 'APPROVED_L3') statusDisplay = 'Approval 3'
            else if (customer.kycStatus === 'READY_FOR_SAP') statusDisplay = 'Ready for SAP'
            else if (customer.kycStatus === 'SYNCED_TO_SAP') statusDisplay = 'Synced to SAP'
            else if (customer.kycStatus === 'REJECTED') statusDisplay = 'Rejected'
            
            return {
              id: index,
              title: `Customer ${customer.customerName}`,
              time: new Date(customer.createdAt).toLocaleDateString(),
              type: 'customer',
              status: statusDisplay,
              kycStatus: customer.kycStatus
            }
          })
        setRecentActivity(activity)
      }

      // Fetch user statistics
      try {
        const customers = await customerService.getAll()
        
        // Group customers by CreatedBy (user ID) to calculate stats
        const userStatsMap = new Map<number, { name: string; created: number; approved: number; pending: number; rejected: number }>()
        
        customers.forEach(customer => {
          if (customer.createdBy) {
            if (!userStatsMap.has(customer.createdBy)) {
              userStatsMap.set(customer.createdBy, {
                name: customer.createdByName || `User ${customer.createdBy}`,
                created: 0,
                approved: 0,
                pending: 0,
                rejected: 0
              })
            }
            
            const userStats = userStatsMap.get(customer.createdBy)!
            userStats.created++
            
            if (customer.kycStatus === 'READY_FOR_SAP' || customer.kycStatus === 'SYNCED_TO_SAP') {
              userStats.approved++
            } else if (['SUBMITTED', 'APPROVED_L1', 'APPROVED_L2'].includes(customer.kycStatus)) {
              userStats.pending++
            } else if (customer.kycStatus === 'REJECTED') {
              userStats.rejected++
            }
          }
        })
        
        const userStatusArray = Array.from(userStatsMap.values()).sort((a, b) => b.created - a.created)
        setUserStatusData(userStatusArray)

        // Calculate approval status by level based on KYC status progression
        const approvalStats = [
          { level: 'Level 1 (Manager 1)', approved: 0, pending: 0, rejected: 0, managers: new Set<string>() },
          { level: 'Level 2 (Manager 2)', approved: 0, pending: 0, rejected: 0, managers: new Set<string>() },
          { level: 'Level 3 (Manager 3)', approved: 0, pending: 0, rejected: 0, managers: new Set<string>() }
        ]

        customers.forEach(customer => {
          // Based on KYC status progression
          if (customer.kycStatus === 'REJECTED') {
            // Rejected at any level
            if (customer.rejectedByName) {
              // Assume rejected at current level (could be L1, L2, or L3)
              approvalStats[0].rejected++
              approvalStats[0].managers.add(customer.rejectedByName)
            }
          } else if (customer.kycStatus === 'SUBMITTED') {
            // Pending L1
            approvalStats[0].pending++
          } else if (customer.kycStatus === 'APPROVED_L1') {
            // Approved L1, Pending L2
            approvalStats[0].approved++
            if (customer.approvedByLevel1Name) {
              approvalStats[0].managers.add(customer.approvedByLevel1Name)
            }
            approvalStats[1].pending++
          } else if (customer.kycStatus === 'APPROVED_L2') {
            // Approved L1 and L2, Pending L3
            approvalStats[0].approved++
            if (customer.approvedByLevel1Name) {
              approvalStats[0].managers.add(customer.approvedByLevel1Name)
            }
            approvalStats[1].approved++
            if (customer.approvedByLevel2Name) {
              approvalStats[1].managers.add(customer.approvedByLevel2Name)
            }
            approvalStats[2].pending++
          } else if (customer.kycStatus === 'READY_FOR_SAP' || customer.kycStatus === 'SYNCED_TO_SAP') {
            // Approved all levels
            approvalStats[0].approved++
            if (customer.approvedByLevel1Name) {
              approvalStats[0].managers.add(customer.approvedByLevel1Name)
            }
            approvalStats[1].approved++
            if (customer.approvedByLevel2Name) {
              approvalStats[1].managers.add(customer.approvedByLevel2Name)
            }
            approvalStats[2].approved++
            if (customer.approvedByLevel3Name) {
              approvalStats[2].managers.add(customer.approvedByLevel3Name)
            }
          }
        })

        // Convert sets to arrays and create the final data structure
        const approvalStatusWithManagers = approvalStats.map(stat => ({
          level: stat.level,
          approved: stat.approved,
          pending: stat.pending,
          rejected: stat.rejected,
          managers: Array.from(stat.managers)
        }))

        setApprovalStatusData(approvalStatusWithManagers)
      } catch (e) {
        console.error('Failed to load user statistics:', e)
        setUserStatusData([])
        setApprovalStatusData([])
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  

  // Chart data
  const statusData = [
    { name: 'Approved', value: stats.approvedKYC + stats.syncedToSAP, color: '#10b981' },
    { name: 'Pending', value: stats.pendingKYC, color: '#f59e0b' },
    { name: 'Rejected', value: Math.max(0, stats.totalCustomers - stats.approvedKYC - stats.syncedToSAP - stats.pendingKYC), color: '#ef4444' }
  ]

  const trendData = [
    { month: 'Jan', Approved: 5, Pending: 3, Rejected: 1 },
    { month: 'Feb', Approved: 8, Pending: 5, Rejected: 2 },
    { month: 'Mar', Approved: 15, Pending: 4, Rejected: 3 },
    { month: 'Apr', Approved: 12, Pending: 6, Rejected: 2 },
    { month: 'May', Approved: 20, Pending: 8, Rejected: 4 },
    { month: 'Jun', Approved: 25, Pending: 10, Rejected: 5 },
    { month: 'Jul', Approved: 30, Pending: 7, Rejected: 3 },
    { month: 'Aug', Approved: 35, Pending: 9, Rejected: 4 },
    { month: 'Sep', Approved: 32, Pending: 12, Rejected: 6 },
    { month: 'Oct', Approved: 40, Pending: 8, Rejected: 3 },
    { month: 'Nov', Approved: 38, Pending: 10, Rejected: 5 },
    { month: 'Dec', Approved: 45, Pending: 11, Rejected: 4 }
  ]

  return (
    <div className="main-content">
      {/* Hero Section with Role-Based Styling */}
      <div style={{
        background: user?.role === 'User' 
          ? 'linear-gradient(135deg, #065f46 0%, #047857 100%)'
          : user?.role === 'Manager'
          ? 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)'
          : 'linear-gradient(135deg, #581c87 0%, #6b21a8 100%)',
        borderRadius: '16px',
        padding: '2.5rem',
        marginBottom: '2rem',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
          pointerEvents: 'none'
        }}></div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 900, 
            color: 'white', 
            marginBottom: '0.75rem',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
          }}>
            {user?.role === 'User' && '🌱 Welcome to Your Workspace'}
            {user?.role === 'Manager' && '⭐ Approval Dashboard'}
            {user?.role === 'IT' && '⚙️ System Administration'}
          </h1>
          <p style={{ 
            color: 'rgba(255, 255, 255, 0.9)', 
            fontSize: '1.125rem',
            maxWidth: '600px'
          }}>
            {user?.role === 'User' && `Hello ${user?.name}! Manage your customer KYC submissions here.`}
            {user?.role === 'Manager' && `Hello ${user?.name}! Review and approve pending KYC requests.`}
            {user?.role === 'IT' && `Hello ${user?.name}! Monitor system health and manage users.`}
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <div className="spinner" style={{ width: '50px', height: '50px', borderWidth: '5px' }}></div>
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading dashboard...</p>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="stats-grid">
            <div
              className="stat-card"
              onClick={() => navigate('/customers')}
              style={{
              background: user?.role === 'User' 
                ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.05))'
                : user?.role === 'Manager'
                ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05))'
                : 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(124, 58, 237, 0.05))',
              borderColor: user?.role === 'User'
                ? 'rgba(16, 185, 129, 0.3)'
                : user?.role === 'Manager'
                ? 'rgba(59, 130, 246, 0.3)'
                : 'rgba(168, 85, 247, 0.3)'
            }}>
              <div className="stat-header">
                <div>
                  <div className="stat-title">Total Customers</div>
                  <div className="stat-value">{stats.totalCustomers}</div>
                  <div className="stat-change positive">
                    📈 Active Records
                  </div>
                </div>
                <div className="stat-icon primary" style={{
                  background: user?.role === 'User'
                    ? 'linear-gradient(135deg, #10b981, #059669)'
                    : user?.role === 'Manager'
                    ? 'linear-gradient(135deg, #3b82f6, #2563eb)'
                    : 'linear-gradient(135deg, #a855f7, #7c3aed)'
                }}>
                  👥
                </div>
              </div>
            </div>

            <div
              className="stat-card"
              onClick={() => user?.role === 'Manager' ? navigate('/dashboard/approvals') : navigate('/customers?status=SUBMITTED')}
              style={{ cursor: 'pointer' }}
            >
              <div className="stat-header">
                <div>
                  <div className="stat-title">Pending KYC</div>
                  <div className="stat-value">{stats.pendingKYC}</div>
                  <div className="stat-change warning">
                    ⏳ Awaiting Review
                  </div>
                </div>
                <div className="stat-icon warning">
                  ⏰
                </div>
              </div>
            </div>

            <div
              className="stat-card"
              onClick={() => navigate('/customers?status=READY_FOR_SAP')}
              style={{ cursor: 'pointer' }}
            >
              <div className="stat-header">
                <div>
                  <div className="stat-title">Approved</div>
                  <div className="stat-value">{stats.approvedKYC}</div>
                  <div className="stat-change positive">
                    ✓ Verified
                  </div>
                </div>
                <div className="stat-icon success">
                  ✓
                </div>
              </div>
            </div>

            <div
              className="stat-card"
              onClick={() => navigate('/customers?status=SYNCED_TO_SAP')}
              style={{ cursor: 'pointer' }}
            >
              <div className="stat-header">
                <div>
                  <div className="stat-title">SAP Synced</div>
                  <div className="stat-value">{stats.syncedToSAP}</div>
                  <div className="stat-change positive">
                    🔄 Integrated
                  </div>
                </div>
                <div className="stat-icon primary">
                  🔄
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Charts - All Charts */}
            <DashboardCharts
              statusData={statusData}
              trendData={trendData}
              userStatusData={userStatusData}
              approvalStatusData={approvalStatusData}
              recentActivity={recentActivity}
            />
        </>
      )}
    </div>
  )
}

export default DashboardPage
