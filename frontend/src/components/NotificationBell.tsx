import { useState } from 'react'
import { useNotification } from '../context/NotificationContext'
import '../styles/notifications.css'

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification } = useNotification()
  const [isOpen, setIsOpen] = useState(false)

  const getIconByType = (type: string) => {
    switch (type) {
      case 'new':
        return '📄'
      case 'approval':
        return '👤'
      case 'synced':
        return '✅'
      case 'rejected':
        return '❌'
      default:
        return 'ℹ️'
    }
  }

  const getColorByType = (type: string) => {
    switch (type) {
      case 'new':
        return '#3b82f6'
      case 'approval':
        return '#f59e0b'
      case 'synced':
        return '#10b981'
      case 'rejected':
        return '#ef4444'
      default:
        return '#6b7280'
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - new Date(date).getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return new Date(date).toLocaleDateString()
  }

  return (
    <div className="notification-container">
      <button
        className="notification-bell"
        onClick={() => setIsOpen(!isOpen)}
        title="Notifications"
      >
        <span className="bell-icon">🔔</span>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button className="mark-all-read" onClick={markAllAsRead}>
                Mark all as read
              </button>
            )}
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="notification-empty">
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map(notif => (
                <div
                  key={notif.id}
                  className={`notification-item ${!notif.read ? 'unread' : ''}`}
                  onClick={() => markAsRead(notif.id)}
                >
                  <div className="notification-item-header">
                    <span className="notification-icon" style={{ fontSize: '1.25rem' }}>
                      {getIconByType(notif.type)}
                    </span>
                    <div className="notification-content">
                      <h4 className="notification-title">{notif.title}</h4>
                      <p className="notification-message">{notif.message}</p>
                      <span className="notification-time">{formatTime(notif.timestamp)}</span>
                    </div>
                    <button
                      className="notification-close"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeNotification(notif.id)
                      }}
                      title="Remove"
                    >
                      ×
                    </button>
                  </div>
                  {!notif.read && (
                    <div
                      className="notification-dot"
                      style={{ backgroundColor: getColorByType(notif.type) }}
                    />
                  )}
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="notification-footer">
              <a href="/notifications" className="view-all">
                View all notifications →
              </a>
            </div>
          )}
        </div>
      )}

      {isOpen && (
        <div className="notification-overlay" onClick={() => setIsOpen(false)} />
      )}
    </div>
  )
}
