import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import VolunteerForm from '../VolunteerForm'

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('VolunteerForm', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  test('renders volunteer form with all required fields', () => {
    render(<VolunteerForm />)
    
    expect(screen.getByText('Volunteer Registration')).toBeInTheDocument()
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument()
    expect(screen.getByText('Areas of Interest')).toBeInTheDocument()
    expect(screen.getByText('Availability')).toBeInTheDocument()
  })

  test('shows validation errors for required fields', async () => {
    const user = userEvent.setup()
    render(<VolunteerForm />)
    
    const submitButton = screen.getByRole('button', { name: /submit volunteer application/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/full name is required/i)).toBeInTheDocument()
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
      expect(screen.getByText(/phone number is required/i)).toBeInTheDocument()
    })
  })

  test('validates email format', async () => {
    const user = userEvent.setup()
    render(<VolunteerForm />)
    
    const emailInput = screen.getByLabelText(/email address/i)
    await user.type(emailInput, 'invalid-email')
    
    const submitButton = screen.getByRole('button', { name: /submit volunteer application/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument()
    })
  })

  test('validates phone number format', async () => {
    const user = userEvent.setup()
    render(<VolunteerForm />)
    
    const phoneInput = screen.getByLabelText(/phone number/i)
    await user.type(phoneInput, '123')
    
    const submitButton = screen.getByRole('button', { name: /submit volunteer application/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid phone number/i)).toBeInTheDocument()
    })
  })

  test('requires at least one area of interest', async () => {
    const user = userEvent.setup()
    render(<VolunteerForm />)
    
    // Fill required fields but don't select any areas of interest
    await user.type(screen.getByLabelText(/full name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email address/i), 'john@example.com')
    await user.type(screen.getByLabelText(/phone number/i), '+91 98765 43210')
    
    const submitButton = screen.getByRole('button', { name: /submit volunteer application/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/please select at least one area of interest/i)).toBeInTheDocument()
    })
  })

  test('requires availability selection', async () => {
    const user = userEvent.setup()
    render(<VolunteerForm />)
    
    // Fill required fields but don't select availability
    await user.type(screen.getByLabelText(/full name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email address/i), 'john@example.com')
    await user.type(screen.getByLabelText(/phone number/i), '+91 98765 43210')
    
    // Select an area of interest
    const educationCheckbox = screen.getByLabelText(/education & tutoring/i)
    await user.click(educationCheckbox)
    
    const submitButton = screen.getByRole('button', { name: /submit volunteer application/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/please select your availability/i)).toBeInTheDocument()
    })
  })

  test('submits form with valid data', async () => {
    const user = userEvent.setup()
    const mockOnSuccess = vi.fn()
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: '123',
        fullName: 'John Doe',
        email: 'john@example.com',
        status: 'new',
        message: 'Application submitted successfully!'
      })
    })
    
    render(<VolunteerForm onSuccess={mockOnSuccess} />)
    
    // Fill all required fields
    await user.type(screen.getByLabelText(/full name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email address/i), 'john@example.com')
    await user.type(screen.getByLabelText(/phone number/i), '+91 98765 43210')
    
    // Select areas of interest
    const educationCheckbox = screen.getByLabelText(/education & tutoring/i)
    await user.click(educationCheckbox)
    
    // Select availability
    const weekendsRadio = screen.getByLabelText(/weekends only/i)
    await user.click(weekendsRadio)
    
    // Add optional fields
    await user.type(screen.getByLabelText(/previous volunteer experience/i), 'I have volunteered at local schools')
    await user.type(screen.getByLabelText(/why do you want to volunteer/i), 'I want to make a difference')
    
    const submitButton = screen.getByRole('button', { name: /submit volunteer application/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/volunteers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: 'John Doe',
          email: 'john@example.com',
          phone: '+91 98765 43210',
          areasOfInterest: ['Education & Tutoring'],
          availability: 'Weekends only',
          experience: 'I have volunteered at local schools',
          message: 'I want to make a difference'
        })
      })
    })
    
    // Should show success message
    await waitFor(() => {
      expect(screen.getByText(/thank you for volunteering!/i)).toBeInTheDocument()
    })
    
    expect(mockOnSuccess).toHaveBeenCalled()
  })

  test('handles API errors gracefully', async () => {
    const user = userEvent.setup()
    
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        message: 'A volunteer application with this email already exists'
      })
    })
    
    render(<VolunteerForm />)
    
    // Fill form with valid data
    await user.type(screen.getByLabelText(/full name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email address/i), 'john@example.com')
    await user.type(screen.getByLabelText(/phone number/i), '+91 98765 43210')
    
    const educationCheckbox = screen.getByLabelText(/education & tutoring/i)
    await user.click(educationCheckbox)
    
    const weekendsRadio = screen.getByLabelText(/weekends only/i)
    await user.click(weekendsRadio)
    
    const submitButton = screen.getByRole('button', { name: /submit volunteer application/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/a volunteer application with this email already exists/i)).toBeInTheDocument()
    })
  })

  test('shows loading state during submission', async () => {
    const user = userEvent.setup()
    
    // Mock a delayed response
    mockFetch.mockImplementationOnce(() => 
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: async () => ({ id: '123', message: 'Success' })
      }), 100))
    )
    
    render(<VolunteerForm />)
    
    // Fill form
    await user.type(screen.getByLabelText(/full name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email address/i), 'john@example.com')
    await user.type(screen.getByLabelText(/phone number/i), '+91 98765 43210')
    
    const educationCheckbox = screen.getByLabelText(/education & tutoring/i)
    await user.click(educationCheckbox)
    
    const weekendsRadio = screen.getByLabelText(/weekends only/i)
    await user.click(weekendsRadio)
    
    const submitButton = screen.getByRole('button', { name: /submit volunteer application/i })
    await user.click(submitButton)
    
    // Should show loading state
    expect(screen.getByText(/submitting application.../i)).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
  })

  test('allows multiple areas of interest selection', async () => {
    const user = userEvent.setup()
    render(<VolunteerForm />)
    
    const educationCheckbox = screen.getByLabelText(/education & tutoring/i)
    const healthcareCheckbox = screen.getByLabelText(/healthcare & medical support/i)
    const environmentCheckbox = screen.getByLabelText(/environmental conservation/i)
    
    await user.click(educationCheckbox)
    await user.click(healthcareCheckbox)
    await user.click(environmentCheckbox)
    
    expect(educationCheckbox).toBeChecked()
    expect(healthcareCheckbox).toBeChecked()
    expect(environmentCheckbox).toBeChecked()
  })

  test('allows only one availability selection', async () => {
    const user = userEvent.setup()
    render(<VolunteerForm />)
    
    const weekendsRadio = screen.getByLabelText(/weekends only/i)
    const weekdaysRadio = screen.getByLabelText(/weekdays only/i)
    
    await user.click(weekendsRadio)
    expect(weekendsRadio).toBeChecked()
    
    await user.click(weekdaysRadio)
    expect(weekdaysRadio).toBeChecked()
    expect(weekendsRadio).not.toBeChecked()
  })
})