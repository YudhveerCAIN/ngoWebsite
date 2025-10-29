import { render, screen, waitFor } from '@testing-library/react'
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

describe('ImpactChart', () => {
  const mockData = [
    { label: 'Item 1', value: 100 },
    { label: 'Item 2', value: 200 },
    { label: 'Item 3', value: 150 }
  ]

  const mockProgressData = [
    { label: 'Goal 1', value: 75, target: 100, percentage: 75 },
    { label: 'Goal 2', value: 120, target: 150, percentage: 80 }
  ]

  test('renders bar chart correctly', () => {
    render(
      <ImpactChart
        type="bar"
        data={mockData}
        title="Test Bar Chart"
      />
    )
    
    expect(screen.getByText('Test Bar Chart')).toBeInTheDocument()
    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.getByText('Item 2')).toBeInTheDocument()
    expect(screen.getByText('Item 3')).toBeInTheDocument()
  })

  test('shows values when showValues is true', () => {
    render(
      <ImpactChart
        type="bar"
        data={mockData}
        showValues={true}
      />
    )
    
    expect(screen.getByText('100')).toBeInTheDocument()
    expect(screen.getByText('200')).toBeInTheDocument()
    expect(screen.getByText('150')).toBeInTheDocument()
  })

  test('renders progress chart correctly', () => {
    render(
      <ImpactChart
        type="progress"
        data={mockProgressData}
      />
    )
    
    expect(screen.getByText('Goal 1')).toBeInTheDocument()
    expect(screen.getByText('Goal 2')).toBeInTheDocument()
    expect(screen.getByText('75%')).toBeInTheDocument()
    expect(screen.getByText('80%')).toBeInTheDocument()
  })

  test('renders line chart correctly', () => {
    render(
      <ImpactChart
        type="line"
        data={mockData}
        height={300}
      />
    )
    
    // Check for SVG elements
    const svg = screen.getByRole('img', { hidden: true })
    expect(svg).toBeInTheDocument()
    
    // Check for labels
    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.getByText('Item 2')).toBeInTheDocument()
    expect(screen.getByText('Item 3')).toBeInTheDocument()
  })

  test('applies color themes correctly', () => {
    const { container } = render(
      <ImpactChart
        type="bar"
        data={mockData}
        color="green"
      />
    )
    
    // Check for green color classes in the DOM
    expect(container.querySelector('.bg-green-500')).toBeInTheDocument()
  })

  test('handles empty data gracefully', () => {
    render(
      <ImpactChart
        type="bar"
        data={[]}
        title="Empty Chart"
      />
    )
    
    expect(screen.getByText('Empty Chart')).toBeInTheDocument()
  })

  test('animates when animated prop is true', async () => {
    render(
      <ImpactChart
        type="bar"
        data={mockData}
        animated={true}
      />
    )
    
    // Animation should start when component becomes visible
    await waitFor(() => {
      expect(screen.getByText('Item 1')).toBeInTheDocument()
    })
  })

  test('does not animate when animated prop is false', () => {
    render(
      <ImpactChart
        type="bar"
        data={mockData}
        animated={false}
      />
    )
    
    expect(screen.getByText('Item 1')).toBeInTheDocument()
  })

  test('renders without title when not provided', () => {
    render(
      <ImpactChart
        type="bar"
        data={mockData}
      />
    )
    
    expect(screen.getByText('Item 1')).toBeInTheDocument()
    // Should not have any h3 elements (title)
    expect(screen.queryByRole('heading', { level: 3 })).not.toBeInTheDocument()
  })

  test('applies custom className', () => {
    const { container } = render(
      <ImpactChart
        type="bar"
        data={mockData}
        className="custom-chart-class"
      />
    )
    
    expect(container.firstChild).toHaveClass('custom-chart-class')
  })

  test('handles progress data with targets correctly', () => {
    render(
      <ImpactChart
        type="progress"
        data={mockProgressData}
        showValues={true}
      />
    )
    
    expect(screen.getByText('75 / 100')).toBeInTheDocument()
    expect(screen.getByText('120 / 150')).toBeInTheDocument()
  })
})