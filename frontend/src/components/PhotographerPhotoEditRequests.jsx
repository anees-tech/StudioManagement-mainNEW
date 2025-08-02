import React, { useState, useEffect, useRef } from 'react'
import './PhotographerPhotoEditRequests.css'

const PhotographerPhotoEditRequests = ({ photographer }) => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadData, setUploadData] = useState({
    photographerNotes: '',
    editedPhotos: []
  })
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (photographer?._id) {
      fetchRequests()
    }
  }, [photographer])

  const fetchRequests = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/photo-edit-requests/photographer/${photographer._id}`)
      const data = await response.json()
      setRequests(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching photo edit requests:', error)
      setRequests([])
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (requestId, newStatus, notes = '') => {
    try {
      const response = await fetch(`http://localhost:5000/api/photo-edit-requests/${requestId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: newStatus,
          photographerNotes: notes
        })
      })

      if (response.ok) {
        alert(`Request status updated to ${newStatus}`)
        fetchRequests()
      } else {
        alert('Failed to update status')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Error updating status. Please try again.')
    }
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    setUploadData(prev => ({
      ...prev,
      editedPhotos: files
    }))
  }

  const handleUploadEditedPhotos = async (e) => {
    e.preventDefault()
    
    if (uploadData.editedPhotos.length === 0) {
      alert('Please select at least one edited photo to upload')
      return
    }

    try {
      const formData = new FormData()
      formData.append('photographerNotes', uploadData.photographerNotes)

      uploadData.editedPhotos.forEach(file => {
        formData.append('editedPhotos', file)
      })

      const response = await fetch(`http://localhost:5000/api/photo-edit-requests/${selectedRequest._id}/edited-photos`, {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        alert('Edited photos uploaded successfully!')
        setShowUploadModal(false)
        setUploadData({
          photographerNotes: '',
          editedPhotos: []
        })
        fetchRequests()
        setShowDetailsModal(false)
      } else {
        const errorData = await response.json()
        alert(errorData.message || 'Failed to upload photos')
      }
    } catch (error) {
      console.error('Error uploading edited photos:', error)
      alert('Error uploading photos. Please try again.')
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

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading photo edit requests...</p>
      </div>
    )
  }

  return (
    <div className="photographer-photo-edit-requests">
      <div className="requests-header">
        <h2>Photo Edit Requests</h2>
        <div className="stats-summary">
          <div className="stat-item">
            <span className="stat-value">{requests.filter(r => r.status === 'assigned').length}</span>
            <span className="stat-label">New</span>
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

      <div className="requests-grid">
        {requests.length === 0 ? (
          <div className="no-requests">
            <h3>No Photo Edit Requests Yet</h3>
            <p>You'll see assigned photo editing requests here.</p>
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
                    <span className="label">Original Photos:</span>
                    <span className="value">{request.originalPhotos.length}</span>
                  </div>
                  
                  {request.editedPhotos.length > 0 && (
                    <div className="detail-item">
                      <span className="label">Edited Photos:</span>
                      <span className="value">{request.editedPhotos.length}</span>
                    </div>
                  )}
                  
                  {request.estimatedCost > 0 && (
                    <div className="detail-item">
                      <span className="label">Est. Cost:</span>
                      <span className="value price">${request.estimatedCost}</span>
                    </div>
                  )}
                  
                  {request.deadline && (
                    <div className="detail-item">
                      <span className="label">Deadline:</span>
                      <span className="value">{new Date(request.deadline).toLocaleDateString()}</span>
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
                
                {request.status === 'assigned' && (
                  <button 
                    className="btn-primary"
                    onClick={() => handleStatusUpdate(request._id, 'in_progress')}
                  >
                    Start Work
                  </button>
                )}
                
                {request.status === 'in_progress' && (
                  <button 
                    className="btn-success"
                    onClick={() => {
                      setSelectedRequest(request)
                      setShowUploadModal(true)
                    }}
                  >
                    Upload Results
                  </button>
                )}
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
                
                {selectedRequest.photographerNotes && (
                  <div className="detail-section">
                    <h4>Your Notes</h4>
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
                    
                    {selectedRequest.editedPhotos.length > 0 && (
                      <div className="photo-group">
                        <h5>Your Edited Photos ({selectedRequest.editedPhotos.length})</h5>
                        <div className="photo-grid">
                          {selectedRequest.editedPhotos.map((photo, index) => (
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
              {selectedRequest.status === 'assigned' && (
                <button 
                  className="btn-primary"
                  onClick={() => {
                    setShowDetailsModal(false)
                    handleStatusUpdate(selectedRequest._id, 'in_progress')
                  }}
                >
                  Start Work
                </button>
              )}
              
              {selectedRequest.status === 'in_progress' && (
                <button 
                  className="btn-success"
                  onClick={() => {
                    setShowDetailsModal(false)
                    setShowUploadModal(true)
                  }}
                >
                  Upload Results
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

      {/* Upload Edited Photos Modal */}
      {showUploadModal && selectedRequest && (
        <div className="modal-overlay">
          <div className="modal upload-modal">
            <div className="modal-header">
              <h3>Upload Edited Photos</h3>
              <button 
                className="close-btn"
                onClick={() => setShowUploadModal(false)}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleUploadEditedPhotos} className="modal-form">
              <div className="form-group">
                <label>Upload Edited Photos *</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  multiple
                  required
                />
                <p className="help-text">
                  Select the edited photos (JPEG, PNG, GIF, WebP - Max 10MB each)
                </p>
                {uploadData.editedPhotos.length > 0 && (
                  <p className="selected-files">
                    {uploadData.editedPhotos.length} photo(s) selected
                  </p>
                )}
              </div>
              
              <div className="form-group">
                <label>Notes for Client</label>
                <textarea
                  value={uploadData.photographerNotes}
                  onChange={(e) => setUploadData({...uploadData, photographerNotes: e.target.value})}
                  placeholder="Any notes about the editing work, changes made, or instructions for the client..."
                  rows="4"
                />
              </div>
              
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowUploadModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-success">
                  Upload & Complete
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default PhotographerPhotoEditRequests
