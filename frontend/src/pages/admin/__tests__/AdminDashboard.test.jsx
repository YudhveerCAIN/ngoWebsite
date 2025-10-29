import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import AdminDashboard from '../AdminDashboard'
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

describe('AdminDashboard', () => {
  const mockUser = {
    id: '123',
    name: 'Admin User',
    email: 'admin@test.com',
    role: 'admin',
    lastLoginAt: '2024-01-15T10:00:00Z'
  }

  const mockStats = {
    impact: {
      studentsSupported: 1250,
      volunteersActive: 85,
      totalDonationAmount: 2450000,
      dataSource: 'live'
    },
    contacts: {
      total: 234,
      recent: 45,
      byStatus: {
        new: 12,
        responded: 18,
        closed: 15
      }
    }
  }

  beforeEach(() => {
    fetch.mockClear()
    localStorageMock.getItem.mockClear()
    localStorageMock.setItem.mockClear()
    localStorageMock.removeItem.mockClear()
    
    // Mock authenticated user
    localStorageMock.getItem
      .mockReturnValueOnce('valid-token')
      .mockReturnValueOnce(JSON.stringify(mockUser))
    
    // Mock document.title
    Object.defineProperty(document, 'title', {
      writable: true,
      value: 'Test'
    })
  })

  test('renders dashboard with loading state', async () => {
    fetch.mockImplementation(() => new Promise(() => {})) // Never resolves
    
    renderWithProviders(<AdminDashboard />)
    
    expect(screen.getByText('Loading dashboard...')).toBeInTheDocument()
  })

  test('renders dashboard with stats after loading', async () => {
    // Mock auth validation
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ valid: true, user: mockUser })
    })
    
    // Mock API responses
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStats.impact
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStats.contacts
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ volunteers: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ donations: [] })
      })
    
    renderWithProviders(<AdminDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument()
      expect(screen.getByText(`Welcome back, ${mockUser.name}`)).toBeInTheDocument()
    })
    
    // Check stats display
    expect(screen.getByText('1,250')).toBeInTheDocument() // Students supported
    expect(screen.getByText('85')).toBeInTheDocument() // Active volunteers
    expect(screen.getByText('₹24,50,000')).toBeInTheDocument() // Total donations
    expect(screen.getByText('234')).toBeInTheDocument() // Contact inquiries
  })

  test('displays user information correctly', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({})
    })
    
    renderWithProviders(<AdminDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText(`Welcome back, ${mockUser.name}`)).toBeInTheDocument()
      expect(screen.getByText('admin')).toBeInTheDocument()
    })
  })

  test('displays contact inquiry breakdown', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => mockStats.contacts
    })
    
    renderWithProviders(<AdminDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Recent Contact Inquiries')).toBeInTheDocument()
      expect(screen.getByText('12')).toBeInTheDocument() // New inquiries
      expect(screen.getByText('18')).toBeInTheDocument() // Responded
      expect(screen.getByText('15')).toBeInTheDocument() // Closed
      expect(screen.getByText('45')).toBeInTheDocument() // Recent (30 days)
    })
  })

  test('displays system status information', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => mockStats
    })
    
    renderWithProviders(<AdminDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('System Status')).toBeInTheDocument()
      expect(screen.getByText('Connected')).toBeInTheDocument() // Database
      expect(screen.getByText('Operational')).toBeInTheDocument() // API Status
      expect(screen.getByText('Live Data')).toBeInTheDocument() // Data source
    })
  })

  test('handles API errors gracefully', async () => {
    fetch.mockRejectedValue(new Error('API Error'))
    
    renderWithProviders(<AdminDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load dashboard statistics')).toBeInTheDocument()
    })
  })

  test('handles partial API failures', async () => {
    // Mock mixed success/failure responses
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStats.impact
      })
      .mockRejectedValueOnce(new Error('Contact API failed'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ volunteers: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ donations: [] })
      })
    
    renderWithProviders(<AdminDashboard />)
    
    await waitFor(() => {
      // Should still show impact data
      expect(screen.getByText('1,250')).toBeInTheDocument()
      // Should show fallback for failed contact data
      expect(screen.getByText('No contact data available')).toBeInTheDocument()
    })
  })

  test('logout functionality works', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({})
    })
    
    renderWithProviders(<AdminDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Logout')).toBeInTheDocument()
    })
    
    // Mock logout API call
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Logout successful' })
    })
    
    fireEvent.click(screen.getByText('Logout'))
    
    // Should clear localStorage
    await waitFor(() => {
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('adminToken')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('adminUser')
    })
  })

  test('sets and restores page title', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({})
    })
    
    const { unmount } = renderWithProviders(<AdminDashboard />)
    
    await waitFor(() => {
      expect(document.title).toBe('Admin Dashboard - Urjja Pratishthan Prakashalay')
    })
    
    unmount()
    
    expect(document.title).toBe('Urjja Pratishthan Prakashalay')
  })

  test('displays quick actions section', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({})
    })
    
    renderWithProviders(<AdminDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Quick Actions')).toBeInTheDocument()
      expect(screen.getByText('Manage Contacts')).toBeInTheDocument()
      expect(screen.getByText('Manage Volunteers')).toBeInTheDocument()
      expect(screen.getByText('View Donations')).toBeInTheDocument()
    })
  })

  test('handles empty stats gracefully', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({})
    })
    
    renderWithProviders(<AdminDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument()
      // Should show 0 for missing stats
      expect(screen.getAllByText('0')).toHaveLength(4) // Four stat cards
    })
  })

  test('displays last login information', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({})
    })
    
    renderWithProviders(<AdminDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('1/15/2024')).toBeInTheDocument() // Formatted last login date
    })
  })

  test('shows cached data indicator when appropriate', async () => {
    const cachedStats = {
      ...mockStats.impact,
      dataSource: 'fallback'
    }
    
    fetch.mockResolvedValue({
      ok: true,
      json: async () => cachedStats
    })
    
    renderWithProviders(<AdminDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Cached Data')).toBeInTheDocument()
    })
  })
})