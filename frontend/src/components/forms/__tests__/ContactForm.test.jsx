import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ContactForm from '../ContactForm'

// Mock fetch globally
global.fetch = vi.fn()

describe('ContactForm', () => {
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

  test('renders contact form with all required fields', () => {
    render(<ContactForm />)
    
    expect(screen.getByText('Contact Us')).toBeInTheDocument()
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/subject/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument()
  })

  test('displays validation errors for empty required fields', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)
    
    const submitButton = screen.getByRole('button', { name: /send message/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Full name is required')).toBeInTheDocument()
      expect(screen.getByText('Email is required')).toBeInTheDocument()
      expect(screen.getByText('Please select a subject')).toBeInTheDocument()
      expect(screen.getByText('Message is required')).toBeInTheDocument()
    })
  })

  test('validates email format', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)
    
    const emailInput = screen.getByLabelText(/email address/i)
    await user.type(emailInput, 'invalid-email')
    
    const submitButton = screen.getByRole('button', { name: /send message/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
    })
  })

  test('validates phone number format', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)
    
    const phoneInput = screen.getByLabelText(/phone number/i)
    await user.type(phoneInput, '123')
    
    const submitButton = screen.getByRole('button', { name: /send message/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid phone number')).toBeInTheDocument()
    })
  })

  test('validates name length', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)
    
    const nameInput = screen.getByLabelText(/full name/i)
    await user.type(nameInput, 'A')
    
    const submitButton = screen.getByRole('button', { name: /send message/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Name must be at least 2 characters')).toBeInTheDocument()
    })
  })

  test('validates message length', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)
    
    const messageInput = screen.getByLabelText(/message/i)
    await user.type(messageInput, 'Short')
    
    const submitButton = screen.getByRole('button', { name: /send message/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Message must be at least 10 characters')).toBeInTheDocument()
    })
  })

  test('validates message max length', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)
    
    const longMessage = 'A'.repeat(2001)
    const messageInput = screen.getByLabelText(/message/i)
    await user.type(messageInput, longMessage)
    
    const submitButton = screen.getByRole('button', { name: /send message/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Message must be less than 2000 characters')).toBeInTheDocument()
    })
  })

  test('submits form with valid data', async () => {
    const user = userEvent.setup()
    const mockOnSuccess = vi.fn()
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: '123',
        name: validContactData.name,
        email: validContactData.email,
        subject: validContactData.subject,
        status: 'new',
        message: 'Your message has been sent successfully!'
      })
    })
    
    render(<ContactForm onSuccess={mockOnSuccess} />)
    
    // Fill out the form
    await user.type(screen.getByLabelText(/full name/i), validContactData.name)
    await user.type(screen.getByLabelText(/email address/i), validContactData.email)
    await user.type(screen.getByLabelText(/phone number/i), validContactData.phone)
    await user.selectOptions(screen.getByLabelText(/subject/i), validContactData.subject)
    await user.type(screen.getByLabelText(/message/i), validContactData.message)
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /send message/i })
    await user.click(submitButton)
    
    // Verify API call
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validContactData),
      })
    })
    
    // Verify success callback
    expect(mockOnSuccess).toHaveBeenCalled()
  })

  test('displays loading state during submission', async () => {
    const user = userEvent.setup()
    
    fetch.mockImplementation(() => new Promise(resolve => 
      setTimeout(() => resolve({
        ok: true,
        json: async () => ({ id: '123', message: 'Success' })
      }), 100)
    ))
    
    render(<ContactForm />)
    
    // Fill out required fields
    await user.type(screen.getByLabelText(/full name/i), validContactData.name)
    await user.type(screen.getByLabelText(/email address/i), validContactData.email)
    await user.selectOptions(screen.getByLabelText(/subject/i), validContactData.subject)
    await user.type(screen.getByLabelText(/message/i), validContactData.message)
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /send message/i })
    await user.click(submitButton)
    
    // Check loading state
    expect(screen.getByText('Sending Message...')).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
  })

  test('displays error message on submission failure', async () => {
    const user = userEvent.setup()
    
    fetch.mockRejectedValueOnce(new Error('Network error'))
    
    render(<ContactForm />)
    
    // Fill out required fields
    await user.type(screen.getByLabelText(/full name/i), validContactData.name)
    await user.type(screen.getByLabelText(/email address/i), validContactData.email)
    await user.selectOptions(screen.getByLabelText(/subject/i), validContactData.subject)
    await user.type(screen.getByLabelText(/message/i), validContactData.message)
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /send message/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument()
    })
  })

  test('displays server validation errors', async () => {
    const user = userEvent.setup()
    
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        message: 'Validation failed',
        errors: [
          { field: 'email', message: 'Invalid email format' }
        ]
      })
    })
    
    render(<ContactForm />)
    
    // Fill out required fields
    await user.type(screen.getByLabelText(/full name/i), validContactData.name)
    await user.type(screen.getByLabelText(/email address/i), 'invalid-email')
    await user.selectOptions(screen.getByLabelText(/subject/i), validContactData.subject)
    await user.type(screen.getByLabelText(/message/i), validContactData.message)
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /send message/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Validation failed')).toBeInTheDocument()
    })
  })

  test('shows success message after successful submission', async () => {
    const user = userEvent.setup()
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: '123',
        name: validContactData.name,
        email: validContactData.email,
        subject: validContactData.subject,
        status: 'new',
        message: 'Your message has been sent successfully!'
      })
    })
    
    render(<ContactForm />)
    
    // Fill out and submit form
    await user.type(screen.getByLabelText(/full name/i), validContactData.name)
    await user.type(screen.getByLabelText(/email address/i), validContactData.email)
    await user.selectOptions(screen.getByLabelText(/subject/i), validContactData.subject)
    await user.type(screen.getByLabelText(/message/i), validContactData.message)
    
    const submitButton = screen.getByRole('button', { name: /send message/i })
    await user.click(submitButton)
    
    // Check success message
    await waitFor(() => {
      expect(screen.getByText('Message Sent Successfully!')).toBeInTheDocument()
      expect(screen.getByText(/Thank you for reaching out to us/)).toBeInTheDocument()
      expect(screen.getByText(/we will get back to you within 24-48 hours/)).toBeInTheDocument()
    })
  })

  test('allows sending another message after success', async () => {
    const user = userEvent.setup()
    
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        id: '123',
        message: 'Success'
      })
    })
    
    render(<ContactForm />)
    
    // Fill out and submit form
    await user.type(screen.getByLabelText(/full name/i), validContactData.name)
    await user.type(screen.getByLabelText(/email address/i), validContactData.email)
    await user.selectOptions(screen.getByLabelText(/subject/i), validContactData.subject)
    await user.type(screen.getByLabelText(/message/i), validContactData.message)
    
    await user.click(screen.getByRole('button', { name: /send message/i }))
    
    // Wait for success message
    await waitFor(() => {
      expect(screen.getByText('Message Sent Successfully!')).toBeInTheDocument()
    })
    
    // Click "Send Another Message"
    const anotherMessageButton = screen.getByText('Send Another Message')
    await user.click(anotherMessageButton)
    
    // Should show form again
    expect(screen.getByText('Contact Us')).toBeInTheDocument()
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
  })

  test('includes all subject options', () => {
    render(<ContactForm />)
    
    const subjectSelect = screen.getByLabelText(/subject/i)
    const expectedOptions = [
      'General Inquiry',
      'Volunteer Opportunities',
      'Partnership Proposal',
      'Donation Information',
      'Event Information',
      'Media & Press',
      'Feedback & Suggestions',
      'Other'
    ]
    
    expectedOptions.forEach(option => {
      expect(screen.getByRole('option', { name: option })).toBeInTheDocument()
    })
  })

  test('phone field is optional', async () => {
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
    
    // Submit should work without phone
    const submitButton = screen.getByRole('button', { name: /send message/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalled()
    })
  })

  test('form resets after successful submission', async () => {
    const user = userEvent.setup()
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: '123', message: 'Success' })
    })
    
    render(<ContactForm />)
    
    const nameInput = screen.getByLabelText(/full name/i)
    const emailInput = screen.getByLabelText(/email address/i)
    const messageInput = screen.getByLabelText(/message/i)
    
    // Fill out form
    await user.type(nameInput, validContactData.name)
    await user.type(emailInput, validContactData.email)
    await user.selectOptions(screen.getByLabelText(/subject/i), validContactData.subject)
    await user.type(messageInput, validContactData.message)
    
    // Submit form
    await user.click(screen.getByRole('button', { name: /send message/i }))
    
    // Wait for success and go back to form
    await waitFor(() => {
      expect(screen.getByText('Message Sent Successfully!')).toBeInTheDocument()
    })
    
    await user.click(screen.getByText('Send Another Message'))
    
    // Form should be reset
    expect(nameInput).toHaveValue('')
    expect(emailInput).toHaveValue('')
    expect(messageInput).toHaveValue('')
  })
})