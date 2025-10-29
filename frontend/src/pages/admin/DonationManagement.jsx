import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Button, Card, LoadingSpinner, Input, Modal } from '../../components/ui'

const DonationManagement = () => {
  const { apiRequest } = useAuth()
  const [donations, setDonations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedDonation, setSelectedDonation] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    dateFrom: '',
    dateTo: '',
    page: 1,
    limit: 10
  })
  const [pagination, setPagination] = useState({})
  const [stats, setStats] = useState({})

  useEffect(() => {
    fetchDonations()
    fetchDonationStats()
  }, [filters])

  const fetchDonations = async () => {
    try {
      setLoading(true)
      setError('')
      
      const queryParams = new URLSearchParams()
      if (filters.status) queryParams.append('paymentStatus', filters.status)
      if (filters.search) queryParams.append('search', filters.search)
      if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom)
      if (filters.dateTo) queryParams.append('dateTo', filters.dateTo)
      queryParams.append('page', filters.page)
      queryParams.append('limit', filters.limit)
      
      const response = await apiRequest(`/api/donations?${queryParams}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch donations')
      }
      
      const data = await response.json()
      setDonations(data.donations || [])
      setPagination(data.pagination || {})
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchDonationStats = async () => {
    try {
      const response = await apiRequest('/donations/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (err) {
      console.error('Failed to fetch donation stats:', err)
    }
  }

  const handleExport = async () => {
    try {
      const queryParams = new URLSearchParams()
      if (filters.status) queryParams.append('paymentStatus', filters.status)
      if (filters.search) queryParams.append('search', filters.search)
      if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom)
      if (filters.dateTo) queryParams.append('dateTo', filters.dateTo)
      queryParams.append('format', 'csv')
      
      const response = await apiRequest(`/api/donations/export?${queryParams}`)
      
      if (!response.ok) {
        throw new Error('Failed to export donations')
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `donations-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleSearch = (searchTerm) => {
    setFilters(prev => ({ ...prev, search: searchTerm, page: 1 }))
  }

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value, page: 1 }))
  }

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }))
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  if (loading && donations.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" text="Loading donations..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Donation Management</h1>
          <p className="text-gray-600">Track and manage donation transactions</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handleExport}>
            Export CSV
          </Button>
          <Button onClick={() => window.open('/donate', '_blank')}>
            View Donation Page
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats.totalAmount || 0)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Donations</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalCount || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Donation</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats.averageAmount || 0)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats.monthlyAmount || 0)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Input
            placeholder="Search donations..."
            value={filters.search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full"
          />
          
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          
          <Input
            type="date"
            placeholder="From Date"
            value={filters.dateFrom}
            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
          />
          
          <Input
            type="date"
            placeholder="To Date"
            value={filters.dateTo}
            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
          />
          
          <select
            value={filters.limit}
            onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>
      </Card>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Donations Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Donor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {donations.map((donation) => (
                <tr key={donation._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {donation.fullName}
                      </div>
                      <div className="text-sm text-gray-500">{donation.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(donation.amountInInr)}
                    </div>
                    {donation.recurring && (
                      <div className="text-sm text-gray-500">
                        Recurring ({donation.frequency})
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {donation.paymentProvider || 'Razorpay'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {donation.transactionId || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(donation.paymentStatus)}`}>
                      {donation.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(donation.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedDonation(donation)
                        setShowModal(true)
                      }}
                    >
                      View Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
              >
                Next
              </Button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>{' '}
                  of <span className="font-medium">{pagination.total}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.pages}
                  >
                    Next
                  </Button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Donation Detail Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setSelectedDonation(null)
        }}
        title="Donation Details"
      >
        {selectedDonation && (
          <div className="space-y-6">
            {/* Donor Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Donor Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedDonation.fullName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedDonation.email}</p>
                </div>
                {selectedDonation.phone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedDonation.phone}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Donation Details */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Donation Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount</label>
                  <p className="mt-1 text-sm text-gray-900">{formatCurrency(selectedDonation.amountInInr)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Currency</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedDonation.currency || 'INR'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Recurring</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedDonation.recurring ? `Yes (${selectedDonation.frequency})` : 'No'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(selectedDonation.createdAt)}</p>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Payment Provider</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedDonation.paymentProvider || 'Razorpay'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedDonation.paymentStatus)}`}>
                    {selectedDonation.paymentStatus}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Transaction ID</label>
                  <p className="mt-1 text-sm text-gray-900 font-mono">{selectedDonation.transactionId || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Receipt Sent</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedDonation.receiptSent ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>
            </div>

            {selectedDonation.message && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Message</label>
                <p className="mt-1 text-sm text-gray-900">{selectedDonation.message}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default DonationManagement