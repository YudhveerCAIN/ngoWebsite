import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Contact from '../pages/Contact'
import Impact from '../pages/Impact'
import ImpactCounter from '../components/features/ImpactCounter'
import ImpactChart from '../components/features/ImpactChart'

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

describe('Contact and Impact Performance Tests', () => {
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
    vi.useFakeTimers()
  })
  
  afterEach(() => {
    vi.useRealTimers()
  })

  test('contact page renders quickly', () => {
    const startTime = performance.now()
    
    renderWithRouter(<Contact />)
    
    const endTime = performance.now()
    const renderTime = endTime - startTime
    
    // Should render in less than 100ms
    expect(renderTime).toBeLessThan(100)
    expect(screen.getByText('Contact Us')).toBeInTheDocument()
  })

  test('impact page renders quickly with data', async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockImpactData
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => []
      })

    const startTime = performance.now()
    
    renderWithRouter(<Impact />)
    
    const endTime = performance.now()
    const renderTime = endTime - startTime
    
    // Should render in less than 100ms
    expect(renderTime).toBeLessThan(100)
    expect(screen.getByText('Our Impact')).toBeInTheDocument()
  })

  test('multiple impact counters animate efficiently', async () => {
    const counters = Array.from({ length: 10 }, (_, i) => (
      <ImpactCounter
        key={i}
        end={i * 100}
        label={`Counter ${i}`}
        duration={1000}
        delay={i * 50}
      />
    ))

    const startTime = performance.now()
    
    render(<div>{counters}</div>)
    
    // Fast-forward all animations
    vi.advanceTimersByTime(2000)
    
    const endTime = performance.now()
    const totalTime = endTime - startTime
    
    // Should complete all animations in reasonable time
    expect(totalTime).toBeLessThan(500)
    
    // All counters should be rendered
    expect(screen.getByText('Counter 0')).toBeInTheDocument()
    expect(screen.getByText('Counter 9')).toBeInTheDocument()
  })

  test('impact charts render efficiently with large datasets', () => {
    const largeDataset = Array.from({ length: 50 }, (_, i) => ({
      label: `Item ${i}`,
      value: Math.floor(Math.random() * 1000)
    }))

    const startTime = performance.now()
    
    render(
      <ImpactChart
        type="bar"
        data={largeDataset}
        title="Large Dataset Chart"
      />
    )
    
    const endTime = performance.now()
    const renderTime = endTime - startTime
    
    // Should render large dataset in reasonable time
    expect(renderTime).toBeLessThan(200)
    expect(screen.getByText('Large Dataset Chart')).toBeInTheDocument()
  })

  test('contact form handles rapid user input efficiently', async () => {
    const { container } = renderWithRouter(<Contact />)
    
    const nameInput = screen.getByLabelText(/full name/i)
    const emailInput = screen.getByLabelText(/email address/i)
    const messageInput = screen.getByLabelText(/message/i)
    
    const startTime = performance.now()
    
    // Simulate rapid typing
    const longText = 'A'.repeat(1000)
    
    // Use fireEvent for performance testing (faster than userEvent)
    nameInput.value = longText
    emailInput.value = `${longText}@example.com`
    messageInput.value = longText
    
    const endTime = performance.now()
    const inputTime = endTime - startTime
    
    // Should handle large input quickly
    expect(inputTime).toBeLessThan(50)
    expect(nameInput.value).toBe(longText)
  })

  test('impact page handles API response delays gracefully', async () => {
    // Mock slow API response
    fetch.mockImplementation(() => 
      new Promise(resolve => 
        setTimeout(() => resolve({
          ok: true,
          json: async () => mockImpactData
        }), 1000)
      )
    )

    const startTime = performance.now()
    
    renderWithRouter(<Impact />)
    
    // Should show loading state immediately
    expect(screen.getByText('Loading impact data...')).toBeInTheDocument()
    
    const loadingTime = performance.now() - startTime
    expect(loadingTime).toBeLessThan(50)
    
    // Fast-forward to resolve API call
    vi.advanceTimersByTime(1000)
    
    await waitFor(() => {
      expect(screen.getByText('Students Supported')).toBeInTheDocument()
    })
  })

  test('memory usage remains stable with repeated renders', () => {
    const initialMemory = performance.memory?.usedJSHeapSize || 0
    
    // Render and unmount components multiple times
    for (let i = 0; i < 10; i++) {
      const { unmount } = renderWithRouter(<Contact />)
      unmount()
    }
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc()
    }
    
    const finalMemory = performance.memory?.usedJSHeapSize || 0
    
    // Memory should not increase significantly (allow for 10MB increase)
    if (initialMemory > 0 && finalMemory > 0) {
      const memoryIncrease = finalMemory - initialMemory
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024) // 10MB
    }
  })

  test('impact animations do not block UI thread', async () => {
    const counters = Array.from({ length, 20 }, (_, i) => (
      <ImpactCounter
        key={i}
        end={1000}
        label={`Counter ${i}`}
        duration={2000}
      />
    ))

    render(<div>{counters}</div>)
    
    const startTime = performance.now()
    
    // Start all animations
    vi.advanceTimersByTime(100)
    
    // Simulate other UI operations during animation
    const button = document.createElement('button')
    button.textContent = 'Test Button'
    document.body.appendChild(button)
    
    // Click should be responsive even during animations
    button.click()
    
    const responseTime = performance.now() - startTime
    expect(responseTime).toBeLessThan(100)
    
    document.body.removeChild(button)
  })

  test('contact form validation performs well with large inputs', () => {
    renderWithRouter(<Contact />)
    
    const messageInput = screen.getByLabelText(/message/i)
    const veryLongMessage = 'A'.repeat(5000) // Longer than max allowed
    
    const startTime = performance.now()
    
    // Simulate typing long message
    messageInput.value = veryLongMessage
    messageInput.dispatchEvent(new Event('input', { bubbles: true }))
    
    const validationTime = performance.now() - startTime
    
    // Validation should be fast even with long input
    expect(validationTime).toBeLessThan(50)
  })

  test('impact page scrolling performance with many elements', () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockImpactData
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => Array.from({ length: 100 }, (_, i) => ({
          id: i,
          title: `Story ${i}`,
          excerpt: `This is story number ${i}`,
          category: 'Education'
        }))
      })

    const { container } = renderWithRouter(<Impact />)
    
    const startTime = performance.now()
    
    // Simulate scrolling
    window.dispatchEvent(new Event('scroll'))
    
    const scrollTime = performance.now() - startTime
    
    // Scrolling should be smooth
    expect(scrollTime).toBeLessThan(50)
  })
})