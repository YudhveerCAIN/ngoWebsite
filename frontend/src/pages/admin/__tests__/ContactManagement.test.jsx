import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import ContactManagement from '../ContactManagement'
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

describe('ContactManagement', () => {
  const mockUser = {
    id: '123',
    name: 'Admin User',
    email: 'admin@test.com',
    role: 'admin'
  }

  const mockInquiries = [
    {
      _id: 'inq1',
      name: 'John Inquirer',
      email: 'john@inquirer.com',
      phone: '+91 98765 43210',
      subject: 'General Inquiry',
      message: 'I would like to know more about your programs and how I can contribute to your mission.',
      status: 'new',
      response: null,
      createdAt: '2024-01-15T10:00:00Z'
    },
    {
      _id: 'inq2',
      name: 'Jane Questioner',
      email: 'jane@questioner.com',
      phone: null,
      subject: 'Volunteer Opportunities',
      message: 'Are there any volunteer opportunities available for weekends?',
      status: 'responded',
      response: 'Thank you for your interest. We have several weekend volunteer opportunities available.',
      createdAt: '2024-01-10T08:00:00Z'
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

  test('renders contact management page', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        inquiries: mockInquiries,
        pagination: mockPagination
      })
    })
    
    renderWithProviders(<ContactManagement />)
    
    await waitFor(() => {
      expect(screen.getByText('Contact Management')).toBeInTheDocument()
      expect(screen.getByText('Manage and respond to contact inquiries')).toBeInTheDocument()
    })
  })

  test('displays loading state initially', () => {
    fetch.mockImplementation(() => new Promise(() => {})) // Never resolves
    
    renderWithProviders(<ContactManagement />)
    
    expect(screen.getByText('Loading contact inquiries...')).toBeInTheDocument()
  })

  test('displays inquiry list after loading', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        inquiries: mockInquiries,
        pagination: mockPagination
      })
    })
    
    renderWithProviders(<ContactManagement />)
    
    await waitFor(() => {
      expect(screen.getByText('John Inquirer')).toBeInTheDocument()
      expect(screen.getByText('jane@questioner.com')).toBeInTheDocument()
      expect(screen.getByText('General Inquiry')).toBeInTheDocument()
      expect(screen.getByText('Volunteer Opportunities')).toBeInTheDocument()
    })
  })

  test('displays inquiry status badges correctly', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        inquiries: mockInquiries,
        pagination: mockPagination
      })
    })
    
    renderWithProviders(<ContactManagement />)
    
    await waitFor(() => {
      expect(screen.getByText('new')).toBeInTheDocument()
      expect(screen.getByText('responded')).toBeInTheDocument()
    })
  })

  test('truncates long messages in table', async () => {
    const inquiryWithLongMessage = {
      ...mockInquiries[0],
      message: 'This is a very long message that should be truncated in the table view to prevent the table from becoming too wide and difficult to read. It contains a lot of information about the inquiry.'
    }
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        inquiries: [inquiryWithLongMessage],
        pagination: mockPagination
      })
    })
    
    renderWithProviders(<ContactManagement />)
    
    await waitFor(() => {
      // Should show truncated message in table
      const messageCell = screen.getByText(/This is a very long message/)
      expect(messageCell).toHaveClass('truncate')
    })
  })

  test('search functionality works', async () => {
    const user = userEvent.setup()
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        inquiries: mockInquiries,
        pagination: mockPagination
      })
    })
    
    renderWithProviders(<ContactManagement />)
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search inquiries...')).toBeInTheDocument()
    })
    
    const searchInput = screen.getByPlaceholderText('Search inquiries...')
    
    // Mock search API call
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        inquiries: [mockInquiries[0]], // Only John Inquirer
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
        inquiries: mockInquiries,
        pagination: mockPagination
      })
    })
    
    renderWithProviders(<ContactManagement />)
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('All Statuses')).toBeInTheDocument()
    })
    
    const statusFilter = screen.getByDisplayValue('All Statuses')
    
    // Mock filtered API call
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        inquiries: [mockInquiries[1]], // Only responded inquiry
        pagination: { ...mockPagination, total: 1 }
      })
    })
    
    await user.selectOptions(statusFilter, 'responded')
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('status=responded'),
        expect.any(Object)
      )
    })
  })

  test('opens inquiry detail modal', async () => {
    const user = userEvent.setup()
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        inquiries: mockInquiries,
        pagination: mockPagination
      })
    })
    
    renderWithProviders(<ContactManagement />)
    
    await waitFor(() => {
      expect(screen.getAllByText('Manage')[0]).toBeInTheDocument()
    })
    
    await user.click(screen.getAllByText('Manage')[0])
    
    await waitFor(() => {
      expect(screen.getByText('Manage Contact Inquiry')).toBeInTheDocument()
      expect(screen.getByText('John Inquirer')).toBeInTheDocument()
      expect(screen.getByText('john@inquirer.com')).toBeInTheDocument()
      expect(screen.getByText('I would like to know more about your programs')).toBeInTheDocument()
    })
  })

  test('displays full message in modal', async () => {
    const user = userEvent.setup()
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        inquiries: mockInquiries,
        pagination: mockPagination
      })
    })
    
    renderWithProviders(<ContactManagement />)
    
    await waitFor(() => {
      expect(screen.getAllByText('Manage')[0]).toBeInTheDocument()
    })
    
    await user.click(screen.getAllByText('Manage')[0])
    
    await waitFor(() => {
      expect(screen.getByText('I would like to know more about your programs and how I can contribute to your mission.')).toBeInTheDocument()
    })
  })

  test('updates inquiry status', async () => {
    const user = userEvent.setup()
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        inquiries: mockInquiries,
        pagination: mockPagination
      })
    })
    
    renderWithProviders(<ContactManagement />)
    
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
        inquiries: mockInquiries,
        pagination: mockPagination
      })
    })
    
    await user.click(screen.getByText('Responded'))
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/contact/inq1/status'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ status: 'responded', response: '' })
        })
      )
    })
  })

  test('adds response note when updating status', async () => {
    const user = userEvent.setup()
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        inquiries: mockInquiries,
        pagination: mockPagination
      })
    })
    
    renderWithProviders(<ContactManagement />)
    
    await waitFor(() => {
      expect(screen.getAllByText('Manage')[0]).toBeInTheDocument()
    })
    
    await user.click(screen.getAllByText('Manage')[0])
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Add a response note (for internal tracking)...')).toBeInTheDocument()
    })
    
    const responseTextarea = screen.getByPlaceholderText('Add a response note (for internal tracking)...')
    await user.type(responseTextarea, 'Contacted via email')
    
    // Mock status update API call
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Status updated successfully' })
    })
    
    // Mock refresh API call
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        inquiries: mockInquiries,
        pagination: mockPagination
      })
    })
    
    await user.click(screen.getByText('Responded'))
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/contact/inq1/status'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ status: 'responded', response: 'Contacted via email' })
        })
      )
    })
  })

  test('displays previous response when available', async () => {
    const user = userEvent.setup()
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        inquiries: mockInquiries,
        pagination: mockPagination
      })
    })
    
    renderWithProviders(<ContactManagement />)
    
    await waitFor(() => {
      expect(screen.getAllByText('Manage')[1]).toBeInTheDocument()
    })
    
    await user.click(screen.getAllByText('Manage')[1]) // Click on Jane's inquiry
    
    await waitFor(() => {
      expect(screen.getByText('Previous Response')).toBeInTheDocument()
      expect(screen.getByText('Thank you for your interest. We have several weekend volunteer opportunities available.')).toBeInTheDocument()
    })
  })

  test('quick actions work correctly', async () => {
    const user = userEvent.setup()
    
    // Mock window.open
    const mockOpen = vi.fn()
    global.window.open = mockOpen
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        inquiries: mockInquiries,
        pagination: mockPagination
      })
    })
    
    renderWithProviders(<ContactManagement />)
    
    await waitFor(() => {
      expect(screen.getAllByText('Manage')[0]).toBeInTheDocument()
    })
    
    await user.click(screen.getAllByText('Manage')[0])
    
    await waitFor(() => {
      expect(screen.getByText('Reply via Email')).toBeInTheDocument()
      expect(screen.getByText('Call')).toBeInTheDocument()
    })
    
    await user.click(screen.getByText('Reply via Email'))
    
    expect(mockOpen).toHaveBeenCalledWith(
      'mailto:john@inquirer.com?subject=Re: General Inquiry',
      '_blank'
    )
    
    await user.click(screen.getByText('Call'))
    
    expect(mockOpen).toHaveBeenCalledWith(
      'tel:+91 98765 43210',
      '_blank'
    )
  })

  test('handles inquiries without phone numbers', async () => {
    const user = userEvent.setup()
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        inquiries: mockInquiries,
        pagination: mockPagination
      })
    })
    
    renderWithProviders(<ContactManagement />)
    
    await waitFor(() => {
      expect(screen.getAllByText('Manage')[1]).toBeInTheDocument()
    })
    
    await user.click(screen.getAllByText('Manage')[1]) // Jane's inquiry (no phone)
    
    await waitFor(() => {
      expect(screen.getByText('Reply via Email')).toBeInTheDocument()
      expect(screen.queryByText('Call')).not.toBeInTheDocument() // Should not show call button
    })
  })

  test('handles API errors gracefully', async () => {
    fetch.mockRejectedValueOnce(new Error('API Error'))
    
    renderWithProviders(<ContactManagement />)
    
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
        inquiries: mockInquiries,
        pagination: multiPagePagination
      })
    })
    
    renderWithProviders(<ContactManagement />)
    
    await waitFor(() => {
      expect(screen.getByText('Showing 1 to 2 of 25 results')).toBeInTheDocument()
      expect(screen.getByText('Next')).toBeInTheDocument()
    })
  })

  test('formats dates correctly', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        inquiries: mockInquiries,
        pagination: mockPagination
      })
    })
    
    renderWithProviders(<ContactManagement />)
    
    await waitFor(() => {
      expect(screen.getByText('Jan 15, 2024, 10:00 AM')).toBeInTheDocument()
      expect(screen.getByText('Jan 10, 2024, 08:00 AM')).toBeInTheDocument()
    })
  })

  test('shows view contact page button', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        inquiries: mockInquiries,
        pagination: mockPagination
      })
    })
    
    renderWithProviders(<ContactManagement />)
    
    await waitFor(() => {
      expect(screen.getByText('View Contact Page')).toBeInTheDocument()
    })
  })

  test('handles empty inquiry list', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        inquiries: [],
        pagination: { page: 1, limit: 10, total: 0, pages: 0 }
      })
    })
    
    renderWithProviders(<ContactManagement />)
    
    await waitFor(() => {
      expect(screen.getByText('Contact Management')).toBeInTheDocument()
      // Should show empty table or no results message
    })
  })

  test('modal closes correctly', async () => {
    const user = userEvent.setup()
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        inquiries: mockInquiries,
        pagination: mockPagination
      })
    })
    
    renderWithProviders(<ContactManagement />)
    
    await waitFor(() => {
      expect(screen.getAllByText('Manage')[0]).toBeInTheDocument()
    })
    
    await user.click(screen.getAllByText('Manage')[0])
    
    await waitFor(() => {
      expect(screen.getByText('Manage Contact Inquiry')).toBeInTheDocument()
    })
    
    // Close modal by clicking outside or close button
    const modal = screen.getByRole('dialog')
    expect(modal).toBeInTheDocument()
    
    // Simulate ESC key or close button click
    fireEvent.keyDown(modal, { key: 'Escape', code: 'Escape' })
    
    await waitFor(() => {
      expect(screen.queryByText('Manage Contact Inquiry')).not.toBeInTheDocument()
    })
  })

  test('displays contact information as clickable links', async () => {
    const user = userEvent.setup()
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        inquiries: mockInquiries,
        pagination: mockPagination
      })
    })
    
    renderWithProviders(<ContactManagement />)
    
    await waitFor(() => {
      expect(screen.getAllByText('Manage')[0]).toBeInTheDocument()
    })
    
    await user.click(screen.getAllByText('Manage')[0])
    
    await waitFor(() => {
      const emailLink = screen.getByText('john@inquirer.com')
      const phoneLink = screen.getByText('+91 98765 43210')
      
      expect(emailLink.closest('a')).toHaveAttribute('href', 'mailto:john@inquirer.com')
      expect(phoneLink.closest('a')).toHaveAttribute('href', 'tel:+91 98765 43210')
    })
  })
})