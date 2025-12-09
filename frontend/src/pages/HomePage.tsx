import { useEffect, useState } from 'react'
import { apiClient } from '../services/api'

function HomePage() {
  const [health, setHealth] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await apiClient.get('/health')
        setHealth(response.data)
      } catch (error) {
        console.error('Failed to check API health:', error)
      } finally {
        setLoading(false)
      }
    }

    checkHealth()
  }, [])

  return (
    <div>
      <h1>Welcome to KYC Portal</h1>
      <div className="card">
        <h2>System Status</h2>
        {loading ? (
          <p>Checking API status...</p>
        ) : health ? (
          <div>
            <p>✅ API Status: {health.status}</p>
            <p>Service: {health.service}</p>
            <p>Timestamp: {new Date(health.timestamp).toLocaleString()}</p>
          </div>
        ) : (
          <p>❌ API is not responding. Please check backend connection.</p>
        )}
      </div>
      <div className="card">
        <h2>Quick Actions</h2>
        <p>Manage customer KYC information and sync with SAP B1</p>
        <button onClick={() => window.location.href = '/customers'}>
          View Customers
        </button>
      </div>
    </div>
  )
}

export default HomePage
