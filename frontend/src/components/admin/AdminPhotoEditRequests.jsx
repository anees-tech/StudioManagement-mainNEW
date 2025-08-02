import React, { useState, useEffect } from 'react'
import './AdminPhotoEditRequests.css'

const AdminPhotoEditRequests = () => {
  const [requests, setRequests] = useState([])
  const [photographers, setPhotographers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all'
  })
  const [assignData, setAssignData] = useState({
    photographerId: '',
    estimatedCost: '',
    deadline: '',
    adminNotes: ''
  })

  useEffect(() => {
    fetchRequests()
    fetchPhotographers()
  }, [])

  const fetchRequests = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/photo-edit-requests')
      const data = await response.json()
      setRequests(data.requests || [])
    } catch (error) {
      console.error('Error fetching photo edit requests:', error)
      setRequests([])
    } finally {
      setLoading(false)
    }
  }

  const fetchPhotographers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/photographers')
      const data = await response.json()
      setPhotographers(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching photographers:', error)
      setPhotographers([])
    }
  }

  const handleAssignPhotographer = async (e) => {
    e.preventDefault()
    
    if (!assignData.photographerId) {
      alert('Please select a photographer')
      return
    }

    try {
      const response = await fetch(`http://localhost:5000/api/photo-edit-requests/${selectedRequest._id}/assign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          photographerId: assignData.photographerId,
          assignedBy: 'admin', // In a real app, this would be the admin's ID
          estimatedCost: parseFloat(assignData.estimatedCost) || 0,
          deadline: assignData.deadline || null
        })
      })

      if (response.ok) {
        alert('Photographer assigned successfully!')
        setShowAssignModal(false)
        setAssignData({
          photographerId: '',
          estimatedCost: '',
          deadline: '',
          adminNotes: ''
        })
        fetchRequests()
      } else {
        const errorData = await response.json()
        alert(errorData.message || 'Failed to assign photographer')
      }
    } catch (error) {
      console.error('Error assigning photographer:', error)
      alert('Error assigning photographer. Please try again.')
    }
  }

  const handleDeleteRequest = async (requestId) => {
    if (window.confirm('Are you sure you want to delete this photo edit request?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/photo-edit-requests/${requestId}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          alert('Request deleted successfully!')
          fetchRequests()
        } else {
          alert('Failed to delete request')
        }
      } catch (error) {
        console.error('Error deleting request:', error)
        alert('Error deleting request. Please try again.')
      }
    }
  }

  const handleViewDetails = (request) => {
    setSelectedRequest(request)
    setShowDetailsModal(true)
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'status-pending'
      case 'assigned': return 'status-assigned'
      case 'in_progress': return 'status-progress'
      case 'completed': return 'status-completed'
      case 'delivered': return 'status-delivered'
      case 'cancelled': return 'status-cancelled'
      default: return 'status-pending'
    }
  }

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'low': return 'priority-low'
      case 'medium': return 'priority-medium'
      case 'high': return 'priority-high'
      case 'urgent': return 'priority-urgent'
      default: return 'priority-medium'
    }
  }

  const filteredRequests = requests.filter(request => {
    if (filters.status !== 'all' && request.status !== filters.status) return false
    if (filters.priority !== 'all' && request.priority !== filters.priority) return false
    return true
  })

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading photo edit requests...</p>
      </div>
    )
  }

  return (
    <div className="admin-photo-edit-requests">
      <div className="requests-header">
        <h2>Photo Edit Requests Management</h2>
        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-value">{requests.filter(r => r.status === 'pending').length}</span>
            <span className="stat-label">Pending</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{requests.filter(r => r.status === 'in_progress').length}</span>
            <span className="stat-label">In Progress</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{requests.filter(r => r.status === 'completed').length}</span>
            <span className="stat-label">Completed</span>
          </div>
        </div>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <label>Status:</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Priority:</label>
          <select
            value={filters.priority}
            onChange={(e) => setFilters({...filters, priority: e.target.value})}
          >
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>

      <div className="requests-grid">
        {filteredRequests.length === 0 ? (
          <div className="no-requests">
            <h3>No Photo Edit Requests Found</h3>
            <p>No requests match the current filters.</p>
          </div>
        ) : (
          filteredRequests.map(request => (
            <div key={request._id} className="request-card">
              <div className="request-header">
                <h3>{request.title}</h3>
                <div className="request-badges">
                  <span className={`status-badge ${getStatusBadgeClass(request.status)}`}>
                    {request.status.replace('_', ' ')}
                  </span>
                  <span className={`priority-badge ${getPriorityBadgeClass(request.priority)}`}>
                    {request.priority}
                  </span>
                </div>
              </div>
              
              <div className="request-content">
                <div className="client-info">
                  <img 
                    src={request.clientId?.profileImage || '/placeholder-profile.jpg'} 
                    alt="Client"
                    className="client-avatar"
                  />
                  <div>
                    <p className="client-name">{request.clientId?.username}</p>
                    <p className="client-email">{request.clientId?.email}</p>
                  </div>
                </div>
                
                <p className="description">{request.description}</p>
                
                <div className="request-details">
                  <div className="detail-item">
                    <span className="label">Photos:</span>
                    <span className="value">{request.originalPhotos.length} original</span>
                  </div>
                  
                  {request.photographerId && (
                    <div className="detail-item">
                      <span className="label">Photographer:</span>
                      <span className="value">{request.photographerId.userId?.username}</span>
                    </div>
                  )}
                  
                  {request.estimatedCost > 0 && (
                    <div className="detail-item">
                      <span className="label">Est. Cost:</span>
                      <span className="value price">${request.estimatedCost}</span>
                    </div>
                  )}
                  
                  <div className="detail-item">
                    <span className="label">Created:</span>
                    <span className="value">{new Date(request.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="request-actions">
                <button 
                  className="btn-secondary"
                  onClick={() => handleViewDetails(request)}
                >
                  View Details
                </button>
                
                {request.status === 'pending' && (
                  <button 
                    className="btn-primary"
                    onClick={() => {
                      setSelectedRequest(request)
                      setShowAssignModal(true)
                    }}
                  >
                    Assign Photographer
                  </button>
                )}
                
                <button 
                  className="btn-danger"
                  onClick={() => handleDeleteRequest(request._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedRequest && (
        <div className="modal-overlay">
          <div className="modal details-modal">
            <div className="modal-header">
              <h3>{selectedRequest.title}</h3>
              <button 
                className="close-btn"
                onClick={() => setShowDetailsModal(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-content">
              <div className="request-details-full">
                <div className="detail-section">
                  <h4>Request Information</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="label">Status:</span>
                      <span className={`value status-badge ${getStatusBadgeClass(selectedRequest.status)}`}>
                        {selectedRequest.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Priority:</span>
                      <span className={`value priority-badge ${getPriorityBadgeClass(selectedRequest.priority)}`}>
                        {selectedRequest.priority}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Payment:</span>
                      <span className="value">{selectedRequest.paymentStatus}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Created:</span>
                      <span className="value">{new Date(selectedRequest.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="detail-section">
                  <h4>Client Information</h4>
                  <div className="client-info-detailed">
                    <img 
                      src={selectedRequest.clientId?.profileImage || '/placeholder-profile.jpg'} 
                      alt="Client"
                      className="client-avatar-large"
                    />
                    <div>
                      <p className="client-name-large">{selectedRequest.clientId?.username}</p>
                      <p className="client-email">{selectedRequest.clientId?.email}</p>
                      {selectedRequest.clientId?.phone && (
                        <p className="client-phone">{selectedRequest.clientId.phone}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="detail-section">
                  <h4>Description</h4>
                  <p>{selectedRequest.description}</p>
                </div>
                
                {selectedRequest.clientNotes && (
                  <div className="detail-section">
                    <h4>Client Notes</h4>
                    <p>{selectedRequest.clientNotes}</p>
                  </div>
                )}
                
                {selectedRequest.photographerId && (
                  <div className="detail-section">
                    <h4>Assigned Photographer</h4>
                    <div className="photographer-info">
                      <img 
                        src={selectedRequest.photographerId.userId?.profileImage || '/placeholder-profile.jpg'} 
                        alt="Photographer"
                        className="photographer-avatar"
                      />
                      <div>
                        <p className="photographer-name">{selectedRequest.photographerId.userId?.username}</p>
                        <p className="photographer-email">{selectedRequest.photographerId.userId?.email}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="detail-section">
                  <h4>Original Photos ({selectedRequest.originalPhotos.length})</h4>
                  <div className="photo-grid">
                    {selectedRequest.originalPhotos.map((photo, index) => (
                      <div key={index} className="photo-item">
                        <img 
                          src={`http://localhost:5000/api/photo-edit-requests/photos/${photo.filename}`} 
                          alt={photo.originalName}
                          className="photo-thumbnail"
                          onError={(e) => {
                            e.target.src = '/placeholder-image.jpg';
                            e.target.alt = 'Image not available';
                          }}
                        />
                        <p className="photo-name">{photo.originalName}</p>
                        <a 
                          href={`http://localhost:5000/api/photo-edit-requests/photos/${photo.filename}`}
                          download={photo.originalName}
                          className="download-btn"
                        >
                          Download
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
                
                {selectedRequest.editedPhotos.length > 0 && (
                  <div className="detail-section">
                    <h4>Edited Photos ({selectedRequest.editedPhotos.length})</h4>
                    <div className="photo-grid">
                      {selectedRequest.editedPhotos.map((photo, index) => (
                        <div key={index} className="photo-item">
                          <img 
                            src={`http://localhost:5000/api/photo-edit-requests/photos/${photo.filename}`} 
                            alt={photo.originalName}
                            className="photo-thumbnail"
                            onError={(e) => {
                              e.target.src = '/placeholder-image.jpg';
                              e.target.alt = 'Image not available';
                            }}
                          />
                          <p className="photo-name">{photo.originalName}</p>
                          <a 
                            href={`http://localhost:5000/api/photo-edit-requests/photos/${photo.filename}`}
                            download={photo.originalName}
                            className="download-btn"
                          >
                            Download
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="modal-actions">
              {selectedRequest.status === 'pending' && (
                <button 
                  className="btn-primary"
                  onClick={() => {
                    setShowDetailsModal(false)
                    setShowAssignModal(true)
                  }}
                >
                  Assign Photographer
                </button>
              )}
              <button 
                className="btn-secondary" 
                onClick={() => setShowDetailsModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Photographer Modal */}
      {showAssignModal && selectedRequest && (
        <div className="modal-overlay">
          <div className="modal assign-modal">
            <div className="modal-header">
              <h3>Assign Photographer</h3>
              <button 
                className="close-btn"
                onClick={() => setShowAssignModal(false)}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleAssignPhotographer} className="modal-form">
              <div className="form-group">
                <label>Select Photographer *</label>
                <select
                  value={assignData.photographerId}
                  onChange={(e) => setAssignData({...assignData, photographerId: e.target.value})}
                  required
                >
                  <option value="">Choose a photographer...</option>
                  {photographers.map(photographer => (
                    <option key={photographer._id} value={photographer._id}>
                      {photographer.userId?.username} - {photographer.specialization}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Estimated Cost ($)</label>
                  <input
                    type="number"
                    value={assignData.estimatedCost}
                    onChange={(e) => setAssignData({...assignData, estimatedCost: e.target.value})}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
                
                <div className="form-group">
                  <label>Deadline</label>
                  <input
                    type="date"
                    value={assignData.deadline}
                    onChange={(e) => setAssignData({...assignData, deadline: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Admin Notes</label>
                <textarea
                  value={assignData.adminNotes}
                  onChange={(e) => setAssignData({...assignData, adminNotes: e.target.value})}
                  placeholder="Any special instructions for the photographer..."
                  rows="3"
                />
              </div>
              
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowAssignModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Assign Photographer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPhotoEditRequests
