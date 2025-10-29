import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import { AppProvider } from '../context/AppContext'
import Donate from '../pages/Donate'
import DonationForm from '../components/forms/DonationForm'

// Mock fetch globally
global.fetch = vi.fn()

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

describe('Complete Donation Flow', () => {
  const mockDonationData = {
    fullName: 'Jane Donor',
    email: 'jane.donor@example.com',
    phone: '+91 98765 43210',
    amountInInr: 5000,
    recurring: false,
    message: 'Happy to support your educational programs!'
  }

  const mockRazorpayOrder = {
    id: 'order_123456789',
    amount: 500000, // Amount in paise
    currency: 'INR',
    status: 'created'
  }

  const mockPaymentResponse = {
    razorpay_order_id: 'order_123456789',
    razorpay_payment_id: 'pay_987654321',
    razorpay_signature: 'signature_abc123'
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

  test('complete donation journey from landing to payment confirmation', async () => {
    const user = userEvent.setup()
    
    // Mock API responses
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockRazorpayOrder
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'donation_123',
          ...mockDonationData,
          paymentStatus: 'completed',
          transactionId: 'pay_987654321',
          receiptSent: true
        })
      })
    
    // Mock successful Razorpay payment
    global.Razorpay.mockImplementation((options) => ({
      open: vi.fn(() => {
        // Simulate successful payment
        setTimeout(() => {
          options.handler(mockPaymentResponse)
        }, 100)
      }),
      on: vi.fn()
    }))
    
    render(
      <AllProviders>
        <Donate />
      </AllProviders>
    )
    
    // Step 1: User lands on donation page
    expect(screen.getByText('Support Our Mission')).toBeInTheDocument()
    expect(screen.getByText(/make a difference/i)).toBeInTheDocument()
    
    // Step 2: User sees donation options and impact information
    expect(screen.getByText(/your donation helps/i)).toBeInTheDocument()
    
    // Step 3: User selects donation amount
    const amount5000Button = screen.getByRole('button', { name: /₹5,000/i })
    await user.click(amount5000Button)
    
    // Verify amount is selected
    expect(amount5000Button).toHaveClass('border-primary-500')
    
    // Step 4: Fill donor information
    const nameInput = screen.getByLabelText(/full name/i)
    const emailInput = screen.getByLabelText(/email address/i)
    const phoneInput = screen.getByLabelText(/phone number/i)
    const messageInput = screen.getByLabelText(/message/i)
    
    await user.type(nameInput, mockDonationData.fullName)
    await user.type(emailInput, mockDonationData.email)
    await user.type(phoneInput, mockDonationData.phone)
    await user.type(messageInput, mockDonationData.message)
    
    // Step 5: Review donation details
    expect(screen.getByText('₹5,000')).toBeInTheDocument()
    expect(screen.getByText(mockDonationData.fullName)).toBeInTheDocument()
    
    // Step 6: Proceed to payment
    const donateButton = screen.getByRole('button', { name: /donate now/i })
    await user.click(donateButton)
    
    // Step 7: Verify Razorpay order creation
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/donations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockDonationData),
      })
    })
    
    // Step 8: Verify Razorpay initialization
    await waitFor(() => {
      expect(global.Razorpay).toHaveBeenCalledWith(
        expect.objectContaining({
          key: expect.any(String),
          amount: mockRazorpayOrder.amount,
          currency: mockRazorpayOrder.currency,
          order_id: mockRazorpayOrder.id,
          name: 'Urjja Pratishthan Prakashalay',
          description: 'Donation to support our mission',
          prefill: {
            name: mockDonationData.fullName,
            email: mockDonationData.email,
            contact: mockDonationData.phone
          }
        })
      )
    })
    
    // Step 9: Verify payment processing
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/donations/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: mockRazorpayOrder.id,
          paymentId: mockPaymentResponse.razorpay_payment_id,
          signature: mockPaymentResponse.razorpay_signature
        }),
      })
    })
    
    // Step 10: Verify success message
    await waitFor(() => {
      expect(screen.getByText('Donation Successful!')).toBeInTheDocument()
      expect(screen.getByText(/thank you for your generous donation/i)).toBeInTheDocument()
    })
    
    // Step 11: Verify donation receipt information
    expect(screen.getByText(mockDonationData.fullName)).toBeInTheDocument()
    expect(screen.getByText('₹5,000')).toBeInTheDocument()
    expect(screen.getByText('pay_987654321')).toBeInTheDocument()
    
    // Step 12: Verify tax benefit information
    expect(screen.getByText(/tax deduction/i)).toBeInTheDocument()
    expect(screen.getByText(/section 80g/i)).toBeInTheDocument()
    
    // Step 13: Verify next steps
    expect(screen.getByText(/receipt has been sent/i)).toBeInTheDocument()
    
    // Step 14: Test additional donation option
    expect(screen.getByText('Make Another Donation')).toBeInTheDocument()
  })

  test('donation with custom amount', async () => {
    const user = userEvent.setup()
    
    const customAmount = 7500
    const customDonationData = {
      ...mockDonationData,
      amountInInr: customAmount
    }
    
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ...mockRazorpayOrder,
          amount: customAmount * 100
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'donation_124',
          ...customDonationData,
          paymentStatus: 'completed'
        })
      })
    
    global.Razorpay.mockImplementation((options) => ({
      open: vi.fn(() => options.handler(mockPaymentResponse)),
      on: vi.fn()
    }))
    
    render(
      <AllProviders>
        <DonationForm />
      </AllProviders>
    )
    
    // Select custom amount
    const customAmountButton = screen.getByRole('button', { name: /custom amount/i })
    await user.click(customAmountButton)
    
    // Enter custom amount
    const customAmountInput = screen.getByLabelText(/enter amount/i)
    await user.type(customAmountInput, customAmount.toString())
    
    // Fill donor information
    await user.type(screen.getByLabelText(/full name/i), customDonationData.fullName)
    await user.type(screen.getByLabelText(/email address/i), customDonationData.email)
    
    // Submit donation
    await user.click(screen.getByRole('button', { name: /donate now/i }))
    
    // Verify custom amount in API call
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/donations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customDonationData),
      })
    })
  })

  test('recurring donation setup', async () => {
    const user = userEvent.setup()
    
    const recurringDonationData = {
      ...mockDonationData,
      recurring: true,
      frequency: 'monthly'
    }
    
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockRazorpayOrder
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'donation_125',
          ...recurringDonationData,
          paymentStatus: 'completed'
        })
      })
    
    global.Razorpay.mockImplementation((options) => ({
      open: vi.fn(() => options.handler(mockPaymentResponse)),
      on: vi.fn()
    }))
    
    render(
      <AllProviders>
        <DonationForm />
      </AllProviders>
    )
    
    // Select amount
    await user.click(screen.getByRole('button', { name: /₹5,000/i }))
    
    // Enable recurring donation
    const recurringCheckbox = screen.getByLabelText(/make this a recurring donation/i)
    await user.click(recurringCheckbox)
    
    // Select frequency
    const frequencySelect = screen.getByLabelText(/frequency/i)
    await user.selectOptions(frequencySelect, 'monthly')
    
    // Fill donor information
    await user.type(screen.getByLabelText(/full name/i), recurringDonationData.fullName)
    await user.type(screen.getByLabelText(/email address/i), recurringDonationData.email)
    
    // Submit donation
    await user.click(screen.getByRole('button', { name: /donate now/i }))
    
    // Verify recurring donation data
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/donations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(recurringDonationData),
      })
    })
    
    // Verify recurring donation confirmation
    await waitFor(() => {
      expect(screen.getByText(/recurring donation/i)).toBeInTheDocument()
      expect(screen.getByText(/monthly/i)).toBeInTheDocument()
    })
  })

  test('donation form validation', async () => {
    const user = userEvent.setup()
    
    render(
      <AllProviders>
        <DonationForm />
      </AllProviders>
    )
    
    // Try to submit without selecting amount
    const donateButton = screen.getByRole('button', { name: /donate now/i })
    await user.click(donateButton)
    
    // Verify validation errors
    await waitFor(() => {
      expect(screen.getByText('Please select a donation amount')).toBeInTheDocument()
      expect(screen.getByText('Full name is required')).toBeInTheDocument()
      expect(screen.getByText('Email is required')).toBeInTheDocument()
    })
    
    // Test invalid email
    await user.type(screen.getByLabelText(/email address/i), 'invalid-email')
    await user.click(donateButton)
    
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
    })
    
    // Test minimum donation amount
    const customAmountButton = screen.getByRole('button', { name: /custom amount/i })
    await user.click(customAmountButton)
    
    const customAmountInput = screen.getByLabelText(/enter amount/i)
    await user.type(customAmountInput, '50') // Below minimum
    
    await user.click(donateButton)
    
    await waitFor(() => {
      expect(screen.getByText('Minimum donation amount is ₹100')).toBeInTheDocument()
    })
  })

  test('payment failure handling', async () => {
    const user = userEvent.setup()
    
    // Mock order creation success but payment failure
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockRazorpayOrder
    })
    
    // Mock Razorpay payment failure
    global.Razorpay.mockImplementation((options) => ({
      open: vi.fn(() => {
        // Simulate payment failure
        setTimeout(() => {
          options.modal.ondismiss()
        }, 100)
      }),
      on: vi.fn()
    }))
    
    render(
      <AllProviders>
        <DonationForm />
      </AllProviders>
    )
    
    // Fill form and submit
    await user.click(screen.getByRole('button', { name: /₹5,000/i }))
    await user.type(screen.getByLabelText(/full name/i), mockDonationData.fullName)
    await user.type(screen.getByLabelText(/email address/i), mockDonationData.email)
    
    await user.click(screen.getByRole('button', { name: /donate now/i }))
    
    // Verify payment failure handling
    await waitFor(() => {
      expect(screen.getByText(/payment was cancelled/i)).toBeInTheDocument()
    })
    
    // Verify retry option
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
  })

  test('network error during donation', async () => {
    const user = userEvent.setup()
    
    // Mock network error
    fetch.mockRejectedValueOnce(new TypeError('Failed to fetch'))
    
    render(
      <AllProviders>
        <DonationForm />
      </AllProviders>
    )
    
    // Fill form and submit
    await user.click(screen.getByRole('button', { name: /₹5,000/i }))
    await user.type(screen.getByLabelText(/full name/i), mockDonationData.fullName)
    await user.type(screen.getByLabelText(/email address/i), mockDonationData.email)
    
    await user.click(screen.getByRole('button', { name: /donate now/i }))
    
    // Verify network error handling
    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument()
    })
  })

  test('donation form accessibility', async () => {
    const user = userEvent.setup()
    
    render(
      <AllProviders>
        <DonationForm />
      </AllProviders>
    )
    
    // Test keyboard navigation
    const firstAmountButton = screen.getByRole('button', { name: /₹1,000/i })
    firstAmountButton.focus()
    expect(document.activeElement).toBe(firstAmountButton)
    
    // Tab through amount buttons
    await user.tab()
    expect(document.activeElement).toBe(screen.getByRole('button', { name: /₹2,500/i }))
    
    // Test ARIA labels
    expect(screen.getByLabelText(/full name/i)).toHaveAttribute('required')
    expect(screen.getByLabelText(/email address/i)).toHaveAttribute('required')
    
    // Test form role
    expect(screen.getByRole('form')).toBeInTheDocument()
  })

  test('donation impact display', async () => {
    const user = userEvent.setup()
    
    render(
      <AllProviders>
        <Donate />
      </AllProviders>
    )
    
    // Verify impact information is displayed
    expect(screen.getByText(/your donation helps/i)).toBeInTheDocument()
    
    // Test different amount impacts
    await user.click(screen.getByRole('button', { name: /₹1,000/i }))
    expect(screen.getByText(/can provide educational materials/i)).toBeInTheDocument()
    
    await user.click(screen.getByRole('button', { name: /₹5,000/i }))
    expect(screen.getByText(/can sponsor a student/i)).toBeInTheDocument()
    
    await user.click(screen.getByRole('button', { name: /₹10,000/i }))
    expect(screen.getByText(/can fund a complete program/i)).toBeInTheDocument()
  })

  test('donation receipt and follow-up', async () => {
    const user = userEvent.setup()
    
    const donationResponse = {
      id: 'donation_126',
      ...mockDonationData,
      paymentStatus: 'completed',
      transactionId: 'pay_987654321',
      receiptSent: true,
      receiptUrl: '/receipts/donation_126.pdf'
    }
    
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockRazorpayOrder
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => donationResponse
      })
    
    global.Razorpay.mockImplementation((options) => ({
      open: vi.fn(() => options.handler(mockPaymentResponse)),
      on: vi.fn()
    }))
    
    render(
      <AllProviders>
        <DonationForm />
      </AllProviders>
    )
    
    // Complete donation
    await user.click(screen.getByRole('button', { name: /₹5,000/i }))
    await user.type(screen.getByLabelText(/full name/i), mockDonationData.fullName)
    await user.type(screen.getByLabelText(/email address/i), mockDonationData.email)
    await user.click(screen.getByRole('button', { name: /donate now/i }))
    
    // Verify receipt information
    await waitFor(() => {
      expect(screen.getByText('Donation Successful!')).toBeInTheDocument()
      expect(screen.getByText(/receipt has been sent/i)).toBeInTheDocument()
    })
    
    // Verify follow-up options
    expect(screen.getByText('Download Receipt')).toBeInTheDocument()
    expect(screen.getByText('Share on Social Media')).toBeInTheDocument()
    expect(screen.getByText('Make Another Donation')).toBeInTheDocument()
  })
})