"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import "../styles/PhotographerDashboard.css"
import ReviewComponent from "../components/ReviewComponent"
import PhotographerPhotoEditRequests from "../components/PhotographerPhotoEditRequests"

const PhotographerDashboard = () => {
  const [user, setUser] = useState(null)
  const [photographer, setPhotographer] = useState(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [bookings, setBookings] = useState([])
  const [uploading, setUploading] = useState(false)
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    totalEarnings: 0,
  })
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  // Portfolio management
  const [portfolioItem, setPortfolioItem] = useState({
    title: "",
    description: "",
    imageUrl: "",
    category: "",
  })
  const [editingPortfolio, setEditingPortfolio] = useState(null)
  const [showPortfolioModal, setShowPortfolioModal] = useState(false)

  // Availability management
  const [availability, setAvailability] = useState({
    date: "",
    timeSlots: [{ start: "", end: "" }],
  })
  const [editingAvailability, setEditingAvailability] = useState(null)
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false)

  // Profile update
  const [profileUpdate, setProfileUpdate] = useState({
    specialization: "",
    services: [],
    description: "",
    experience: "",
    pricing: [],
  })

  // Pricing management
  const [newPricing, setNewPricing] = useState({
    service: "",
    price: "",
    description: "",
  })

  const serviceOptions = [
    "Photo Editing",
    "Videography", 
    "Video Editing",
    "Photo Shoot Retouching",
    "Studio Lighting Services",
    "Underwater Photography",
    "Nature Photography",
    "Wedding Photography",
    "Engagement Photography",
  ]

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      navigate("/login")
      return
    }

    const parsedUser = JSON.parse(userData)
    if (parsedUser.role !== "photographer") {
      navigate("/login")
      return
    }

    setUser(parsedUser)
    fetchPhotographerData(parsedUser._id)
  }, [navigate])

  const fetchPhotographerData = async (userId) => {
    try {
      // Fetch photographer profile
      const photographerResponse = await fetch(`http://localhost:5000/api/photographers`)
      const photographers = await photographerResponse.json()
      const currentPhotographer = photographers.find((p) => p.userId._id === userId)

      if (currentPhotographer) {
        setPhotographer(currentPhotographer)
        setProfileUpdate({
          specialization: currentPhotographer.specialization,
          services: currentPhotographer.services,
          description: currentPhotographer.description,
          experience: currentPhotographer.experience,
          pricing: currentPhotographer.pricing || [],
        })

        // Fetch bookings
        const bookingsResponse = await fetch(
          `http://localhost:5000/api/bookings/photographer/${currentPhotographer._id}`,
        )
        const bookingsData = await bookingsResponse.json()
        setBookings(bookingsData)

        // Calculate stats
        const totalBookings = bookingsData.length
        const pendingBookings = bookingsData.filter((b) => b.status === "pending").length
        const completedBookings = bookingsData.filter((b) => b.status === "completed").length
        const totalEarnings = bookingsData.filter((b) => b.status === "completed").reduce((sum, b) => sum + b.price, 0)

        setStats({
          totalBookings,
          pendingBookings,
          completedBookings,
          totalEarnings,
        })

        // Fetch updated user data
        const userResponse = await fetch(`http://localhost:5000/api/users/${userId}`)
        if (userResponse.ok) {
          const userData = await userResponse.json()
          setUser(userData)
          localStorage.setItem("user", JSON.stringify(userData))
        }
      }
    } catch (error) {
      console.error("Error fetching photographer data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      alert('Please select a valid image file (JPEG, PNG, GIF, WebP)')
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('profileImage', file)

      const response = await fetch(`http://localhost:5000/api/users/${user._id}/upload-photo`, {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        localStorage.setItem("user", JSON.stringify(data.user))
        alert('Profile photo updated successfully!')
      } else {
        const errorData = await response.json()
        alert(errorData.message || 'Failed to upload photo')
      }
    } catch (error) {
      console.error('Error uploading photo:', error)
      alert('Error uploading photo. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  // Portfolio Functions
  const handleAddPortfolio = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(`http://localhost:5000/api/photographers/${photographer._id}/portfolio`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(portfolioItem),
      })

      if (response.ok) {
        fetchPhotographerData(user._id)
        setPortfolioItem({ title: "", description: "", imageUrl: "", category: "" })
        alert("Portfolio item added successfully!")
      }
    } catch (error) {
      console.error("Error adding portfolio item:", error)
    }
  }

  const handleEditPortfolio = (index) => {
    const item = photographer.portfolio[index]
    setEditingPortfolio(index)
    setPortfolioItem(item)
    setShowPortfolioModal(true)
  }

  const handleUpdatePortfolio = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(`http://localhost:5000/api/photographers/${photographer._id}/portfolio/${editingPortfolio}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(portfolioItem),
      })

      if (response.ok) {
        fetchPhotographerData(user._id)
        setPortfolioItem({ title: "", description: "", imageUrl: "", category: "" })
        setEditingPortfolio(null)
        setShowPortfolioModal(false)
        alert("Portfolio item updated successfully!")
      }
    } catch (error) {
      console.error("Error updating portfolio item:", error)
    }
  }

  const handleDeletePortfolio = async (index) => {
    if (window.confirm("Are you sure you want to delete this portfolio item?")) {
      try {
        const response = await fetch(`http://localhost:5000/api/photographers/${photographer._id}/portfolio/${index}`, {
          method: "DELETE",
        })

        if (response.ok) {
          fetchPhotographerData(user._id)
          alert("Portfolio item deleted successfully!")
        }
      } catch (error) {
        console.error("Error deleting portfolio item:", error)
      }
    }
  }

  // Availability Functions
  const handleAddAvailability = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(`http://localhost:5000/api/photographers/${photographer._id}/availability`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(availability),
      })

      if (response.ok) {
        fetchPhotographerData(user._id)
        setAvailability({ date: "", timeSlots: [{ start: "", end: "" }] })
        alert("Availability added successfully!")
      }
    } catch (error) {
      console.error("Error adding availability:", error)
    }
  }

  const handleEditAvailability = (index) => {
    const item = photographer.availability[index]
    setEditingAvailability(index)
    setAvailability(item)
    setShowAvailabilityModal(true)
  }

  const handleUpdateAvailability = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(`http://localhost:5000/api/photographers/${photographer._id}/availability/${editingAvailability}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(availability),
      })

      if (response.ok) {
        fetchPhotographerData(user._id)
        setAvailability({ date: "", timeSlots: [{ start: "", end: "" }] })
        setEditingAvailability(null)
        setShowAvailabilityModal(false)
        alert("Availability updated successfully!")
      }
    } catch (error) {
      console.error("Error updating availability:", error)
    }
  }

  const handleDeleteAvailability = async (index) => {
    if (window.confirm("Are you sure you want to delete this availability?")) {
      try {
        const response = await fetch(`http://localhost:5000/api/photographers/${photographer._id}/availability/${index}`, {
          method: "DELETE",
        })

        if (response.ok) {
          fetchPhotographerData(user._id)
          alert("Availability deleted successfully!")
        }
      } catch (error) {
        console.error("Error deleting availability:", error)
      }
    }
  }

  // Pricing Functions
  const handleAddPricing = () => {
    if (newPricing.service && newPricing.price && newPricing.description) {
      setProfileUpdate({
        ...profileUpdate,
        pricing: [...profileUpdate.pricing, { ...newPricing, price: parseFloat(newPricing.price) }]
      })
      setNewPricing({ service: "", price: "", description: "" })
    }
  }

  const handleDeletePricing = (index) => {
    const updatedPricing = profileUpdate.pricing.filter((_, i) => i !== index)
    setProfileUpdate({ ...profileUpdate, pricing: updatedPricing })
  }

  const addTimeSlot = () => {
    setAvailability({
      ...availability,
      timeSlots: [...availability.timeSlots, { start: "", end: "" }]
    })
  }

  const removeTimeSlot = (index) => {
    if (availability.timeSlots.length > 1) {
      const newSlots = availability.timeSlots.filter((_, i) => i !== index)
      setAvailability({ ...availability, timeSlots: newSlots })
    }
  }

  const updateTimeSlot = (index, field, value) => {
    const newSlots = [...availability.timeSlots]
    newSlots[index][field] = value
    setAvailability({ ...availability, timeSlots: newSlots })
  }

  const handleBookingStatusUpdate = async (bookingId, status) => {
    try {
      const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        fetchPhotographerData(user._id)
        alert(`Booking ${status} successfully!`)
      }
    } catch (error) {
      console.error("Error updating booking status:", error)
    }
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(`http://localhost:5000/api/photographers/${photographer._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileUpdate),
      })

      if (response.ok) {
        fetchPhotographerData(user._id)
        alert("Profile updated successfully!")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    navigate("/login")
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner-large"></div>
        <p>Loading your dashboard...</p>
      </div>
    )
  }

  return (
    <div className="photographer-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <div className="user-info">
            <div className="user-avatar">
              {user?.profileImage ? (
                <img src={user.profileImage} alt="Profile" />
              ) : (
                <div className="avatar-placeholder">{user?.username?.charAt(0).toUpperCase()}</div>
              )}
            </div>
            <div className="user-details">
              <h1>Welcome back, {user?.username}!</h1>
              <p>Photographer Dashboard</p>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>

      <div className="dashboard-nav">
        <div className="nav-tabs">
          {[
            { id: "overview", label: "Overview", icon: "📊" },
            { id: "bookings", label: "Bookings", icon: "📅" },
            { id: "photo-edit", label: "Photo Editing", icon: "🎨" },
            { id: "portfolio", label: "Portfolio", icon: "🖼️" },
            { id: "availability", label: "Availability", icon: "⏰" },
            { id: "reviews", label: "Reviews", icon: "⭐" },
            { id: "profile", label: "Profile", icon: "👤" },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`nav-tab ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="dashboard-content">
        {activeTab === "overview" && (
          <div className="overview-section">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📊</div>
                <div className="stat-info">
                  <h3>{stats.totalBookings}</h3>
                  <p>Total Bookings</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⏳</div>
                <div className="stat-info">
                  <h3>{stats.pendingBookings}</h3>
                  <p>Pending</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-info">
                  <h3>{stats.completedBookings}</h3>
                  <p>Completed</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">💰</div>
                <div className="stat-info">
                  <h3>${stats.totalEarnings}</h3>
                  <p>Total Earnings</p>
                </div>
              </div>
            </div>

            <div className="recent-bookings">
              <h2>Recent Bookings</h2>
              <div className="bookings-list">
                {bookings.slice(0, 5).map((booking) => (
                  <div key={booking._id} className="booking-item">
                    <div className="booking-info">
                      <h4>{booking.service}</h4>
                      <p>Client: {booking.clientId?.username}</p>
                      <span className="booking-date">
                        {new Date(booking.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className={`booking-status ${booking.status}`}>{booking.status}</div>
                  </div>
                ))}
                {bookings.length === 0 && (
                  <div className="no-bookings">
                    <h3>No Bookings Yet</h3>
                    <p>When clients book your services, they will appear here for you to manage and track.</p>
                    <div className="placeholder-actions">
                      <button 
                        className="btn-primary"
                        onClick={() => setActiveTab("portfolio")}
                      >
                        📸🖼 Update Portfolio
                      </button>
                      <button 
                        className="btn-secondary"
                        onClick={() => setActiveTab("availability")}
                      >
                        ⏰ Set Availability
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "photo-edit" && (
          <div className="photo-edit-section">
            <PhotographerPhotoEditRequests photographer={photographer} />
          </div>
        )}

        {activeTab === "bookings" && (
          <div className="bookings-section">
            <h2>Manage Bookings</h2>
            <div className="bookings-grid">
              {bookings.map((booking) => (
                <div key={booking._id} className="booking-card">
                  <div className="booking-header">
                    <h3>{booking.service}</h3>
                    <span className={`status-badge ${booking.status}`}>{booking.status}</span>
                  </div>
                  <div className="booking-details">
                    <p><strong>Client:</strong> {booking.clientId?.username}</p>
                    <p><strong>Email:</strong> {booking.clientId?.email}</p>
                    <p><strong>Date:</strong> {new Date(booking.date).toLocaleDateString()}</p>
                    <p><strong>Time:</strong> {booking.timeSlot?.start} - {booking.timeSlot?.end}</p>
                    <p><strong>Location:</strong> {booking.location}</p>
                    <p><strong>Price:</strong> ${booking.price}</p>
                    {booking.notes && <p><strong>Notes:</strong> {booking.notes}</p>}
                  </div>
                  <div className="booking-actions">
                    {booking.status === "pending" && (
                      <>
                        <button 
                          onClick={() => handleBookingStatusUpdate(booking._id, "confirmed")}
                          className="btn-confirm"
                        >
                          ✅ Confirm
                        </button>
                        <button 
                          onClick={() => handleBookingStatusUpdate(booking._id, "cancelled")}
                          className="btn-cancel"
                        >
                          ❌ Decline
                        </button>
                      </>
                    )}
                    {booking.status === "confirmed" && (
                      <button 
                        onClick={() => handleBookingStatusUpdate(booking._id, "completed")}
                        className="btn-complete"
                      >
                        ✅ Mark Complete
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {bookings.length === 0 && (
                <div className="no-bookings-message">
                  <h3>No bookings yet</h3>
                  <p>When clients book your services, they will appear here for you to manage and track.</p>
                  <div className="placeholder-actions">
                    <button 
                      className="btn-primary"
                      onClick={() => setActiveTab("portfolio")}
                    >
                      📸 Update Portfolio
                    </button>
                    <button 
                      className="btn-secondary"
                      onClick={() => setActiveTab("availability")}
                    >
                      ⏰ Set Availability
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "portfolio" && (
          <div className="portfolio-section">
            <h2>Portfolio Management</h2>

            <div className="add-portfolio-form">
              <h3>Add New Portfolio Item</h3>
              <form onSubmit={handleAddPortfolio}>
                <div className="form-row">
                  <input
                    type="text"
                    placeholder="Title"
                    value={portfolioItem.title}
                    onChange={(e) => setPortfolioItem({ ...portfolioItem, title: e.target.value })}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Category"
                    value={portfolioItem.category}
                    onChange={(e) => setPortfolioItem({ ...portfolioItem, category: e.target.value })}
                    required
                  />
                </div>
                <input
                  type="url"
                  placeholder="Image URL"
                  value={portfolioItem.imageUrl}
                  onChange={(e) => setPortfolioItem({ ...portfolioItem, imageUrl: e.target.value })}
                  required
                />
                <textarea
                  placeholder="Description"
                  value={portfolioItem.description}
                  onChange={(e) => setPortfolioItem({ ...portfolioItem, description: e.target.value })}
                  required
                />
                <button type="submit" className="btn-primary">
                  ➕ Add to Portfolio
                </button>
              </form>
            </div>

            <div className="portfolio-grid">
              {photographer?.portfolio?.map((item, index) => (
                <div key={index} className="portfolio-item">
                  <div className="portfolio-image">
                    <img src={item.imageUrl || "/placeholder.svg"} alt={item.title} />
                    <div className="portfolio-actions">
                      <button 
                        className="action-btn edit-btn"
                        onClick={() => handleEditPortfolio(index)}
                      >
                        ✏️
                      </button>
                      <button 
                        className="action-btn delete-btn"
                        onClick={() => handleDeletePortfolio(index)}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <div className="portfolio-info">
                    <h4>{item.title}</h4>
                    <p>{item.description}</p>
                    <span className="portfolio-category-badge">{item.category}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "availability" && (
          <div className="availability-section">
            <h2>Manage Availability</h2>

            <div className="add-availability-form">
              <h3>Add Available Time Slots</h3>
              <form onSubmit={handleAddAvailability}>
                <input
                  type="date"
                  value={availability.date}
                  onChange={(e) => setAvailability({ ...availability, date: e.target.value })}
                  required
                />
                <div className="time-slots">
                  {availability.timeSlots.map((slot, index) => (
                    <div key={index} className="time-slot-row">
                      <input
                        type="time"
                        value={slot.start}
                        onChange={(e) => updateTimeSlot(index, "start", e.target.value)}
                        required
                      />
                      <span>to</span>
                      <input
                        type="time"
                        value={slot.end}
                        onChange={(e) => updateTimeSlot(index, "end", e.target.value)}
                        required
                      />
                      {availability.timeSlots.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => removeTimeSlot(index)}
                          className="remove-slot-btn"
                        >
                          ❌
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="form-actions">
                  <button type="button" onClick={addTimeSlot} className="btn-secondary">
                    ➕ Add Time Slot
                  </button>
                  <button type="submit" className="btn-primary">
                    💾 Save Availability
                  </button>
                </div>
              </form>
            </div>

            <div className="availability-list">
              <h3>Current Availability</h3>
              {photographer?.availability?.map((avail, index) => (
                <div key={index} className="availability-item">
                  <div className="availability-date">
                    <h4>{new Date(avail.date).toLocaleDateString()}</h4>
                  </div>
                  <div className="time-slots-display">
                    {avail.timeSlots.map((slot, slotIndex) => (
                      <span key={slotIndex} className={`time-slot-badge ${slot.isBooked ? "booked" : "available"}`}>
                        {slot.start} - {slot.end}
                      </span>
                    ))}
                  </div>
                  <div className="availability-actions">
                    <button onClick={() => handleEditAvailability(index)} className="btn-edit">
                      ✏️
                    </button>
                    <button onClick={() => handleDeleteAvailability(index)} className="btn-delete">
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="reviews-section">
            <div className="section-card">
              <div className="card-header">
                <h2>Customer Reviews</h2>
                <div className="header-decoration"></div>
              </div>
              <div className="card-content">
                <ReviewComponent 
                  photographerId={photographer?._id}
                  mode="photographer-view"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "profile" && (
          <div className="profile-section">
            <h2>Update Profile</h2>
            
            {/* Profile Photo Section */}
            <div className="profile-photo-section">
              <h3>Profile Photo</h3>
              <div className="photo-upload-container">
                <div className="current-photo">
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt="Profile" className="profile-photo-large" />
                  ) : (
                    <div className="profile-photo-placeholder">
                      {user?.username?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="photo-upload-controls">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handlePhotoUpload}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-upload-photo"
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <div className="loading-spinner-small"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        📸 {user?.profileImage ? 'Change Photo' : 'Upload Photo'}
                      </>
                    )}
                  </button>
                  <p className="upload-help-text">
                    Supported formats: JPEG, PNG, GIF, WebP (Max 5MB)
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleProfileUpdate} className="profile-form">
              <div className="form-group">
                <label>Specialization</label>
                <input
                  type="text"
                  value={profileUpdate.specialization}
                  onChange={(e) => setProfileUpdate({ ...profileUpdate, specialization: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Experience (years)</label>
                <input
                  type="number"
                  value={profileUpdate.experience}
                  onChange={(e) => setProfileUpdate({ ...profileUpdate, experience: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={profileUpdate.description}
                  onChange={(e) => setProfileUpdate({ ...profileUpdate, description: e.target.value })}
                  rows="4"
                />
              </div>

              <div className="services-form-group">
                <label>Services</label>
                <div className="services-grid">
                  {serviceOptions.map((service) => (
                    <label key={service} className="service-checkbox">
                      <input
                        type="checkbox"
                        checked={profileUpdate.services.includes(service)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setProfileUpdate({
                              ...profileUpdate,
                              services: [...profileUpdate.services, service],
                            })
                          } else {
                            setProfileUpdate({
                              ...profileUpdate,
                              services: profileUpdate.services.filter((s) => s !== service),
                            })
                          }
                        }}
                      />
                      <span className="checkmark"></span>
                      {service}
                    </label>
                  ))}
                </div>
              </div>

              {/* Pricing Section */}
              <div className="pricing-section">
                <h3>Pricing Packages</h3>
                
                {/* Add New Pricing */}
                <div className="add-pricing-form">
                  <div className="pricing-input-group">
                    <input
                      type="text"
                      placeholder="Service Name"
                      value={newPricing.service}
                      onChange={(e) => setNewPricing({ ...newPricing, service: e.target.value })}
                    />
                    <input
                      type="number"
                      placeholder="Price ($)"
                      value={newPricing.price}
                      onChange={(e) => setNewPricing({ ...newPricing, price: e.target.value })}
                    />
                    <input
                      type="text"
                      placeholder="Description"
                      value={newPricing.description}
                      onChange={(e) => setNewPricing({ ...newPricing, description: e.target.value })}
                    />
                    <button type="button" className="btn-add-pricing" onClick={handleAddPricing}>
                      ➕ Add
                    </button>
                  </div>
                </div>

                {/* Display Existing Pricing */}
                <div className="pricing-list">
                  {profileUpdate.pricing.map((pricing, index) => (
                    <div key={index} className="pricing-item">
                      <div className="pricing-info">
                        <h4>{pricing.service}</h4>
                        <p className="pricing-price">${pricing.price}</p>
                        <p className="pricing-description">{pricing.description}</p>
                      </div>
                      <button 
                        type="button" 
                        className="btn-remove"
                        onClick={() => handleDeletePricing(index)}
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn-primary">
                💾 Update Profile
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Portfolio Edit Modal */}
      {showPortfolioModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Edit Portfolio Item</h3>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowPortfolioModal(false)
                  setEditingPortfolio(null)
                  setPortfolioItem({ title: "", description: "", imageUrl: "", category: "" })
                }}
              >
                ❌
              </button>
            </div>
            <form onSubmit={handleUpdatePortfolio} className="modal-form">
              <div className="form-row">
                <input
                  type="text"
                  placeholder="Title"
                  value={portfolioItem.title}
                  onChange={(e) => setPortfolioItem({ ...portfolioItem, title: e.target.value })}
                  required
                />
                <input
                  type="text"
                  placeholder="Category"
                  value={portfolioItem.category}
                  onChange={(e) => setPortfolioItem({ ...portfolioItem, category: e.target.value })}
                  required
                />
              </div>
              <input
                type="url"
                placeholder="Image URL"
                value={portfolioItem.imageUrl}
                onChange={(e) => setPortfolioItem({ ...portfolioItem, imageUrl: e.target.value })}
                required
              />
              <textarea
                placeholder="Description"
                value={portfolioItem.description}
                onChange={(e) => setPortfolioItem({ ...portfolioItem, description: e.target.value })}
                required
              />
              <div className="modal-actions">
                <button type="submit" className="btn-primary">💾 Update</button>
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => {
                    setShowPortfolioModal(false)
                    setEditingPortfolio(null)
                    setPortfolioItem({ title: "", description: "", imageUrl: "", category: "" })
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Availability Edit Modal */}
      {showAvailabilityModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Edit Availability</h3>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowAvailabilityModal(false)
                  setEditingAvailability(null)
                  setAvailability({ date: "", timeSlots: [{ start: "", end: "" }] })
                }}
              >
                ❌
              </button>
            </div>
            <form onSubmit={handleUpdateAvailability} className="modal-form">
              <input
                type="date"
                value={availability.date}
                onChange={(e) => setAvailability({ ...availability, date: e.target.value })}
                required
              />
              <div className="time-slots">
                {availability.timeSlots.map((slot, index) => (
                  <div key={index} className="time-slot">
                    <input
                      type="time"
                      value={slot.start}
                      onChange={(e) => {
                        const newSlots = [...availability.timeSlots]
                        newSlots[index].start = e.target.value
                        setAvailability({ ...availability, timeSlots: newSlots })
                      }}
                      required
                    />
                    <span className="time-slot-separator">to</span>
                    <input
                      type="time"
                      value={slot.end}
                      onChange={(e) => {
                        const newSlots = [...availability.timeSlots]
                        newSlots[index].end = e.target.value
                        setAvailability({ ...availability, timeSlots: newSlots })
                      }}
                      required
                    />
                    {availability.timeSlots.length > 1 && (
                      <button 
                        type="button" 
                        className="remove-slot-btn"
                        onClick={() => removeTimeSlot(index)}
                      >
                        ❌
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button type="button" className="add-time-slot-btn" onClick={addTimeSlot}>
                ➕ Add Time Slot
              </button>
              <div className="modal-actions">
                <button type="submit" className="btn-primary">💾 Update</button>
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => {
                    setShowAvailabilityModal(false)
                    setEditingAvailability(null)
                    setAvailability({ date: "", timeSlots: [{ start: "", end: "" }] })
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default PhotographerDashboard




