import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Impact from '../Impact'

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

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('Impact Page', () => {
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
        peopleScreened: 2500,
        awarenessSessionsConducted: 40,
        familiesHelped: 500
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

  const mockStories = [
    {
      id: 1,
      title: "Success Story 1",
      content: "This is a success story",
      authorName: "John Doe",
      published: true
    }
  ]

  beforeEach(() => {
    fetch.mockClear()
  })

  test('renders impact page header', () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => mockImpactData
    })

    renderWithRouter(<Impact />)
    
    expect(screen.getByText('Our Impact')).toBeInTheDocument()
    expect(screen.getByText(/See the tangible difference/)).toBeInTheDocument()
  })

  test('displays loading state initially', () => {
    fetch.mockImplementation(() => new Promise(() => {})) // Never resolves
    
    renderWithRouter(<Impact />)
    
    expect(screen.getByText('Loading impact data...')).toBeInTheDocument()
  })

  test('fetches and displays impact data', async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockImpactData
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStories
      })

    renderWithRouter(<Impact />)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/impact')
      expect(fetch).toHaveBeenCalledWith('/api/stories')
    })

    await waitFor(() => {
      expect(screen.getByText('Students Supported')).toBeInTheDocument()
      expect(screen.getByText('Programs Conducted')).toBeInTheDocument()
      expect(screen.getByText('Outreach Activities')).toBeInTheDocument()
      expect(screen.getByText('Active Volunteers')).toBeInTheDocument()
    })
  })

  test('displays error message when API fails', async () => {
    fetch.mockRejectedValueOnce(new Error('API Error'))

    renderWithRouter(<Impact />)

    await waitFor(() => {
      expect(screen.getByText('API Error')).toBeInTheDocument()
    })
  })

  test('shows program breakdown sections', async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockImpactData
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStories
      })

    renderWithRouter(<Impact />)

    await waitFor(() => {
      expect(screen.getByText('Program Impact Breakdown')).toBeInTheDocument()
      expect(screen.getByText('Education Programs')).toBeInTheDocument()
      expect(screen.getByText('Healthcare Initiatives')).toBeInTheDocument()
      expect(screen.getByText('Skill Development')).toBeInTheDocument()
    })
  })

  test('displays success stories section', async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockImpactData
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStories
      })

    renderWithRouter(<Impact />)

    await waitFor(() => {
      expect(screen.getByText('Success Stories')).toBeInTheDocument()
      expect(screen.getByText(/Real stories of transformation/)).toBeInTheDocument()
    })
  })

  test('shows call to action section', async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockImpactData
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStories
      })

    renderWithRouter(<Impact />)

    await waitFor(() => {
      expect(screen.getByText('Be Part of Our Impact')).toBeInTheDocument()
      expect(screen.getByText('Become a Volunteer')).toBeInTheDocument()
      expect(screen.getByText('Make a Donation')).toBeInTheDocument()
    })
  })

  test('displays additional metrics when impact data is available', async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockImpactData
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStories
      })

    renderWithRouter(<Impact />)

    await waitFor(() => {
      expect(screen.getByText('Total Donations')).toBeInTheDocument()
      expect(screen.getByText('Events Organized')).toBeInTheDocument()
      expect(screen.getByText('Community Inquiries')).toBeInTheDocument()
    })
  })

  test('handles stories API failure gracefully', async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockImpactData
      })
      .mockRejectedValueOnce(new Error('Stories API Error'))

    renderWithRouter(<Impact />)

    // Should still render the page even if stories fail
    await waitFor(() => {
      expect(screen.getByText('Our Impact')).toBeInTheDocument()
    })
  })

  test('uses fallback data when API returns empty', async () => {
    fetch
      .mockResolvedValueOnce({
        ok: false,
        status: 500
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => []
      })

    renderWithRouter(<Impact />)

    await waitFor(() => {
      expect(screen.getByText('Students Supported')).toBeInTheDocument()
    })
  })

  test('displays growth indicators', async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockImpactData
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStories
      })

    renderWithRouter(<Impact />)

    await waitFor(() => {
      // Growth indicators should be visible
      expect(screen.getByText('+25%')).toBeInTheDocument()
      expect(screen.getByText('+30%')).toBeInTheDocument()
    })
  })
})