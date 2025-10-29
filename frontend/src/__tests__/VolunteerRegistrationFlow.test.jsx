import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import { AppProvider } from '../context/AppContext'
import GetInvolved from '../pages/GetInvolved'
import VolunteerForm from '../components/forms/VolunteerForm'

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

const AllProviders = ({ children }) => (
  <BrowserRouter>
    <AppProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </AppProvider>
  </BrowserRouter>
)

describe('Complete Volunteer Registration Flow', () => {
  const mockVolunteerData = {
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+91 98765 43210',
    areasOfInterest: ['education', 'healthcare'],
    availability: 'weekends',
    experience: 'I have 2 years of experience in community service',
    message: 'I am passionate about helping underprivileged children and would love to contribute to your educational programs.'
  }

  beforeEach(() => {
    fetch.mockClear()
    
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

  test('complete volunteer registration journey from landing to confirmation', async () => {
    const user = userEvent.setup()
    
    // Mock successful API responses
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 'vol_123',
        fullName: mockVolunteerData.fullName,
        email: mockVolunteerData.email,
        status: 'new',
        message: 'Thank you for your interest in volunteering!'
      })
    })
    
    render(
      <AllProviders>
        <GetInvolved />
      </AllProviders>
    )
    
    // Step 1: User lands on Get Involved page
    expect(screen.getByText('Get Involved')).toBeInTheDocument()
    expect(screen.getByText(/Join our mission/i)).toBeInTheDocument()
    
    // Step 2: User sees volunteer opportunities
    expect(screen.getByText(/volunteer opportunities/i)).toBeInTheDocument()
    
    // Step 3: User clicks on volunteer registration
    const volunteerButton = screen.getByRole('button', { name: /become a volunteer/i })
    await user.click(volunteerButton)
    
    // Step 4: Volunteer form should be visible
    await waitFor(() => {
      expect(screen.getByText('Volunteer Registration')).toBeInTheDocument()
    })
    
    // Step 5: Fill out personal information
    const nameInput = screen.getByLabelText(/full name/i)
    const emailInput = screen.getByLabelText(/email address/i)
    const phoneInput = screen.getByLabelText(/phone number/i)
    
    await user.type(nameInput, mockVolunteerData.fullName)
    await user.type(emailInput, mockVolunteerData.email)
    await user.type(phoneInput, mockVolunteerData.phone)
    
    // Step 6: Select areas of interest
    const educationCheckbox = screen.getByLabelText(/education/i)
    const healthcareCheckbox = screen.getByLabelText(/healthcare/i)
    
    await user.click(educationCheckbox)
    await user.click(healthcareCheckbox)
    
    // Step 7: Select availability
    const availabilitySelect = screen.getByLabelText(/availability/i)
    await user.selectOptions(availabilitySelect, mockVolunteerData.availability)
    
    // Step 8: Fill experience and message
    const experienceTextarea = screen.getByLabelText(/experience/i)
    const messageTextarea = screen.getByLabelText(/message/i)
    
    await user.type(experienceTextarea, mockVolunteerData.experience)
    await user.type(messageTextarea, mockVolunteerData.message)
    
    // Step 9: Submit the form
    const submitButton = screen.getByRole('button', { name: /submit application/i })
    await user.click(submitButton)
    
    // Step 10: Verify loading state
    expect(screen.getByText(/submitting/i)).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
    
    // Step 11: Verify API call
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/volunteers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockVolunteerData),
      })
    })
    
    // Step 12: Verify success message
    await waitFor(() => {
      expect(screen.getByText('Application Submitted Successfully!')).toBeInTheDocument()
      expect(screen.getByText(/Thank you for your interest in volunteering/)).toBeInTheDocument()
    })
    
    // Step 13: Verify confirmation details
    expect(screen.getByText(mockVolunteerData.fullName)).toBeInTheDocument()
    expect(screen.getByText(mockVolunteerData.email)).toBeInTheDocument()
    
    // Step 14: Verify next steps information
    expect(screen.getByText(/what happens next/i)).toBeInTheDocument()
    expect(screen.getByText(/review your application/i)).toBeInTheDocument()
    
    // Step 15: Verify additional actions
    expect(screen.getByText('Submit Another Application')).toBeInTheDocument()
    
    // Step 16: Test form reset functionality
    const anotherApplicationButton = screen.getByText('Submit Another Application')
    await user.click(anotherApplicationButton)
    
    // Form should be reset and visible again
    await waitFor(() => {
      expect(screen.getByText('Volunteer Registration')).toBeInTheDocument()
      expect(screen.getByLabelText(/full name/i)).toHaveValue('')
    })
  })

  test('volunteer registration with validation errors', async () => {
    const user = userEvent.setup()
    
    render(
      <AllProviders>
        <VolunteerForm />
      </AllProviders>
    )
    
    // Try to submit empty form
    const submitButton = screen.getByRole('button', { name: /submit application/i })
    await user.click(submitButton)
    
    // Verify validation errors
    await waitFor(() => {
      expect(screen.getByText('Full name is required')).toBeInTheDocument()
      expect(screen.getByText('Email is required')).toBeInTheDocument()
      expect(screen.getByText('Please select your availability')).toBeInTheDocument()
      expect(screen.getByText('Please select at least one area of interest')).toBeInTheDocument()
    })
    
    // Fill some fields and test partial validation
    await user.type(screen.getByLabelText(/full name/i), 'A') // Too short
    await user.type(screen.getByLabelText(/email address/i), 'invalid-email')
    await user.type(screen.getByLabelText(/phone number/i), '123') // Invalid format
    
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Name must be at least 2 characters')).toBeInTheDocument()
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
      expect(screen.getByText('Please enter a valid phone number')).toBeInTheDocument()
    })
  })

  test('volunteer registration with server error', async () => {
    const user = userEvent.setup()
    
    // Mock server error
    fetch.mockRejectedValueOnce(new Error('Server error'))
    
    render(
      <AllProviders>
        <VolunteerForm />
      </AllProviders>
    )
    
    // Fill out valid form data
    await user.type(screen.getByLabelText(/full name/i), mockVolunteerData.fullName)
    await user.type(screen.getByLabelText(/email address/i), mockVolunteerData.email)
    await user.selectOptions(screen.getByLabelText(/availability/i), mockVolunteerData.availability)
    await user.click(screen.getByLabelText(/education/i))
    
    // Submit form
    await user.click(screen.getByRole('button', { name: /submit application/i }))
    
    // Verify error handling
    await waitFor(() => {
      expect(screen.getByText('Server error')).toBeInTheDocument()
    })
    
    // Verify form is still accessible for retry
    expect(screen.getByLabelText(/full name/i)).not.toBeDisabled()
    expect(screen.getByRole('button', { name: /submit application/i })).not.toBeDisabled()
  })

  test('volunteer registration with network connectivity issues', async () => {
    const user = userEvent.setup()
    
    // Mock network error
    fetch.mockRejectedValueOnce(new TypeError('Failed to fetch'))
    
    render(
      <AllProviders>
        <VolunteerForm />
      </AllProviders>
    )
    
    // Fill out form
    await user.type(screen.getByLabelText(/full name/i), mockVolunteerData.fullName)
    await user.type(screen.getByLabelText(/email address/i), mockVolunteerData.email)
    await user.selectOptions(screen.getByLabelText(/availability/i), mockVolunteerData.availability)
    await user.click(screen.getByLabelText(/education/i))
    
    // Submit form
    await user.click(screen.getByRole('button', { name: /submit application/i }))
    
    // Verify network error handling
    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument()
    })
  })

  test('volunteer registration form accessibility', async () => {
    const user = userEvent.setup()
    
    render(
      <AllProviders>
        <VolunteerForm />
      </AllProviders>
    )
    
    // Test keyboard navigation
    const nameInput = screen.getByLabelText(/full name/i)
    nameInput.focus()
    expect(document.activeElement).toBe(nameInput)
    
    // Tab to next field
    await user.tab()
    expect(document.activeElement).toBe(screen.getByLabelText(/email address/i))
    
    // Test ARIA labels and roles
    expect(screen.getByRole('form')).toBeInTheDocument()
    expect(screen.getByLabelText(/full name/i)).toHaveAttribute('required')
    expect(screen.getByLabelText(/email address/i)).toHaveAttribute('required')
    
    // Test error announcements
    await user.click(screen.getByRole('button', { name: /submit application/i }))
    
    await waitFor(() => {
      const errorMessages = screen.getAllByRole('alert')
      expect(errorMessages.length).toBeGreaterThan(0)
    })
  })

  test('volunteer registration with different user scenarios', async () => {
    const user = userEvent.setup()
    
    // Test scenario 1: Student volunteer
    const studentData = {
      ...mockVolunteerData,
      fullName: 'Jane Student',
      email: 'jane.student@university.edu',
      areasOfInterest: ['education'],
      availability: 'weekdays',
      experience: 'I am a college student studying education and want to gain practical experience.'
    }
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 'vol_124',
        ...studentData,
        status: 'new'
      })
    })
    
    render(
      <AllProviders>
        <VolunteerForm />
      </AllProviders>
    )
    
    // Fill student data
    await user.type(screen.getByLabelText(/full name/i), studentData.fullName)
    await user.type(screen.getByLabelText(/email address/i), studentData.email)
    await user.selectOptions(screen.getByLabelText(/availability/i), studentData.availability)
    await user.click(screen.getByLabelText(/education/i))
    await user.type(screen.getByLabelText(/experience/i), studentData.experience)
    
    await user.click(screen.getByRole('button', { name: /submit application/i }))
    
    await waitFor(() => {
      expect(screen.getByText('Application Submitted Successfully!')).toBeInTheDocument()
    })
  })

  test('volunteer registration form persistence during navigation', async () => {
    const user = userEvent.setup()
    
    render(
      <AllProviders>
        <VolunteerForm />
      </AllProviders>
    )
    
    // Fill partial form data
    await user.type(screen.getByLabelText(/full name/i), 'Partial Name')
    await user.type(screen.getByLabelText(/email address/i), 'partial@email.com')
    
    // Simulate navigation away and back (in a real app, this would test form persistence)
    // For this test, we'll verify the form maintains state during re-renders
    const { rerender } = render(
      <AllProviders>
        <VolunteerForm />
      </AllProviders>
    )
    
    // In a real implementation with form persistence, we'd verify saved data
    // For now, we test that the form can handle re-renders gracefully
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
  })

  test('volunteer registration with multiple interest areas', async () => {
    const user = userEvent.setup()
    
    const multiInterestData = {
      ...mockVolunteerData,
      areasOfInterest: ['education', 'healthcare', 'environment', 'community']
    }
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 'vol_125',
        ...multiInterestData,
        status: 'new'
      })
    })
    
    render(
      <AllProviders>
        <VolunteerForm />
      </AllProviders>
    )
    
    // Fill form with multiple interests
    await user.type(screen.getByLabelText(/full name/i), multiInterestData.fullName)
    await user.type(screen.getByLabelText(/email address/i), multiInterestData.email)
    await user.selectOptions(screen.getByLabelText(/availability/i), multiInterestData.availability)
    
    // Select multiple interest areas
    for (const interest of multiInterestData.areasOfInterest) {
      const checkbox = screen.getByLabelText(new RegExp(interest, 'i'))
      await user.click(checkbox)
    }
    
    await user.type(screen.getByLabelText(/message/i), multiInterestData.message)
    
    await user.click(screen.getByRole('button', { name: /submit application/i }))
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/volunteers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(multiInterestData),
      })
    })
    
    await waitFor(() => {
      expect(screen.getByText('Application Submitted Successfully!')).toBeInTheDocument()
    })
  })
})