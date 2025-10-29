import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AdminLogin from '../AdminLogin'

// Mock fetch globally
global.fetch = vi.fn()

describe('AdminLogin', () => {
  const mockOnLoginSuccess = vi.fn()
  const mockOnLoginError = vi.fn()

  beforeEach(() => {
    fetch.mockClear()
    mockOnLoginSuccess.mockClear()
    mockOnLoginError.mockClear()
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        setItem: vi.fn(),
        getItem: vi.fn(),
        removeItem: vi.fn(),
      },
      writable: true,
    })
  })

  test('renders login form with all required fields', () => {
    render(<AdminLogin />)
    
    expect(screen.getByText('Admin Login')).toBeInTheDocument()
    expect(screen.getByText('Sign in to access the admin dashboard')).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  test('validates required fields', async () => {
    const user = userEvent.setup()
    render(<AdminLogin />)
    
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument()
      expect(screen.getByText('Password is required')).toBeInTheDocument()
    })
  })

  test('validates email format', async () => {
    const user = userEvent.setup()
    render(<AdminLogin />)
    
    const emailInput = screen.getByLabelText(/email address/i)
    await user.type(emailInput, 'invalid-email')
    
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
    })
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
    
    render(
      <AdminLogin 
        onLoginSuccess={mockOnLoginSuccess}
        onLoginError={mockOnLoginError}
      />
    )
    
    // Fill out form
    await user.type(screen.getByLabelText(/email address/i), 'admin@urjjapratishthan.org')
    await user.type(screen.getByLabelText(/password/i), 'Admin@123')
    
    // Submit form
    await user.click(screen.getByRole('button', { name: /sign in/i }))
    
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
    
    // Verify localStorage calls
    expect(localStorage.setItem).toHaveBeenCalledWith('adminToken', mockResponse.token)
    expect(localStorage.setItem).toHaveBeenCalledWith('adminUser', JSON.stringify(mockResponse.user))
    
    // Verify success callback
    expect(mockOnLoginSuccess).toHaveBeenCalledWith(mockResponse)
  })

  test('displays loading state during submission', async () => {
    const user = userEvent.setup()
    
    fetch.mockImplementation(() => 
      new Promise(resolve => 
        setTimeout(() => resolve({
          ok: true,
          json: async () => ({ token: 'test', user: {} })
        }), 100)
      )
    )
    
    render(<AdminLogin />)
    
    // Fill out form
    await user.type(screen.getByLabelText(/email address/i), 'admin@test.com')
    await user.type(screen.getByLabelText(/password/i), 'password')
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    await user.click(submitButton)
    
    // Check loading state
    expect(screen.getByText('Signing in...')).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
    expect(screen.getByText('Authenticating...')).toBeInTheDocument()
  })

  test('handles login failure', async () => {
    const user = userEvent.setup()
    
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        message: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      })
    })
    
    render(
      <AdminLogin 
        onLoginSuccess={mockOnLoginSuccess}
        onLoginError={mockOnLoginError}
      />
    )
    
    // Fill out form
    await user.type(screen.getByLabelText(/email address/i), 'admin@test.com')
    await user.type(screen.getByLabelText(/password/i), 'wrongpassword')
    
    // Submit form
    await user.click(screen.getByRole('button', { name: /sign in/i }))
    
    // Verify error display
    await waitFor(() => {
      expect(screen.getByText('Login Failed')).toBeInTheDocument()
      expect(screen.getByText('Invalid email or password')).toBeInTheDocument()
    })
    
    // Verify error callback
    expect(mockOnLoginError).toHaveBeenCalled()
    expect(mockOnLoginSuccess).not.toHaveBeenCalled()
  })

  test('handles network errors', async () => {
    const user = userEvent.setup()
    
    fetch.mockRejectedValueOnce(new Error('Network error'))
    
    render(
      <AdminLogin 
        onLoginSuccess={mockOnLoginSuccess}
        onLoginError={mockOnLoginError}
      />
    )
    
    // Fill out form
    await user.type(screen.getByLabelText(/email address/i), 'admin@test.com')
    await user.type(screen.getByLabelText(/password/i), 'password')
    
    // Submit form
    await user.click(screen.getByRole('button', { name: /sign in/i }))
    
    // Verify error display
    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument()
    })
    
    // Verify error callback
    expect(mockOnLoginError).toHaveBeenCalled()
  })

  test('disables form during loading', async () => {
    const user = userEvent.setup()
    
    fetch.mockImplementation(() => new Promise(() => {})) // Never resolves
    
    render(<AdminLogin />)
    
    // Fill out form
    await user.type(screen.getByLabelText(/email address/i), 'admin@test.com')
    await user.type(screen.getByLabelText(/password/i), 'password')
    
    // Submit form
    await user.click(screen.getByRole('button', { name: /sign in/i }))
    
    // Verify form is disabled
    expect(screen.getByLabelText(/email address/i)).toBeDisabled()
    expect(screen.getByLabelText(/password/i)).toBeDisabled()
    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled()
  })

  test('resets form after successful login', async () => {
    const user = userEvent.setup()
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        token: 'test-token',
        user: { id: '123', email: 'admin@test.com', name: 'Admin' }
      })
    })
    
    render(<AdminLogin onLoginSuccess={mockOnLoginSuccess} />)
    
    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/password/i)
    
    // Fill out form
    await user.type(emailInput, 'admin@test.com')
    await user.type(passwordInput, 'password')
    
    // Submit form
    await user.click(screen.getByRole('button', { name: /sign in/i }))
    
    // Wait for success
    await waitFor(() => {
      expect(mockOnLoginSuccess).toHaveBeenCalled()
    })
    
    // Form should be reset
    expect(emailInput).toHaveValue('')
    expect(passwordInput).toHaveValue('')
  })

  test('displays security information', () => {
    render(<AdminLogin />)
    
    expect(screen.getByText('Secure Admin Access')).toBeInTheDocument()
    expect(screen.getByText(/This is a secure area for authorized administrators only/)).toBeInTheDocument()
    expect(screen.getByText(/All login attempts are logged and monitored/)).toBeInTheDocument()
  })
})