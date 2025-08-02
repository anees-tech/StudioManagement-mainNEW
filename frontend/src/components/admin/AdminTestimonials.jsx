"use client"

import { useState, useEffect } from "react"
import { Edit, Trash2, Plus, MessageSquare } from "lucide-react"
import "../../styles/admin/AdminTestimonials.css"

const AdminTestimonials = ({ refreshDashboard }) => {
  const [testimonials, setTestimonials] = useState([])
  const [availableReviews, setAvailableReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingTestimonial, setEditingTestimonial] = useState(null)
  const [filter, setFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchTestimonials()
    fetchAvailableReviews()
  }, [])

  const fetchTestimonials = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/testimonials")
      if (response.ok) {
        const data = await response.json()
        setTestimonials(data)
      } else {
        setError("Failed to fetch testimonials")
      }
    } catch (error) {
      console.error("Error fetching testimonials:", error)
      setError("Failed to load testimonials")
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableReviews = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/testimonials/available-reviews")
      if (response.ok) {
        const data = await response.json()
        setAvailableReviews(data)
      }
    } catch (error) {
      console.error("Error fetching available reviews:", error)
    }
  }

  const handleCreateTestimonial = async (reviewId, title) => {
    try {
      const response = await fetch("http://localhost:5000/api/testimonials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reviewId, title }),
      })

      if (response.ok) {
        const data = await response.json()
        setTestimonials([data.testimonial, ...testimonials])
        setShowCreateModal(false)
        fetchAvailableReviews()
        refreshDashboard()
        alert("Testimonial created successfully!")
      } else {
        const errorData = await response.json()
        alert(errorData.message || "Failed to create testimonial")
      }
    } catch (error) {
      console.error("Error creating testimonial:", error)
      alert("Failed to create testimonial")
    }
  }

  const handleUpdateTestimonial = async (id, updates) => {
    try {
      const response = await fetch(`http://localhost:5000/api/testimonials/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        const data = await response.json()
        setTestimonials(testimonials.map(t => t._id === id ? data.testimonial : t))
        setEditingTestimonial(null)
        refreshDashboard()
        alert("Testimonial updated successfully!")
      } else {
        const errorData = await response.json()
        alert(errorData.message || "Failed to update testimonial")
      }
    } catch (error) {
      console.error("Error updating testimonial:", error)
      alert("Failed to update testimonial")
    }
  }

  const handleToggleFeatured = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/testimonials/${id}/toggle-featured`, {
        method: "PUT",
      })

      if (response.ok) {
        const data = await response.json()
        setTestimonials(testimonials.map(t => t._id === id ? data.testimonial : t))
        refreshDashboard()
        alert(data.message)
      } else {
        const errorData = await response.json()
        alert(errorData.message || "Failed to update testimonial")
      }
    } catch (error) {
      console.error("Error toggling featured status:", error)
      alert("Failed to update testimonial")
    }
  }

  const handleToggleActive = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/testimonials/${id}/toggle-active`, {
        method: "PUT",
      })

      if (response.ok) {
        const data = await response.json()
        setTestimonials(testimonials.map(t => t._id === id ? data.testimonial : t))
        refreshDashboard()
        alert(data.message)
      } else {
        const errorData = await response.json()
        alert(errorData.message || "Failed to update testimonial")
      }
    } catch (error) {
      console.error("Error toggling active status:", error)
      alert("Failed to update testimonial")
    }
  }

  const handleDeleteTestimonial = async (id) => {
    if (!window.confirm("Are you sure you want to delete this testimonial?")) {
      return
    }

    try {
      const response = await fetch(`http://localhost:5000/api/testimonials/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setTestimonials(testimonials.filter(t => t._id !== id))
        refreshDashboard()
        fetchAvailableReviews()
        alert("Testimonial deleted successfully!")
      } else {
        const errorData = await response.json()
        alert(errorData.message || "Failed to delete testimonial")
      }
    } catch (error) {
      console.error("Error deleting testimonial:", error)
      alert("Failed to delete testimonial")
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString()
  }

  const filteredTestimonials = testimonials.filter(testimonial => {
    const matchesFilter = filter === "all" || 
      (filter === "featured" && testimonial.isFeatured) ||
      (filter === "active" && testimonial.isActive) ||
      (filter === "inactive" && !testimonial.isActive)
    
    const matchesSearch = !searchTerm || 
      testimonial.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      testimonial.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      testimonial.clientId.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      testimonial.photographerId.userId.username.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesFilter && matchesSearch
  })

  if (loading) {
    return (
      <div className="admin-testimonials loading">
        <div className="loading-spinner"></div>
        <p>Loading testimonials...</p>
      </div>
    )
  }

  return (
    <div className="admin-testimonials">
      <div className="testimonials-header">
        <h1>Testimonials Management</h1>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="btn-primary"
        >
          Create New Testimonial
        </button>
      </div>

      {error && (
        <div className="error-message">
          <span>{error}</span>
          <button onClick={fetchTestimonials} className="retry-btn">
            Retry
          </button>
        </div>
      )}

      <div className="testimonials-controls">
        <div className="search-filter">
          <input
            type="text"
            placeholder="Search testimonials..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Testimonials</option>
            <option value="featured">Featured</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="testimonials-stats">
        <div className="stat-card">
          <h3>{testimonials.length}</h3>
          <p>Total Testimonials</p>
        </div>
        <div className="stat-card">
          <h3>{testimonials.filter(t => t.isFeatured).length}</h3>
          <p>Featured</p>
        </div>
        <div className="stat-card">
          <h3>{testimonials.filter(t => t.isActive).length}</h3>
          <p>Active</p>
        </div>
        <div className="stat-card">
          <h3>{availableReviews.length}</h3>
          <p>Available Reviews</p>
        </div>
      </div>

      <div className="testimonials-grid">
        {filteredTestimonials.map((testimonial) => (
          <div key={testimonial._id} className="testimonial-card">
            <div className="testimonial-header">
              <h3>{testimonial.title}</h3>
              <div className="testimonial-badges">
                {testimonial.isFeatured && (
                  <span className="badge featured">Featured</span>
                )}
                {testimonial.isActive ? (
                  <span className="badge active">Active</span>
                ) : (
                  <span className="badge inactive">Inactive</span>
                )}
              </div>
            </div>

            <div className="testimonial-content">
              <p>"{testimonial.content}"</p>
              <div className="testimonial-rating">
                {'⭐'.repeat(testimonial.rating)}
              </div>
            </div>

            <div className="testimonial-info">
              <div className="client-info">
                <div className="user-avatar">
                  {testimonial.clientId.profileImage ? (
                    <img 
                      src={testimonial.clientId.profileImage} 
                      alt={testimonial.clientId.username}
                    />
                  ) : (
                    <div className="avatar-placeholder">
                      {testimonial.clientId.username.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="user-details">
                  <strong>{testimonial.clientId.username}</strong>
                  <p>Client</p>
                </div>
              </div>

              <div className="photographer-info">
                <div className="user-avatar">
                  {testimonial.photographerId.userId.profileImage ? (
                    <img 
                      src={testimonial.photographerId.userId.profileImage} 
                      alt={testimonial.photographerId.userId.username}
                    />
                  ) : (
                    <div className="avatar-placeholder">
                      {testimonial.photographerId.userId.username.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="user-details">
                  <strong>{testimonial.photographerId.userId.username}</strong>
                  <p>Photographer</p>
                </div>
              </div>
            </div>

            <div className="testimonial-meta">
              <span className="date">Created: {formatDate(testimonial.createdAt)}</span>
              {testimonial.approvedAt && (
                <span className="approved">
                  Approved: {formatDate(testimonial.approvedAt)}
                </span>
              )}
            </div>

            <div className="testimonial-actions">
              <button 
                onClick={() => setEditingTestimonial(testimonial)}
                className="btn-edit"
              >
                Edit
              </button>
              <button 
                onClick={() => handleToggleFeatured(testimonial._id)}
                className={`btn-toggle ${testimonial.isFeatured ? 'featured' : ''}`}
              >
                {testimonial.isFeatured ? 'Unfeature' : 'Feature'}
              </button>
              <button 
                onClick={() => handleToggleActive(testimonial._id)}
                className={`btn-toggle ${testimonial.isActive ? 'active' : ''}`}
              >
                {testimonial.isActive ? 'Deactivate' : 'Activate'}
              </button>
              <button 
                onClick={() => handleDeleteTestimonial(testimonial._id)}
                className="btn-delete"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredTestimonials.length === 0 && (
        <div className="no-testimonials">
          <h3>No testimonials found</h3>
          <p>
            {filter === "all" 
              ? "No testimonials have been created yet." 
              : `No ${filter} testimonials found.`}
          </p>
        </div>
      )}

      {/* Create Testimonial Modal */}
      {showCreateModal && (
        <CreateTestimonialModal
          availableReviews={availableReviews}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateTestimonial}
        />
      )}

      {/* Edit Testimonial Modal */}
      {editingTestimonial && (
        <EditTestimonialModal
          testimonial={editingTestimonial}
          onClose={() => setEditingTestimonial(null)}
          onSubmit={handleUpdateTestimonial}
        />
      )}
    </div>
  )
}

// Create Testimonial Modal Component
const CreateTestimonialModal = ({ availableReviews, onClose, onSubmit }) => {
  const [selectedReview, setSelectedReview] = useState("")
  const [title, setTitle] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!selectedReview || !title) {
      alert("Please select a review and enter a title")
      return
    }
    onSubmit(selectedReview, title)
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Create New Testimonial</h2>
          <button onClick={onClose} className="modal-close">×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="testimonial-form">
          <div className="form-group">
            <label>Select Review:</label>
            <select 
              value={selectedReview} 
              onChange={(e) => setSelectedReview(e.target.value)}
              required
            >
              <option value="">Choose a review...</option>
              {availableReviews.map((review) => (
                <option key={review._id} value={review._id}>
                  {review.clientId.username} - {review.photographerId.userId.username} 
                  - {review.rating}⭐ - {review.comment.substring(0, 50)}...
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Title:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter testimonial title"
              required
            />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancel
            </button>
            <button type="submit" className="btn-submit">
              Create Testimonial
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Edit Testimonial Modal Component
const EditTestimonialModal = ({ testimonial, onClose, onSubmit }) => {
  const [title, setTitle] = useState(testimonial.title)
  const [content, setContent] = useState(testimonial.content)
  const [isActive, setIsActive] = useState(testimonial.isActive)
  const [isFeatured, setIsFeatured] = useState(testimonial.isFeatured)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title || !content) {
      alert("Please enter both title and content")
      return
    }
    onSubmit(testimonial._id, { title, content, isActive, isFeatured })
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Edit Testimonial</h2>
          <button onClick={onClose} className="modal-close">×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="testimonial-form">
          <div className="form-group">
            <label>Title:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Content:</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows="4"
              required
            />
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              Active
            </label>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
              />
              Featured
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancel
            </button>
            <button type="submit" className="btn-submit">
              Update Testimonial
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminTestimonials
