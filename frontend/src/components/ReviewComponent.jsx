"use client"

import { useState, useEffect } from "react"
import "./ReviewComponent.css"
import ReviewResponseComponent from "./ReviewResponseComponent"

const ReviewComponent = ({ 
  photographerId, 
  bookingId = null, 
  showForm = false, 
  onReviewSubmitted = null,
  mode = "display", // "display", "form", "edit", "client-reviews", "photographer-view"
  clientId = null
}) => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [showReviewForm, setShowReviewForm] = useState(showForm)
  const [editingReview, setEditingReview] = useState(null)
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: "",
    comment: "",
    serviceType: "",
  })
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    ratingBreakdown: [],
    verifiedReviews: 0,
    recentReviews: 0,
    responseRate: 0
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const user = JSON.parse(localStorage.getItem("user") || "{}")

  useEffect(() => {
    if (mode === "client-reviews" && clientId) {
      fetchClientReviews()
    } else if (photographerId) {
      fetchReviews()
      fetchReviewStats()
    }
  }, [photographerId, mode, clientId])

  const fetchReviews = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/reviews/photographer/${photographerId}`)
      const data = await response.json()
      
      if (response.ok) {
        setReviews(data.reviews || [])
      } else {
        console.error("Error fetching reviews:", data.message)
        setReviews([])
      }
    } catch (error) {
      console.error("Error fetching reviews:", error)
      setReviews([])
    } finally {
      setLoading(false)
    }
  }

  const fetchClientReviews = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/reviews/client/${clientId}`)
      const data = await response.json()
      
      if (response.ok) {
        setReviews(Array.isArray(data) ? data : [])
      } else {
        console.error("Error fetching client reviews:", data.message)
        setReviews([])
      }
    } catch (error) {
      console.error("Error fetching client reviews:", error)
      setReviews([])
    } finally {
      setLoading(false)
    }
  }

  const fetchReviewStats = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/reviews/photographer/${photographerId}/stats`)
      const data = await response.json()
      
      if (response.ok) {
        setStats(data.stats || {
          totalReviews: 0,
          averageRating: 0,
          ratingBreakdown: [],
          verifiedReviews: 0,
          recentReviews: 0,
          responseRate: 0
        })
      } else {
        console.error("Error fetching review stats:", data.message)
        // Set default stats on error
        setStats({
          totalReviews: 0,
          averageRating: 0,
          ratingBreakdown: [],
          verifiedReviews: 0,
          recentReviews: 0,
          responseRate: 0
        })
      }
    } catch (error) {
      console.error("Error fetching review stats:", error)
      // Set default stats on error
      setStats({
        totalReviews: 0,
        averageRating: 0,
        ratingBreakdown: [],
        verifiedReviews: 0,
        recentReviews: 0,
        responseRate: 0
      })
    }
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")
    setSuccess("")

    try {
      const reviewData = {
        clientId: user._id,
        photographerId,
        bookingId,
        ...reviewForm,
      }

      const url = editingReview 
        ? `http://localhost:5000/api/reviews/${editingReview._id}`
        : "http://localhost:5000/api/reviews"
      
      const method = editingReview ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reviewData),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(editingReview ? "Review updated successfully!" : "Review submitted successfully!")
        setReviewForm({ rating: 5, title: "", comment: "", serviceType: "" })
        setShowReviewForm(false)
        setEditingReview(null)
        
        if (mode === "client-reviews") {
          fetchClientReviews()
        } else {
          fetchReviews()
          fetchReviewStats()
        }
        
        if (onReviewSubmitted) onReviewSubmitted(data.review)
      } else {
        setError(data.message || "Failed to submit review")
      }
    } catch (error) {
      console.error("Error submitting review:", error)
      setError("Network error. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditReview = (review) => {
    setEditingReview(review)
    setReviewForm({
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      serviceType: review.serviceType,
    })
    setShowReviewForm(true)
  }

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return

    try {
      const response = await fetch(`http://localhost:5000/api/reviews/${reviewId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setSuccess("Review deleted successfully!")
        if (mode === "client-reviews") {
          fetchClientReviews()
        } else {
          fetchReviews()
          fetchReviewStats()
        }
      } else {
        const data = await response.json()
        setError(data.message || "Failed to delete review")
      }
    } catch (error) {
      console.error("Error deleting review:", error)
      setError("Network error. Please try again.")
    }
  }

  const handleVoteHelpful = async (reviewId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/reviews/${reviewId}/helpful`, {
        method: "PUT",
      })

      if (response.ok) {
        if (mode === "client-reviews") {
          fetchClientReviews()
        } else {
          fetchReviews()
        }
      }
    } catch (error) {
      console.error("Error voting helpful:", error)
    }
  }

  const renderStars = (rating, interactive = false, onChange = null) => {
    return (
      <div className="stars-container">
        {[...Array(5)].map((_, i) => (
          <span
            key={i}
            className={`star ${i < rating ? "filled" : ""} ${interactive ? "interactive" : ""}`}
            onClick={interactive && onChange ? () => onChange(i + 1) : undefined}
          >
            ⭐
          </span>
        ))}
      </div>
    )
  }

  const renderRatingBreakdown = () => {
    const breakdown = [5, 4, 3, 2, 1].map(rating => {
      const found = stats.ratingBreakdown?.find(r => r._id === rating)
      const count = found ? found.count : 0
      const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0
      return { rating, count, percentage }
    })

    return (
      <div className="rating-breakdown">
        {breakdown.map(({ rating, count, percentage }) => (
          <div key={rating} className="rating-bar">
            <span className="rating-label">{rating} ⭐</span>
            <div className="bar-container">
              <div className="bar-fill" style={{ width: `${percentage}%` }}></div>
            </div>
            <span className="rating-count">{count}</span>
          </div>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="reviews-loading">
        <div className="loading-spinner"></div>
        <p>Loading reviews...</p>
      </div>
    )
  }

  return (
    <div className="review-component">
      {/* Review Statistics - only show for photographer profiles */}
      {mode !== "client-reviews" && (
        <div className="review-stats">
          <div className="stats-header">
            <h3>Reviews & Ratings</h3>
            <div className="overall-rating">
              <span className="rating-number">{stats.averageRating?.toFixed(1) || "0.0"}</span>
              {renderStars(Math.round(stats.averageRating || 0))}
              <span className="total-reviews">({stats.totalReviews} reviews)</span>
            </div>
          </div>
          
          {stats.totalReviews > 0 && (
            <div className="rating-overview">
              {renderRatingBreakdown()}
              <div className="additional-stats">
                <div className="stat-item">
                  <span className="stat-label">Verified Reviews:</span>
                  <span className="stat-value">{stats.verifiedReviews || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Response Rate:</span>
                  <span className="stat-value">{stats.responseRate || 0}%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Review Form */}
      {(showReviewForm || mode === "form") && user._id && (
        <div className="review-form-container">
          <div className="review-form-header">
            <h4>{editingReview ? "Edit Review" : "Write a Review"}</h4>
            {showReviewForm && (
              <button 
                className="close-form-btn"
                onClick={() => {
                  setShowReviewForm(false)
                  setEditingReview(null)
                  setReviewForm({ rating: 5, title: "", comment: "", serviceType: "" })
                }}
              >
                ✕
              </button>
            )}
          </div>

          <form onSubmit={handleSubmitReview} className="review-form">
            <div className="form-group">
              <label>Rating *</label>
              {renderStars(reviewForm.rating, true, (rating) => 
                setReviewForm({ ...reviewForm, rating })
              )}
            </div>

            <div className="form-group">
              <label htmlFor="title">Title *</label>
              <input
                type="text"
                id="title"
                value={reviewForm.title}
                onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                placeholder="Summarize your experience"
                required
                maxLength={100}
              />
            </div>

            <div className="form-group">
              <label htmlFor="serviceType">Service Type *</label>
              <input
                type="text"
                id="serviceType"
                value={reviewForm.serviceType}
                onChange={(e) => setReviewForm({ ...reviewForm, serviceType: e.target.value })}
                placeholder="e.g., Wedding Photography"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="comment">Your Review *</label>
              <textarea
                id="comment"
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                placeholder="Tell others about your experience..."
                required
                maxLength={1000}
                rows={4}
              />
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <div className="form-actions">
              <button type="submit" className="submit-review-btn" disabled={submitting}>
                {submitting ? (
                  <>
                    <div className="loading-spinner-small"></div>
                    {editingReview ? "Updating..." : "Submitting..."}
                  </>
                ) : (
                  editingReview ? "Update Review" : "Submit Review"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Review Button */}
      {!showReviewForm && mode === "display" && user._id && bookingId && (
        <div className="add-review-section">
          <button 
            className="add-review-btn"
            onClick={() => setShowReviewForm(true)}
          >
            ✍️ Write a Review
          </button>
        </div>
      )}

      {/* Reviews List */}
      <div className="reviews-list">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review._id} className="review-item">
              <div className="review-header">
                <div className="reviewer-info">
                  <div className="reviewer-avatar">
                    {review.clientId?.profileImage ? (
                      <img src={review.clientId.profileImage} alt={review.clientId?.username} />
                    ) : (
                      <div className="avatar-placeholder">
                        {review.clientId?.username?.charAt(0).toUpperCase() || "?"}
                      </div>
                    )}
                  </div>
                  <div className="reviewer-details">
                    <h5>{review.clientId?.username || "Anonymous"}</h5>
                    <div className="review-meta">
                      {renderStars(review.rating)}
                      <span className="service-type">{review.serviceType}</span>
                      <span className="review-date">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                      {mode === "client-reviews" && review.photographerId && (
                        <span className="photographer-name">
                          For: {review.photographerId.userId?.username || "Unknown Photographer"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {user._id === review.clientId?._id && (
                  <div className="review-actions">
                    <button 
                      className="edit-review-btn"
                      onClick={() => handleEditReview(review)}
                    >
                      ✏️
                    </button>
                    <button 
                      className="delete-review-btn"
                      onClick={() => handleDeleteReview(review._id)}
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>

              <div className="review-content">
                <h4 className="review-title">{review.title}</h4>
                <p className="review-comment">{review.comment}</p>
                
                {/* Add photographer response component - only for photographers */}
                {user.role === "photographer" && photographerId === review.photographerId?._id && (
                  <ReviewResponseComponent 
                    review={review}
                    onResponseSubmitted={() => fetchReviews()}
                  />
                )}
                
                {/* Show existing response for all users */}
                {review.photographerResponse && (
                  <div className="photographer-response">
                    <div className="response-header">
                      <strong>Photographer Response:</strong>
                      <span className="response-date">
                        {new Date(review.photographerResponse.respondedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p>{review.photographerResponse.message}</p>
                  </div>
                )}
              </div>

              <div className="review-footer">
                <button 
                  className="helpful-btn"
                  onClick={() => handleVoteHelpful(review._id)}
                >
                  👍 Helpful ({review.helpfulVotes || 0})
                </button>
                
                {review.isVerified && (
                  <span className="verified-badge">
                    ✅ Verified Review
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="no-reviews">
            <div className="no-reviews-icon">⭐</div>
            <h4>
              {mode === "client-reviews" ? "No Reviews Written Yet" : "No Reviews Yet"}
            </h4>
            <p>
              {mode === "client-reviews" 
                ? "You haven't written any reviews yet. Complete a booking to leave a review!" 
                : "Be the first to leave a review for this photographer!"}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ReviewComponent