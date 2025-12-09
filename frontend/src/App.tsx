import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './components/DashboardLayout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import CustomersPage from './pages/CustomersPage'
import CreateCustomerPage from './pages/CreateCustomerPageNew'
import CustomerDetailPage from './pages/CustomerDetailPage'
import EditCustomerPage from './pages/EditCustomerPage'
import VendorsPage from './pages/VendorsPage'
import CreateVendorPage from './pages/CreateVendorPageNew'
import RegisterUserPage from './pages/RegisterUserPage'
import UsersManagementPage from './pages/UsersManagementPage'
import ManagerApprovalsPage from './pages/ManagerApprovalsPage'
import SAPSyncPage from './pages/SAPSyncPage'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <DashboardPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/customers"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <CustomersPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/customers/create"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <CreateCustomerPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/customers/:id"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <CustomerDetailPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/customers/:id/edit"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <EditCustomerPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/dashboard/users"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <UsersManagementPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/dashboard/register-user"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <RegisterUserPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/dashboard/approvals"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ManagerApprovalsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/dashboard/sap-sync"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <SAPSyncPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/vendors"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <VendorsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/vendors/create"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <CreateVendorPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
