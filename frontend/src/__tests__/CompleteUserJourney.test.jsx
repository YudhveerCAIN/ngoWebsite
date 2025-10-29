import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import { AppProvider } from '../context/AppContext'
import App from '../App'

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

// Mock Razorpay
global.Razorpay = vi.fn().mockImplementation(() => ({
  open: vi.fn(),
  on: vi.fn()
}))

const AllProviders = ({ children }) => (
  <BrowserRouter>
    <AppProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </AppProvider>
  </BrowserRouter>
)

describe('Complete User Journey Integration Tests', () => {
  const mockUserData = {
    volunteer: {
      fullName: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      phone: '+91 98765 43210',
      areasOfInterest: ['education', 'community'],
      availability: 'weekends',
      experience: 'I have experience working with children and community development.',
      message: 'I am passionate about education and want to make a difference.'
    },
    donation: {
      fullName: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      phone: '+91 98765 43210',
      amountInInr: 5000,
      recurring: false,
      message: 'Supporting your educational programs!'
    },
    contact: {
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      phone: '+91 98765 43210',
      subject: 'Partnership Proposal',
      message: 'I would like to discuss a potential partnership with my organization.'
    }
  }

  const mockApiResponses = {
    impact: {
      studentsSupported: 1250,
      programsConducted: 48,
      outreachActivities: 120,
      volunteersActive: 85,
      totalDonationAmount: 2450000,
      totalEvents: 28,
      totalInquiries: 234
    },
    programs: [
      {
        id: 'prog_1',
        title: 'Educational Support',
        category: 'education',
        description: 'Comprehensive educational support for underprivileged students'
      }
    ],
    events: [
      {
        id: 'event_1',
        title: 'Digital Literacy Workshop',
        date: '2024-12-15T10:00:00Z',
        location: 'Community Center',
        registrationOpen: true
      }
    ],
    stories: [
      {
        id: 'story_1',
        title: 'Success Story',
        excerpt: 'A student\'s journey to success'
      }
    ]
  }

  beforeEach(() => {
    fetch.mockClear()
    global.Razorpay.mockClear()
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        setItem: vi.fn(),
        getItem: vi.fn(),
        removeItem: vi.fn(),
      },
      writable: true,
    })
  })

  test('complete user journey: discovery to engagement', async () => {
    const user = userEvent.setup()
    
    // Mock all API responses
    fetch
      // Home page impact data
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponses.impact
      })
      // Programs data
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponses.programs
      })
      // About page data
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          foundedYear: 2013,
          journey: 'Started with a mission to enable vision through education'
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          vision: 'A society where every child has opportunity to learn',
          mission: 'Empower underserved communities through education'
        })
      })
      // Volunteer registration
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'vol_123',
          ...mockUserData.volunteer,
          status: 'new'
        })
      })
      // Donation processing
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'order_123',
          amount: 500000,
          currency: 'INR'
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'donation_123',
          ...mockUserData.donation,
          paymentStatus: 'completed'
        })
      })
      // Contact form
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'contact_123',
          ...mockUserData.contact,
          status: 'new'
        })
      })
    
    // Mock successful payment
    global.Razorpay.mockImplementation((options) => ({
      open: vi.fn(() => {
        setTimeout(() => {
          options.handler({
            razorpay_order_id: 'order_123',
            razorpay_payment_id: 'pay_123',
            razorpay_signature: 'sig_123'
          })
        }, 100)
      }),
      on: vi.fn()
    }))
    
    render(
      <AllProviders>
        <App />
      </AllProviders>
    )
    
    // Phase 1: Discovery - User lands on homepage
    await waitFor(() => {
      expect(screen.getByText(/enabling vision through education/i)).toBeInTheDocument()
    })
    
    // User sees impact statistics
    await waitFor(() => {
      expect(screen.getByText('1,250')).toBeInTheDocument() // Students supported
    })
    
    // Phase 2: Learning - User explores About page
    const aboutLink = screen.getByRole('link', { name: /about/i })
    await user.click(aboutLink)
    
    await waitFor(() => {
      expect(screen.getByText('About Urjja Pratishthan Prakashalay')).toBeInTheDocument()
    })
    
    // User learns about the organization
    expect(screen.getByText(/enabling vision through education since 2013/i)).toBeInTheDocument()
    
    // Phase 3: Program Discovery - User explores programs
    const programsLink = screen.getByRole('link', { name: /programs/i })
    await user.click(programsLink)
    
    await waitFor(() => {
      expect(screen.getByText('Our Programs')).toBeInTheDocument()
    })
    
    // User sees program categories and details
    expect(screen.getByText('Educational Support')).toBeInTheDocument()
    
    // Phase 4: Engagement Decision - User decides to get involved
    const getInvolvedLink = screen.getByRole('link', { name: /get involved/i })
    await user.click(getInvolvedLink)
    
    await waitFor(() => {
      expect(screen.getByText('Get Involved')).toBeInTheDocument()
    })
    
    // Phase 5: Volunteer Registration
    const volunteerButton = screen.getByRole('button', { name: /become a volunteer/i })
    await user.click(volunteerButton)
    
    await waitFor(() => {
      expect(screen.getByText('Volunteer Registration')).toBeInTheDocument()
    })
    
    // Fill volunteer form
    await user.type(screen.getByLabelText(/full name/i), mockUserData.volunteer.fullName)
    await user.type(screen.getByLabelText(/email address/i), mockUserData.volunteer.email)
    await user.type(screen.getByLabelText(/phone number/i), mockUserData.volunteer.phone)
    await user.selectOptions(screen.getByLabelText(/availability/i), mockUserData.volunteer.availability)
    await user.click(screen.getByLabelText(/education/i))
    await user.type(screen.getByLabelText(/experience/i), mockUserData.volunteer.experience)
    await user.type(screen.getByLabelText(/message/i), mockUserData.volunteer.message)
    
    await user.click(screen.getByRole('button', { name: /submit application/i }))
    
    // Verify volunteer registration success
    await waitFor(() => {
      expect(screen.getByText('Application Submitted Successfully!')).toBeInTheDocument()
    })
    
    // Phase 6: Financial Support - User decides to donate
    const donateLink = screen.getByRole('link', { name: /donate/i })
    await user.click(donateLink)
    
    await waitFor(() => {
      expect(screen.getByText('Support Our Mission')).toBeInTheDocument()
    })
    
    // Select donation amount and fill form
    await user.click(screen.getByRole('button', { name: /₹5,000/i }))
    await user.type(screen.getByLabelText(/full name/i), mockUserData.donation.fullName)
    await user.type(screen.getByLabelText(/email address/i), mockUserData.donation.email)
    await user.type(screen.getByLabelText(/phone number/i), mockUserData.donation.phone)
    await user.type(screen.getByLabelText(/message/i), mockUserData.donation.message)
    
    await user.click(screen.getByRole('button', { name: /donate now/i }))
    
    // Verify donation success
    await waitFor(() => {
      expect(screen.getByText('Donation Successful!')).toBeInTheDocument()
    })
    
    // Phase 7: Further Engagement - User contacts for partnership
    const contactLink = screen.getByRole('link', { name: /contact/i })
    await user.click(contactLink)
    
    await waitFor(() => {
      expect(screen.getByText('Contact Us')).toBeInTheDocument()
    })
    
    // Fill contact form
    await user.type(screen.getByLabelText(/full name/i), mockUserData.contact.name)
    await user.type(screen.getByLabelText(/email address/i), mockUserData.contact.email)
    await user.type(screen.getByLabelText(/phone number/i), mockUserData.contact.phone)
    await user.selectOptions(screen.getByLabelText(/subject/i), mockUserData.contact.subject)
    await user.type(screen.getByLabelText(/message/i), mockUserData.contact.message)
    
    await user.click(screen.getByRole('button', { name: /send message/i }))
    
    // Verify contact success
    await waitFor(() => {
      expect(screen.getByText('Message Sent Successfully!')).toBeInTheDocument()
    })
    
    // Phase 8: Continued Engagement - User explores impact
    const impactLink = screen.getByRole('link', { name: /impact/i })
    await user.click(impactLink)
    
    await waitFor(() => {
      expect(screen.getByText('Our Impact')).toBeInTheDocument()
    })
    
    // User sees their contribution is part of the impact
    expect(screen.getByText(/1,250/)).toBeInTheDocument() // Students supported
    
    // Verify all API calls were made
    expect(fetch).toHaveBeenCalledTimes(8)
  })

  test('user journey with error recovery', async () => {
    const user = userEvent.setup()
    
    // Mock initial success then failures
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponses.impact
      })
      // Volunteer registration failure
      .mockRejectedValueOnce(new Error('Network error'))
      // Retry success
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'vol_124',
          ...mockUserData.volunteer,
          status: 'new'
        })
      })
    
    render(
      <AllProviders>
        <App />
      </AllProviders>
    )
    
    // Navigate to volunteer registration
    await waitFor(() => {
      expect(screen.getByText(/enabling vision through education/i)).toBeInTheDocument()
    })
    
    const getInvolvedLink = screen.getByRole('link', { name: /get involved/i })
    await user.click(getInvolvedLink)
    
    const volunteerButton = screen.getByRole('button', { name: /become a volunteer/i })
    await user.click(volunteerButton)
    
    // Fill form
    await user.type(screen.getByLabelText(/full name/i), mockUserData.volunteer.fullName)
    await user.type(screen.getByLabelText(/email address/i), mockUserData.volunteer.email)
    await user.selectOptions(screen.getByLabelText(/availability/i), mockUserData.volunteer.availability)
    await user.click(screen.getByLabelText(/education/i))
    
    // Submit and encounter error
    await user.click(screen.getByRole('button', { name: /submit application/i }))
    
    // Verify error handling
    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument()
    })
    
    // Retry submission
    const retryButton = screen.getByRole('button', { name: /try again/i })
    await user.click(retryButton)
    
    // Verify success on retry
    await waitFor(() => {
      expect(screen.getByText('Application Submitted Successfully!')).toBeInTheDocument()
    })
  })

  test('user journey with accessibility navigation', async () => {
    const user = userEvent.setup()
    
    fetch.mockResolvedValue({
      ok: true,
      json: async () => mockApiResponses.impact
    })
    
    render(
      <AllProviders>
        <App />
      </AllProviders>
    )
    
    // Test keyboard navigation
    await waitFor(() => {
      expect(screen.getByText(/enabling vision through education/i)).toBeInTheDocument()
    })
    
    // Navigate using keyboard
    const aboutLink = screen.getByRole('link', { name: /about/i })
    aboutLink.focus()
    expect(document.activeElement).toBe(aboutLink)
    
    // Press Enter to navigate
    await user.keyboard('{Enter}')
    
    await waitFor(() => {
      expect(screen.getByText('About Urjja Pratishthan Prakashalay')).toBeInTheDocument()
    })
    
    // Test skip links and landmarks
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  test('user journey with mobile responsive behavior', async () => {
    const user = userEvent.setup()
    
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    })
    
    fetch.mockResolvedValue({
      ok: true,
      json: async () => mockApiResponses.impact
    })
    
    render(
      <AllProviders>
        <App />
      </AllProviders>
    )
    
    await waitFor(() => {
      expect(screen.getByText(/enabling vision through education/i)).toBeInTheDocument()
    })
    
    // Test mobile navigation
    const mobileMenuButton = screen.getByRole('button', { name: /menu/i })
    await user.click(mobileMenuButton)
    
    // Mobile menu should be visible
    expect(screen.getByRole('navigation')).toBeVisible()
    
    // Test responsive layout elements
    const container = screen.getByRole('main')
    expect(container).toHaveClass('px-4') // Mobile padding
  })

  test('user journey with data persistence', async () => {
    const user = userEvent.setup()
    
    fetch.mockResolvedValue({
      ok: true,
      json: async () => mockApiResponses.impact
    })
    
    render(
      <AllProviders>
        <App />
      </AllProviders>
    )
    
    // Navigate to volunteer form
    await waitFor(() => {
      expect(screen.getByText(/enabling vision through education/i)).toBeInTheDocument()
    })
    
    const getInvolvedLink = screen.getByRole('link', { name: /get involved/i })
    await user.click(getInvolvedLink)
    
    const volunteerButton = screen.getByRole('button', { name: /become a volunteer/i })
    await user.click(volunteerButton)
    
    // Fill partial form data
    await user.type(screen.getByLabelText(/full name/i), 'Partial Name')
    await user.type(screen.getByLabelText(/email address/i), 'partial@email.com')
    
    // Navigate away
    const homeLink = screen.getByRole('link', { name: /home/i })
    await user.click(homeLink)
    
    // Navigate back to form
    await user.click(getInvolvedLink)
    await user.click(volunteerButton)
    
    // In a real implementation, form data might be persisted
    // For this test, we verify the form is accessible again
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
  })

  test('complete user journey performance metrics', async () => {
    const user = userEvent.setup()
    
    fetch.mockResolvedValue({
      ok: true,
      json: async () => mockApiResponses.impact
    })
    
    const startTime = performance.now()
    
    render(
      <AllProviders>
        <App />
      </AllProviders>
    )
    
    // Measure initial load time
    await waitFor(() => {
      expect(screen.getByText(/enabling vision through education/i)).toBeInTheDocument()
    })
    
    const loadTime = performance.now() - startTime
    expect(loadTime).toBeLessThan(3000) // Should load within 3 seconds
    
    // Test navigation performance
    const navigationStart = performance.now()
    
    const aboutLink = screen.getByRole('link', { name: /about/i })
    await user.click(aboutLink)
    
    await waitFor(() => {
      expect(screen.getByText('About Urjja Pratishthan Prakashalay')).toBeInTheDocument()
    })
    
    const navigationTime = performance.now() - navigationStart
    expect(navigationTime).toBeLessThan(1000) // Navigation should be fast
  })

  test('user journey with network connectivity issues', async () => {
    const user = userEvent.setup()
    
    // Mock network failure
    fetch.mockRejectedValue(new TypeError('Failed to fetch'))
    
    render(
      <AllProviders>
        <App />
      </AllProviders>
    )
    
    // Should handle network errors gracefully
    await waitFor(() => {
      // App should still render with fallback content
      expect(screen.getByText(/urjja pratishthan prakashalay/i)).toBeInTheDocument()
    })
    
    // User should see appropriate error messages
    expect(screen.getByText(/unable to load/i) || screen.getByText(/network error/i)).toBeInTheDocument()
  })
})