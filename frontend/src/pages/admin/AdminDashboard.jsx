import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Button, Card, LoadingSpinner } from '../../components/ui'

const AdminDashboard = () => {
  const { user, logout, apiRequest } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  useEffect(() => {
    document.title = 'Admin Dashboard - Urjja Pratishthan Prakashalay'
    fetchDashboardStats()
    
    return () => {
      document.title = 'Urjja Pratishthan Prakashalay'
    }
  }, [])
  
  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Fetch various statistics
      const [
        impactResponse,
        contactResponse,
        volunteerResponse,
        donationResponse
      ] = await Promise.allSettled([
        fetch('/api/impact'),
        apiRequest('/api/contact/stats'),
        fetch('/api/volunteers?limit=1'),
        fetch('/api/donations?limit=1')
      ])
      
      const dashboardStats = {
        impact: impactResponse.status === 'fulfilled' && impactResponse.value.ok 
          ? await impactResponse.value.json() 
          : null,
        contacts: contactResponse.status === 'fulfilled' && contactResponse.value.ok 
          ? await contactResponse.value.json() 
          : null,
        volunteers: volunteerResponse.status === 'fulfilled' && volunteerResponse.value.ok 
          ? await volunteerResponse.value.json() 
          : null,
        donations: donationResponse.status === 'fulfilled' && donationResponse.value.ok 
          ? await donationResponse.value.json() 
          : null
      }
      
      setStats(dashboardStats)
    } catch (err) {
      console.error('Dashboard stats error:', err)
      setError('Failed to load dashboard statistics')
    } finally {
      setLoading(false)
    }
  }
  
  const handleLogout = async () => {
    await logout()
  }
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-sm text-gray-600">
                Welcome back, {user?.name}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Role: <span className="font-medium text-gray-900">{user?.role}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Students Supported</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.impact?.studentsSupported?.toLocaleString() || '0'}
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Contact Inquiries</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.contacts?.total || '0'}
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Volunteers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.impact?.volunteersActive || '0'}
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Donations</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{stats?.impact?.totalDonationAmount?.toLocaleString() || '0'}
                </p>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <Card.Header>
              <Card.Title>Recent Contact Inquiries</Card.Title>
            </Card.Header>
            <Card.Content>
              {stats?.contacts ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">New Inquiries</span>
                    <span className="font-medium">{stats.contacts.byStatus?.new || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Responded</span>
                    <span className="font-medium">{stats.contacts.byStatus?.responded || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Closed</span>
                    <span className="font-medium">{stats.contacts.byStatus?.closed || 0}</span>
                  </div>
                  <div className="pt-3 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900">Recent (30 days)</span>
                      <span className="font-bold text-primary-600">{stats.contacts.recent || 0}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No contact data available</p>
              )}
            </Card.Content>
          </Card>
          
          <Card>
            <Card.Header>
              <Card.Title>System Status</Card.Title>
            </Card.Header>
            <Card.Content>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Database</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Connected
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">API Status</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Operational
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Last Login</span>
                  <span className="text-sm font-medium">
                    {user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="pt-3 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900">Data Source</span>
                    <span className="text-sm font-medium text-primary-600">
                      {stats?.impact?.dataSource === 'live' ? 'Live Data' : 'Cached Data'}
                    </span>
                  </div>
                </div>
              </div>
            </Card.Content>
          </Card>
        </div>
        
        {/* Quick Actions */}
        <div className="mt-8">
          <Card>
            <Card.Header>
              <Card.Title>Quick Actions</Card.Title>
            </Card.Header>
            <Card.Content>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="justify-start">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Manage Contacts
                </Button>
                <Button variant="outline" className="justify-start">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  Manage Volunteers
                </Button>
                <Button variant="outline" className="justify-start">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  View Donations
                </Button>
              </div>
            </Card.Content>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default AdminDashboard