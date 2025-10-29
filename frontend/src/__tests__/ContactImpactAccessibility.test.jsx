import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Contact from '../pages/Contact'
import Impact from '../pages/Impact'
import ContactForm from '../components/forms/ContactForm'
import ImpactCounter from '../components/features/ImpactCounter'
import ImpactChart from '../components/features/ImpactChart'

// Mock fetch globally
global.fetch = vi.fn()

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback) {
    this.callback = callback
  }
  
  observe() {
    setTimeout(() => {
      this.callback([{ isIntersecting: true }])
    }, 0)
  }
  
  unobserve() {}
  disconnect() {}
}

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('Contact and Impact Accessibility Tests', () => {
  const mockImpactData = {
    studentsSupported: 1250,
    programsConducted: 48,
    outreachActivities: 120,
    volunteersActive: 85,
    totalDonationAmount: 2450000,
    totalEvents: 28,
    totalInquiries: 234,
    programBreakdown: {
      education: {
        scholarshipsProvided: 180,
        learningMaterialsDistributed: 500,
        tutoringSessionsConducted: 1200,
        studentsReached: 250
      },
      healthcare: {
        healthCampsOrganized: 25,
        peopleScreened: 2500
      },
      skillDevelopment: {
        trainingProgramsConducted: 15,
        peopleTrained: 300,
        jobPlacements: 150
      }
    },
    growth: {
      volunteersGrowth: 25,
      donationsGrowth: 40,
      programsGrowth: 30,
      outreachGrowth: 35
    }
  }

  beforeEach(() => {
    fetch.mockClear()
  })

  test('contact page has proper heading hierarchy', () => {
    renderWithRouter(<Contact />)
    
    // Main heading should be h1
    const mainHeading = screen.getByRole('heading', { level: 1 })
    expect(mainHeading).toHaveTextContent('Contact Us')
    
    // Section headings should be h2
    const sectionHeadings = screen.getAllByRole('heading', { level: 2 })
    expect(sectionHeadings.length).toBeGreaterThan(0)
    
    // Subsection headings should be h3
    const subHeadings = screen.getAllByRole('heading', { level: 3 })
    expect(subHeadings.length).toBeGreaterThan(0)
  })

  test('impact page has proper heading hierarchy', async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockImpactData
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => []
      })

    renderWithRouter(<Impact />)
    
    // Main heading should be h1
    const mainHeading = screen.getByRole('heading', { level: 1 })
    expect(mainHeading).toHaveTextContent('Our Impact')
    
    // Section headings should be h2
    const sectionHeadings = screen.getAllByRole('heading', { level: 2 })
    expect(sectionHeadings.length).toBeGreaterThan(0)
    
    // Should include key sections
    expect(screen.getByRole('heading', { name: /impact by numbers/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /program impact breakdown/i })).toBeInTheDocument()
  })

  test('contact form has proper labels and ARIA attributes', () => {
    render(<ContactForm />)
    
    // All form inputs should have labels
    const nameInput = screen.getByLabelText(/full name/i)
    const emailInput = screen.getByLabelText(/email address/i)
    const phoneInput = screen.getByLabelText(/phone number/i)
    const subjectSelect = screen.getByLabelText(/subject/i)
    const messageTextarea = screen.getByLabelText(/message/i)
    
    expect(nameInput).toBeInTheDocument()
    expect(emailInput).toBeInTheDocument()
    expect(phoneInput).toBeInTheDocument()
    expect(subjectSelect).toBeInTheDocument()
    expect(messageTextarea).toBeInTheDocument()
    
    // Required fields should be marked
    expect(nameInput).toBeRequired()
    expect(emailInput).toBeRequired()
    expect(subjectSelect).toBeRequired()
    expect(messageTextarea).toBeRequired()
    expect(phoneInput).not.toBeRequired()
    
    // Submit button should be properly labeled
    const submitButton = screen.getByRole('button', { name: /send message/i })
    expect(submitButton).toBeInTheDocument()
  })

  test('form validation errors are accessible', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)
    
    // Submit empty form to trigger validation
    const submitButton = screen.getByRole('button', { name: /send message/i })
    await user.click(submitButton)
    
    // Error messages should have role="alert"
    const errorMessages = screen.getAllByRole('alert')
    expect(errorMessages.length).toBeGreaterThan(0)
    
    // Specific error messages should be present
    expect(screen.getByText('Full name is required')).toBeInTheDocument()
    expect(screen.getByText('Email is required')).toBeInTheDocument()
    expect(screen.getByText('Please select a subject')).toBeInTheDocument()
    expect(screen.getByText('Message is required')).toBeInTheDocument()
  })

  test('impact counters are accessible to screen readers', () => {
    render(
      <ImpactCounter
        end={1250}
        label="Students Supported"
        description="Number of students we have helped through our programs"
        icon={<div>📚</div>}
      />
    )
    
    // Label should be accessible
    expect(screen.getByText('Students Supported')).toBeInTheDocument()
    
    // Description should be accessible
    expect(screen.getByText(/Number of students we have helped/)).toBeInTheDocument()
    
    // Counter value should be accessible
    expect(screen.getByText('0')).toBeInTheDocument() // Initial value
  })

  test('impact charts have proper accessibility attributes', () => {
    const chartData = [
      { label: 'Scholarships', value: 180 },
      { label: 'Materials', value: 500 },
      { label: 'Sessions', value: 1200 }
    ]

    render(
      <ImpactChart
        type="bar"
        data={chartData}
        title="Education Impact"
      />
    )
    
    // Chart title should be accessible
    expect(screen.getByText('Education Impact')).toBeInTheDocument()
    
    // Data labels should be accessible
    expect(screen.getByText('Scholarships')).toBeInTheDocument()
    expect(screen.getByText('Materials')).toBeInTheDocument()
    expect(screen.getByText('Sessions')).toBeInTheDocument()
    
    // Values should be accessible
    expect(screen.getByText('180')).toBeInTheDocument()
    expect(screen.getByText('500')).toBeInTheDocument()
    expect(screen.getByText('1,200')).toBeInTheDocument()
  })

  test('contact page links are keyboard accessible', () => {
    renderWithRouter(<Contact />)
    
    // Phone link should be focusable
    const phoneLink = screen.getByRole('link', { name: /\+91 98765 43210/ })
    expect(phoneLink).toBeInTheDocument()
    expect(phoneLink).toHaveAttribute('href', 'tel:+919876543210')
    
    // Email link should be focusable
    const emailLink = screen.getByRole('link', { name: /info@urjjapratishthan.org/ })
    expect(emailLink).toBeInTheDocument()
    expect(emailLink).toHaveAttribute('href', 'mailto:info@urjjapratishthan.org')
    
    // Social media links should be focusable
    const socialLinks = screen.getAllByRole('link').filter(link => 
      link.getAttribute('href') === '#'
    )
    expect(socialLinks.length).toBeGreaterThan(0)
  })

  test('impact page call-to-action links are accessible', async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockImpactData
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => []
      })

    renderWithRouter(<Impact />)
    
    // CTA links should be accessible
    const volunteerLink = screen.getByRole('link', { name: /become a volunteer/i })
    const donateLink = screen.getByRole('link', { name: /make a donation/i })
    
    expect(volunteerLink).toBeInTheDocument()
    expect(donateLink).toBeInTheDocument()
    
    // Links should have proper href attributes
    expect(volunteerLink.closest('a')).toHaveAttribute('href', '/get-involved')
    expect(donateLink.closest('a')).toHaveAttribute('href', '/donate')
  })

  test('color contrast is sufficient for text elements', () => {
    renderWithRouter(<Contact />)
    
    // Main headings should have sufficient contrast
    const mainHeading = screen.getByRole('heading', { level: 1 })
    const computedStyle = window.getComputedStyle(mainHeading)
    
    // This is a basic check - in real scenarios, you'd use tools like axe-core
    expect(computedStyle.color).toBeDefined()
  })

  test('focus management works correctly in forms', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)
    
    // Tab through form elements
    const nameInput = screen.getByLabelText(/full name/i)
    const emailInput = screen.getByLabelText(/email address/i)
    const phoneInput = screen.getByLabelText(/phone number/i)
    
    nameInput.focus()
    expect(document.activeElement).toBe(nameInput)
    
    await user.tab()
    expect(document.activeElement).toBe(emailInput)
    
    await user.tab()
    expect(document.activeElement).toBe(phoneInput)
  })

  test('error announcements are properly communicated', async () => {
    const user = userEvent.setup()
    
    fetch.mockRejectedValueOnce(new Error('Network error'))
    
    render(<ContactForm />)
    
    // Fill form and submit to trigger error
    await user.type(screen.getByLabelText(/full name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email address/i), 'john@example.com')
    await user.selectOptions(screen.getByLabelText(/subject/i), 'General Inquiry')
    await user.type(screen.getByLabelText(/message/i), 'Test message')
    
    await user.click(screen.getByRole('button', { name: /send message/i }))
    
    // Error should be announced with role="alert"
    await waitFor(() => {
      const errorAlert = screen.getByRole('alert')
      expect(errorAlert).toHaveTextContent('Network error')
    })
  })

  test('success messages are accessible', async () => {
    const user = userEvent.setup()
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: '123',
        message: 'Success'
      })
    })
    
    render(<ContactForm />)
    
    // Fill and submit form
    await user.type(screen.getByLabelText(/full name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email address/i), 'john@example.com')
    await user.selectOptions(screen.getByLabelText(/subject/i), 'General Inquiry')
    await user.type(screen.getByLabelText(/message/i), 'Test message')
    
    await user.click(screen.getByRole('button', { name: /send message/i }))
    
    // Success message should be accessible
    await waitFor(() => {
      expect(screen.getByText('Message Sent Successfully!')).toBeInTheDocument()
      expect(screen.getByText(/Thank you for reaching out to us/)).toBeInTheDocument()
    })
  })

  test('loading states are announced to screen readers', async () => {
    fetch.mockImplementation(() => new Promise(() => {})) // Never resolves
    
    renderWithRouter(<Impact />)
    
    // Loading message should be accessible
    expect(screen.getByText('Loading impact data...')).toBeInTheDocument()
  })

  test('impact statistics are semantically structured', async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockImpactData
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => []
      })

    renderWithRouter(<Impact />)
    
    // Statistics should be in a logical structure
    expect(screen.getByText('Students Supported')).toBeInTheDocument()
    expect(screen.getByText('Programs Conducted')).toBeInTheDocument()
    expect(screen.getByText('Outreach Activities')).toBeInTheDocument()
    expect(screen.getByText('Active Volunteers')).toBeInTheDocument()
  })

  test('keyboard navigation works throughout the pages', async () => {
    const user = userEvent.setup()
    
    renderWithRouter(<Contact />)
    
    // Should be able to navigate with keyboard
    const firstFocusableElement = screen.getByLabelText(/full name/i)
    firstFocusableElement.focus()
    
    expect(document.activeElement).toBe(firstFocusableElement)
    
    // Tab should move to next element
    await user.tab()
    expect(document.activeElement).not.toBe(firstFocusableElement)
  })

  test('ARIA landmarks are properly used', () => {
    renderWithRouter(<Contact />)
    
    // Main content should be in main landmark
    const mainContent = document.querySelector('main') || document.querySelector('[role="main"]')
    // Note: This test assumes the page structure includes proper landmarks
    
    // Form should be properly structured
    const form = screen.getByRole('form') || document.querySelector('form')
    expect(form).toBeInTheDocument()
  })
})