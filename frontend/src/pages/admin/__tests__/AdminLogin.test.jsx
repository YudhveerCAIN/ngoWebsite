import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import AdminLogin from '../AdminLogin'
import { AuthProvider } from '../../../context/AuthContext'

// Mock fetch
global.fetch = vi.fn()

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
}
global.localStorage = localStorageMock

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  )
}

describe('AdminLogin Page', () => {
  beforeEach(() => {
    fetch.mockClear()
    localStorageMock.getItem.mockClear()
    localStorageMock.setItem.mockClear()
    localStorageMock.removeItem.mockClear()
    
    // Mock document.title
    Object.defineProperty(document, 'title', {
      writable: true,
      value: 'Test'
    })
  })

  test('renders admin login page', async () => {
    localStorageMock.getItem.mockReturnValue(null)
    
    renderWithProviders(<AdminLogin />)
    
    await waitFor(() => {
      expect(screen.getByText('Admin Login')).toBeInTheDocument()
      expect(screen.getByText('Sign in to access the admin dashboard')).toBeInTheDocument()
    })
  })

  test('sets page title correctly', async () => {
    localStorageMock.getItem.mockReturnValue(null)
    
    renderWithProviders(<AdminLogin />)
    
    await waitFor(() => {
      expect(document.title).toBe('Admin Login - Urjja Pratishthan Prakashalay')
    })
  })

  test('redirects when already authenticated', async () => {
    const mockToken = 'valid-token'
    const mockUser = { id: '123', email: 'admin@test.com', role: 'admin' }
    
    localStorageMock.getItem
      .mockReturnValueOnce(mockToken)
      .mockReturnValueOnce(JSON.stringify(mockUser))
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ valid: true, user: mockUser })
    })
    
    renderWithProviders(<AdminLogin />)
    
    // Should not show login form when authenticated
    await waitFor(() => {
      expect(screen.queryByText('Admin Login')).not.toBeInTheDocument()
    })
  })

  test('shows login form when not authenticated', async () => {
    localStorageMock.getItem.mockReturnValue(null)
    
    renderWithProviders(<AdminLogin />)
    
    await waitFor(() => {
      expect(screen.getByText('Admin Login')).toBeInTheDocument()
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    })
  })

  test('restores original title on unmount', async () => {
    localStorageMock.getItem.mockReturnValue(null)
    
    const { unmount } = renderWithProviders(<AdminLogin />)
    
    await waitFor(() => {
      expect(document.title).toBe('Admin Login - Urjja Pratishthan Prakashalay')
    })
    
    unmount()
    
    expect(document.title).toBe('Urjja Pratishthan Prakashalay')
  })

  test('handles authentication loading state', () => {
    localStorageMock.getItem.mockReturnValue('some-token')
    
    // Mock a slow validation response
    fetch.mockImplementation(() => new Promise(() => {}))
    
    renderWithProviders(<AdminLogin />)
    
    // Should show some loading state or the login form
    expect(screen.getByText('Admin Login') || screen.getByText('Loading')).toBeInTheDocument()
  })

  test('handles authentication error during initialization', async () => {
    const mockToken = 'invalid-token'
    const mockUser = { id: '123', email: 'admin@test.com' }
    
    localStorageMock.getItem
      .mockReturnValueOnce(mockToken)
      .mockReturnValueOnce(JSON.stringify(mockUser))
    
    fetch.mockRejectedValueOnce(new Error('Network error'))
    
    renderWithProviders(<AdminLogin />)
    
    await waitFor(() => {
      expect(screen.getByText('Admin Login')).toBeInTheDocument()
    })
    
    // Should clear localStorage on error
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('adminToken')
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('adminUser')
  })
})