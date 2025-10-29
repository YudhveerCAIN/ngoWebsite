import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import AdminLogin from '../../components/admin/AdminLogin'

const AdminLoginPage = () => {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from || '/admin'
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, location])
  
  const handleLoginSuccess = (result) => {
    console.log('Login successful:', result)
    const from = location.state?.from || '/admin'
    navigate(from, { replace: true })
  }
  
  const handleLoginError = (error) => {
    console.error('Login error:', error)
  }
  
  // Don't render login form if already authenticated
  if (isAuthenticated) {
    return null
  }
  
  return (
    <AdminLogin
      onLoginSuccess={handleLoginSuccess}
      onLoginError={handleLoginError}
    />
  )
}

export default AdminLoginPage