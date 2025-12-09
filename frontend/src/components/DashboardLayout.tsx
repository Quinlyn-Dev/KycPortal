import { ReactNode, useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import '../styles/modern.css'
import { ToastProvider } from '../context/ToastContext'
import { NotificationProvider } from '../context/NotificationContext'
import ToastContainer from './ToastContainer'
import { NotificationBell } from './NotificationBell'

interface DashboardLayoutProps {
  children: ReactNode
}

function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null)
  const [submenuPosition, setSubmenuPosition] = useState<{ top: number } | null>(null)
  const sidebarRef = useRef<HTMLDivElement | null>(null)
  const [currentDateTime, setCurrentDateTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed)
  }

  // Close submenu when clicking outside
  useEffect(() => {
    const onDocClick = (ev: MouseEvent) => {
      const target = ev.target as HTMLElement
      if (!target.closest('.sidebar') && !target.closest('.sidebar-submenu') && !target.closest('.menu-parent')) {
        setOpenSubmenu(null)
      }
    }
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [])

  const formatDateTime = () => {
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }
    return currentDateTime.toLocaleString('en-GB', options).replace(',', '')
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const menuItems: Array<any> = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    {
      label: 'Know Your',
      icon: '🧾',
      children: [
        { path: '/customers', label: 'Customer', icon: '👥' },
        { path: '/vendors', label: 'Vendor', icon: '🏷️' }
      ]
    },
    { path: '/dashboard/approvals', label: 'Approvals', icon: '✅', roles: ['Manager', 'IT'] },
    { path: '/dashboard/sap-sync', label: 'SAP Sync', icon: '🔄', roles: ['IT'] },
    { path: '/dashboard/users', label: 'Users', icon: '👤', roles: ['IT'] },
  ]

  const filteredMenuItems = menuItems
    .map(item => {
      // if parent with children, filter children by roles
      if (item.children) {
        const children = item.children.filter((child: any) => !child.roles || child.roles.includes(user?.role || ''))
        if (children.length === 0) return null
        return { ...item, children }
      }
      if (!item.roles || item.roles.includes(user?.role || '')) return item
      return null
    })
    .filter(Boolean)

  const getSidebarClass = () => {
    let baseClass = 'sidebar'
    if (isSidebarCollapsed) baseClass += ' collapsed'
    if (user?.role === 'User') baseClass += ' user-sidebar'
    else if (user?.role === 'Manager') baseClass += ' manager-sidebar'
    else if (user?.role === 'IT') baseClass += ' it-sidebar'

    return baseClass
  }

  const getRoleBadgeText = () => {
    if (user?.role === 'User') return '🌱 Data Entry'
    if (user?.role === 'Manager') return '⭐ Approval Manager'
    if (user?.role === 'IT') return '⚙️ IT Admin'
    return user?.role || 'User'
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <NotificationProvider>
      <ToastProvider>
        <div className="dashboard-layout">
          <div className={getSidebarClass()} ref={sidebarRef}>
        
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <svg width="40" height="40" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="32" height="32" rx="8" fill="url(#gradient)" />
              <path d="M8 16L14 10L14 22L8 16Z" fill="white" />
              <path d="M18 10L24 16L18 22V10Z" fill="white" opacity="0.8" />
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#2563eb" />
                  <stop offset="1" stopColor="#1e40af" />
                </linearGradient>
              </defs>
            </svg>
            <div className="sidebar-logo-text">
              <h2>Ticka</h2>
            </div>
          </div>
          <button 
            className="sidebar-toggle-inner" 
            onClick={toggleSidebar}
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              {isSidebarCollapsed ? (
                <polyline points="12 9 16 12 12 15"></polyline>
              ) : (
                <polyline points="12 9 8 12 12 15"></polyline>
              )}
            </svg>
          </button>
        </div>

        <ul className="sidebar-menu">
          {filteredMenuItems.map((item: any) => (
            <li key={item.path || item.label} className={`${item.children ? 'has-children' : ''} ${openSubmenu === item.label ? 'open' : ''}`}>
              {item.children ? (
                <>
                  <div
                    className={`menu-parent ${openSubmenu === item.label ? 'active' : ''}`}
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      // Toggle submenu on click
                      const newValue = openSubmenu === item.label ? null : item.label
                      setOpenSubmenu(newValue)
                      
                      // Calculate position for fixed positioning
                      if (newValue) {
                        const rect = e.currentTarget.getBoundingClientRect()
                        setSubmenuPosition({ top: rect.top })
                      } else {
                        setSubmenuPosition(null)
                      }
                      
                      console.log('Menu clicked:', item.label, 'Sidebar collapsed:', isSidebarCollapsed, 'New state:', newValue)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        ;(e.currentTarget as HTMLElement).click()
                      }
                    }}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  <ul
                    className={`sidebar-submenu ${openSubmenu === item.label ? 'open' : ''}`}
                    style={{
                      ...(openSubmenu === item.label && submenuPosition ? { top: `${submenuPosition.top}px` } : {}),
                      display: openSubmenu === item.label ? 'block' : undefined
                    }}
                  >
                    {item.children.map((child: any) => (
                      <li key={child.path}>
                        <a
                          href={child.path}
                          className={location.pathname.startsWith(child.path) ? 'active' : ''}
                          data-tooltip={child.label}
                          onClick={(e) => {
                            e.preventDefault()
                            navigate(child.path)
                            setOpenSubmenu(null)
                          }}
                        >
                          <span>{child.icon}</span>
                          <span>{child.label}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <a
                  href={item.path}
                  className={location.pathname === item.path ? 'active' : ''}
                  data-tooltip={item.label}
                  onClick={(e) => {
                    e.preventDefault()
                    navigate(item.path)
                  }}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </a>
              )}
            </li>
          ))}
        </ul>

        <div className="sidebar-footer">
          <div className="user-profile-card">
            <div className="user-profile-avatar">
              {user ? getInitials(user.name) : 'U'}
            </div>
            <div className="user-profile-name">{user?.name}</div>
            <div className="user-profile-email">{user?.email}</div>
            <div className="user-profile-role">{user?.role}</div>
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>

        <div className="top-bar-wrapper">
          <div className="top-bar-header">
            <div className="top-bar-title">
                <h1>KYC - KYC Protal</h1>
              </div>
          </div>
          <div className="top-bar-actions">
            <button 
              className="theme-toggle-btn" 
              onClick={toggleTheme}
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
              )}
            </button>
            <div className="datetime-display">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>{formatDateTime()}</span>
            </div>
            <NotificationBell />
          </div>
        </div>

        {children}
        <ToastContainer />
      </div>
      </ToastProvider>
    </NotificationProvider>
  )
}

export default DashboardLayout
