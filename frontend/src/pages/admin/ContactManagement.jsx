import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Button, Card, LoadingSpinner, Input, Modal } from '../../components/ui'

const ContactManagement = () => {
  const { apiRequest } = useAuth()
  const [inquiries, setInquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedInquiry, setSelectedInquiry] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [response, setResponse] = useState('')
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    page: 1,
    limit: 10
  })
  const [pagination, setPagination] = useState({})
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchInquiries()
  }, [filters])

  const fetchInquiries = async () => {
    try {
      setLoading(true)
      setError('')
      
      const queryParams = new URLSearchParams()
      if (filters.status) queryParams.append('status', filters.status)
      if (filters.search) queryParams.append('search', filters.search)
      queryParams.append('page', filters.page)
      queryParams.append('limit', filters.limit)
      
      const response = await apiRequest(`/api/contact?${queryParams}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch contact inquiries')
      }
      
      const data = await response.json()
      setInquiries(data.inquiries || [])
      setPagination(data.pagination || {})
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (inquiryId, newStatus, responseText = '') => {
    try {
      setUpdating(true)
      
      const response = await apiRequest(`/api/contact/${inquiryId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus, response: responseText })
      })
      
      if (!response.ok) {
        throw new Error('Failed to update inquiry status')
      }
      
      // Refresh inquiries list
      await fetchInquiries()
      setShowModal(false)
      setSelectedInquiry(null)
      setResponse('')
    } catch (err) {
      setError(err.message)
    } finally {
      setUpdating(false)
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
      case 'new': return 'bg-blue-100 text-blue-800'
      case 'responded': return 'bg-green-100 text-green-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
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

  if (loading && inquiries.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" text="Loading contact inquiries..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contact Management</h1>
          <p className="text-gray-600">Manage and respond to contact inquiries</p>
        </div>
        <Button onClick={() => window.open('/contact', '_blank')}>
          View Contact Page
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Search inquiries..."
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
            <option value="new">New</option>
            <option value="responded">Responded</option>
            <option value="closed">Closed</option>
          </select>
          
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

      {/* Inquiries Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Message
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
              {inquiries.map((inquiry) => (
                <tr key={inquiry._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {inquiry.name}
                      </div>
                      <div className="text-sm text-gray-500">{inquiry.email}</div>
                      {inquiry.phone && (
                        <div className="text-sm text-gray-500">{inquiry.phone}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {inquiry.subject}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {inquiry.message}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(inquiry.status)}`}>
                      {inquiry.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(inquiry.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedInquiry(inquiry)
                        setResponse(inquiry.response || '')
                        setShowModal(true)
                      }}
                    >
                      Manage
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

      {/* Inquiry Detail Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setSelectedInquiry(null)
          setResponse('')
        }}
        title="Manage Contact Inquiry"
      >
        {selectedInquiry && (
          <div className="space-y-6">
            {/* Inquiry Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <p className="mt-1 text-sm text-gray-900">{selectedInquiry.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-sm text-gray-900">
                  <a href={`mailto:${selectedInquiry.email}`} className="text-primary-600 hover:text-primary-500">
                    {selectedInquiry.email}
                  </a>
                </p>
              </div>
              {selectedInquiry.phone && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <p className="mt-1 text-sm text-gray-900">
                    <a href={`tel:${selectedInquiry.phone}`} className="text-primary-600 hover:text-primary-500">
                      {selectedInquiry.phone}
                    </a>
                  </p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <p className="mt-1 text-sm text-gray-900">{formatDate(selectedInquiry.createdAt)}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Subject</label>
              <p className="mt-1 text-sm text-gray-900">{selectedInquiry.subject}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Message</label>
              <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedInquiry.message}</p>
              </div>
            </div>

            {/* Response Section */}
            <div className="border-t pt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Response (Optional)
              </label>
              <textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                rows={4}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="Add a response note (for internal tracking)..."
              />
            </div>

            {/* Status Update */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Update Status</h3>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  variant={selectedInquiry.status === 'new' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusUpdate(selectedInquiry._id, 'new', response)}
                  disabled={updating}
                >
                  New
                </Button>
                <Button
                  variant={selectedInquiry.status === 'responded' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusUpdate(selectedInquiry._id, 'responded', response)}
                  disabled={updating}
                >
                  Responded
                </Button>
                <Button
                  variant={selectedInquiry.status === 'closed' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusUpdate(selectedInquiry._id, 'closed', response)}
                  disabled={updating}
                >
                  Closed
                </Button>
              </div>
            </div>

            {/* Previous Response */}
            {selectedInquiry.response && (
              <div className="border-t pt-6">
                <label className="block text-sm font-medium text-gray-700">Previous Response</label>
                <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedInquiry.response}</p>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`mailto:${selectedInquiry.email}?subject=Re: ${selectedInquiry.subject}`, '_blank')}
                >
                  Reply via Email
                </Button>
                {selectedInquiry.phone && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`tel:${selectedInquiry.phone}`, '_blank')}
                  >
                    Call
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default ContactManagement