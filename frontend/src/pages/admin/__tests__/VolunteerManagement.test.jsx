import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import VolunteerManagement from '../VolunteerManagement'
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

describe('VolunteerManagement', () => {
  const mockUser = {
    id: '123',
    name: 'Admin User',
    email: 'admin@test.com',
    role: 'admin'
  }

  const mockVolunteers = [
    {
      _id: 'vol1',
      fullName: 'John Doe',
      email: 'john@example.com',
      phone: '+91 98765 43210',
      areasOfInterest: ['Education', 'Healthcare'],
      availability: 'Weekends',
      experience: '2 years in teaching',
      message: 'I want to help with education programs',
      status: 'new',
      createdAt: '2024-01-15T10:00:00Z',
      reviewedAt: null,
      notes: null
    },
    {
      _id: 'vol2',
      fullName: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+91 87654 32109',
      areasOfInterest: ['Environment', 'Community Development'],
      availability: 'Flexible',
      experience: null,
      message: 'Looking forward to contributing',
      status: 'accepted',
      createdAt: '2024-01-10T08:00:00Z',
      reviewedAt: '2024-01-12T14:00:00Z',
      notes: 'Great candidate for environment programs'
    }
  ]

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

  test('renders volunteer management page', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        volunteers: mockVolunteers,
        pagination: mockPagination
      })
    })
    
    renderWithProviders(<VolunteerManagement />)
    
    await waitFor(() => {
      expect(screen.getByText('Volunteer Management')).toBeInTheDocument()
      expect(screen.getByText('Manage volunteer applications and status updates')).toBeInTheDocument()
    })
  })

  test('displays loading state initially', () => {
    fetch.mockImplementation(() => new Promise(() => {})) // Never resolves
    
    renderWithProviders(<VolunteerManagement />)
    
    expect(screen.getByText('Loading volunteers...')).toBeInTheDocument()
  })

  test('displays volunteer list after loading', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        volunteers: mockVolunteers,
        pagination: mockPagination
      })
    })
    
    renderWithProviders(<VolunteerManagement />)
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('jane@example.com')).toBeInTheDocument()
      expect(screen.getByText('Education')).toBeInTheDocument()
      expect(screen.getByText('Healthcare')).toBeInTheDocument()
    })
  })

  test('displays volunteer status badges correctly', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        volunteers: mockVolunteers,
        pagination: mockPagination
      })
    })
    
    renderWithProviders(<VolunteerManagement />)
    
    await waitFor(() => {
      expect(screen.getByText('new')).toBeInTheDocument()
      expect(screen.getByText('accepted')).toBeInTheDocument()
    })
  })

  test('search functionality works', async () => {
    const user = userEvent.setup()
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        volunteers: mockVolunteers,
        pagination: mockPagination
      })
    })
    
    renderWithProviders(<VolunteerManagement />)
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search volunteers...')).toBeInTheDocument()
    })
    
    const searchInput = screen.getByPlaceholderText('Search volunteers...')
    
    // Mock search API call
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        volunteers: [mockVolunteers[0]], // Only John Doe
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
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        volunteers: mockVolunteers,
        pagination: mockPagination
      })
    })
    
    renderWithProviders(<VolunteerManagement />)
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('All Statuses')).toBeInTheDocument()
    })
    
    const statusFilter = screen.getByDisplayValue('All Statuses')
    
    // Mock filtered API call
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        volunteers: [mockVolunteers[1]], // Only accepted volunteer
        pagination: { ...mockPagination, total: 1 }
      })
    })
    
    await user.selectOptions(statusFilter, 'accepted')
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('status=accepted'),
        expect.any(Object)
      )
    })
  })

  test('opens volunteer detail modal', async () => {
    const user = userEvent.setup()
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        volunteers: mockVolunteers,
        pagination: mockPagination
      })
    })
    
    renderWithProviders(<VolunteerManagement />)
    
    await waitFor(() => {
      expect(screen.getAllByText('Manage')[0]).toBeInTheDocument()
    })
    
    await user.click(screen.getAllByText('Manage')[0])
    
    await waitFor(() => {
      expect(screen.getByText('Manage Volunteer')).toBeInTheDocument()
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('john@example.com')).toBeInTheDocument()
      expect(screen.getByText('2 years in teaching')).toBeInTheDocument()
    })
  })

  test('updates volunteer status', async () => {
    const user = userEvent.setup()
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        volunteers: mockVolunteers,
        pagination: mockPagination
      })
    })
    
    renderWithProviders(<VolunteerManagement />)
    
    await waitFor(() => {
      expect(screen.getAllByText('Manage')[0]).toBeInTheDocument()
    })
    
    await user.click(screen.getAllByText('Manage')[0])
    
    await waitFor(() => {
      expect(screen.getByText('Update Status')).toBeInTheDocument()
    })
    
    // Mock status update API call
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Status updated successfully' })
    })
    
    // Mock refresh API call
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        volunteers: mockVolunteers,
        pagination: mockPagination
      })
    })
    
    await user.click(screen.getByText('accepted'))
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/volunteers/vol1/status'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ status: 'accepted', notes: '' })
        })
      )
    })
  })

  test('handles API errors gracefully', async () => {
    fetch.mockRejectedValueOnce(new Error('API Error'))
    
    renderWithProviders(<VolunteerManagement />)
    
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
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        volunteers: mockVolunteers,
        pagination: multiPagePagination
      })
    })
    
    renderWithProviders(<VolunteerManagement />)
    
    await waitFor(() => {
      expect(screen.getByText('Showing 1 to 2 of 25 results')).toBeInTheDocument()
      expect(screen.getByText('Next')).toBeInTheDocument()
    })
  })

  test('pagination navigation works', async () => {
    const user = userEvent.setup()
    
    const multiPagePagination = {
      page: 1,
      limit: 10,
      total: 25,
      pages: 3
    }
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        volunteers: mockVolunteers,
        pagination: multiPagePagination
      })
    })
    
    renderWithProviders(<VolunteerManagement />)
    
    await waitFor(() => {
      expect(screen.getByText('Next')).toBeInTheDocument()
    })
    
    // Mock next page API call
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        volunteers: [],
        pagination: { ...multiPagePagination, page: 2 }
      })
    })
    
    await user.click(screen.getByText('Next'))
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('page=2'),
        expect.any(Object)
      )
    })
  })

  test('displays volunteer interests correctly', async () => {
    const volunteerWithManyInterests = {
      ...mockVolunteers[0],
      areasOfInterest: ['Education', 'Healthcare', 'Environment', 'Community Development', 'Technology']
    }
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        volunteers: [volunteerWithManyInterests],
        pagination: mockPagination
      })
    })
    
    renderWithProviders(<VolunteerManagement />)
    
    await waitFor(() => {
      expect(screen.getByText('Education')).toBeInTheDocument()
      expect(screen.getByText('Healthcare')).toBeInTheDocument()
      expect(screen.getByText('+3 more')).toBeInTheDocument() // Shows only first 2 + count
    })
  })

  test('formats dates correctly', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        volunteers: mockVolunteers,
        pagination: mockPagination
      })
    })
    
    renderWithProviders(<VolunteerManagement />)
    
    await waitFor(() => {
      expect(screen.getByText('Jan 15, 2024')).toBeInTheDocument()
      expect(screen.getByText('Jan 10, 2024')).toBeInTheDocument()
    })
  })

  test('shows view public form button', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        volunteers: mockVolunteers,
        pagination: mockPagination
      })
    })
    
    renderWithProviders(<VolunteerManagement />)
    
    await waitFor(() => {
      expect(screen.getByText('View Public Form')).toBeInTheDocument()
    })
  })

  test('handles empty volunteer list', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        volunteers: [],
        pagination: { page: 1, limit: 10, total: 0, pages: 0 }
      })
    })
    
    renderWithProviders(<VolunteerManagement />)
    
    await waitFor(() => {
      expect(screen.getByText('Volunteer Management')).toBeInTheDocument()
      // Should show empty table or no results message
    })
  })

  test('modal closes correctly', async () => {
    const user = userEvent.setup()
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        volunteers: mockVolunteers,
        pagination: mockPagination
      })
    })
    
    renderWithProviders(<VolunteerManagement />)
    
    await waitFor(() => {
      expect(screen.getAllByText('Manage')[0]).toBeInTheDocument()
    })
    
    await user.click(screen.getAllByText('Manage')[0])
    
    await waitFor(() => {
      expect(screen.getByText('Manage Volunteer')).toBeInTheDocument()
    })
    
    // Close modal by clicking outside or close button
    const modal = screen.getByRole('dialog')
    expect(modal).toBeInTheDocument()
    
    // Simulate ESC key or close button click
    fireEvent.keyDown(modal, { key: 'Escape', code: 'Escape' })
    
    await waitFor(() => {
      expect(screen.queryByText('Manage Volunteer')).not.toBeInTheDocument()
    })
  })
})