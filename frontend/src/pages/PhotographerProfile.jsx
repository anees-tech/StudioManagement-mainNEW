"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import "../styles/PhotographerProfile.css"
import ReviewComponent from "../components/ReviewComponent"

const PhotographerProfile = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [photographer, setPhotographer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("about")

  useEffect(() => {
    fetchPhotographerProfile()
  }, [id])

  const fetchPhotographerProfile = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/photographers/${id}`)
      const data = await response.json()

      if (response.ok) {
        setPhotographer(data)
      } else {
        setError("Photographer not found")
      }
    } catch (error) {
      console.error("Error fetching photographer profile:", error)
      setError("An error occurred while loading the profile")
    } finally {
      setLoading(false)
    }
  }

  const handleBookNow = () => {
    const user = localStorage.getItem("user")
    if (!user) {
      navigate("/login")
      return
    }
    navigate(`/booking/${photographer._id}`)
  }

  const handleImageError = (e) => {
    e.target.src = "/placeholder.svg?height=150&width=150"
  }

  const handlePortfolioImageError = (e) => {
    e.target.src = "/placeholder.svg?height=300&width=400"
  }

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading photographer profile...</p>
      </div>
    )
  }

  if (error || !photographer) {
    return (
      <div className="profile-error">
        <h2>Profile Not Found</h2>
        <p>{error}</p>
        <button onClick={() => navigate("/browse")} className="back-btn">
          Back to Browse
        </button>
      </div>
    )
  }

  return (
    <div className="photographer-profile">
      <div className="profile-hero">
        <div className="hero-background">
          <div className="hero-overlay"></div>
          <div className="floating-elements">
            <div className="floating-element element-1">📸</div>
            <div className="floating-element element-2">🎨</div>
            <div className="floating-element element-3">✨</div>
            <div className="floating-element element-4">🌟</div>
          </div>
        </div>
        <div className="hero-content">
          <div className="photographer-main-info">
            <div className="photographer-avatar">
              {photographer.userId?.profileImage ? (
                <img
                  src={photographer.userId.profileImage}
                  alt={photographer.userId.username}
                  onError={handleImageError}
                />
              ) : (
                <div className="avatar-placeholder">
                  {photographer.userId?.username?.charAt(0).toUpperCase() || "?"}
                </div>
              )}
              <div className="avatar-ring"></div>
            </div>
            <div className="photographer-details">
              <h1 className="photographer-name">{photographer.userId?.username || "Unknown Photographer"}</h1>
              <p className="photographer-specialization">
                <span className="spec-icon">🎯</span>
                {photographer.specialization || "Photography"}
              </p>
              <div className="photographer-rating">
                <div className="stars">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`star ${i < Math.round(photographer.rating || 0) ? "filled" : ""}`}>
                      ⭐
                    </span>
                  ))}
                </div>
                <span className="rating-text">
                  {photographer.rating?.toFixed(1) || "0.0"} ({photographer.reviewCount || 0} reviews)
                </span>
              </div>
              <div className="photographer-stats">
                <div className="stat">
                  <span className="stat-number">{photographer.experience || 0}</span>
                  <span className="stat-label">Years Experience</span>
                </div>
                <div className="stat">
                  <span className="stat-number">{photographer.portfolio?.length || 0}</span>
                  <span className="stat-label">Portfolio Items</span>
                </div>
                <div className="stat">
                  <span className="stat-number">{photographer.services?.length || 0}</span>
                  <span className="stat-label">Services</span>
                </div>
                <div className="stat">
                  <span className="stat-number">{photographer.pricing?.length || 0}</span>
                  <span className="stat-label">Packages</span>
                </div>
              </div>
            </div>
          </div>
          <div className="profile-actions">
            <button onClick={handleBookNow} className="book-now-btn">
              <span className="btn-icon">📅</span>
              Book Now
            </button>
            <button onClick={() => navigate("/browse")} className="back-btn">
              <span className="btn-icon">←</span>
              Back to Browse
            </button>
          </div>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-nav">
          <div className="nav-container">
            <div className="nav-tabs">
              {[
                { id: "about", label: "About", icon: "👤" },
                { id: "portfolio", label: "Portfolio", icon: "🖼️" },
                { id: "services", label: "Services & Pricing", icon: "💼" },
                { id: "availability", label: "Availability", icon: "⏰" },
                { id: "reviews", label: "Reviews", icon: "⭐" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  className={`nav-tab ${activeTab === tab.id ? "active" : ""}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span className="tab-icon">{tab.icon}</span>
                  <span className="tab-label">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="profile-sections">
          {activeTab === "about" && (
            <div className="about-section">
              <div className="section-card">
                <div className="card-header">
                  <h2>About {photographer.userId?.username || "This Photographer"}</h2>
                  <div className="header-decoration"></div>
                </div>
                <div className="card-content">
                  <div className="about-content">
                    <div className="about-text">
                      <p className="photographer-description">
                        {photographer.description ||
                          "This photographer hasn't added a description yet, but their work speaks for itself!"}
                      </p>
                    </div>
                    <div className="about-image">
                      {photographer.userId?.profileImage ? (
                        <img
                          src={photographer.userId.profileImage}
                          alt={photographer.userId.username}
                          className="about-profile-image"
                          onError={handleImageError}
                        />
                      ) : (
                        <div className="about-profile-placeholder">
                          {photographer.userId?.username?.charAt(0).toUpperCase() || "?"}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="info-grid">
                    <div className="contact-info">
                      <h3>Contact Information</h3>
                      <div className="contact-items">
                        <div className="contact-item">
                          <span className="contact-icon">📧</span>
                          <span className="contact-text">{photographer.userId?.email || "Not provided"}</span>
                        </div>
                        {photographer.userId?.phone && (
                          <div className="contact-item">
                            <span className="contact-icon">📱</span>
                            <span className="contact-text">{photographer.userId.phone}</span>
                          </div>
                        )}
                        {photographer.userId?.address && (
                          <div className="contact-item">
                            <span className="contact-icon">📍</span>
                            <span className="contact-text">{photographer.userId.address}</span>
                          </div>
                        )}
                        {photographer.location && (
                          <div className="contact-item">
                            <span className="contact-icon">🌍</span>
                            <span className="contact-text">{photographer.location}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="specializations">
                      <h3>Services Offered</h3>
                      <div className="services-tags">
                        {photographer.specialization && (
                          <span className="service-tag primary">{photographer.specialization}</span>
                        )}
                        {photographer.services?.map((service, index) => (
                          <span key={index} className="service-tag">
                            {service}
                          </span>
                        ))}
                        {(!photographer.services || photographer.services.length === 0) && (
                          <span className="service-tag">General Photography</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "portfolio" && (
            <div className="portfolio-section">
              <div className="section-card">
                <div className="card-header">
                  <h2>Portfolio</h2>
                  <div className="header-decoration"></div>
                </div>
                <div className="card-content">
                  {photographer.portfolio && photographer.portfolio.length > 0 ? (
                    <div className="portfolio-grid">
                      {photographer.portfolio.map((item, index) => (
                        <div key={index} className="portfolio-item">
                          <div className="portfolio-image">
                            <img
                              src={item.imageUrl || "/placeholder.svg?height=300&width=400"}
                              alt={item.title || `Portfolio item ${index + 1}`}
                              onError={handlePortfolioImageError}
                            />
                            <div className="portfolio-overlay">
                              <div className="portfolio-info">
                                <h4>{item.title || "Untitled"}</h4>
                                <p>{item.category || "General"}</p>
                              </div>
                            </div>
                          </div>
                          <div className="portfolio-details">
                            <h4>{item.title || "Untitled"}</h4>
                            <p className="portfolio-category">{item.category || "General"}</p>
                            <p className="portfolio-description">
                              {item.description || "No description provided"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <div className="empty-icon">🖼️</div>
                      <h3>No Portfolio Items Yet</h3>
                      <p>This photographer is still building their portfolio. Check back soon!</p>
                      <button onClick={handleBookNow} className="contact-btn">
                        Contact Photographer
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "services" && (
            <div className="services-section">
              <div className="section-card">
                <div className="card-header">
                  <h2>Services & Pricing</h2>
                  <div className="header-decoration"></div>
                </div>
                <div className="card-content">
                  {photographer.pricing && photographer.pricing.length > 0 ? (
                    <div className="pricing-grid">
                      {photographer.pricing.map((pkg, index) => (
                        <div key={index} className="pricing-card">
                          <div className="pricing-header">
                            <h3>{pkg.service || "Photography Service"}</h3>
                            <div className="price">
                              <span className="currency">$</span>
                              <span className="amount">{pkg.price || 0}</span>
                            </div>
                          </div>
                          <div className="pricing-content">
                            <p className="pricing-description">
                              {pkg.description || "Professional photography service"}
                            </p>
                            <div className="pricing-features">
                              <div className="feature">
                                <span className="feature-icon">✅</span>
                                <span>Professional Quality</span>
                              </div>
                              <div className="feature">
                                <span className="feature-icon">✅</span>
                                <span>High Resolution Images</span>
                              </div>
                              <div className="feature">
                                <span className="feature-icon">✅</span>
                                <span>Quick Delivery</span>
                              </div>
                              <div className="feature">
                                <span className="feature-icon">✅</span>
                                <span>Post-Processing Included</span>
                              </div>
                            </div>
                          </div>
                          <button onClick={handleBookNow} className="select-package-btn">
                            Select Package
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <div className="empty-icon">💼</div>
                      <h3>No Pricing Packages Available</h3>
                      <p>Contact the photographer directly for pricing information.</p>
                      <button onClick={handleBookNow} className="contact-btn">
                        Contact Photographer
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "availability" && (
            <div className="availability-section">
              <div className="section-card">
                <div className="card-header">
                  <h2>Available Time Slots</h2>
                  <div className="header-decoration"></div>
                </div>
                <div className="card-content">
                  {photographer.availability && photographer.availability.length > 0 ? (
                    <div className="availability-grid">
                      {photographer.availability.map((avail, index) => (
                        <div key={index} className="availability-item">
                          <div className="availability-date">
                            <div className="date-circle">
                              <span className="date-number">{new Date(avail.date).getDate()}</span>
                              <span className="date-month">
                                {new Date(avail.date).toLocaleDateString('en-US', { month: 'short' })}
                              </span>
                            </div>
                            <div className="date-info">
                              <h4>{new Date(avail.date).toLocaleDateString('en-US', { 
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}</h4>
                            </div>
                          </div>
                          <div className="time-slots-display">
                            {avail.timeSlots?.map((slot, slotIndex) => (
                              <span 
                                key={slotIndex} 
                                className={`time-slot-badge ${slot.isBooked ? "booked" : "available"}`}
                              >
                                <span className="time-text">{slot.start} - {slot.end}</span>
                                <span className="status-icon">
                                  {slot.isBooked ? "❌" : "✅"}
                                </span>
                              </span>
                            )) || (
                              <span className="no-slots">No time slots available</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <div className="empty-icon">⏰</div>
                      <h3>No Available Time Slots</h3>
                      <p>The photographer hasn't set their availability yet. Contact them directly to schedule.</p>
                      <button onClick={handleBookNow} className="contact-btn">
                        Contact Photographer
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="reviews-section">
              <div className="section-card">
                <div className="card-header">
                  <h2>Reviews & Testimonials</h2>
                  <div className="header-decoration"></div>
                </div>
                <div className="card-content">
                  <ReviewComponent 
                    photographerId={photographer._id}
                    mode="display"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PhotographerProfile
