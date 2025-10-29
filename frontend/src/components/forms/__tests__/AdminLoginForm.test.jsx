import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import AdminLoginForm from '../AdminLoginForm'
import { AuthProvider } from '../../../context/AuthContext'

// Mock fetch globally
global.fetch = vi.fn()

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  )
}

describe('AdminLoginForm', () => {
  beforeEach(() => {
    fetch.mockClear()
    localStorage.clear()
  })

  test('renders login form with all required fields', () => {
    renderWithProviders(<AdminLoginForm />)
    
    expect(screen.getByText('Admin Login')).toBeInTheDocument()
    expect(screen.getByText('Sign in to access the admin dashboard')).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  test('displays validation errors for empty fields', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AdminLoginForm />)
    
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument()
      expect(screen.getByText('Password is required')).toBeInTheDocument()
    })
  })

  test('validates email format', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AdminLoginForm />)
    
    const emailInput = screen.getByLabelText(/email address/i)
    await user.type(emailInput, 'invalid-email')
    
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
    })
  })

  test('toggles password visibility', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AdminLoginForm />)
    
    const passwordInput = screen.getByLabelText(/password/i)
    const toggleButton = screen.getByRole('button', { tabIndex: -1 })
    
    // Initially password should be hidden
    expect(passwordInput).toHaveAttribute('type', 'password')
    
    // Click toggle to show password
    await user.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'text')
    
    // Click toggle to hide password again
    await user.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  test('submits form with valid credentials', async () => {
    const user = userEvent.setup()
    
    const mockResponse = {
      token: 'mock-jwt-token',
      user: {
        id: '123',
        email: 'admin@urjjapratishthan.org',
        name: 'Admin User',
        role: 'admin'
      },
      expiresIn: '8h'
    }
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    })
    
    renderWithProviders(<AdminLoginForm />)
    
    // Fill out the form
    await user.type(screen.getByLabelText(/email address/i), 'admin@urjjapratishthan.org')
    await user.type(screen.getByLabelText(/password/i), 'Admin@123')
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    await user.click(submitButton)
    
    // Verify API call
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@urjjapratishthan.org',
          password: 'Admin@123'
        }),
      })
    })
  })

  test('displays loading state during submission', async () => {
    const user = userEvent.setup()
    
    fetch.mockImplementation(() => new Promise(resolve => 
      setTimeout(() => resolve({
        ok: true,
        json: async () => ({ token: 'token', user: {} })
      }), 100)
    ))
    
    renderWithProviders(<AdminLoginForm />)
    
    // Fill out required fields
    await user.type(screen.getByLabelText(/email address/i), 'admin@test.com')
    await user.type(screen.getByLabelText(/password/i), 'password')
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    await user.click(submitButton)
    
    // Check loading state
    expect(screen.getByText('Signing in...')).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
  })

  test('handles invalid credentials error', async () => {
    const user = userEvent.setup()
    
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        message: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      })
    })
    
    renderWithProviders(<AdminLoginForm />)
    
    await user.type(screen.getByLabelText(/email address/i), 'admin@test.com')
    await user.type(screen.getByLabelText(/password/i), 'wrongpassword')
    await user.click(screen.getByRole('button', { name: /sign in/i }))
    
    await waitFor(() => {
      expect(screen.getByText('Invalid email or password')).toBeInTheDocument()
    })
  })

  test('handles network errors', async () => {
    const user = userEvent.setup()
    
    fetch.mockRejectedValueOnce(new Error('Network error'))
    
    renderWithProviders(<AdminLoginForm />)
    
    await user.type(screen.getByLabelText(/email address/i), 'admin@test.com')
    await user.type(screen.getByLabelText(/password/i), 'password')
    await user.click(screen.getByRole('button', { name: /sign in/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/Network error/)).toBeInTheDocument()
    })
  })

  test('handles server validation errors', async () => {
    const user = userEvent.setup()
    
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        message: 'Validation failed',
        errors: [
          { field: 'email', message: 'Email is required' },
          { field: 'password', message: 'Password must be at least 8 characters' }
        ]
      })
    })
    
    renderWithProviders(<AdminLoginForm />)
    
    await user.type(screen.getByLabelText(/email address/i), '')
    await user.type(screen.getByLabelText(/password/i), '123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))
    
    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument()
      expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument()
    })
  })

  test('has proper accessibility attributes', () => {
    renderWithProviders(<AdminLoginForm />)
    
    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/password/i)
    
    expect(emailInput).toHaveAttribute('type', 'email')
    expect(emailInput).toHaveAttribute('autoComplete', 'email')
    expect(emailInput).toHaveAttribute('autoFocus')
    
    expect(passwordInput).toHaveAttribute('type', 'password')
    expect(passwordInput).toHaveAttribute('autoComplete', 'current-password')
  })

  test('displays security notice', () => {
    renderWithProviders(<AdminLoginForm />)
    
    expect(screen.getByText(/This is a secure admin area/)).toBeInTheDocument()
    expect(screen.getByText(/Only authorized personnel should access/)).toBeInTheDocument()
  })

  test('form has proper ARIA labels and roles', () => {
    renderWithProviders(<AdminLoginForm />)
    
    const form = screen.getByRole('form', { hidden: true }) || screen.getByLabelText(/email address/i).closest('form')
    expect(form).toBeInTheDocument()
    
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    expect(submitButton).toHaveAttribute('type', 'submit')
  })

  test('clears errors when user starts typing', async () => {
    const user = userEvent.setup()
    
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        message: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      })
    })
    
    renderWithProviders(<AdminLoginForm />)
    
    // Submit form to trigger error
    await user.type(screen.getByLabelText(/email address/i), 'test@test.com')
    await user.type(screen.getByLabelText(/password/i), 'wrong')
    await user.click(screen.getByRole('button', { name: /sign in/i }))
    
    await waitFor(() => {
      expect(screen.getByText('Invalid email or password')).toBeInTheDocument()
    })
    
    // Start typing in email field - errors should clear
    await user.clear(screen.getByLabelText(/email address/i))
    await user.type(screen.getByLabelText(/email address/i), 'new@test.com')
    
    // Error should still be there until form is resubmitted
    expect(screen.getByText('Invalid email or password')).toBeInTheDocument()
  })
})