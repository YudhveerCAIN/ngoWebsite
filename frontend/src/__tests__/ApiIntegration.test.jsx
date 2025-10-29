import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import ContactForm from '../components/forms/ContactForm'
import Impact from '../pages/Impact'

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

describe('API Integration Tests', () => {
  beforeEach(() => {
    fetch.mockClear()
  })

  describe('Contact API Integration', () => {
    test('handles successful contact submission with proper API response', async () => {
      const user = userEvent.setup()
      
      const mockResponse = {
        id: '507f1f77bcf86cd799439011',
        name: 'John Doe',
        email: 'john.doe@example.com',
        subject: 'General Inquiry',
        status: 'new',
        createdAt: '2024-01-15T10:30:00.000Z',
        message: 'Your message has been sent successfully! We will get back to you within 24-48 hours.'
      }

      fetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => mockResponse
      })

      render(<ContactForm />)

      // Fill out form
      await user.type(screen.getByLabelText(/full name/i), 'John Doe')
      await user.type(screen.getByLabelText(/email address/i), 'john.doe@example.com')
      await user.type(screen.getByLabelText(/phone number/i), '+91 98765 43210')
      await user.selectOptions(screen.getByLabelText(/subject/i), 'General Inquiry')
      await user.type(screen.getByLabelText(/message/i), 'I would like to know more about your programs.')

      // Submit form
      await user.click(screen.getByRole('button', { name: /send message/i }))

      // Verify API call
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: 'John Doe',
            email: 'john.doe@example.com',
            phone: '+91 98765 43210',
            subject: 'General Inquiry',
            message: 'I would like to know more about your programs.'
          }),
        })
      })

      // Verify success response handling
      await waitFor(() => {
        expect(screen.getByText('Message Sent Successfully!')).toBeInTheDocument()
        expect(screen.getByText(/Thank you for reaching out to us/)).toBeInTheDocument()
      })
    })

    test('handles API validation errors correctly', async () => {
      const user = userEvent.setup()
      
      const mockErrorResponse = {
        message: 'Validation failed',
        errors: [
          { field: 'email', message: 'Please provide a valid email address' },
          { field: 'message', message: 'Message must be at least 10 characters' }
        ]
      }

      fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => mockErrorResponse
      })

      render(<ContactForm />)

      // Fill out form with invalid data
      await user.type(screen.getByLabelText(/full name/i), 'John Doe')
      await user.type(screen.getByLabelText(/email address/i), 'invalid-email')
      await user.selectOptions(screen.getByLabelText(/subject/i), 'General Inquiry')
      await user.type(screen.getByLabelText(/message/i), 'Short')

      await user.click(screen.getByRole('button', { name: /send message/i }))

      await waitFor(() => {
        expect(screen.getByText('Validation failed')).toBeInTheDocument()
      })
    })

    test('handles network errors gracefully', async () => {
      const user = userEvent.setup()
      
      fetch.mockRejectedValueOnce(new Error('Network error'))

      render(<ContactForm />)

      await user.type(screen.getByLabelText(/full name/i), 'John Doe')
      await user.type(screen.getByLabelText(/email address/i), 'john@example.com')
      await user.selectOptions(screen.getByLabelText(/subject/i), 'General Inquiry')
      await user.type(screen.getByLabelText(/message/i), 'Test message')

      await user.click(screen.getByRole('button', { name: /send message/i }))

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument()
      })
    })

    test('handles server errors (500) appropriately', async () => {
      const user = userEvent.setup()
      
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ message: 'Internal server error' })
      })

      render(<ContactForm />)

      await user.type(screen.getByLabelText(/full name/i), 'John Doe')
      await user.type(screen.getByLabelText(/email address/i), 'john@example.com')
      await user.selectOptions(screen.getByLabelText(/subject/i), 'General Inquiry')
      await user.type(screen.getByLabelText(/message/i), 'Test message')

      await user.click(screen.getByRole('button', { name: /send message/i }))

      await waitFor(() => {
        expect(screen.getByText('Internal server error')).toBeInTheDocument()
      })
    })
  })

  describe('Impact API Integration', () => {
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
          peopleScreened: 2500,
          awarenessSessionsConducted: 40,
          familiesHelped: 500
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
      },
      lastUpdated: '2024-01-15T10:30:00.000Z',
      dataSource: 'live'
    }

    const mockStoriesData = [
      {
        _id: '507f1f77bcf86cd799439011',
        title: 'From Dropout to Graduate',
        authorName: 'Priya Sharma',
        content: 'My journey from school dropout to graduation was made possible by the scholarship program.',
        published: true,
        publishedAt: '2024-01-10T00:00:00.000Z'
      }
    ]

    test('fetches and displays impact data correctly', async () => {
      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockImpactData
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockStoriesData
        })

      renderWithRouter(<Impact />)

      // Verify API calls
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/impact')
        expect(fetch).toHaveBeenCalledWith('/api/stories')
      })

      // Verify data display
      await waitFor(() => {
        expect(screen.getByText('Students Supported')).toBeInTheDocument()
        expect(screen.getByText('Programs Conducted')).toBeInTheDocument()
        expect(screen.getByText('Outreach Activities')).toBeInTheDocument()
        expect(screen.getByText('Active Volunteers')).toBeInTheDocument()
      })

      // Verify program breakdown
      await waitFor(() => {
        expect(screen.getByText('Education Programs')).toBeInTheDocument()
        expect(screen.getByText('Healthcare Initiatives')).toBeInTheDocument()
        expect(screen.getByText('Skill Development')).toBeInTheDocument()
      })
    })

    test('handles impact API failure with fallback data', async () => {
      fetch
        .mockRejectedValueOnce(new Error('Impact API Error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockStoriesData
        })

      renderWithRouter(<Impact />)

      await waitFor(() => {
        expect(screen.getByText('Impact API Error')).toBeInTheDocument()
      })

      // Should still show the page structure
      expect(screen.getByText('Our Impact')).toBeInTheDocument()
    })

    test('handles stories API failure gracefully', async () => {
      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockImpactData
        })
        .mockRejectedValueOnce(new Error('Stories API Error'))

      renderWithRouter(<Impact />)

      // Should still render impact data
      await waitFor(() => {
        expect(screen.getByText('Students Supported')).toBeInTheDocument()
      })

      // Should still show success stories section (with fallback data)
      expect(screen.getByText('Success Stories')).toBeInTheDocument()
    })

    test('handles partial API responses', async () => {
      const partialImpactData = {
        studentsSupported: 1250,
        programsConducted: 48,
        // Missing other fields
      }

      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => partialImpactData
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => []
        })

      renderWithRouter(<Impact />)

      await waitFor(() => {
        expect(screen.getByText('Students Supported')).toBeInTheDocument()
        expect(screen.getByText('Programs Conducted')).toBeInTheDocument()
      })
    })

    test('handles malformed API responses', async () => {
      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => null
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => 'invalid json'
        })

      renderWithRouter(<Impact />)

      // Should handle gracefully and show fallback
      await waitFor(() => {
        expect(screen.getByText('Our Impact')).toBeInTheDocument()
      })
    })
  })

  describe('Cross-API Integration', () => {
    test('multiple API calls work independently', async () => {
      const user = userEvent.setup()
      
      // Mock different responses for different APIs
      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            id: '123',
            message: 'Contact success'
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            studentsSupported: 1000,
            programsConducted: 50
          })
        })

      // Render both components
      const { container } = render(
        <BrowserRouter>
          <div>
            <ContactForm />
            <Impact />
          </div>
        </BrowserRouter>
      )

      // Submit contact form
      await user.type(screen.getByLabelText(/full name/i), 'John Doe')
      await user.type(screen.getByLabelText(/email address/i), 'john@example.com')
      await user.selectOptions(screen.getByLabelText(/subject/i), 'General Inquiry')
      await user.type(screen.getByLabelText(/message/i), 'Test message')
      await user.click(screen.getByRole('button', { name: /send message/i }))

      // Both APIs should be called
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/contact', expect.any(Object))
        expect(fetch).toHaveBeenCalledWith('/api/impact')
      })
    })

    test('API failures in one component do not affect others', async () => {
      fetch
        .mockRejectedValueOnce(new Error('Contact API Error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ studentsSupported: 1000 })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => []
        })

      render(
        <BrowserRouter>
          <div>
            <ContactForm />
            <Impact />
          </div>
        </BrowserRouter>
      )

      // Impact should still work despite contact API failure
      await waitFor(() => {
        expect(screen.getByText('Students Supported')).toBeInTheDocument()
      })

      // Contact form should still be functional
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    })
  })
})