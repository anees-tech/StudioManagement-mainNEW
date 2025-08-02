"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import "../styles/BookingInterface.css"

const BookingInterface = ({ user }) => {
  const { photographerId } = useParams()
  const navigate = useNavigate()
  const [photographer, setPhotographer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [bookingData, setBookingData] = useState({
    date: "",
    time: "",
    duration: "2",
    service: "",
    location: "",
    specialRequests: "",
    contactInfo: {
      phone: "",
      email: user?.email || "",
    },
  })

  useEffect(() => {
    if (photographerId) {
      fetchPhotographerDetails()
    }
  }, [photographerId])

  const fetchPhotographerDetails = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/photographers/${photographerId}`)
      const data = await response.json()

      if (response.ok) {
        setPhotographer(data)
        // Set default service if available
        if (data.services && data.services.length > 0) {
          setBookingData((prev) => ({
            ...prev,
            service: data.services[0],
          }))
        }
      } else {
        setError("Photographer not found")
      }
    } catch (error) {
      console.error("Error fetching photographer:", error)
      setError("Failed to load photographer details")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target

    if (name.startsWith("contactInfo.")) {
      const field = name.split(".")[1]
      setBookingData((prev) => ({
        ...prev,
        contactInfo: {
          ...prev.contactInfo,
          [field]: value,
        },
      }))
    } else {
      setBookingData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")
    setSuccess("")

    try {
      // Validate required fields
      if (!bookingData.service || !bookingData.date || !bookingData.time || !bookingData.location) {
        setError("Please fill in all required fields")
        setSubmitting(false)
        return
      }

      // Calculate total amount
      const totalAmount = calculateTotalAmount()

      const bookingPayload = {
        clientId: user._id,
        photographerId: photographerId,
        service: bookingData.service,
        date: bookingData.date,
        time: bookingData.time,
        duration: parseInt(bookingData.duration),
        location: bookingData.location,
        specialRequests: bookingData.specialRequests || "",
        contactInfo: {
          phone: bookingData.contactInfo.phone,
          email: bookingData.contactInfo.email,
        },
        totalAmount: totalAmount,
      }

      console.log("Submitting booking:", bookingPayload) // Debug log

      const response = await fetch("http://localhost:5000/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingPayload),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Booking request submitted successfully! You will be redirected to your dashboard.")
        setTimeout(() => {
          navigate("/user-dashboard")
        }, 2000)
      } else {
        console.error("Booking error:", data) // Debug log
        setError(data.message || "Failed to submit booking request")
      }
    } catch (error) {
      console.error("Booking submission error:", error)
      setError("Network error. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const calculateTotalAmount = () => {
    if (!photographer?.pricing || !bookingData.service) return 0

    const selectedService = photographer.pricing.find((p) => p.service === bookingData.service)
    if (!selectedService) return 0

    const basePrice = selectedService.price
    const duration = parseInt(bookingData.duration)
    
    // Calculate price based on duration (assuming base price is for 2 hours)
    const hourlyRate = basePrice / 2
    const totalPrice = hourlyRate * duration
    
    // Apply discount for longer sessions
    let finalPrice = totalPrice
    if (duration >= 6) {
      finalPrice = totalPrice * 0.9 // 10% discount for 6+ hours
    } else if (duration >= 4) {
      finalPrice = totalPrice * 0.95 // 5% discount for 4+ hours
    }

    return Math.round(finalPrice)
  }

  const getMinDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split("T")[0]
  }

  if (loading) {
    return (
      <div className="booking-loading">
        <div className="loading-spinner"></div>
        <p>Loading booking details...</p>
      </div>
    )
  }

  if (error && !photographer) {
    return (
      <div className="booking-error">
        <h2>Booking Not Available</h2>
        <p>{error}</p>
        <button onClick={() => navigate("/browse")} className="back-btn">
          Back to Browse
        </button>
      </div>
    )
  }

  return (
    <div className="booking-interface">
      <div className="booking-container">
        <div className="booking-header">
          <button onClick={() => navigate(-1)} className="back-button">
            ← Back
          </button>
          <h1>Book a Session</h1>
          <p>Schedule your photography session with {photographer?.userId.username}</p>
        </div>

        <div className="booking-content">
          <div className="photographer-summary">
            <div className="photographer-card">
              <div className="photographer-image">
                <img
                  src={photographer?.userId.profileImage || "/placeholder.svg?height=120&width=120"}
                  alt={photographer?.userId.username}
                 
                />
              </div>
              <div className="photographer-info">
                <h3>{photographer?.userId.username}</h3>
                <p className="specialization">{photographer?.specialization}</p>
                <div className="rating">
                  <div className="stars">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={`star ${i < Math.round(photographer?.rating || 0) ? "filled" : ""}`}>
                        ⭐
                      </span>
                    ))}
                  </div>
                  <span className="rating-text">
                    {photographer?.rating?.toFixed(1) || "0.0"} ({photographer?.reviewCount || 0} reviews)
                  </span>
                </div>
                <div className="contact-info">
                  <p>📧 {photographer?.userId.email}</p>
                  {photographer?.phone && <p>📱 {photographer.phone}</p>}
                </div>
              </div>
            </div>

            <div className="pricing-summary">
              <h4>Pricing Information</h4>
              {photographer?.pricing && photographer.pricing.length > 0 ? (
                <div className="pricing-list">
                  {photographer.pricing.map((pkg, index) => (
                    <div key={index} className="pricing-item">
                      <span className="service-name">{pkg.service}</span>
                      <span className="service-price">${pkg.price}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-pricing">Contact photographer for pricing details</p>
              )}
            </div>
          </div>

          <div className="booking-form-container">
            <form onSubmit={handleSubmit} className="booking-form">
              <div className="form-section">
                <h3>Session Details</h3>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="service">Service Type *</label>
                    <select
                      id="service"
                      name="service"
                      value={bookingData.service}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select a service</option>
                      {photographer?.services?.map((service, index) => (
                        <option key={index} value={service}>
                          {service}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="duration">Duration (hours) *</label>
                    <select
                      id="duration"
                      name="duration"
                      value={bookingData.duration}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="1">1 hour</option>
                      <option value="2">2 hours</option>
                      <option value="3">3 hours</option>
                      <option value="4">4 hours</option>
                      <option value="6">6 hours</option>
                      <option value="8">8 hours (Full day)</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="date">Preferred Date *</label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={bookingData.date}
                      onChange={handleInputChange}
                      min={getMinDate()}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="time">Preferred Time *</label>
                    <select id="time" name="time" value={bookingData.time} onChange={handleInputChange} required>
                      <option value="">Select time</option>
                      <option value="09:00">9:00 AM</option>
                      <option value="10:00">10:00 AM</option>
                      <option value="11:00">11:00 AM</option>
                      <option value="12:00">12:00 PM</option>
                      <option value="13:00">1:00 PM</option>
                      <option value="14:00">2:00 PM</option>
                      <option value="15:00">3:00 PM</option>
                      <option value="16:00">4:00 PM</option>
                      <option value="17:00">5:00 PM</option>
                      <option value="18:00">6:00 PM</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="location">Location *</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={bookingData.location}
                    onChange={handleInputChange}
                    placeholder="Enter the session location"
                    required
                  />
                </div>
              </div>

              <div className="form-section">
                <h3>Contact Information</h3>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="contactInfo.email">Email *</label>
                    <input
                      type="email"
                      id="contactInfo.email"
                      name="contactInfo.email"
                      value={bookingData.contactInfo.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="contactInfo.phone">Phone Number *</label>
                    <input
                      type="tel"
                      id="contactInfo.phone"
                      name="contactInfo.phone"
                      value={bookingData.contactInfo.phone}
                      onChange={handleInputChange}
                      placeholder="Your phone number"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Additional Information</h3>

                <div className="form-group">
                  <label htmlFor="specialRequests">Special Requests or Notes</label>
                  <textarea
                    id="specialRequests"
                    name="specialRequests"
                    value={bookingData.specialRequests}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Any special requirements, themes, or additional information..."
                  />
                </div>
              </div>

              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}

              <div className="booking-summary">
                <div className="summary-details">
                  <h4>Booking Summary</h4>
                  <div className="summary-item">
                    <span>Service:</span>
                    <span>{bookingData.service || "Not selected"}</span>
                  </div>
                  <div className="summary-item">
                    <span>Duration:</span>
                    <span>
                      {bookingData.duration} hour{bookingData.duration !== "1" ? "s" : ""}
                    </span>
                  </div>
                  <div className="summary-item">
                    <span>Date & Time:</span>
                    <span>
                      {bookingData.date && bookingData.time
                        ? `${new Date(bookingData.date).toLocaleDateString()} at ${bookingData.time}`
                        : "Not selected"}
                    </span>
                  </div>
                  <div className="summary-item total">
                    <span>Estimated Total:</span>
                    <span>${calculateTotalAmount()}</span>
                  </div>
                </div>
              </div>

              <button type="submit" className="submit-booking-btn" disabled={submitting}>
                {submitting ? (
                  <>
                    <div className="loading-spinner-small"></div>
                    Submitting...
                  </>
                ) : (
                  "Submit Booking Request"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookingInterface
