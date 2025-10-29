import { render, screen, waitFor } from '@testing-library/react'
import ImpactCounter from '../ImpactCounter'

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback) {
    this.callback = callback
  }
  
  observe(element) {
    // Immediately trigger the callback as if element is visible
    setTimeout(() => {
      this.callback([{ isIntersecting: true }])
    }, 0)
  }
  
  unobserve() {}
  disconnect() {}
}

describe('ImpactCounter', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  
  afterEach(() => {
    vi.useRealTimers()
  })

  test('renders counter with basic props', () => {
    render(
      <ImpactCounter
        end={100}
        label="Test Counter"
      />
    )
    
    expect(screen.getByText('Test Counter')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  test('animates to end value when visible', async () => {
    render(
      <ImpactCounter
        end={100}
        label="Test Counter"
        duration={1000}
      />
    )
    
    // Wait for intersection observer to trigger
    await waitFor(() => {
      expect(screen.getByText('0')).toBeInTheDocument()
    })
    
    // Fast-forward animation
    vi.advanceTimersByTime(1000)
    
    await waitFor(() => {
      expect(screen.getByText('100')).toBeInTheDocument()
    })
  })

  test('displays prefix and suffix correctly', () => {
    render(
      <ImpactCounter
        end={100}
        label="Test Counter"
        prefix="₹"
        suffix="+"
      />
    )
    
    expect(screen.getByText(/₹.*\+/)).toBeInTheDocument()
  })

  test('shows growth indicator when enabled', async () => {
    render(
      <ImpactCounter
        end={100}
        label="Test Counter"
        showGrowth={true}
        growthPercentage={25}
      />
    )
    
    await waitFor(() => {
      expect(screen.getByText('+25%')).toBeInTheDocument()
    })
  })

  test('displays icon when provided', () => {
    const TestIcon = () => <div data-testid="test-icon">Icon</div>
    
    render(
      <ImpactCounter
        end={100}
        label="Test Counter"
        icon={<TestIcon />}
      />
    )
    
    expect(screen.getByTestId('test-icon')).toBeInTheDocument()
  })

  test('applies different color themes', () => {
    const { rerender } = render(
      <ImpactCounter
        end={100}
        label="Test Counter"
        color="primary"
      />
    )
    
    expect(screen.getByText('100')).toHaveClass('text-primary-600')
    
    rerender(
      <ImpactCounter
        end={100}
        label="Test Counter"
        color="green"
      />
    )
    
    expect(screen.getByText('100')).toHaveClass('text-green-600')
  })

  test('formats large numbers correctly', async () => {
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

  test('formats thousands correctly', async () => {
    render(
      <ImpactCounter
        end={1500}
        label="Thousands"
      />
    )
    
    vi.advanceTimersByTime(2000)
    
    await waitFor(() => {
      expect(screen.getByText('1.5K')).toBeInTheDocument()
    })
  })

  test('applies size classes correctly', () => {
    const { rerender } = render(
      <ImpactCounter
        end={100}
        label="Test Counter"
        size="sm"
      />
    )
    
    expect(screen.getByText('100')).toHaveClass('text-2xl')
    
    rerender(
      <ImpactCounter
        end={100}
        label="Test Counter"
        size="lg"
      />
    )
    
    expect(screen.getByText('100')).toHaveClass('text-5xl')
  })

  test('shows description when provided', () => {
    render(
      <ImpactCounter
        end={100}
        label="Test Counter"
        description="This is a test description"
      />
    )
    
    expect(screen.getByText('This is a test description')).toBeInTheDocument()
  })

  test('handles delay prop correctly', async () => {
    render(
      <ImpactCounter
        end={100}
        label="Test Counter"
        delay={500}
      />
    )
    
    // Should not start animating immediately
    expect(screen.getByText('0')).toBeInTheDocument()
    
    // Fast-forward past delay
    vi.advanceTimersByTime(600)
    
    // Now animation should start
    vi.advanceTimersByTime(2000)
    
    await waitFor(() => {
      expect(screen.getByText('100')).toBeInTheDocument()
    })
  })
})