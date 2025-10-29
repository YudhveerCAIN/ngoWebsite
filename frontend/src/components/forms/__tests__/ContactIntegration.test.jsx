import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ContactForm from '../ContactForm'

// Mock fetch globally
global.fetch = vi.fn()

describe('ContactForm Integration', () => {
  const validContactData = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+91 98765 43210',
    subject: 'General Inquiry',
    message: 'I would like to know more about your programs and how I can contribute to your mission.'
  }

  beforeEach(() => {
    fetch.mockClear()
  })

  test('successfully submits contact form and shows success message', async () => {
    const user = userEvent.setup()
    
    // Mock successful API response
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: '507f1f77bcf86cd799439011',
        name: validContactData.name,
        email: validContactData.email,
        subject: validContactData.subject,
        status: 'new',
        createdAt: new Date().toISOString(),
        message: 'Your message has been sent successfully! We will get back to you within 24-48 hours.'
      })
    })
    
    render(<ContactForm />)
    
    // Fill out the form
    await user.type(screen.getByLabelText(/full name/i), validContactData.name)
    await user.type(screen.getByLabelText(/email address/i), validContactData.email)
    await user.type(screen.getByLabelText(/phone number/i), validContactData.phone)
    await user.selectOptions(screen.getByLabelText(/subject/i), validContactData.subject)
    await user.type(screen.getByLabelText(/message/i), validContactData.message)
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /send message/i })
    await user.click(submitButton)
    
    // Verify API call was made with correct data
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validContactData),
      })
    })
    
    // Verify success message is displayed
    await waitFor(() => {
      expect(screen.getByText('Message Sent Successfully!')).toBeInTheDocument()
      expect(screen.getByText(/Thank you for reaching out to us/)).toBeInTheDocument()
      expect(screen.getByText(/we will get back to you within 24-48 hours/)).toBeInTheDocument()
      expect(screen.getByText(/You should receive a confirmation email/)).toBeInTheDocument()
    })
  })

  test('handles server validation errors gracefully', async () => {
    const user = userEvent.setup()
    
    // Mock server validation error response
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        message: 'Validation failed',
        errors: [
          { field: 'email', message: 'Please provide a valid email address' },
          { field: 'message', message: 'Message must be at least 10 characters' }
        ]
      })
    })
    
    render(<ContactForm />)
    
    // Fill out form with invalid data
    await user.type(screen.getByLabelText(/full name/i), validContactData.name)
    await user.type(screen.getByLabelText(/email address/i), 'invalid-email')
    await user.selectOptions(screen.getByLabelText(/subject/i), validContactData.subject)
    await user.type(screen.getByLabelText(/message/i), 'Short')
    
    // Submit the form
    await user.click(screen.getByRole('button', { name: /send message/i }))
    
    // Verify error message is displayed
    await waitFor(() => {
      expect(screen.getByText('Validation failed')).toBeInTheDocument()
    })
  })

  test('handles network errors gracefully', async () => {
    const user = userEvent.setup()
    
    // Mock network error
    fetch.mockRejectedValueOnce(new Error('Network error'))
    
    render(<ContactForm />)
    
    // Fill out valid form
    await user.type(screen.getByLabelText(/full name/i), validContactData.name)
    await user.type(screen.getByLabelText(/email address/i), validContactData.email)
    await user.selectOptions(screen.getByLabelText(/subject/i), validContactData.subject)
    await user.type(screen.getByLabelText(/message/i), validContactData.message)
    
    // Submit the form
    await user.click(screen.getByRole('button', { name: /send message/i }))
    
    // Verify error message is displayed
    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument()
    })
  })

  test('handles server errors (500) gracefully', async () => {
    const user = userEvent.setup()
    
    // Mock server error
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({
        message: 'Internal server error'
      })
    })
    
    render(<ContactForm />)
    
    // Fill out valid form
    await user.type(screen.getByLabelText(/full name/i), validContactData.name)
    await user.type(screen.getByLabelText(/email address/i), validContactData.email)
    await user.selectOptions(screen.getByLabelText(/subject/i), validContactData.subject)
    await user.type(screen.getByLabelText(/message/i), validContactData.message)
    
    // Submit the form
    await user.click(screen.getByRole('button', { name: /send message/i }))
    
    // Verify error message is displayed
    await waitFor(() => {
      expect(screen.getByText('Internal server error')).toBeInTheDocument()
    })
  })

  test('form resets after successful submission', async () => {
    const user = userEvent.setup()
    
    // Mock successful response
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: '123',
        message: 'Success'
      })
    })
    
    render(<ContactForm />)
    
    const nameInput = screen.getByLabelText(/full name/i)
    const emailInput = screen.getByLabelText(/email address/i)
    const subjectSelect = screen.getByLabelText(/subject/i)
    const messageInput = screen.getByLabelText(/message/i)
    
    // Fill out form
    await user.type(nameInput, validContactData.name)
    await user.type(emailInput, validContactData.email)
    await user.selectOptions(subjectSelect, validContactData.subject)
    await user.type(messageInput, validContactData.message)
    
    // Verify form has values
    expect(nameInput).toHaveValue(validContactData.name)
    expect(emailInput).toHaveValue(validContactData.email)
    expect(subjectSelect).toHaveValue(validContactData.subject)
    expect(messageInput).toHaveValue(validContactData.message)
    
    // Submit form
    await user.click(screen.getByRole('button', { name: /send message/i }))
    
    // Wait for success message
    await waitFor(() => {
      expect(screen.getByText('Message Sent Successfully!')).toBeInTheDocument()
    })
    
    // Go back to form
    await user.click(screen.getByText('Send Another Message'))
    
    // Verify form is reset
    expect(nameInput).toHaveValue('')
    expect(emailInput).toHaveValue('')
    expect(subjectSelect).toHaveValue('')
    expect(messageInput).toHaveValue('')
  })

  test('shows loading state during submission', async () => {
    const user = userEvent.setup()
    
    // Mock delayed response
    fetch.mockImplementation(() => 
      new Promise(resolve => 
        setTimeout(() => resolve({
          ok: true,
          json: async () => ({ id: '123', message: 'Success' })
        }), 100)
      )
    )
    
    render(<ContactForm />)
    
    // Fill out form
    await user.type(screen.getByLabelText(/full name/i), validContactData.name)
    await user.type(screen.getByLabelText(/email address/i), validContactData.email)
    await user.selectOptions(screen.getByLabelText(/subject/i), validContactData.subject)
    await user.type(screen.getByLabelText(/message/i), validContactData.message)
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /send message/i })
    await user.click(submitButton)
    
    // Verify loading state
    expect(screen.getByText('Sending Message...')).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
    
    // Wait for completion
    await waitFor(() => {
      expect(screen.getByText('Message Sent Successfully!')).toBeInTheDocument()
    }, { timeout: 2000 })
  })

  test('calls onSuccess callback when provided', async () => {
    const user = userEvent.setup()
    const mockOnSuccess = vi.fn()
    
    const mockResponse = {
      id: '123',
      name: validContactData.name,
      email: validContactData.email,
      subject: validContactData.subject,
      status: 'new',
      message: 'Success'
    }
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    })
    
    render(<ContactForm onSuccess={mockOnSuccess} />)
    
    // Fill out and submit form
    await user.type(screen.getByLabelText(/full name/i), validContactData.name)
    await user.type(screen.getByLabelText(/email address/i), validContactData.email)
    await user.selectOptions(screen.getByLabelText(/subject/i), validContactData.subject)
    await user.type(screen.getByLabelText(/message/i), validContactData.message)
    
    await user.click(screen.getByRole('button', { name: /send message/i }))
    
    // Verify callback was called with response data
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith(mockResponse)
    })
  })

  test('works without optional phone field', async () => {
    const user = userEvent.setup()
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: '123', message: 'Success' })
    })
    
    render(<ContactForm />)
    
    // Fill out required fields only (skip phone)
    await user.type(screen.getByLabelText(/full name/i), validContactData.name)
    await user.type(screen.getByLabelText(/email address/i), validContactData.email)
    await user.selectOptions(screen.getByLabelText(/subject/i), validContactData.subject)
    await user.type(screen.getByLabelText(/message/i), validContactData.message)
    
    // Submit form
    await user.click(screen.getByRole('button', { name: /send message/i }))
    
    // Verify API call was made without phone field
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: validContactData.name,
          email: validContactData.email,
          subject: validContactData.subject,
          message: validContactData.message
        }),
      })
    })
    
    // Verify success
    await waitFor(() => {
      expect(screen.getByText('Message Sent Successfully!')).toBeInTheDocument()
    })
  })
})