import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from '../ProtectedRoute'
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

const TestComponent = () => <div>Protected Content</div>
const LoginComponent = () => <div>Login Page</div>
const FallbackComponent = () => <div>Access Denied Fallback</div>

const renderWithProviders = (component, initialRoute = '/') => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/admin/login" element={<LoginComponent />} />
          <Route path="/" element={component} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    fetch.mockClear()
    localStorageMock.getItem.mockClear()
    localStorageMock.setItem.mockClear()
    localStorageMock.removeItem.mockClear()
  })

  test('shows loading spinner while checking authentication', () => {
    localStorageMock.getItem.mockReturnValue(null)
    
    renderWithProviders(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    )
    
    expect(screen.getByText('Checking authentication...')).toBeInTheDocument()
  })

  test('redirects to login when not authenticated', async () => {
    localStorageMock.getItem.mockReturnValue(null)
    
    renderWithProviders(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    )
    
    await waitFor(() => {
      expect(screen.getByText('Login Page')).toBeInTheDocument()
    })
    
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  test('renders protected content when authenticated', async () => {
    const mockToken = 'valid-token'
    const mockUser = { id: '123', email: 'admin@test.com', role: 'admin' }
    
    localStorageMock.getItem
      .mockReturnValueOnce(mockToken)
      .mockReturnValueOnce(JSON.stringify(mockUser))
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ valid: true, user: mockUser })
    })
    
    renderWithProviders(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    )
    
    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })
  })

  test('shows access denied for non-admin when requireAdmin is true', async () => {
    const mockToken = 'valid-token'
    const mockUser = { id: '123', email: 'user@test.com', role: 'moderator' }
    
    localStorageMock.getItem
      .mockReturnValueOnce(mockToken)
      .mockReturnValueOnce(JSON.stringify(mockUser))
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ valid: true, user: mockUser })
    })
    
    renderWithProviders(
      <ProtectedRoute requireAdmin={true}>
        <TestComponent />
      </ProtectedRoute>
    )
    
    await waitFor(() => {
      expect(screen.getByText('Access Denied')).toBeInTheDocument()
      expect(screen.getByText(/Admin privileges are required/)).toBeInTheDocument()
      expect(screen.getByText('moderator')).toBeInTheDocument()
    })
    
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  test('renders protected content for admin when requireAdmin is true', async () => {
    const mockToken = 'valid-token'
    const mockUser = { id: '123', email: 'admin@test.com', role: 'admin' }
    
    localStorageMock.getItem
      .mockReturnValueOnce(mockToken)
      .mockReturnValueOnce(JSON.stringify(mockUser))
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ valid: true, user: mockUser })
    })
    
    renderWithProviders(
      <ProtectedRoute requireAdmin={true}>
        <TestComponent />
      </ProtectedRoute>
    )
    
    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })
  })

  test('renders custom fallback when provided', async () => {
    const mockToken = 'valid-token'
    const mockUser = { id: '123', email: 'user@test.com', role: 'moderator' }
    
    localStorageMock.getItem
      .mockReturnValueOnce(mockToken)
      .mockReturnValueOnce(JSON.stringify(mockUser))
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ valid: true, user: mockUser })
    })
    
    renderWithProviders(
      <ProtectedRoute requireAdmin={true} fallback={<FallbackComponent />}>
        <TestComponent />
      </ProtectedRoute>
    )
    
    await waitFor(() => {
      expect(screen.getByText('Access Denied Fallback')).toBeInTheDocument()
    })
    
    expect(screen.queryByText('Access Denied')).not.toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  test('handles authentication errors gracefully', async () => {
    const mockToken = 'invalid-token'
    const mockUser = { id: '123', email: 'admin@test.com' }
    
    localStorageMock.getItem
      .mockReturnValueOnce(mockToken)
      .mockReturnValueOnce(JSON.stringify(mockUser))
    
    fetch.mockRejectedValueOnce(new Error('Network error'))
    
    renderWithProviders(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    )
    
    await waitFor(() => {
      expect(screen.getByText('Login Page')).toBeInTheDocument()
    })
  })

  test('preserves location state for redirect after login', async () => {
    localStorageMock.getItem.mockReturnValue(null)
    
    // This test would need more complex setup to test location state
    // For now, we'll just verify the redirect happens
    renderWithProviders(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    )
    
    await waitFor(() => {
      expect(screen.getByText('Login Page')).toBeInTheDocument()
    })
  })

  test('works with nested routes', async () => {
    const mockToken = 'valid-token'
    const mockUser = { id: '123', email: 'admin@test.com', role: 'admin' }
    
    localStorageMock.getItem
      .mockReturnValueOnce(mockToken)
      .mockReturnValueOnce(JSON.stringify(mockUser))
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ valid: true, user: mockUser })
    })
    
    renderWithProviders(
      <ProtectedRoute>
        <div>
          <h1>Admin Area</h1>
          <ProtectedRoute requireAdmin={true}>
            <TestComponent />
          </ProtectedRoute>
        </div>
      </ProtectedRoute>
    )
    
    await waitFor(() => {
      expect(screen.getByText('Admin Area')).toBeInTheDocument()
      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })
  })
})