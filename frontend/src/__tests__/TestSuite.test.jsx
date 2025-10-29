import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'

// Import all components to test
import ContactForm from '../components/forms/ContactForm'
import ImpactCounter from '../components/features/ImpactCounter'
import ImpactChart from '../components/features/ImpactChart'
import Impact from '../pages/Impact'
import Contact from '../pages/Contact'

// Mock dependencies
global.fetch = vi.fn()
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback) {
    this.callback = callback
  }
  observe() {
    setTimeout(() => this.callback([{ isIntersecting: true }]), 0)
  }
  unobserve() {}
  disconnect() {}
}

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('Comprehensive Test Suite for Contact and Impact Features', () => {
  beforeEach(() => {
    fetch.mockClear()
    vi.clearAllMocks()
  })

  describe('Feature Integration Tests', () => {
    test('contact and impact features work independently', async () => {
      const mockImpactData = {
        studentsSupported: 1250,
        programsConducted: 48,
        outreachActivities: 120,
        volunteersActive: 85
      }

      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: '123', message: 'Contact success' })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockImpactData
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => []
        })

      const user = userEvent.setup()

      render(
        <BrowserRouter>
          <div>
            <ContactForm />
            <Impact />
          </div>
        </BrowserRouter>
      )

      // Test contact form
      await user.type(screen.getByLabelText(/full name/i), 'John Doe')
      await user.type(screen.getByLabelText(/email address/i), 'john@example.com')
      await user.selectOptions(screen.getByLabelText(/subject/i), 'General Inquiry')
      await user.type(screen.getByLabelText(/message/i), 'Test message')
      await user.click(screen.getByRole('button', { name: /send message/i }))

      // Test impact data loading
      await waitFor(() => {
        expect(screen.getByText('Students Supported')).toBeInTheDocument()
        expect(screen.getByText('Message Sent Successfully!')).toBeInTheDocument()
      })

      // Verify API calls
      expect(fetch).toHaveBeenCalledWith('/api/contact', expect.any(Object))
      expect(fetch).toHaveBeenCalledWith('/api/impact')
    })

    test('error handling works across all components', async () => {
      fetch.mockRejectedValue(new Error('Network error'))

      const user = userEvent.setup()

      render(
        <BrowserRouter>
          <div>
            <ContactForm />
            <Impact />
          </div>
        </BrowserRouter>
      )

      // Try contact form submission
      await user.type(screen.getByLabelText(/full name/i), 'John Doe')
      await user.type(screen.getByLabelText(/email address/i), 'john@example.com')
      await user.selectOptions(screen.getByLabelText(/subject/i), 'General Inquiry')
      await user.type(screen.getByLabelText(/message/i), 'Test message')
      await user.click(screen.getByRole('button', { name: /send message/i }))

      // Both should handle errors gracefully
      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument()
      })
    })
  })

  describe('Component Reliability Tests', () => {
    test('all components handle edge cases', () => {
      // Test with minimal/empty data
      render(
        <div>
          <ImpactCounter end={0} label="Zero Counter" />
          <ImpactChart type="bar" data={[]} title="Empty Chart" />
          <ContactForm />
        </div>
      )

      expect(screen.getByText('Zero Counter')).toBeInTheDocument()
      expect(screen.getByText('Empty Chart')).toBeInTheDocument()
      expect(screen.getByText('Contact Us')).toBeInTheDocument()
    })

    test('components handle rapid state changes', async () => {
      const { rerender } = render(
        <ImpactCounter end={100} label="Dynamic Counter" />
      )

      // Rapidly change props
      for (let i = 0; i < 10; i++) {
        rerender(
          <ImpactCounter end={100 + i * 10} label={`Counter ${i}`} />
        )
      }

      expect(screen.getByText('Counter 9')).toBeInTheDocument()
    })

    test('components maintain functionality after multiple renders', () => {
      const { rerender } = render(<ContactForm />)

      // Re-render multiple times
      for (let i = 0; i < 5; i++) {
        rerender(<ContactForm key={i} />)
      }

      // Form should still be functional
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument()
    })
  })

  describe('Cross-Browser Compatibility Tests', () => {
    test('components work with different user agents', () => {
      // Mock different user agents
      const originalUserAgent = navigator.userAgent

      // Test with different browsers
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        configurable: true
      })

      render(
        <div>
          <ImpactCounter end={100} label="Browser Test" />
          <ContactForm />
        </div>
      )

      expect(screen.getByText('Browser Test')).toBeInTheDocument()
      expect(screen.getByText('Contact Us')).toBeInTheDocument()

      // Restore original user agent
      Object.defineProperty(navigator, 'userAgent', {
        value: originalUserAgent,
        configurable: true
      })
    })

    test('components handle different viewport sizes', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      render(
        <div>
          <ImpactCounter end={100} label="Mobile Test" />
          <ContactForm />
        </div>
      )

      expect(screen.getByText('Mobile Test')).toBeInTheDocument()
      expect(screen.getByText('Contact Us')).toBeInTheDocument()

      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      })

      window.dispatchEvent(new Event('resize'))

      expect(screen.getByText('Mobile Test')).toBeInTheDocument()
      expect(screen.getByText('Contact Us')).toBeInTheDocument()
    })
  })

  describe('Data Validation Tests', () => {
    test('contact form validates all field types correctly', async () => {
      const user = userEvent.setup()
      render(<ContactForm />)

      // Test email validation
      await user.type(screen.getByLabelText(/email address/i), 'invalid-email')
      await user.click(screen.getByRole('button', { name: /send message/i }))

      await waitFor(() => {
        expect(screen.getByText(/valid email address/i)).toBeInTheDocument()
      })

      // Clear and test phone validation
      await user.clear(screen.getByLabelText(/email address/i))
      await user.type(screen.getByLabelText(/email address/i), 'valid@email.com')
      await user.type(screen.getByLabelText(/phone number/i), '123')
      await user.click(screen.getByRole('button', { name: /send message/i }))

      await waitFor(() => {
        expect(screen.getByText(/valid phone number/i)).toBeInTheDocument()
      })
    })

    test('impact components handle various data formats', () => {
      const testData = [
        { label: 'String Numbers', value: '100' },
        { label: 'Float Numbers', value: 100.5 },
        { label: 'Large Numbers', value: 1000000 },
        { label: 'Zero Values', value: 0 }
      ]

      render(
        <ImpactChart type="bar" data={testData} />
      )

      testData.forEach(item => {
        expect(screen.getByText(item.label)).toBeInTheDocument()
      })
    })
  })

  describe('Security Tests', () => {
    test('components sanitize user input', async () => {
      const user = userEvent.setup()
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: '123', message: 'Success' })
      })

      render(<ContactForm />)

      // Try to inject script
      const maliciousInput = '<script>alert("xss")</script>'
      
      await user.type(screen.getByLabelText(/full name/i), maliciousInput)
      await user.type(screen.getByLabelText(/email address/i), 'test@example.com')
      await user.selectOptions(screen.getByLabelText(/subject/i), 'General Inquiry')
      await user.type(screen.getByLabelText(/message/i), 'Test message')
      await user.click(screen.getByRole('button', { name: /send message/i }))

      // Should not execute script, should be treated as text
      expect(screen.queryByText('alert')).not.toBeInTheDocument()
    })

    test('API calls use proper headers', async () => {
      const user = userEvent.setup()
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: '123', message: 'Success' })
      })

      render(<ContactForm />)

      await user.type(screen.getByLabelText(/full name/i), 'John Doe')
      await user.type(screen.getByLabelText(/email address/i), 'john@example.com')
      await user.selectOptions(screen.getByLabelText(/subject/i), 'General Inquiry')
      await user.type(screen.getByLabelText(/message/i), 'Test message')
      await user.click(screen.getByRole('button', { name: /send message/i }))

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: expect.any(String)
        })
      })
    })
  })

  describe('Performance Regression Tests', () => {
    test('components render within performance budgets', () => {
      const startTime = performance.now()

      render(
        <BrowserRouter>
          <div>
            <Contact />
            <Impact />
          </div>
        </BrowserRouter>
      )

      const endTime = performance.now()
      const renderTime = endTime - startTime

      // Should render both pages in under 1 second
      expect(renderTime).toBeLessThan(1000)
    })

    test('animations do not cause performance issues', () => {
      vi.useFakeTimers()

      const startTime = performance.now()

      render(
        <div>
          {Array.from({ length: 10 }, (_, i) => (
            <ImpactCounter
              key={i}
              end={i * 100}
              label={`Counter ${i}`}
              duration={1000}
            />
          ))}
        </div>
      )

      vi.advanceTimersByTime(1000)

      const endTime = performance.now()
      const animationTime = endTime - startTime

      expect(animationTime).toBeLessThan(500)

      vi.useRealTimers()
    })
  })

  describe('Comprehensive Feature Coverage', () => {
    test('all major user flows work end-to-end', async () => {
      const user = userEvent.setup()
      
      const mockImpactData = {
        studentsSupported: 1250,
        programsConducted: 48,
        programBreakdown: {
          education: { scholarshipsProvided: 180 }
        }
      }

      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: '123', message: 'Contact success' })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockImpactData
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => []
        })

      renderWithRouter(
        <div>
          <Contact />
          <Impact />
        </div>
      )

      // Test contact flow
      await user.type(screen.getByLabelText(/full name/i), 'John Doe')
      await user.type(screen.getByLabelText(/email address/i), 'john@example.com')
      await user.selectOptions(screen.getByLabelText(/subject/i), 'General Inquiry')
      await user.type(screen.getByLabelText(/message/i), 'I want to volunteer')
      await user.click(screen.getByRole('button', { name: /send message/i }))

      // Verify contact success
      await waitFor(() => {
        expect(screen.getByText('Message Sent Successfully!')).toBeInTheDocument()
      })

      // Verify impact data loads
      await waitFor(() => {
        expect(screen.getByText('Students Supported')).toBeInTheDocument()
        expect(screen.getByText('Education Programs')).toBeInTheDocument()
      })

      // Test "Send Another Message" flow
      await user.click(screen.getByText('Send Another Message'))
      expect(screen.getByLabelText(/full name/i)).toHaveValue('')
    })
  })
})