import React, { useState, useEffect, useRef } from 'react'
import './PhotoEditRequests.css'

const PhotoEditRequests = ({ user }) => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const fileInputRef = useRef(null)
  
  const [newRequest, setNewRequest] = useState({
    title: '',
    description: '',
    clientNotes: '',
    priority: 'medium',
    deadline: '',
    originalPhotos: []
  })

  useEffect(() => {
    if (user?._id) {
      fetchRequests()
    }
  }, [user])

  const fetchRequests = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/photo-edit-requests/client/${user._id}`)
      const data = await response.json()
      setRequests(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching photo edit requests:', error)
      setRequests([])
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    setNewRequest(prev => ({
      ...prev,
      originalPhotos: files
    }))
  }

  const handleCreateRequest = async (e) => {
    e.preventDefault()
    
    if (newRequest.originalPhotos.length === 0) {
      alert('Please select at least one photo to edit')
      return
    }

    try {
      const formData = new FormData()
      formData.append('clientId', user._id)
      formData.append('title', newRequest.title)
      formData.append('description', newRequest.description)
      formData.append('clientNotes', newRequest.clientNotes)
      formData.append('priority', newRequest.priority)
      if (newRequest.deadline) {
        formData.append('deadline', newRequest.deadline)
      }

      newRequest.originalPhotos.forEach(file => {
        formData.append('originalPhotos', file)
      })

      const response = await fetch('http://localhost:5000/api/photo-edit-requests', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        alert('Photo edit request created successfully!')
        setShowCreateModal(false)
        setNewRequest({
          title: '',
          description: '',
          clientNotes: '',
          priority: 'medium',
          deadline: '',
          originalPhotos: []
        })
        fetchRequests()
      } else {
        const errorData = await response.json()
        alert(errorData.message || 'Failed to create request')
      }
    } catch (error) {
      console.error('Error creating photo edit request:', error)
      alert('Error creating request. Please try again.')
    }
  }

  const handleViewDetails = (request) => {
    setSelectedRequest(request)
    setShowDetailsModal(true)
  }

  const handlePayment = async (requestId) => {
    if (window.confirm('Proceed with payment for this photo editing service?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/photo-edit-requests/${requestId}/payment`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ paymentStatus: 'paid' })
        })

        if (response.ok) {
          alert('Payment successful! Your edited photos will be delivered shortly.')
          fetchRequests()
        } else {
          alert('Payment failed. Please try again.')
        }
      } catch (error) {
        console.error('Error processing payment:', error)
        alert('Payment error. Please try again.')
      }
    }
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

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading photo edit requests...</p>
      </div>
    )
  }

  return (
    <div className="photo-edit-requests">
      <div className="requests-header">
        <h2>Photo Editing Requests</h2>
        <button 
          className="btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          📸 New Edit Request
        </button>
      </div>

      <div className="requests-grid">
        {requests.length === 0 ? (
          <div className="no-requests">
            <h3>No Photo Edit Requests Yet</h3>
            <p>Submit your photos for professional editing!</p>
            <button 
              className="btn-primary"
              onClick={() => setShowCreateModal(true)}
            >
              Create Your First Request
            </button>
          </div>
        ) : (
          requests.map(request => (
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
                <p className="description">{request.description}</p>
                
                <div className="request-details">
                  <div className="detail-item">
                    <span className="label">Original Photos:</span>
                    <span className="value">{request.originalPhotos.length}</span>
                  </div>
                  
                  {request.editedPhotos.length > 0 && (
                    <div className="detail-item">
                      <span className="label">Edited Photos:</span>
                      <span className="value">{request.editedPhotos.length}</span>
                    </div>
                  )}
                  
                  {request.photographerId && (
                    <div className="detail-item">
                      <span className="label">Photographer:</span>
                      <span className="value">{request.photographerId.userId?.username || 'Unknown'}</span>
                    </div>
                  )}
                  
                  {request.finalCost > 0 && (
                    <div className="detail-item">
                      <span className="label">Cost:</span>
                      <span className="value price">${request.finalCost}</span>
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
                
                {request.status === 'completed' && request.paymentStatus === 'pending' && (
                  <button 
                    className="btn-primary"
                    onClick={() => handlePayment(request._id)}
                  >
                    Pay ${request.finalCost}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Request Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal photo-edit-modal">
            <div className="modal-header">
              <h3>Create Photo Edit Request</h3>
              <button 
                className="close-btn"
                onClick={() => setShowCreateModal(false)}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleCreateRequest} className="modal-form">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={newRequest.title}
                  onChange={(e) => setNewRequest({...newRequest, title: e.target.value})}
                  placeholder="e.g., Wedding Photos Color Correction"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Description *</label>
                <textarea
                  value={newRequest.description}
                  onChange={(e) => setNewRequest({...newRequest, description: e.target.value})}
                  placeholder="Describe what kind of editing you need..."
                  rows="4"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Upload Photos *</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  multiple
                  required
                />
                <p className="help-text">
                  Select up to 10 photos (JPEG, PNG, GIF, WebP - Max 10MB each)
                </p>
                {newRequest.originalPhotos.length > 0 && (
                  <p className="selected-files">
                    {newRequest.originalPhotos.length} photo(s) selected
                  </p>
                )}
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={newRequest.priority}
                    onChange={(e) => setNewRequest({...newRequest, priority: e.target.value})}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Deadline (Optional)</label>
                  <input
                    type="date"
                    value={newRequest.deadline}
                    onChange={(e) => setNewRequest({...newRequest, deadline: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Additional Notes</label>
                <textarea
                  value={newRequest.clientNotes}
                  onChange={(e) => setNewRequest({...newRequest, clientNotes: e.target.value})}
                  placeholder="Any specific requirements or instructions..."
                  rows="3"
                />
              </div>
              
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                  <h4>Description</h4>
                  <p>{selectedRequest.description}</p>
                </div>
                
                {selectedRequest.clientNotes && (
                  <div className="detail-section">
                    <h4>Your Notes</h4>
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
                
                {selectedRequest.photographerNotes && (
                  <div className="detail-section">
                    <h4>Photographer Notes</h4>
                    <p>{selectedRequest.photographerNotes}</p>
                  </div>
                )}
                
                <div className="detail-section">
                  <h4>Photos</h4>
                  <div className="photos-section">
                    <div className="photo-group">
                      <h5>Original Photos ({selectedRequest.originalPhotos.length})</h5>
                      <div className="photo-grid">
                        {selectedRequest.originalPhotos.map((photo, index) => (
                          <div key={index} className="photo-item">
                            <img 
                              src={`http://localhost:5000/${photo.path.replace(/\\/g, '/')}`} 
                              alt={photo.originalName}
                              className="photo-thumbnail"
                            />
                            <p className="photo-name">{photo.originalName}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {selectedRequest.editedPhotos.length > 0 && (
                      <div className="photo-group">
                        <h5>Edited Photos ({selectedRequest.editedPhotos.length})</h5>
                        <div className="photo-grid">
                          {selectedRequest.editedPhotos.map((photo, index) => (
                            <div key={index} className="photo-item">
                              <img 
                                src={`http://localhost:5000/${photo.path.replace(/\\/g, '/')}`} 
                                alt={photo.originalName}
                                className="photo-thumbnail"
                              />
                              <p className="photo-name">{photo.originalName}</p>
                              <a 
                                href={`http://localhost:5000/${photo.path.replace(/\\/g, '/')}`}
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
                
                {(selectedRequest.estimatedCost > 0 || selectedRequest.finalCost > 0) && (
                  <div className="detail-section">
                    <h4>Pricing</h4>
                    <div className="pricing-info">
                      {selectedRequest.estimatedCost > 0 && (
                        <p>Estimated Cost: <span className="price">${selectedRequest.estimatedCost}</span></p>
                      )}
                      {selectedRequest.finalCost > 0 && (
                        <p>Final Cost: <span className="price">${selectedRequest.finalCost}</span></p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="modal-actions">
              {selectedRequest.status === 'completed' && selectedRequest.paymentStatus === 'pending' && (
                <button 
                  className="btn-primary"
                  onClick={() => {
                    setShowDetailsModal(false)
                    handlePayment(selectedRequest._id)
                  }}
                >
                  Pay ${selectedRequest.finalCost}
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
    </div>
  )
}

export default PhotoEditRequests
