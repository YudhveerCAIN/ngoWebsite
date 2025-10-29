import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ImpactCounter from '../ImpactCounter'
import ImpactChart from '../ImpactChart'

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

// Mock requestAnimationFrame
global.requestAnimationFrame = (callback) => {
  setTimeout(callback, 16)
}

describe('Impact Components Integration', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  
  afterEach(() => {
    vi.useRealTimers()
  })

  test('ImpactCounter and ImpactChart work together', async () => {
    const chartData = [
      { label: 'Scholarships', value: 180 },
      { label: 'Materials', value: 500 },
      { label: 'Sessions', value: 1200 }
    ]

    render(
      <div>
        <ImpactCounter
          end={1250}
          label="Students Supported"
          duration={1000}
        />
        <ImpactChart
          type="bar"
          data={chartData}
          title="Education Impact"
        />
      </div>
    )

    // Both components should render
    expect(screen.getByText('Students Supported')).toBeInTheDocument()
    expect(screen.getByText('Education Impact')).toBeInTheDocument()
    expect(screen.getByText('Scholarships')).toBeInTheDocument()

    // Wait for intersection observer to trigger
    await waitFor(() => {
      expect(screen.getByText('0')).toBeInTheDocument()
    })

    // Fast-forward animation
    vi.advanceTimersByTime(1000)

    await waitFor(() => {
      expect(screen.getByText('1,250')).toBeInTheDocument()
    })
  })

  test('multiple ImpactCounters animate with staggered delays', async () => {
    render(
      <div>
        <ImpactCounter
          end={100}
          label="Counter 1"
          duration={1000}
          delay={0}
        />
        <ImpactCounter
          end={200}
          label="Counter 2"
          duration={1000}
          delay={200}
        />
        <ImpactCounter
          end={300}
          label="Counter 3"
          duration={1000}
          delay={400}
        />
      </div>
    )

    // All should start at 0
    expect(screen.getAllByText('0')).toHaveLength(3)

    // Fast-forward past first delay
    vi.advanceTimersByTime(100)
    
    // First counter should start animating
    vi.advanceTimersByTime(1000)
    
    await waitFor(() => {
      expect(screen.getByText('100')).toBeInTheDocument()
    })

    // Fast-forward past second delay
    vi.advanceTimersByTime(200)
    vi.advanceTimersByTime(1000)
    
    await waitFor(() => {
      expect(screen.getByText('200')).toBeInTheDocument()
    })

    // Fast-forward past third delay
    vi.advanceTimersByTime(400)
    vi.advanceTimersByTime(1000)
    
    await waitFor(() => {
      expect(screen.getByText('300')).toBeInTheDocument()
    })
  })

  test('ImpactChart handles different data types correctly', () => {
    const barData = [
      { label: 'Item 1', value: 100 },
      { label: 'Item 2', value: 200 }
    ]

    const progressData = [
      { label: 'Goal 1', value: 75, target: 100, percentage: 75 },
      { label: 'Goal 2', value: 80, target: 100, percentage: 80 }
    ]

    const { rerender } = render(
      <ImpactChart type="bar" data={barData} />
    )

    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.getByText('Item 2')).toBeInTheDocument()

    rerender(<ImpactChart type="progress" data={progressData} />)

    expect(screen.getByText('Goal 1')).toBeInTheDocument()
    expect(screen.getByText('Goal 2')).toBeInTheDocument()
    expect(screen.getByText('75%')).toBeInTheDocument()
    expect(screen.getByText('80%')).toBeInTheDocument()
  })

  test('components handle edge cases gracefully', async () => {
    // Test with zero values
    render(
      <div>
        <ImpactCounter
          end={0}
          label="Zero Counter"
        />
        <ImpactChart
          type="bar"
          data={[]}
          title="Empty Chart"
        />
      </div>
    )

    expect(screen.getByText('Zero Counter')).toBeInTheDocument()
    expect(screen.getByText('Empty Chart')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  test('components handle very large numbers', async () => {
    render(
      <ImpactCounter
        end={1500000}
        label="Large Number"
      />
    )

    vi.advanceTimersByTime(2000)

    await waitFor(() => {
      expect(screen.getByText('1.5M')).toBeInTheDocument()
    })
  })

  test('components work with different color themes', () => {
    const data = [{ label: 'Test', value: 100 }]

    render(
      <div>
        <ImpactCounter
          end={100}
          label="Primary Counter"
          color="primary"
        />
        <ImpactCounter
          end={200}
          label="Green Counter"
          color="green"
        />
        <ImpactChart
          type="bar"
          data={data}
          color="blue"
        />
      </div>
    )

    // Check that different color classes are applied
    expect(screen.getByText('100')).toHaveClass('text-primary-600')
    expect(screen.getByText('200')).toHaveClass('text-green-600')
  })

  test('components are accessible', () => {
    const data = [{ label: 'Accessible Item', value: 100 }]

    render(
      <div>
        <ImpactCounter
          end={100}
          label="Accessible Counter"
          description="This counter shows impact"
        />
        <ImpactChart
          type="bar"
          data={data}
          title="Accessible Chart"
        />
      </div>
    )

    expect(screen.getByText('Accessible Counter')).toBeInTheDocument()
    expect(screen.getByText('This counter shows impact')).toBeInTheDocument()
    expect(screen.getByText('Accessible Chart')).toBeInTheDocument()
    expect(screen.getByText('Accessible Item')).toBeInTheDocument()
  })

  test('components handle animation interruption gracefully', async () => {
    const { unmount } = render(
      <ImpactCounter
        end={1000}
        label="Interrupted Counter"
        duration={2000}
      />
    )

    // Start animation
    vi.advanceTimersByTime(500)

    // Unmount component mid-animation
    unmount()

    // Should not throw errors
    vi.advanceTimersByTime(2000)
  })

  test('components work in router context', () => {
    const data = [{ label: 'Router Test', value: 100 }]

    render(
      <BrowserRouter>
        <div>
          <ImpactCounter
            end={100}
            label="Router Counter"
          />
          <ImpactChart
            type="bar"
            data={data}
          />
        </div>
      </BrowserRouter>
    )

    expect(screen.getByText('Router Counter')).toBeInTheDocument()
    expect(screen.getByText('Router Test')).toBeInTheDocument()
  })

  test('components handle rapid re-renders', () => {
    const { rerender } = render(
      <ImpactCounter
        end={100}
        label="Rerender Test"
      />
    )

    // Rapidly change props
    for (let i = 0; i < 10; i++) {
      rerender(
        <ImpactCounter
          end={100 + i}
          label={`Rerender Test ${i}`}
        />
      )
    }

    expect(screen.getByText('Rerender Test 9')).toBeInTheDocument()
  })

  test('components maintain performance with many instances', () => {
    const counters = Array.from({ length: 20 }, (_, i) => (
      <ImpactCounter
        key={i}
        end={i * 10}
        label={`Counter ${i}`}
        duration={1000}
        delay={i * 50}
      />
    ))

    render(<div>{counters}</div>)

    // All counters should render
    expect(screen.getByText('Counter 0')).toBeInTheDocument()
    expect(screen.getByText('Counter 19')).toBeInTheDocument()

    // Performance test - should not take too long to render
    const startTime = performance.now()
    vi.advanceTimersByTime(2000)
    const endTime = performance.now()

    // Should complete in reasonable time (this is a basic check)
    expect(endTime - startTime).toBeLessThan(1000)
  })
})