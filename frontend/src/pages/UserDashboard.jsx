"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import "../styles/UserDashboard.css"
import ReviewComponent from "../components/ReviewComponent"
import PhotoEditRequests from "../components/PhotoEditRequests"

const UserDashboard = () => {
  const [user, setUser] = useState(null)
  const [bookings, setBookings] = useState([])
  const [photographers, setPhotographers] = useState([])
  const [activeTab, setActiveTab] = useState("overview")
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [profileUpdate, setProfileUpdate] = useState({
    username: "",
    email: "",
    phone: "",
    address: "",
  })
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      navigate("/login")
      return
    }

    const parsedUser = JSON.parse(userData)
    if (parsedUser.role === "admin") {
      navigate("/admin-dashboard")
      return
    }
    if (parsedUser.role === "photographer") {
      navigate("/photographer-dashboard")
      return
    }

    setUser(parsedUser)
    setProfileUpdate({
      username: parsedUser.username,
      email: parsedUser.email,
      phone: parsedUser.phone || "",
      address: parsedUser.address || "",
    })
    fetchUserData(parsedUser._id)
  }, [navigate])

  const fetchUserData = async (userId) => {
    try {
      // Fetch user bookings
      const bookingsResponse = await fetch(`http://localhost:5000/api/bookings/client/${userId}`)
      const bookingsData = await bookingsResponse.json()
      
      // Filter out bookings with null photographerId
      const validBookings = Array.isArray(bookingsData) 
        ? bookingsData.filter(booking => booking.photographerId && booking.photographerId._id)
        : []
      
      setBookings(validBookings)

      // Fetch featured photographers
      const photographersResponse = await fetch("http://localhost:5000/api/photographers/featured")
      const photographersData = await photographersResponse.json()
      setPhotographers(Array.isArray(photographersData) ? photographersData : [])

      // Fetch updated user data
      const userResponse = await fetch(`http://localhost:5000/api/users/${userId}`)
      if (userResponse.ok) {
        const userData = await userResponse.json()
        setUser(userData)
        localStorage.setItem("user", JSON.stringify(userData))
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
      setBookings([])
      setPhotographers([])
    } finally {
      setLoading(false)
    }
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(`http://localhost:5000/api/users/${user._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileUpdate),
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        localStorage.setItem("user", JSON.stringify(data.user))
        alert("Profile updated successfully!")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
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

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return

    try {
      const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "cancelled" }),
      })

      if (response.ok) {
        fetchUserData(user._id)
        alert("Booking cancelled successfully!")
      } else {
        alert("Failed to cancel booking. Please try again.")
      }
    } catch (error) {
      console.error("Error cancelling booking:", error)
      alert("Error cancelling booking. Please try again.")
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    navigate("/login")
  }

  const getBookingStats = () => {
    const total = bookings.length
    const pending = bookings.filter((b) => b.status === "pending").length
    const confirmed = bookings.filter((b) => b.status === "confirmed").length
    const completed = bookings.filter((b) => b.status === "completed").length
    const totalSpent = bookings
      .filter((b) => b.status === "completed")
      .reduce((sum, b) => sum + (b.price || 0), 0)

    return { total, pending, confirmed, completed, totalSpent }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner-large"></div>
        <p>Loading your dashboard...</p>
      </div>
    )
  }

  const stats = getBookingStats()

  return (
    <div className="user-dashboard">
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
              <p>Client Dashboard</p>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>

      <div className="dashboard-nav">
        <div className="nav-tabs">
          {[{
            id: "overview",
            label: "Overview",
            icon: "📊",
          },
          {
            id: "bookings",
            label: "My Bookings",
            icon: "📅",
          },
          {
            id: "photo-edit",
            label: "Photo Editing",
            icon: "🎨",
          },
          {
            id: "reviews",
            label: "My Reviews",
            icon: "⭐",
          },
          {
            id: "photographers",
            label: "Browse",
            icon: "📸",
          },
          {
            id: "profile",
            label: "Profile",
            icon: "👤",
          },
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
                  <h3>{stats.total}</h3>
                  <p>Total Bookings</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⏳</div>
                <div className="stat-info">
                  <h3>{stats.pending}</h3>
                  <p>Pending</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-info">
                  <h3>{stats.completed}</h3>
                  <p>Completed</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">💰</div>
                <div className="stat-info">
                  <h3>${stats.totalSpent}</h3>
                  <p>Total Spent</p>
                </div>
              </div>
            </div>

            <div className="recent-activity">
              <h2>Recent Bookings</h2>
              <div className="activity-list">
                {bookings.slice(0, 5).map((booking) => (
                  <div key={booking._id} className="activity-item">
                    <div className="activity-info">
                      <h4>{booking.service || "Unknown Service"}</h4>
                      <p>with {booking.photographerId?.userId?.username || "Unknown Photographer"}</p>
                      <span className="activity-date">
                        {booking.date ? new Date(booking.date).toLocaleDateString() : "Unknown Date"}
                      </span>
                    </div>
                    <div className={`activity-status ${booking.status}`}>{booking.status}</div>
                  </div>
                ))}
                {bookings.length === 0 && (
                  <div className="no-bookings">
                    <p>No bookings yet. Start by browsing photographers!</p>
                    <button onClick={() => setActiveTab("photographers")} className="btn-primary">
                      Browse Photographers
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="featured-photographers">
              <h2>Featured Photographers</h2>
              <div className="photographers-grid">
                {photographers.slice(0, 3).map((photographer) => (
                  <div key={photographer._id} className="photographer-card">
                    <div className="photographer-image">
                      {photographer.userId?.profileImage ? (
                        <img src={photographer.userId.profileImage} alt={photographer.userId?.username} />
                      ) : (
                        <div className="image-placeholder">
                          {photographer.userId?.username?.charAt(0).toUpperCase() || "?"}
                        </div>
                      )}
                    </div>
                    <div className="photographer-info">
                      <h3>{photographer.userId?.username || "Unknown"}</h3>
                      <p>{photographer.specialization || "General Photography"}</p>
                      <div className="rating">
                        <span>⭐ {photographer.rating || 0}</span>
                        <span>({photographer.reviewCount || 0} reviews)</span>
                      </div>
                    </div>
                    <button onClick={() => navigate(`/photographer-profile/${photographer._id}`)} className="btn-secondary">
                      View Profile
                    </button>
                  </div>
                ))}
                {photographers.length === 0 && (
                  <div className="no-photographers">
                    <p>No featured photographers available at the moment.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "bookings" && (
          <div className="bookings-section">
            <h2>My Bookings</h2>
            <div className="bookings-grid">
              {bookings.map((booking) => (
                <div key={booking._id} className="booking-card">
                  <div className="booking-header">
                    <h3>{booking.service || "Unknown Service"}</h3>
                    <span className={`status-badge ${booking.status}`}>{booking.status}</span>
                  </div>
                  <div className="booking-details">
                    <p>
                      <strong>Photographer:</strong> {booking.photographerId?.userId?.username || "Unknown"}
                    </p>
                    <p>
                      <strong>Date:</strong> {booking.date ? new Date(booking.date).toLocaleDateString() : "Unknown"}
                    </p>
                    <p>
                      <strong>Time:</strong> {booking.timeSlot?.start && booking.timeSlot?.end 
                        ? `${booking.timeSlot.start} - ${booking.timeSlot.end}` 
                        : "Time not specified"}
                    </p>
                    <p>
                      <strong>Location:</strong> {booking.location || "Location not specified"}
                    </p>
                    <p>
                      <strong>Price:</strong> ${booking.price || 0}
                    </p>
                    {booking.notes && (
                      <p>
                        <strong>Notes:</strong> {booking.notes}
                      </p>
                    )}
                  </div>
                  <div className="booking-actions">
                    {booking.status === "pending" && (
                      <button onClick={() => handleCancelBooking(booking._id)} className="btn-cancel">
                        Cancel Booking
                      </button>
                    )}
                    {booking.status === "completed" && booking.photographerId?._id && (
                      <ReviewComponent
                        photographerId={booking.photographerId._id}
                        bookingId={booking._id}
                        mode="form"
                        showForm={false}
                      />
                    )}
                  </div>
                </div>
              ))}
              {bookings.length === 0 && (
                <div className="no-bookings-message">
                  <h3>No bookings yet</h3>
                  <p>Start by browsing our talented photographers!</p>
                  <button onClick={() => setActiveTab("photographers")} className="btn-primary">
                    Browse Photographers
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "photo-edit" && (
          <div className="photo-edit-section">
            <PhotoEditRequests user={user} />
          </div>
        )}

        {activeTab === "photographers" && (
          <div className="photographers-section">
            <h2>Featured Photographers</h2>
            <div className="photographers-grid">
              {photographers.map((photographer) => (
                <div key={photographer._id} className="photographer-card-large">
                  <div className="photographer-image-large">
                    {photographer.userId?.profileImage ? (
                      <img src={photographer.userId.profileImage} alt={photographer.userId?.username} />
                    ) : (
                      <div className="image-placeholder-large">
                        {photographer.userId?.username?.charAt(0).toUpperCase() || "?"}
                      </div>
                    )}
                  </div>
                  <div className="photographer-content">
                    <h3>{photographer.userId?.username || "Unknown"}</h3>
                    <p className="specialization">{photographer.specialization || "General Photography"}</p>
                    <div className="rating-large">
                      <span>⭐ {photographer.rating || 0}</span>
                      <span>({photographer.reviewCount || 0} reviews)</span>
                    </div>
                    <div className="services-list">
                      {photographer.services?.slice(0, 3).map((service, index) => (
                        <span key={index} className="service-tag">
                          {service}
                        </span>
                      )) || <span className="service-tag">General Photography</span>}
                    </div>
                    <div className="photographer-actions">
                      <button onClick={() => navigate(`/photographer-profile/${photographer._id}`)} className="btn-primary">
                        View Full Profile
                      </button>
                      <button onClick={() => navigate(`/booking/${photographer._id}`)} className="btn-secondary">
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="browse-all">
              <button onClick={() => navigate("/browse")} className="btn-outline">
                Browse All Photographers
              </button>
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
                <label>Username</label>
                <input
                  type="text"
                  value={profileUpdate.username}
                  onChange={(e) => setProfileUpdate({ ...profileUpdate, username: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={profileUpdate.email}
                  onChange={(e) => setProfileUpdate({ ...profileUpdate, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={profileUpdate.phone}
                  onChange={(e) => setProfileUpdate({ ...profileUpdate, phone: e.target.value })}
                  placeholder="Your phone number"
                />
              </div>

              <div className="form-group">
                <label>Address</label>
                <textarea
                  value={profileUpdate.address}
                  onChange={(e) => setProfileUpdate({ ...profileUpdate, address: e.target.value })}
                  placeholder="Your address"
                  rows="3"
                />
              </div>

              <button type="submit" className="btn-primary">
                Update Profile
              </button>
            </form>
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="reviews-section">
            <h2>My Reviews</h2>
            <ReviewComponent
              photographerId={null}
              mode="client-reviews"
              clientId={user._id}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default UserDashboard
