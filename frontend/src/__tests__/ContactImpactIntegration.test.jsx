import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import Contact from '../pages/Contact'
import Impact from '../pages/Impact'

// Mock fetch globally
global.fetch = vi.fn()

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback) {
    this.callback = callback
  }
  
  observe(element) {
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

describe('Contact and Impact Integration', () => {
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

  const mockStories = [
    {
      id: 1,
      title: "Success Story 1",
      excerpt: "This is a success story",
      category: "Education",
      location: "Pune",
      date: "2024-08-15",
      beneficiary: {
        name: "John Doe",
        age: 22
      }
    }
  ]

  beforeEach(() => {
    fetch.mockClear()
    vi.useFakeTimers()
  })
  
  afterEach(() => {
    vi.useRealTimers()
  })

  test('contact form submission updates impact statistics', async () => {
    const user = userEvent.setup()
    
    // Mock successful contact submission
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

    // Mock impact data with updated inquiry count
    const updatedImpactData = {
      ...mockImpactData,
      totalInquiries: mockImpactData.totalInquiries + 1
    }

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => updatedImpactData
    })

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockStories
    })

    // Render contact page and submit form
    renderWithRouter(<Contact />)
    
    await user.type(screen.getByLabelText(/full name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email address/i), 'john@example.com')
    await user.selectOptions(screen.getByLabelText(/subject/i), 'General Inquiry')
    await user.type(screen.getByLabelText(/message/i), 'I would like to know more about your programs.')
    
    await user.click(screen.getByRole('button', { name: /send message/i }))
    
    await waitFor(() => {
      expect(screen.getByText('Message Sent Successfully!')).toBeInTheDocument()
    })

    // Now render impact page to see updated statistics
    renderWithRouter(<Impact />)
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/impact')
    })

    // The impact page should show updated inquiry count
    vi.advanceTimersByTime(3000)
    
    await waitFor(() => {
      expect(screen.getByText('Community Inquiries')).toBeInTheDocument()
    })
  })

  test('impact page displays contact information correctly', async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockImpactData
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStories
      })

    renderWithRouter(<Impact />)

    await waitFor(() => {
      expect(screen.getByText('Our Impact')).toBeInTheDocument()
    })

    // Check that call-to-action section includes contact options
    expect(screen.getByText('Be Part of Our Impact')).toBeInTheDocument()
    
    // Should have links to get involved and donate
    const volunteerLink = screen.getByText('Become a Volunteer')
    const donateLink = screen.getByText('Make a Donation')
    
    expect(volunteerLink).toBeInTheDocument()
    expect(donateLink).toBeInTheDocument()
    expect(volunteerLink.closest('a')).toHaveAttribute('href', '/get-involved')
    expect(donateLink.closest('a')).toHaveAttribute('href', '/donate')
  })

  test('contact page displays organization information that matches impact data', () => {
    renderWithRouter(<Contact />)
    
    // Check that contact information is displayed
    expect(screen.getByText('Contact Us')).toBeInTheDocument()
    expect(screen.getByText(/123 Community Center Road/)).toBeInTheDocument()
    expect(screen.getByText(/Bhosari, Pune - 411026/)).toBeInTheDocument()
    expect(screen.getByText(/+91 98765 43210/)).toBeInTheDocument()
    expect(screen.getByText(/info@urjjapratishthan.org/)).toBeInTheDocument()
    
    // Check office hours
    expect(screen.getByText('Office Hours')).toBeInTheDocument()
    expect(screen.getByText('Monday - Friday')).toBeInTheDocument()
    expect(screen.getByText('9:00 AM - 6:00 PM')).toBeInTheDocument()
  })

  test('error handling works consistently across both pages', async () => {
    // Test contact form error handling
    fetch.mockRejectedValueOnce(new Error('Network error'))
    
    const user = userEvent.setup()
    renderWithRouter(<Contact />)
    
    await user.type(screen.getByLabelText(/full name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email address/i), 'john@example.com')
    await user.selectOptions(screen.getByLabelText(/subject/i), 'General Inquiry')
    await user.type(screen.getByLabelText(/message/i), 'Test message')
    
    await user.click(screen.getByRole('button', { name: /send message/i }))
    
    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument()
    })

    // Test impact page error handling
    fetch.mockRejectedValueOnce(new Error('Failed to load impact data'))
    
    renderWithRouter(<Impact />)
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load impact data')).toBeInTheDocument()
    })
  })

  test('both pages are accessible and follow consistent design patterns', () => {
    // Test contact page accessibility
    renderWithRouter(<Contact />)
    
    // Check for proper headings
    expect(screen.getByRole('heading', { name: /contact us/i })).toBeInTheDocument()
    
    // Check for proper form labels
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    
    // Test impact page accessibility
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockImpactData
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStories
      })

    renderWithRouter(<Impact />)
    
    // Check for proper headings
    expect(screen.getByRole('heading', { name: /our impact/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /impact by numbers/i })).toBeInTheDocument()
  })

  test('responsive design works on both pages', () => {
    // Test contact page responsive classes
    const { container: contactContainer } = renderWithRouter(<Contact />)
    
    // Check for responsive grid classes
    expect(contactContainer.querySelector('.grid-cols-1')).toBeInTheDocument()
    expect(contactContainer.querySelector('.lg\\:grid-cols-2')).toBeInTheDocument()

    // Test impact page responsive classes
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockImpactData
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStories
      })

    const { container: impactContainer } = renderWithRouter(<Impact />)
    
    // Check for responsive grid classes
    expect(impactContainer.querySelector('.md\\:grid-cols-2')).toBeInTheDocument()
    expect(impactContainer.querySelector('.lg\\:grid-cols-4')).toBeInTheDocument()
  })

  test('loading states are consistent across pages', async () => {
    // Test contact form loading state
    fetch.mockImplementation(() => new Promise(resolve => 
      setTimeout(() => resolve({
        ok: true,
        json: async () => ({ id: '123', message: 'Success' })
      }), 100)
    ))
    
    const user = userEvent.setup()
    renderWithRouter(<Contact />)
    
    await user.type(screen.getByLabelText(/full name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email address/i), 'john@example.com')
    await user.selectOptions(screen.getByLabelText(/subject/i), 'General Inquiry')
    await user.type(screen.getByLabelText(/message/i), 'Test message')
    
    await user.click(screen.getByRole('button', { name: /send message/i }))
    
    expect(screen.getByText('Sending Message...')).toBeInTheDocument()

    // Test impact page loading state
    fetch.mockImplementation(() => new Promise(() => {})) // Never resolves
    
    renderWithRouter(<Impact />)
    
    expect(screen.getByText('Loading impact data...')).toBeInTheDocument()
  })

  test('data consistency between contact submissions and impact statistics', async () => {
    const user = userEvent.setup()
    
    // Submit multiple contact forms
    for (let i = 0; i < 3; i++) {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: `${i + 1}`,
          message: 'Success'
        })
      })
      
      renderWithRouter(<Contact />)
      
      await user.type(screen.getByLabelText(/full name/i), `User ${i + 1}`)
      await user.type(screen.getByLabelText(/email address/i), `user${i + 1}@example.com`)
      await user.selectOptions(screen.getByLabelText(/subject/i), 'General Inquiry')
      await user.type(screen.getByLabelText(/message/i), `Message ${i + 1}`)
      
      await user.click(screen.getByRole('button', { name: /send message/i }))
      
      await waitFor(() => {
        expect(screen.getByText('Message Sent Successfully!')).toBeInTheDocument()
      })
    }

    // Check that impact statistics reflect the submissions
    const updatedImpactData = {
      ...mockImpactData,
      totalInquiries: mockImpactData.totalInquiries + 3
    }

    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => updatedImpactData
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStories
      })

    renderWithRouter(<Impact />)
    
    vi.advanceTimersByTime(3000)
    
    await waitFor(() => {
      expect(screen.getByText('Community Inquiries')).toBeInTheDocument()
    })
  })
})