import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import AdminDashboard from '../pages/admin/AdminDashboard'
import VolunteerManagement from '../pages/admin/VolunteerManagement'
import DonationManagement from '../pages/admin/DonationManagement'
import ContactManagement from '../pages/admin/ContactManagement'

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

describe('Admin Integration Tests', () => {
  const mockUser = {
    id: '123',
    name: 'Admin User',
    email: 'admin@test.com',
    role: 'admin',
    lastLoginAt: '2024-01-15T10:00:00Z'
  }

  const mockDashboardData = {
    impact: {
      studentsSupported: 1250,
      volunteersActive: 85,
      totalDonationAmount: 2450000,
      dataSource: 'live'
    },
    contacts: {
      total: 234,
      recent: 45,
      byStatus: { new: 12, responded: 18, closed: 15 }
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
    
    // Mock auth validation
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ valid: true, user: mockUser })
    })
  })

  test('admin dashboard integrates with all management systems', async () => {
    // Mock all dashboard API calls
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockDashboardData.impact
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockDashboardData.contacts
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
      // Dashboard should display integrated data from all systems
      expect(screen.getByText('1,250')).toBeInTheDocument() // Students from impact
      expect(screen.getByText('85')).toBeInTheDocument() // Volunteers
      expect(screen.getByText('234')).toBeInTheDocument() // Contact inquiries
      expect(screen.getByText('₹24,50,000')).toBeInTheDocument() // Donations
      
      // Should show breakdown from contact system
      expect(screen.getByText('12')).toBeInTheDocument() // New inquiries
      expect(screen.getByText('18')).toBeInTheDocument() // Responded
      expect(screen.getByText('15')).toBeInTheDocument() // Closed
    })
  })

  test('authentication flows work across all admin pages', async () => {
    // Test that all admin pages respect authentication
    const pages = [
      { component: AdminDashboard, name: 'Admin Dashboard' },
      { component: VolunteerManagement, name: 'Volunteer Management' },
      { component: DonationManagement, name: 'Donation Management' },
      { component: ContactManagement, name: 'Contact Management' }
    ]

    for (const page of pages) {
      // Mock API responses for each page
      fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          volunteers: [],
          donations: [],
          inquiries: [],
          pagination: { page: 1, limit: 10, total: 0, pages: 0 },
          ...mockDashboardData
        })
      })

      const { unmount } = renderWithProviders(<page.component />)
      
      await waitFor(() => {
        expect(screen.getByText(page.name)).toBeInTheDocument()
      })
      
      unmount()
    }
  })

  test('data consistency across management interfaces', async () => {
    // Test that volunteer data is consistent between dashboard and management
    const mockVolunteer = {
      _id: 'vol1',
      fullName: 'John Volunteer',
      email: 'john@volunteer.com',
      status: 'active',
      createdAt: '2024-01-15T10:00:00Z'
    }

    // Dashboard should show volunteer count
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...mockDashboardData.impact, volunteersActive: 1 })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockDashboardData.contacts
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ volunteers: [mockVolunteer] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ donations: [] })
      })

    const { unmount: unmountDashboard } = renderWithProviders(<AdminDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument() // Should show 1 active volunteer
    })
    
    unmountDashboard()

    // Volunteer management should show the same volunteer
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        volunteers: [mockVolunteer],
        pagination: { page: 1, limit: 10, total: 1, pages: 1 }
      })
    })

    renderWithProviders(<VolunteerManagement />)
    
    await waitFor(() => {
      expect(screen.getByText('John Volunteer')).toBeInTheDocument()
      expect(screen.getByText('active')).toBeInTheDocument()
    })
  })

  test('error handling is consistent across admin interfaces', async () => {
    const pages = [
      { component: AdminDashboard, errorText: 'Failed to load dashboard statistics' },
      { component: VolunteerManagement, errorText: 'API Error' },
      { component: DonationManagement, errorText: 'API Error' },
      { component: ContactManagement, errorText: 'API Error' }
    ]

    for (const page of pages) {
      fetch.mockRejectedValueOnce(new Error('API Error'))
      
      const { unmount } = renderWithProviders(<page.component />)
      
      await waitFor(() => {
        expect(screen.getByText(page.errorText)).toBeInTheDocument()
      })
      
      unmount()
    }
  })

  test('pagination works consistently across management interfaces', async () => {
    const mockPagination = {
      page: 1,
      limit: 10,
      total: 25,
      pages: 3
    }

    const managementPages = [
      { 
        component: VolunteerManagement, 
        mockData: { volunteers: [], pagination: mockPagination }
      },
      { 
        component: DonationManagement, 
        mockData: { donations: [], pagination: mockPagination }
      },
      { 
        component: ContactManagement, 
        mockData: { inquiries: [], pagination: mockPagination }
      }
    ]

    for (const page of managementPages) {
      // Mock stats call for donation management
      if (page.component === DonationManagement) {
        fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ totalAmount: 0, totalCount: 0, averageAmount: 0, monthlyAmount: 0 })
        })
      }

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => page.mockData
      })
      
      const { unmount } = renderWithProviders(<page.component />)
      
      await waitFor(() => {
        expect(screen.getByText('Showing 1 to 0 of 25 results')).toBeInTheDocument()
        expect(screen.getByText('Next')).toBeInTheDocument()
        expect(screen.getByText('Previous')).toBeInTheDocument()
      })
      
      unmount()
    }
  })

  test('search functionality works consistently', async () => {
    const user = userEvent.setup()
    
    const managementPages = [
      { 
        component: VolunteerManagement, 
        placeholder: 'Search volunteers...',
        mockData: { volunteers: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } }
      },
      { 
        component: DonationManagement, 
        placeholder: 'Search donations...',
        mockData: { donations: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } }
      },
      { 
        component: ContactManagement, 
        placeholder: 'Search inquiries...',
        mockData: { inquiries: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } }
      }
    ]

    for (const page of managementPages) {
      // Mock initial load
      if (page.component === DonationManagement) {
        fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ totalAmount: 0, totalCount: 0, averageAmount: 0, monthlyAmount: 0 })
        })
      }

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => page.mockData
      })
      
      const { unmount } = renderWithProviders(<page.component />)
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText(page.placeholder)).toBeInTheDocument()
      })

      const searchInput = screen.getByPlaceholderText(page.placeholder)
      
      // Mock search API call
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => page.mockData
      })
      
      await user.type(searchInput, 'test search')
      
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('search=test search'),
          expect.any(Object)
        )
      })
      
      unmount()
    }
  })

  test('status updates work across different entities', async () => {
    const user = userEvent.setup()
    
    // Test volunteer status update
    const mockVolunteer = {
      _id: 'vol1',
      fullName: 'John Volunteer',
      email: 'john@volunteer.com',
      status: 'new',
      areasOfInterest: ['Education'],
      availability: 'Weekends',
      createdAt: '2024-01-15T10:00:00Z'
    }

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        volunteers: [mockVolunteer],
        pagination: { page: 1, limit: 10, total: 1, pages: 1 }
      })
    })

    const { unmount: unmountVolunteer } = renderWithProviders(<VolunteerManagement />)
    
    await waitFor(() => {
      expect(screen.getByText('John Volunteer')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Manage'))
    
    await waitFor(() => {
      expect(screen.getByText('Update Status')).toBeInTheDocument()
    })

    // Mock status update and refresh
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Status updated' })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          volunteers: [{ ...mockVolunteer, status: 'accepted' }],
          pagination: { page: 1, limit: 10, total: 1, pages: 1 }
        })
      })

    await user.click(screen.getByText('accepted'))
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/volunteers/vol1/status'),
        expect.objectContaining({ method: 'PUT' })
      )
    })

    unmountVolunteer()

    // Test contact inquiry status update
    const mockInquiry = {
      _id: 'inq1',
      name: 'John Inquirer',
      email: 'john@inquirer.com',
      subject: 'General Inquiry',
      message: 'Test message',
      status: 'new',
      createdAt: '2024-01-15T10:00:00Z'
    }

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        inquiries: [mockInquiry],
        pagination: { page: 1, limit: 10, total: 1, pages: 1 }
      })
    })

    renderWithProviders(<ContactManagement />)
    
    await waitFor(() => {
      expect(screen.getByText('John Inquirer')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Manage'))
    
    await waitFor(() => {
      expect(screen.getByText('Update Status')).toBeInTheDocument()
    })

    // Mock status update and refresh
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Status updated' })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          inquiries: [{ ...mockInquiry, status: 'responded' }],
          pagination: { page: 1, limit: 10, total: 1, pages: 1 }
        })
      })

    await user.click(screen.getByText('Responded'))
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/contact/inq1/status'),
        expect.objectContaining({ method: 'PUT' })
      )
    })
  })

  test('admin authentication persists across page navigation', async () => {
    // Simulate navigation between admin pages
    const pages = [AdminDashboard, VolunteerManagement, DonationManagement, ContactManagement]
    
    for (let i = 0; i < pages.length; i++) {
      // Mock API responses
      fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          volunteers: [],
          donations: [],
          inquiries: [],
          pagination: { page: 1, limit: 10, total: 0, pages: 0 },
          totalAmount: 0,
          totalCount: 0,
          averageAmount: 0,
          monthlyAmount: 0,
          ...mockDashboardData
        })
      })

      const { unmount } = renderWithProviders(<pages[i] />)
      
      // Each page should render without requiring re-authentication
      await waitFor(() => {
        expect(screen.getByText(/Management|Dashboard/)).toBeInTheDocument()
      })
      
      // Should not see login form
      expect(screen.queryByText('Admin Login')).not.toBeInTheDocument()
      
      unmount()
    }
  })

  test('logout works from any admin page', async () => {
    const user = userEvent.setup()
    
    // Mock dashboard API calls
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockDashboardData.impact
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockDashboardData.contacts
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
      expect(screen.getByText('Logout')).toBeInTheDocument()
    })

    // Mock logout API call
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Logout successful' })
    })

    await user.click(screen.getByText('Logout'))
    
    await waitFor(() => {
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('adminToken')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('adminUser')
    })
  })
})