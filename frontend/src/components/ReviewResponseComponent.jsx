"use client"

import { useState } from "react"
import "./ReviewResponseComponent.css"

const ReviewResponseComponent = ({ review, onResponseSubmitted }) => {
  const [showResponseForm, setShowResponseForm] = useState(false)
  const [responseText, setResponseText] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSubmitResponse = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch(`http://localhost:5000/api/reviews/${review._id}/response`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: responseText }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Response submitted successfully!")
        setResponseText("")
        setShowResponseForm(false)
        if (onResponseSubmitted) onResponseSubmitted(data.review)
      } else {
        setError(data.message || "Failed to submit response")
      }
    } catch (error) {
      console.error("Error submitting response:", error)
      setError("Network error. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (review.photographerResponse) {
    return (
      <div className="photographer-response">
        <div className="response-header">
          <strong>Your Response:</strong>
          <span className="response-date">
            {new Date(review.photographerResponse.respondedAt).toLocaleDateString()}
          </span>
        </div>
        <p>{review.photographerResponse.message}</p>
      </div>
    )
  }

  return (
    <div className="response-section">
      {!showResponseForm ? (
        <button 
          className="respond-btn"
          onClick={() => setShowResponseForm(true)}
        >
          💬 Respond to Review
        </button>
      ) : (
        <form onSubmit={handleSubmitResponse} className="response-form">
          <div className="form-group">
            <label htmlFor="response">Your Response</label>
            <textarea
              id="response"
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              placeholder="Thank your customer and address any concerns..."
              required
              maxLength={500}
              rows={3}
            />
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="form-actions">
            <button type="submit" className="submit-response-btn" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Response"}
            </button>
            <button 
              type="button" 
              className="cancel-response-btn"
              onClick={() => {
                setShowResponseForm(false)
                setResponseText("")
                setError("")
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default ReviewResponseComponent