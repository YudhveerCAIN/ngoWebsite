import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button, Input, Card, LoadingSpinner } from '../ui'
import { useAuth } from '../../hooks/useAuth'

const AdminLoginForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm()
  
  const onSubmit = async (data) => {
    setIsSubmitting(true)
    setSubmitError('')
    
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
        if (result.code === 'INVALID_CREDENTIALS') {
          setError('email', { message: 'Invalid email or password' })
          setError('password', { message: 'Invalid email or password' })
        } else if (result.errors) {
          result.errors.forEach(error => {
            setError(error.field, { message: error.message })
          })
        } else {
          setSubmitError(result.message || 'Login failed')
        }
        return
      }
      
      // Store authentication data
      login(result.token, result.user)
      
      // Redirect to intended page or dashboard
      const from = location.state?.from?.pathname || '/admin'
      navigate(from, { replace: true })
      
    } catch (error) {
      console.error('Login error:', error)
      setSubmitError('Network error. Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center">
            <svg className="h-6 w-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Admin Login
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access the admin dashboard
          </p>
        </div>

        {/* Login Form */}
        <Card className="mt-8">
          <Card.Content className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email Field */}
              <Input
                label="Email Address"
                type="email"
                required
                autoComplete="email"
                autoFocus
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Please enter a valid email address'
                  }
                })}
                error={errors.email?.message}
                placeholder="admin@urjjapratishthan.org"
                className="block w-full"
              />

              {/* Password Field */}
              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 1,
                      message: 'Password is required'
                    }
                  })}
                  error={errors.password?.message}
                  placeholder="Enter your password"
                  className="block w-full pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Error Display */}
              {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex">
                    <svg className="w-5 h-5 text-red-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-red-700" role="alert">
                      {submitError}
                    </p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                loading={isSubmitting}
                className="w-full"
                size="lg"
              >
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </Card.Content>
        </Card>

        {/* Additional Info */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            This is a secure admin area. Only authorized personnel should access this page.
          </p>
          <p className="text-xs text-gray-500 mt-2">
            If you're having trouble logging in, please contact the system administrator.
          </p>
        </div>
      </div>
    </div>
  )
}

export default AdminLoginForm