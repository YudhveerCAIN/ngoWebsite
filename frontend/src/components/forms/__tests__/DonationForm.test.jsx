import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DonationForm from '../DonationForm'

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock Razorpay
global.Razorpay = vi.fn().mockImplementation(() => ({
  open: vi.fn()
}))

describe('DonationForm', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    global.Razorpay.mockClear()
  })

  test('renders donation form with amount selection', () => {
    render(<DonationForm />)
    
    expect(screen.getByText('Make a Donation')).toBeInTheDocument()
    expect(screen.getByText('Choose Donation Amount')).toBeInTheDocument()
    expect(screen.getByText('₹500')).toBeInTheDocument()
    expect(screen.getByText('₹1,000')).toBeInTheDocument()
    expect(screen.getByText('₹2,500')).toBeInTheDocument()
  })

  test('allows selecting predefined amounts', async () => {
    const user = userEvent.setup()
    render(<DonationForm />)
    
    const amount500Button = screen.getByText('₹500')
    await user.click(amount500Button)
    
    const customAmountInput = screen.getByLabelText(/custom amount/i)
    expect(customAmountInput.value).toBe('500')
  })

  test('validates custom amount input', async () => {
    const user = userEvent.setup()
    render(<DonationForm />)
    
    const customAmountInput = screen.getByLabelText(/custom amount/i)
    await user.type(customAmountInput, '0')
    
    const continueButton = screen.getByText('Continue to Details')
    await user.click(continueButton)
    
    await waitFor(() => {
      expect(screen.getByText(/minimum donation amount/i)).toBeInTheDocument()
    })
  })

  test('progresses through form steps', async () => {
    const user = userEvent.setup()
    render(<DonationForm />)
    
    // Step 1: Select amount
    const amount1000Button = screen.getByText('₹1,000')
    await user.click(amount1000Button)
    
    const continueButton = screen.getByText('Continue to Details')
    await user.click(continueButton)
    
    // Step 2: Should show donor information form
    await waitFor(() => {
      expect(screen.getByText('Donor Information')).toBeInTheDocument()
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    })
  })

  test('validates donor information', async () => {
    const user = userEvent.setup()
    render(<DonationForm />)
    
    // Navigate to step 2
    const amount1000Button = screen.getByText('₹1,000')
    await user.click(amount1000Button)
    
    const continueButton = screen.getByText('Continue to Details')
    await user.click(continueButton)
    
    // Try to continue without filling required fields
    const continueToPaymentButton = screen.getByText('Continue to Payment')
    await user.click(continueToPaymentButton)
    
    await waitFor(() => {
      expect(screen.getByText(/full name is required/i)).toBeInTheDocument()
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
    })
  })

  test('validates email format in donor information', async () => {
    const user = userEvent.setup()
    render(<DonationForm />)
    
    // Navigate to step 2
    const amount1000Button = screen.getByText('₹1,000')
    await user.click(amount1000Button)
    await user.click(screen.getByText('Continue to Details'))
    
    // Fill invalid email
    await user.type(screen.getByLabelText(/full name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email address/i), 'invalid-email')
    
    const continueToPaymentButton = screen.getByText('Continue to Payment')
    await user.click(continueToPaymentButton)
    
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument()
    })
  })

  test('shows payment options in step 3', async () => {
    const user = userEvent.setup()
    render(<DonationForm />)
    
    // Navigate through steps
    const amount1000Button = screen.getByText('₹1,000')
    await user.click(amount1000Button)
    await user.click(screen.getByText('Continue to Details'))
    
    // Fill donor information
    await user.type(screen.getByLabelText(/full name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email address/i), 'john@example.com')
    await user.click(screen.getByText('Continue to Payment'))
    
    // Should show payment options
    await waitFor(() => {
      expect(screen.getByText('Payment Method')).toBeInTheDocument()
      expect(screen.getByText('Donation Summary')).toBeInTheDocument()
      expect(screen.getByText('Online Payment (Recommended)')).toBeInTheDocument()
      expect(screen.getByText('Offline Payment')).toBeInTheDocument()
    })
  })

  test('shows donation summary correctly', async () => {
    const user = userEvent.setup()
    render(<DonationForm />)
    
    // Navigate to payment step
    const amount2500Button = screen.getByText('₹2,500')
    await user.click(amount2500Button)
    await user.click(screen.getByText('Continue to Details'))
    
    await user.type(screen.getByLabelText(/full name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email address/i), 'john@example.com')
    await user.click(screen.getByText('Continue to Payment'))
    
    // Check donation summary
    await waitFor(() => {
      expect(screen.getByText('₹2,500')).toBeInTheDocument()
    })
  })

  test('handles recurring donation selection', async () => {
    const user = userEvent.setup()
    render(<DonationForm />)
    
    // Select amount and enable recurring
    const amount1000Button = screen.getByText('₹1,000')
    await user.click(amount1000Button)
    
    const recurringCheckbox = screen.getByLabelText(/make this a recurring donation/i)
    await user.click(recurringCheckbox)
    
    // Should show frequency selector
    await waitFor(() => {
      expect(screen.getByLabelText(/frequency/i)).toBeInTheDocument()
    })
  })

  test('submits donation form successfully', async () => {
    const user = userEvent.setup()
    const mockOnSuccess = vi.fn()
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: '123',
        fullName: 'John Doe',
        email: 'john@example.com',
        amountInInr: 1000,
        paymentStatus: 'pending'
      })
    })
    
    render(<DonationForm onSuccess={mockOnSuccess} />)
    
    // Fill complete form
    const amount1000Button = screen.getByText('₹1,000')
    await user.click(amount1000Button)
    await user.click(screen.getByText('Continue to Details'))
    
    await user.type(screen.getByLabelText(/full name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email address/i), 'john@example.com')
    await user.type(screen.getByLabelText(/phone number/i), '+91 98765 43210')
    await user.click(screen.getByText('Continue to Payment'))
    
    // Select offline payment for easier testing
    const offlinePaymentRadio = screen.getByLabelText(/offline payment/i)
    await user.click(offlinePaymentRadio)
    
    const donateButton = screen.getByText(/donate ₹1,000/i)
    await user.click(donateButton)
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/donations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: 'John Doe',
          email: 'john@example.com',
          phone: '+91 98765 43210',
          amountInInr: 1000,
          currency: 'INR',
          recurring: false,
          frequency: 'monthly',
          paymentProvider: 'offline'
        })
      })
    })
    
    // Should show success message
    await waitFor(() => {
      expect(screen.getByText(/thank you for your donation!/i)).toBeInTheDocument()
    })
    
    expect(mockOnSuccess).toHaveBeenCalled()
  })

  test('handles API errors gracefully', async () => {
    const user = userEvent.setup()
    
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        message: 'Validation failed'
      })
    })
    
    render(<DonationForm />)
    
    // Fill and submit form
    const amount1000Button = screen.getByText('₹1,000')
    await user.click(amount1000Button)
    await user.click(screen.getByText('Continue to Details'))
    
    await user.type(screen.getByLabelText(/full name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email address/i), 'john@example.com')
    await user.click(screen.getByText('Continue to Payment'))
    
    const donateButton = screen.getByText(/donate ₹1,000/i)
    await user.click(donateButton)
    
    await waitFor(() => {
      expect(screen.getByText(/validation failed/i)).toBeInTheDocument()
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
    
    render(<DonationForm />)
    
    // Fill and submit form
    const amount1000Button = screen.getByText('₹1,000')
    await user.click(amount1000Button)
    await user.click(screen.getByText('Continue to Details'))
    
    await user.type(screen.getByLabelText(/full name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email address/i), 'john@example.com')
    await user.click(screen.getByText('Continue to Payment'))
    
    const donateButton = screen.getByText(/donate ₹1,000/i)
    await user.click(donateButton)
    
    // Should show loading state
    expect(screen.getByText(/processing.../i)).toBeInTheDocument()
    expect(donateButton).toBeDisabled()
  })

  test('allows navigation between steps', async () => {
    const user = userEvent.setup()
    render(<DonationForm />)
    
    // Go to step 2
    const amount1000Button = screen.getByText('₹1,000')
    await user.click(amount1000Button)
    await user.click(screen.getByText('Continue to Details'))
    
    // Go back to step 1
    const backButton = screen.getByText('← Back to Amount')
    await user.click(backButton)
    
    // Should be back at step 1
    expect(screen.getByText('Choose Donation Amount')).toBeInTheDocument()
  })
})