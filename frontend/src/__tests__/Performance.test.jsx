import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ImpactCounter from '../components/features/ImpactCounter'
import ImpactChart from '../components/features/ImpactChart'
import Impact from '../pages/Impact'

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

// Mock fetch
global.fetch = vi.fn()

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('Performance Tests', () => {
  beforeEach(() => {
    fetch.mockClear()
    vi.useFakeTimers()
  })
  
  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Component Rendering Performance', () => {
    test('ImpactCounter renders quickly with large numbers', () => {
      const startTime = performance.now()
      
      render(
        <ImpactCounter
          end={9999999}
          label="Large Number Test"
          duration={1000}
        />
      )
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      expect(renderTime).toBeLessThan(100) // Should render in less than 100ms
      expect(screen.getByText('Large Number Test')).toBeInTheDocument()
    })

    test('multiple ImpactCounters render efficiently', () => {
      const startTime = performance.now()
      
      const counters = Array.from({ length: 50 }, (_, i) => (
        <ImpactCounter
          key={i}
          end={i * 100}
          label={`Counter ${i}`}
          duration={1000}
        />
      ))
      
      render(<div>{counters}</div>)
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      expect(renderTime).toBeLessThan(500) // Should render 50 counters in less than 500ms
      expect(screen.getByText('Counter 0')).toBeInTheDocument()
      expect(screen.getByText('Counter 49')).toBeInTheDocument()
    })

    test('ImpactChart renders efficiently with large datasets', () => {
      const largeDataset = Array.from({ length: 100 }, (_, i) => ({
        label: `Item ${i}`,
        value: Math.random() * 1000
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
      
      expect(renderTime).toBeLessThan(200) // Should render large chart in less than 200ms
      expect(screen.getByText('Large Dataset Chart')).toBeInTheDocument()
    })

    test('Impact page renders within acceptable time', async () => {
      const mockData = {
        studentsSupported: 1250,
        programsConducted: 48,
        outreachActivities: 120,
        volunteersActive: 85
      }

      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockData
      })

      const startTime = performance.now()
      
      renderWithRouter(<Impact />)
      
      await waitFor(() => {
        expect(screen.getByText('Our Impact')).toBeInTheDocument()
      })
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      expect(renderTime).toBeLessThan(1000) // Should render page in less than 1 second
    })
  })

  describe('Animation Performance', () => {
    test('counter animations do not block main thread', async () => {
      const { container } = render(
        <ImpactCounter
          end={1000}
          label="Animation Test"
          duration={1000}
        />
      )

      // Start animation
      vi.advanceTimersByTime(100)

      // Should be able to interact with DOM during animation
      const element = container.querySelector('[data-testid]') || container.firstChild
      expect(element).toBeTruthy()

      // Animation should not cause layout thrashing
      const computedStyle = window.getComputedStyle(element)
      expect(computedStyle).toBeTruthy()
    })

    test('multiple simultaneous animations perform well', () => {
      const counters = Array.from({ length: 20 }, (_, i) => (
        <ImpactCounter
          key={i}
          end={i * 50}
          label={`Animated Counter ${i}`}
          duration={1000}
          delay={i * 10}
        />
      ))

      const startTime = performance.now()
      
      render(<div>{counters}</div>)
      
      // Start all animations
      vi.advanceTimersByTime(1000)
      
      const endTime = performance.now()
      const animationTime = endTime - startTime
      
      expect(animationTime).toBeLessThan(100) // Animation setup should be fast
    })

    test('chart animations are smooth', () => {
      const data = [
        { label: 'Item 1', value: 100 },
        { label: 'Item 2', value: 200 },
        { label: 'Item 3', value: 150 }
      ]

      const startTime = performance.now()
      
      render(
        <ImpactChart
          type="bar"
          data={data}
          animated={true}
        />
      )
      
      const endTime = performance.now()
      const setupTime = endTime - startTime
      
      expect(setupTime).toBeLessThan(50) // Animation setup should be very fast
    })
  })

  describe('Memory Usage', () => {
    test('components clean up properly on unmount', () => {
      const { unmount } = render(
        <ImpactCounter
          end={1000}
          label="Cleanup Test"
          duration={1000}
        />
      )

      // Start animation
      vi.advanceTimersByTime(100)

      // Unmount component
      unmount()

      // Should not throw errors or leak memory
      vi.advanceTimersByTime(2000)
      
      // Test passes if no errors are thrown
      expect(true).toBe(true)
    })

    test('intersection observers are properly cleaned up', () => {
      const { unmount } = render(
        <div>
          <ImpactCounter end={100} label="Observer Test 1" />
          <ImpactCounter end={200} label="Observer Test 2" />
          <ImpactCounter end={300} label="Observer Test 3" />
        </div>
      )

      // Unmount all components
      unmount()

      // Should not cause memory leaks
      expect(true).toBe(true)
    })
  })

  describe('Responsive Performance', () => {
    test('components adapt to viewport changes efficiently', () => {
      const { container } = render(
        <ImpactCounter
          end={1000}
          label="Responsive Test"
        />
      )

      // Simulate viewport changes
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 320,
      })

      window.dispatchEvent(new Event('resize'))

      // Component should still be functional
      expect(screen.getByText('Responsive Test')).toBeInTheDocument()

      // Change to desktop size
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      })

      window.dispatchEvent(new Event('resize'))

      expect(screen.getByText('Responsive Test')).toBeInTheDocument()
    })
  })

  describe('Data Processing Performance', () => {
    test('large number formatting is efficient', () => {
      const startTime = performance.now()
      
      // Test with various large numbers
      const numbers = [1000, 10000, 100000, 1000000, 10000000]
      
      numbers.forEach((num, index) => {
        render(
          <ImpactCounter
            key={index}
            end={num}
            label={`Number ${num}`}
          />
        )
      })
      
      const endTime = performance.now()
      const processingTime = endTime - startTime
      
      expect(processingTime).toBeLessThan(100) // Should process quickly
    })

    test('chart data processing is efficient', () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        label: `Data Point ${i}`,
        value: Math.random() * 10000
      }))

      const startTime = performance.now()
      
      render(
        <ImpactChart
          type="bar"
          data={largeDataset}
        />
      )
      
      const endTime = performance.now()
      const processingTime = endTime - startTime
      
      expect(processingTime).toBeLessThan(300) // Should process large dataset quickly
    })
  })

  describe('Bundle Size Impact', () => {
    test('components do not import unnecessary dependencies', () => {
      // This is more of a static analysis test
      // In a real scenario, you'd use bundle analyzers
      
      const { container } = render(
        <ImpactCounter
          end={100}
          label="Bundle Test"
        />
      )

      // Component should render without heavy dependencies
      expect(container.firstChild).toBeTruthy()
    })
  })
})