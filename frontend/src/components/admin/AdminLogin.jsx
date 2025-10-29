import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button, Input, Card, LoadingSpinner } from '../ui'

const AdminLogin = ({ onLoginSuccess, onLoginError }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm()
  
  const onSubmit = async (data) => {
    setIsLoading(true)
    setError('')
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.message || 'Login failed')
      }
      
      // Store token in localStorage
      localStorage.setItem('adminToken', result.token)
      localStorage.setItem('adminUser', JSON.stringify(result.user))
      
      // Call success callback
      if (onLoginSuccess) {
        onLoginSuccess(result)
      }
      
      reset()
      
    } catch (err) {
      const errorMessage = err.message || 'An error occurred during login'
      setError(errorMessage)
      
      if (onLoginError) {
        onLoginError(err)
      }
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Admin Login
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access the admin dashboard
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Email Field */}
            <Input
              label="Email Address"
              type="email"
              autoComplete="email"
              required
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Please enter a valid email address'
                }
              })}
              error={errors.email?.message}
              placeholder="admin@urjjapratishthan.org"
              disabled={isLoading}
            />

            {/* Password Field */}
            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              required
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 1,
                  message: 'Password is required'
                }
              })}
              error={errors.password?.message}
              placeholder="Enter your password"
              disabled={isLoading}
            />

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <svg className="w-5 h-5 text-red-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="text-sm font-medium text-red-800">
                      Login Failed
                    </h3>
                    <p className="text-sm text-red-700 mt-1" role="alert">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              loading={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Additional Information */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Secure Admin Access
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                This is a secure area for authorized administrators only.
                <br />
                All login attempts are logged and monitored.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <LoadingSpinner size="md" />
            <span className="text-gray-700">Authenticating...</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminLogin