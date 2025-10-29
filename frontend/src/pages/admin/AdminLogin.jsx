import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import AdminLoginForm from '../../components/forms/AdminLoginForm'

const AdminLogin = () => {
  const { isAuthenticated, isLoading } = useAuth()
  
  // Set page title
  useEffect(() => {
    document.title = 'Admin Login - Urjja Pratishthan Prakashalay'
    
    return () => {
      document.title = 'Urjja Pratishthan Prakashalay'
    }
  }, [])
  
  // Redirect if already authenticated
  if (isAuthenticated && !isLoading) {
    return <Navigate to="/admin" replace />
  }
  
  return <AdminLoginForm />
}

export default AdminLogin