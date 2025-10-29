import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import DonationManagement from '../DonationManagement'
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

// Mock URL.createObjectURL and related functions for CSV export
global.URL.createObjectURL = vi.fn(() => 'mock-url')
global.URL.revokeObjectURL = vi.fn()

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  )
}

describe('DonationManagement', () => {
  const mockUser = {
    id: '123',
    name: 'Admin User',
    email: 'admin@test.com',
    role: 'admin'
  }

  const mockDonations = [
    {
      _id: 'don1',
      fullName: 'John Donor',
      email: 'john@donor.com',
      phone: '+91 98765 43210',
      amountInInr: 5000,
      currency: 'INR',
      recurring: false,
      frequency: null,
      message: 'Happy to support your cause',
      paymentProvider: 'Razorpay',
      paymentStatus: 'completed',
      transactionId: 'txn_123456789',
      receiptSent: true,
      createdAt: '2024-01-15T10:00:00Z'
    },
    {
      _id: 'don2',
      fullName: 'Jane Supporter',
      email: 'jane@supporter.com',
      phone: null,
      amountInInr: 10000,
      currency: 'INR',
      recurring: true,
      frequency: 'monthly',
      message: null,
      paymentProvider: 'Razorpay',
      paymentStatus: 'pending',
      transactionId: null,
      receiptSent: false,
      createdAt: '2024-01-10T08:00:00Z'
    }
  ]

  const mockStats = {
    totalAmount: 2450000,
    totalCount: 156,
    averageAmount: 15705,
    monthlyAmount: 125000
  }

  const mockPagination = {
    page: 1,
    limit: 10,
    total: 2,
    pages: 1
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

  test('renders donation management page', async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          donations: mockDonations,
          pagination: mockPagination
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStats
      })
    
    renderWithProviders(<DonationManagement />)
    
    await waitFor(() => {
      expect(screen.getByText('Donation Management')).toBeInTheDocument()
      expect(screen.getByText('Track and manage donation transactions')).toBeInTheDocument()
    })
  })

  test('displays loading state initially', () => {
    fetch.mockImplementation(() => new Promise(() => {})) // Never resolves
    
    renderWithProviders(<DonationManagement />)
    
    expect(screen.getByText('Loading donations...')).toBeInTheDocument()
  })

  test('displays donation statistics', async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          donations: mockDonations,
          pagination: mockPagination
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStats
      })
    
    renderWithProviders(<DonationManagement />)
    
    await waitFor(() => {
      expect(screen.getByText('₹24,50,000')).toBeInTheDocument() // Total amount
      expect(screen.getByText('156')).toBeInTheDocument() // Total count
      expect(screen.getByText('₹15,705')).toBeInTheDocument() // Average amount
      expect(screen.getByText('₹1,25,000')).toBeInTheDocument() // Monthly amount
    })
  })

  test('displays donation list after loading', async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          donations: mockDonations,
          pagination: mockPagination
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStats
      })
    
    renderWithProviders(<DonationManagement />)
    
    await waitFor(() => {
      expect(screen.getByText('John Donor')).toBeInTheDocument()
      expect(screen.getByText('jane@supporter.com')).toBeInTheDocument()
      expect(screen.getByText('₹5,000')).toBeInTheDocument()
      expect(screen.getByText('₹10,000')).toBeInTheDocument()
    })
  })

  test('displays payment status badges correctly', async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          donations: mockDonations,
          pagination: mockPagination
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStats
      })
    
    renderWithProviders(<DonationManagement />)
    
    await waitFor(() => {
      expect(screen.getByText('completed')).toBeInTheDocument()
      expect(screen.getByText('pending')).toBeInTheDocument()
    })
  })

  test('shows recurring donation indicator', async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          donations: mockDonations,
          pagination: mockPagination
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStats
      })
    
    renderWithProviders(<DonationManagement />)
    
    await waitFor(() => {
      expect(screen.getByText('Recurring (monthly)')).toBeInTheDocument()
    })
  })

  test('search functionality works', async () => {
    const user = userEvent.setup()
    
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          donations: mockDonations,
          pagination: mockPagination
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStats
      })
    
    renderWithProviders(<DonationManagement />)
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search donations...')).toBeInTheDocument()
    })
    
    const searchInput = screen.getByPlaceholderText('Search donations...')
    
    // Mock search API call
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        donations: [mockDonations[0]], // Only John Donor
        pagination: { ...mockPagination, total: 1 }
      })
    })
    
    await user.type(searchInput, 'John')
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('search=John'),
        expect.any(Object)
      )
    })
  })

  test('status filter works', async () => {
    const user = userEvent.setup()
    
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          donations: mockDonations,
          pagination: mockPagination
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStats
      })
    
    renderWithProviders(<DonationManagement />)
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('All Statuses')).toBeInTheDocument()
    })
    
    const statusFilter = screen.getByDisplayValue('All Statuses')
    
    // Mock filtered API call
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        donations: [mockDonations[0]], // Only completed donation
        pagination: { ...mockPagination, total: 1 }
      })
    })
    
    await user.selectOptions(statusFilter, 'completed')
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('paymentStatus=completed'),
        expect.any(Object)
      )
    })
  })

  test('date range filter works', async () => {
    const user = userEvent.setup()
    
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          donations: mockDonations,
          pagination: mockPagination
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStats
      })
    
    renderWithProviders(<DonationManagement />)
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('From Date')).toBeInTheDocument()
    })
    
    const fromDateInput = screen.getByPlaceholderText('From Date')
    const toDateInput = screen.getByPlaceholderText('To Date')
    
    // Mock date filtered API call
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        donations: mockDonations,
        pagination: mockPagination
      })
    })
    
    await user.type(fromDateInput, '2024-01-01')
    await user.type(toDateInput, '2024-01-31')
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('dateFrom=2024-01-01'),
        expect.any(Object)
      )
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('dateTo=2024-01-31'),
        expect.any(Object)
      )
    })
  })

  test('opens donation detail modal', async () => {
    const user = userEvent.setup()
    
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          donations: mockDonations,
          pagination: mockPagination
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStats
      })
    
    renderWithProviders(<DonationManagement />)
    
    await waitFor(() => {
      expect(screen.getAllByText('View Details')[0]).toBeInTheDocument()
    })
    
    await user.click(screen.getAllByText('View Details')[0])
    
    await waitFor(() => {
      expect(screen.getByText('Donation Details')).toBeInTheDocument()
      expect(screen.getByText('John Donor')).toBeInTheDocument()
      expect(screen.getByText('john@donor.com')).toBeInTheDocument()
      expect(screen.getByText('txn_123456789')).toBeInTheDocument()
    })
  })

  test('CSV export functionality works', async () => {
    const user = userEvent.setup()
    
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          donations: mockDonations,
          pagination: mockPagination
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStats
      })
    
    renderWithProviders(<DonationManagement />)
    
    await waitFor(() => {
      expect(screen.getByText('Export CSV')).toBeInTheDocument()
    })
    
    // Mock CSV export API call
    const mockBlob = new Blob(['csv,data'], { type: 'text/csv' })
    fetch.mockResolvedValueOnce({
      ok: true,
      blob: async () => mockBlob
    })
    
    // Mock document.createElement and appendChild
    const mockAnchor = {
      href: '',
      download: '',
      click: vi.fn()
    }
    const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor)
    const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => {})
    const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => {})
    
    await user.click(screen.getByText('Export CSV'))
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('format=csv'),
        expect.any(Object)
      )
      expect(createElementSpy).toHaveBeenCalledWith('a')
      expect(mockAnchor.click).toHaveBeenCalled()
    })
    
    createElementSpy.mockRestore()
    appendChildSpy.mockRestore()
    removeChildSpy.mockRestore()
  })

  test('handles API errors gracefully', async () => {
    fetch.mockRejectedValueOnce(new Error('API Error'))
    
    renderWithProviders(<DonationManagement />)
    
    await waitFor(() => {
      expect(screen.getByText('API Error')).toBeInTheDocument()
    })
  })

  test('displays pagination when needed', async () => {
    const multiPagePagination = {
      page: 1,
      limit: 10,
      total: 25,
      pages: 3
    }
    
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          donations: mockDonations,
          pagination: multiPagePagination
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStats
      })
    
    renderWithProviders(<DonationManagement />)
    
    await waitFor(() => {
      expect(screen.getByText('Showing 1 to 2 of 25 results')).toBeInTheDocument()
      expect(screen.getByText('Next')).toBeInTheDocument()
    })
  })

  test('formats currency correctly', async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          donations: mockDonations,
          pagination: mockPagination
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStats
      })
    
    renderWithProviders(<DonationManagement />)
    
    await waitFor(() => {
      expect(screen.getByText('₹5,000')).toBeInTheDocument()
      expect(screen.getByText('₹10,000')).toBeInTheDocument()
    })
  })

  test('formats dates correctly', async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          donations: mockDonations,
          pagination: mockPagination
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStats
      })
    
    renderWithProviders(<DonationManagement />)
    
    await waitFor(() => {
      expect(screen.getByText('Jan 15, 2024, 10:00 AM')).toBeInTheDocument()
      expect(screen.getByText('Jan 10, 2024, 08:00 AM')).toBeInTheDocument()
    })
  })

  test('shows view donation page button', async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          donations: mockDonations,
          pagination: mockPagination
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStats
      })
    
    renderWithProviders(<DonationManagement />)
    
    await waitFor(() => {
      expect(screen.getByText('View Donation Page')).toBeInTheDocument()
    })
  })

  test('handles empty donation list', async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          donations: [],
          pagination: { page: 1, limit: 10, total: 0, pages: 0 }
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ totalAmount: 0, totalCount: 0, averageAmount: 0, monthlyAmount: 0 })
      })
    
    renderWithProviders(<DonationManagement />)
    
    await waitFor(() => {
      expect(screen.getByText('Donation Management')).toBeInTheDocument()
      expect(screen.getByText('₹0')).toBeInTheDocument() // Should show 0 for empty stats
    })
  })

  test('modal displays complete donation information', async () => {
    const user = userEvent.setup()
    
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          donations: mockDonations,
          pagination: mockPagination
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStats
      })
    
    renderWithProviders(<DonationManagement />)
    
    await waitFor(() => {
      expect(screen.getAllByText('View Details')[0]).toBeInTheDocument()
    })
    
    await user.click(screen.getAllByText('View Details')[0])
    
    await waitFor(() => {
      expect(screen.getByText('Donor Information')).toBeInTheDocument()
      expect(screen.getByText('Donation Details')).toBeInTheDocument()
      expect(screen.getByText('Payment Information')).toBeInTheDocument()
      expect(screen.getByText('Happy to support your cause')).toBeInTheDocument()
      expect(screen.getByText('Yes')).toBeInTheDocument() // Receipt sent
    })
  })
})