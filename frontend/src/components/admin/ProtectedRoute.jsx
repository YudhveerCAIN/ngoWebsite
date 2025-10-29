import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { LoadingSpinner } from '../ui'

const ProtectedRoute = ({ 
  children, 
  requireAdmin = true,
  fallbackPath = '/admin/login',
  loadingComponent = null 
}) => {
  const { isAuthenticated, isLoading, user, token } = useAuth()
  const location = useLocation()
  const [isValidating, setIsValidating] = useState(true)
  
  useEffect(() => {
    const validateAccess = async () => {
      if (isLoading) {
        return // Still loading initial auth state
      }
      
      if (!isAuthenticated || !token) {
        setIsValidating(false)
        return
      }
      
      if (requireAdmin && user?.role !== 'admin') {
        setIsValidating(false)
        return
      }
      
      // Additional token validation could be done here
      setIsValidating(false)
    }
    
    validateAccess()
  }, [isAuthenticated, isLoading, user, token, requireAdmin])
  
  // Show loading spinner while validating
  if (isLoading || isValidating) {
    if (loadingComponent) {
      return loadingComponent
    }
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Verifying access...</p>
        </div>
      </div>
    )
  }
  
  // Check authentication
  if (!isAuthenticated || !token) {
    return (
      <Navigate 
        to={fallbackPath} 
        state={{ from: location.pathname }} 
        replace 
      />
    )
  }
  
  // Check admin role if required
  if (requireAdmin && user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-6">
            You don't have permission to access this area.
            <br />
            Admin privileges are required.
          </p>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }
  
  // User is authenticated and authorized
  return children
}

export default ProtectedRoute