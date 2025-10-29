import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Button, Card, LoadingSpinner, Input, Modal } from '../../components/ui'

const VolunteerManagement = () => {
  const { apiRequest } = useAuth()
  const [volunteers, setVolunteers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedVolunteer, setSelectedVolunteer] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    page: 1,
    limit: 10
  })
  const [pagination, setPagination] = useState({})
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchVolunteers()
  }, [filters])

  const fetchVolunteers = async () => {
    try {
      setLoading(true)
      setError('')
      
      const queryParams = new URLSearchParams()
      if (filters.status) queryParams.append('status', filters.status)
      if (filters.search) queryParams.append('search', filters.search)
      queryParams.append('page', filters.page)
      queryParams.append('limit', filters.limit)
      
      const response = await apiRequest(`/api/volunteers?${queryParams}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch volunteers')
      }
      
      const data = await response.json()
      setVolunteers(data.volunteers || [])
      setPagination(data.pagination || {})
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (volunteerId, newStatus, notes = '') => {
    try {
      setUpdating(true)
      
      const response = await apiRequest(`/api/volunteers/${volunteerId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus, notes })
      })
      
      if (!response.ok) {
        throw new Error('Failed to update volunteer status')
      }
      
      // Refresh volunteers list
      await fetchVolunteers()
      setShowModal(false)
      setSelectedVolunteer(null)
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
      case 'reviewed': return 'bg-yellow-100 text-yellow-800'
      case 'accepted': return 'bg-blue-100 text-blue-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'active': return 'bg-blue-100 text-blue-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading && volunteers.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" text="Loading volunteers..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Volunteer Management</h1>
          <p className="text-gray-600">Manage volunteer applications and status updates</p>
        </div>
        <Button onClick={() => window.open('/get-involved', '_blank')}>
          View Public Form
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Search volunteers..."
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
            <option value="reviewed">Reviewed</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
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

      {/* Volunteers Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Volunteer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Interests
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applied
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {volunteers.map((volunteer) => (
                <tr key={volunteer._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {volunteer.fullName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {volunteer.availability}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{volunteer.email}</div>
                    <div className="text-sm text-gray-500">{volunteer.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {volunteer.areasOfInterest?.slice(0, 2).map((interest, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                        >
                          {interest}
                        </span>
                      ))}
                      {volunteer.areasOfInterest?.length > 2 && (
                        <span className="text-xs text-gray-500">
                          +{volunteer.areasOfInterest.length - 2} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(volunteer.status)}`}>
                      {volunteer.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(volunteer.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedVolunteer(volunteer)
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

      {/* Volunteer Detail Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setSelectedVolunteer(null)
        }}
        title="Manage Volunteer"
      >
        {selectedVolunteer && (
          <div className="space-y-6">
            {/* Volunteer Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <p className="mt-1 text-sm text-gray-900">{selectedVolunteer.fullName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-sm text-gray-900">{selectedVolunteer.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <p className="mt-1 text-sm text-gray-900">{selectedVolunteer.phone}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Availability</label>
                <p className="mt-1 text-sm text-gray-900">{selectedVolunteer.availability}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Areas of Interest</label>
              <div className="mt-1 flex flex-wrap gap-2">
                {selectedVolunteer.areasOfInterest?.map((interest, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>

            {selectedVolunteer.experience && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Experience</label>
                <p className="mt-1 text-sm text-gray-900">{selectedVolunteer.experience}</p>
              </div>
            )}

            {selectedVolunteer.message && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Message</label>
                <p className="mt-1 text-sm text-gray-900">{selectedVolunteer.message}</p>
              </div>
            )}

            {/* Status Update */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Update Status</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {['reviewed', 'accepted', 'rejected', 'active', 'inactive'].map((status) => (
                  <Button
                    key={status}
                    variant={selectedVolunteer.status === status ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusUpdate(selectedVolunteer._id, status)}
                    disabled={updating}
                    className="capitalize"
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </div>

            {/* Application Info */}
            <div className="border-t pt-6 text-sm text-gray-500">
              <p>Applied: {formatDate(selectedVolunteer.createdAt)}</p>
              {selectedVolunteer.reviewedAt && (
                <p>Last Updated: {formatDate(selectedVolunteer.reviewedAt)}</p>
              )}
              {selectedVolunteer.notes && (
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <p className="mt-1">{selectedVolunteer.notes}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default VolunteerManagement