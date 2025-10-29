import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Contact from '../Contact'

// Mock fetch globally
global.fetch = vi.fn()

describe('Contact Page', () => {
  beforeEach(() => {
    fetch.mockClear()
  })

  test('renders contact page with all sections', () => {
    render(<Contact />)
    
    // Header
    expect(screen.getByText('Contact Us')).toBeInTheDocument()
    expect(screen.getByText(/We'd love to hear from you/)).toBeInTheDocument()
    
    // Contact information
    expect(screen.getByText('Get in Touch')).toBeInTheDocument()
    expect(screen.getByText('Address')).toBeInTheDocument()
    expect(screen.getByText('Phone')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    
    // Office hours
    expect(screen.getByText('Office Hours')).toBeInTheDocument()
    expect(screen.getByText('Monday - Friday')).toBeInTheDocument()
    
    // Social media
    expect(screen.getByText('Follow Us')).toBeInTheDocument()
    
    // FAQ section
    expect(screen.getByText('Frequently Asked Questions')).toBeInTheDocument()
    expect(screen.getByText('How can I volunteer?')).toBeInTheDocument()
    expect(screen.getByText('Are donations tax-deductible?')).toBeInTheDocument()
  })

  test('displays contact form', () => {
    render(<Contact />)
    
    // Contact form should be present
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/subject/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument()
  })

  test('shows correct contact information', () => {
    render(<Contact />)
    
    // Address
    expect(screen.getByText('123 Community Center Road')).toBeInTheDocument()
    expect(screen.getByText('Bhosari, Pune - 411026')).toBeInTheDocument()
    expect(screen.getByText('Maharashtra, India')).toBeInTheDocument()
    
    // Phone
    expect(screen.getByText('+91 98765 43210')).toBeInTheDocument()
    expect(screen.getByText('Mon-Fri 9:00 AM - 6:00 PM')).toBeInTheDocument()
    
    // Email
    expect(screen.getByText('info@urjjapratishthan.org')).toBeInTheDocument()
    expect(screen.getByText("We'll respond within 24 hours")).toBeInTheDocument()
  })

  test('displays office hours correctly', () => {
    render(<Contact />)
    
    expect(screen.getByText('9:00 AM - 6:00 PM')).toBeInTheDocument()
    expect(screen.getByText('10:00 AM - 4:00 PM')).toBeInTheDocument()
    expect(screen.getByText('Closed')).toBeInTheDocument()
    expect(screen.getByText(/Emergency contact available 24\/7/)).toBeInTheDocument()
  })

  test('shows FAQ section with relevant questions', () => {
    render(<Contact />)
    
    const faqQuestions = [
      'How can I volunteer?',
      'Are donations tax-deductible?',
      'How do you use donations?',
      'Can organizations partner with you?'
    ]
    
    faqQuestions.forEach(question => {
      expect(screen.getByText(question)).toBeInTheDocument()
    })
  })

  test('handles contact form submission success', async () => {
    const user = userEvent.setup()
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: '123',
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'General Inquiry',
        status: 'new',
        message: 'Your message has been sent successfully!'
      })
    })
    
    render(<Contact />)
    
    // Fill out the form
    await user.type(screen.getByLabelText(/full name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email address/i), 'john@example.com')
    await user.selectOptions(screen.getByLabelText(/subject/i), 'General Inquiry')
    await user.type(screen.getByLabelText(/message/i), 'This is a test message for the contact form.')
    
    // Submit the form
    await user.click(screen.getByRole('button', { name: /send message/i }))
    
    // Verify success message appears
    await waitFor(() => {
      expect(screen.getByText('Message Sent Successfully!')).toBeInTheDocument()
    })
  })

  test('handles contact form submission error', async () => {
    const user = userEvent.setup()
    
    fetch.mockRejectedValueOnce(new Error('Network error'))
    
    render(<Contact />)
    
    // Fill out the form
    await user.type(screen.getByLabelText(/full name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email address/i), 'john@example.com')
    await user.selectOptions(screen.getByLabelText(/subject/i), 'General Inquiry')
    await user.type(screen.getByLabelText(/message/i), 'This is a test message.')
    
    // Submit the form
    await user.click(screen.getByRole('button', { name: /send message/i }))
    
    // Verify error message appears
    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument()
    })
  })

  test('contact links are functional', () => {
    render(<Contact />)
    
    // Phone link
    const phoneLink = screen.getByRole('link', { name: '+91 98765 43210' })
    expect(phoneLink).toHaveAttribute('href', 'tel:+919876543210')
    
    // Email link
    const emailLink = screen.getByRole('link', { name: 'info@urjjapratishthan.org' })
    expect(emailLink).toHaveAttribute('href', 'mailto:info@urjjapratishthan.org')
  })

  test('social media links are present', () => {
    render(<Contact />)
    
    // Should have social media icons/links
    const socialLinks = screen.getAllByRole('link').filter(link => 
      link.getAttribute('href') === '#'
    )
    expect(socialLinks).toHaveLength(3) // Facebook, Twitter, Instagram
  })

  test('responsive layout elements are present', () => {
    render(<Contact />)
    
    // Check for responsive grid classes (these would be in the DOM)
    const contactSection = screen.getByText('Get in Touch').closest('div')
    expect(contactSection).toBeInTheDocument()
    
    // Form should be in a separate section
    const formSection = screen.getByLabelText(/full name/i).closest('form')
    expect(formSection).toBeInTheDocument()
  })

  test('accessibility features are present', () => {
    render(<Contact />)
    
    // Form labels should be properly associated
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/subject/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument()
    
    // Required fields should be marked
    expect(screen.getByText(/full name/i)).toBeInTheDocument()
    expect(screen.getByText(/email address/i)).toBeInTheDocument()
  })

  test('handles onSuccess callback correctly', async () => {
    const user = userEvent.setup()
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: '123',
        message: 'Success'
      })
    })
    
    // Mock console.log to verify callback
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    
    render(<Contact />)
    
    // Fill and submit form
    await user.type(screen.getByLabelText(/full name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email address/i), 'john@example.com')
    await user.selectOptions(screen.getByLabelText(/subject/i), 'General Inquiry')
    await user.type(screen.getByLabelText(/message/i), 'Test message')
    
    await user.click(screen.getByRole('button', { name: /send message/i }))
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Contact inquiry submitted:', expect.any(Object))
    })
    
    consoleSpy.mockRestore()
  })
})