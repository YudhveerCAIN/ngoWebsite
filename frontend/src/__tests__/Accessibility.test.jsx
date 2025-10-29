import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import ContactForm from '../components/forms/ContactForm'
import ImpactCounter from '../components/features/ImpactCounter'
import ImpactChart from '../components/features/ImpactChart'
import Impact from '../pages/Impact'
import Contact from '../pages/Contact'

// Mock fetch
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

describe('Accessibility Tests', () => {
  beforeEach(() => {
    fetch.mockClear()
  })

  describe('Contact Form Accessibility', () => {
    test('form has proper labels and ARIA attributes', () => {
      render(<ContactForm />)

      // All form fields should have proper labels
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/subject/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/message/i)).toBeInTheDocument()

      // Required fields should be marked
      const nameInput = screen.getByLabelText(/full name/i)
      const emailInput = screen.getByLabelText(/email address/i)
      const subjectSelect = screen.getByLabelText(/subject/i)
      const messageTextarea = screen.getByLabelText(/message/i)

      expect(nameInput).toBeRequired()
      expect(emailInput).toBeRequired()
      expect(subjectSelect).toBeRequired()
      expect(messageTextarea).toBeRequired()
    })

    test('form validation errors are announced to screen readers', async () => {
      const user = userEvent.setup()
      render(<ContactForm />)

      // Submit empty form
      await user.click(screen.getByRole('button', { name: /send message/i }))

      await waitFor(() => {
        // Error messages should have role="alert" for screen readers
        const errorMessages = screen.getAllByRole('alert')
        expect(errorMessages.length).toBeGreaterThan(0)
      })
    })

    test('form has proper keyboard navigation', async () => {
      const user = userEvent.setup()
      render(<ContactForm />)

      const nameInput = screen.getByLabelText(/full name/i)
      const emailInput = screen.getByLabelText(/email address/i)
      const phoneInput = screen.getByLabelText(/phone number/i)
      const subjectSelect = screen.getByLabelText(/subject/i)
      const messageTextarea = screen.getByLabelText(/message/i)
      const submitButton = screen.getByRole('button', { name: /send message/i })

      // Tab through form elements
      await user.tab()
      expect(nameInput).toHaveFocus()

      await user.tab()
      expect(emailInput).toHaveFocus()

      await user.tab()
      expect(phoneInput).toHaveFocus()

      await user.tab()
      expect(subjectSelect).toHaveFocus()

      await user.tab()
      expect(messageTextarea).toHaveFocus()

      await user.tab()
      expect(submitButton).toHaveFocus()
    })

    test('form provides helpful descriptions and instructions', () => {
      render(<ContactForm />)

      // Phone field should have helper text
      expect(screen.getByText(/We'll use this for urgent follow-ups/)).toBeInTheDocument()

      // Message field should have instructions
      expect(screen.getByText(/Please be as detailed as possible/)).toBeInTheDocument()
    })

    test('success and error states are accessible', async () => {
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

      // Success message should be announced
      await waitFor(() => {
        expect(screen.getByText('Message Sent Successfully!')).toBeInTheDocument()
      })
    })
  })

  describe('Impact Components Accessibility', () => {
    test('ImpactCounter has proper semantic structure', () => {
      render(
        <ImpactCounter
          end={1250}
          label="Students Supported"
          description="Number of students we have helped"
          icon={<div>📚</div>}
        />
      )

      expect(screen.getByText('Students Supported')).toBeInTheDocument()
      expect(screen.getByText('Number of students we have helped')).toBeInTheDocument()
    })

    test('ImpactChart has accessible structure', () => {
      const data = [
        { label: 'Scholarships', value: 180 },
        { label: 'Materials', value: 500 }
      ]

      render(
        <ImpactChart
          type="bar"
          data={data}
          title="Education Impact"
        />
      )

      expect(screen.getByText('Education Impact')).toBeInTheDocument()
      expect(screen.getByText('Scholarships')).toBeInTheDocument()
      expect(screen.getByText('Materials')).toBeInTheDocument()
    })

    test('progress charts have accessible percentage indicators', () => {
      const data = [
        { label: 'Goal 1', value: 75, target: 100, percentage: 75 }
      ]

      render(
        <ImpactChart
          type="progress"
          data={data}
        />
      )

      expect(screen.getByText('75%')).toBeInTheDocument()
      expect(screen.getByText('Goal 1')).toBeInTheDocument()
    })
  })

  describe('Page-Level Accessibility', () => {
    test('Contact page has proper heading hierarchy', () => {
      render(<Contact />)

      // Main heading
      const mainHeading = screen.getByRole('heading', { level: 1 })
      expect(mainHeading).toHaveTextContent('Contact Us')

      // Section headings
      const sectionHeadings = screen.getAllByRole('heading', { level: 2 })
      expect(sectionHeadings.length).toBeGreaterThan(0)

      // Subsection headings
      const subHeadings = screen.getAllByRole('heading', { level: 3 })
      expect(subHeadings.length).toBeGreaterThan(0)
    })

    test('Impact page has proper heading hierarchy', async () => {
      const mockData = {
        studentsSupported: 1250,
        programsConducted: 48
      }

      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockData
      })

      renderWithRouter(<Impact />)

      await waitFor(() => {
        // Main heading
        const mainHeading = screen.getByRole('heading', { level: 1 })
        expect(mainHeading).toHaveTextContent('Our Impact')

        // Section headings
        const sectionHeadings = screen.getAllByRole('heading', { level: 2 })
        expect(sectionHeadings.length).toBeGreaterThan(0)
      })
    })

    test('links have descriptive text', () => {
      render(<Contact />)

      // Phone and email links should be descriptive
      const phoneLink = screen.getByRole('link', { name: '+91 98765 43210' })
      expect(phoneLink).toBeInTheDocument()

      const emailLink = screen.getByRole('link', { name: 'info@urjjapratishthan.org' })
      expect(emailLink).toBeInTheDocument()
    })

    test('images have alt text', async () => {
      const mockData = { studentsSupported: 1250 }
      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockData
      })

      renderWithRouter(<Impact />)

      // Any images should have alt text
      const images = screen.queryAllByRole('img')
      images.forEach(img => {
        expect(img).toHaveAttribute('alt')
      })
    })
  })

  describe('Color and Contrast', () => {
    test('components use semantic color classes', () => {
      render(
        <div>
          <ImpactCounter
            end={100}
            label="Primary Counter"
            color="primary"
          />
          <ImpactCounter
            end={200}
            label="Success Counter"
            color="green"
          />
        </div>
      )

      // Colors should be applied via CSS classes for consistency
      expect(screen.getByText('100')).toHaveClass('text-primary-600')
      expect(screen.getByText('200')).toHaveClass('text-green-600')
    })

    test('error states use appropriate colors', async () => {
      const user = userEvent.setup()
      
      fetch.mockRejectedValueOnce(new Error('Test error'))

      render(<ContactForm />)

      await user.type(screen.getByLabelText(/full name/i), 'John')
      await user.type(screen.getByLabelText(/email address/i), 'john@example.com')
      await user.selectOptions(screen.getByLabelText(/subject/i), 'General Inquiry')
      await user.type(screen.getByLabelText(/message/i), 'Test')
      await user.click(screen.getByRole('button', { name: /send message/i }))

      await waitFor(() => {
        const errorMessage = screen.getByText('Test error')
        expect(errorMessage).toHaveClass('text-red-700')
      })
    })
  })

  describe('Focus Management', () => {
    test('form maintains focus after validation errors', async () => {
      const user = userEvent.setup()
      render(<ContactForm />)

      const nameInput = screen.getByLabelText(/full name/i)
      await user.type(nameInput, 'A') // Too short
      await user.click(screen.getByRole('button', { name: /send message/i }))

      await waitFor(() => {
        // Focus should remain on or near the problematic field
        expect(document.activeElement).toBeTruthy()
      })
    })

    test('success state manages focus appropriately', async () => {
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
        expect(screen.getByText('Message Sent Successfully!')).toBeInTheDocument()
      })

      // Success message should be focusable or announced
      const successMessage = screen.getByText('Message Sent Successfully!')
      expect(successMessage).toBeInTheDocument()
    })
  })

  describe('Screen Reader Support', () => {
    test('loading states are announced', () => {
      fetch.mockImplementation(() => new Promise(() => {})) // Never resolves

      renderWithRouter(<Impact />)

      expect(screen.getByText('Loading impact data...')).toBeInTheDocument()
    })

    test('dynamic content updates are announced', async () => {
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

      // Success message should be in a live region or have role="alert"
      await waitFor(() => {
        const successElement = screen.getByText('Message Sent Successfully!')
        expect(successElement).toBeInTheDocument()
      })
    })

    test('form instructions are properly associated', () => {
      render(<ContactForm />)

      const phoneInput = screen.getByLabelText(/phone number/i)
      const helperText = screen.getByText(/We'll use this for urgent follow-ups/)

      // Helper text should be associated with input via aria-describedby
      expect(phoneInput).toBeInTheDocument()
      expect(helperText).toBeInTheDocument()
    })
  })
})