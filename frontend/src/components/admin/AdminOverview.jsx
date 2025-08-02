import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import "../../styles/admin/AdminOverview.css"

const AdminOverview = ({ stats, loading, refreshDashboard }) => {
  const [analyticsData, setAnalyticsData] = useState([])
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState('month')

  useEffect(() => {
    if (!loading) {
      fetchAnalytics()
    }
  }, [selectedPeriod, loading])

  const fetchAnalytics = async () => {
    try {
      setAnalyticsLoading(true)
      const response = await fetch(`http://localhost:5000/api/admin/analytics?period=${selectedPeriod}`)
      if (response.ok) {
        const data = await response.json()
        setAnalyticsData(data)
      }
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setAnalyticsLoading(false)
    }
  }

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0)
  }

  // Format date
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  // Format time ago
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return formatDate(dateString)
  }

  if (loading) {
    return (
      <div className="admin-overview loading">
        <div className="overview-header">
          <h1>Dashboard Overview</h1>
          <button onClick={refreshDashboard} className="refresh-btn">
            🔄 Refresh
          </button>
        </div>
        
        <div className="stats-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="stat-card skeleton">
              <div className="stat-icon skeleton"></div>
              <div className="stat-content">
                <div className="skeleton-text"></div>
                <div className="skeleton-text"></div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="dashboard-sections">
          <div className="section-card">
            <h2>Recent Bookings</h2>
            <div className="loading-spinner"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-overview">
      <div className="overview-header">
        <h1>Dashboard Overview</h1>
        <div className="header-actions">
          <button onClick={refreshDashboard} className="refresh-btn">
            🔄 Refresh
          </button>
          <select 
            value={selectedPeriod} 
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="period-select"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="year">Last Year</option>
          </select>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon users-icon">
            <i className="fas fa-users"></i>
          </div>
          <div className="stat-content">
            <h3>Total Users</h3>
            <p className="stat-value">{stats.totalUsers}</p>
            <Link to="/admin-dashboard/users" className="stat-link">
              View All Users
            </Link>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon photographers-icon">
            <i className="fas fa-camera"></i>
          </div>
          <div className="stat-content">
            <h3>Photographers</h3>
            <p className="stat-value">{stats.totalPhotographers}</p>
            <Link to="/admin-dashboard/photographers" className="stat-link">
              View All Photographers
            </Link>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bookings-icon">
            <i className="fas fa-calendar-check"></i>
          </div>
          <div className="stat-content">
            <h3>Total Bookings</h3>
            <p className="stat-value">{stats.totalBookings}</p>
            <Link to="/admin-dashboard/bookings" className="stat-link">
              View All Bookings
            </Link>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon revenue-icon">
            <i className="fas fa-dollar-sign"></i>
          </div>
          <div className="stat-content">
            <h3>Total Revenue</h3>
            <p className="stat-value">{formatCurrency(stats.revenue)}</p>
            <Link to="/admin-dashboard/bookings" className="stat-link">
              View Revenue Details
            </Link>
          </div>
        </div>
      </div>

      {/* Booking Status Summary */}
      <div className="status-summary">
        <h2>Booking Status Summary</h2>
        <div className="status-grid">
          <div className="status-card pending">
            <h3>{stats.summary?.pendingBookings || 0}</h3>
            <p>Pending</p>
          </div>
          <div className="status-card confirmed">
            <h3>{stats.summary?.confirmedBookings || 0}</h3>
            <p>Confirmed</p>
          </div>
          <div className="status-card completed">
            <h3>{stats.summary?.completedBookings || 0}</h3>
            <p>Completed</p>
          </div>
          <div className="status-card cancelled">
            <h3>{stats.summary?.cancelledBookings || 0}</h3>
            <p>Cancelled</p>
          </div>
        </div>
      </div>

      <div className="dashboard-sections">
        {/* Recent Bookings */}
        <div className="section-card">
          <div className="section-header">
            <h2>Recent Bookings</h2>
            <Link to="/admin-dashboard/bookings" className="view-all-btn">
              View All
            </Link>
          </div>
          <div className="booking-table-container">
            {stats.recentBookings && stats.recentBookings.length > 0 ? (
              <table className="booking-table">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Photographer</th>
                    <th>Service</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentBookings.slice(0, 5).map((booking) => (
                    <tr key={booking._id}>
                      <td>
                        <div className="user-cell">
                          {booking.clientImage ? (
                            <img 
                              src={booking.clientImage} 
                              alt={booking.clientName}
                              className="user-avatar"
                            />
                          ) : (
                            <div className="user-avatar-placeholder">
                              {booking.clientName.charAt(0)}
                            </div>
                          )}
                          <span>{booking.clientName}</span>
                        </div>
                      </td>
                      <td>
                        <div className="user-cell">
                          {booking.photographerImage ? (
                            <img 
                              src={booking.photographerImage} 
                              alt={booking.photographerName}
                              className="user-avatar"
                            />
                          ) : (
                            <div className="user-avatar-placeholder">
                              {booking.photographerName.charAt(0)}
                            </div>
                          )}
                          <span>{booking.photographerName}</span>
                        </div>
                      </td>
                      <td>{booking.service}</td>
                      <td>{formatDate(booking.date)}</td>
                      <td>
                        <span className={`status-badge status-${booking.status}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td>{formatCurrency(booking.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="no-data">
                <p>No recent bookings found</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Photographers */}
        <div className="section-card">
          <div className="section-header">
            <h2>Top Photographers</h2>
            <Link to="/admin-dashboard/photographers" className="view-all-btn">
              View All
            </Link>
          </div>
          <div className="top-photographers">
            {stats.topPhotographers && stats.topPhotographers.length > 0 ? (
              stats.topPhotographers.map((photographer, index) => (
                <div key={photographer._id} className="photographer-card">
                  <div className="photographer-rank">#{index + 1}</div>
                  <div className="photographer-info">
                    {photographer.photographerImage ? (
                      <img 
                        src={photographer.photographerImage} 
                        alt={photographer.photographerName}
                        className="photographer-avatar"
                      />
                    ) : (
                      <div className="photographer-avatar-placeholder">
                        {photographer.photographerName.charAt(0)}
                      </div>
                    )}
                    <div className="photographer-details">
                      <h4>{photographer.photographerName}</h4>
                      <p>{photographer.specialization}</p>
                      <div className="photographer-stats">
                        <span>{photographer.totalBookings} bookings</span>
                        <span>{formatCurrency(photographer.totalRevenue)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="photographer-rating">
                    ⭐ {photographer.rating?.toFixed(1) || 'N/A'}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-data">
                <p>No photographer data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Reviews */}
        <div className="section-card">
          <div className="section-header">
            <h2>Recent Reviews</h2>
            <div className="review-summary">
              <span className="avg-rating">
                ⭐ {stats.summary?.averageRating?.toFixed(1) || '0.0'} avg
              </span>
              <span className="total-reviews">
                {stats.summary?.totalReviews || 0} reviews
              </span>
            </div>
          </div>
          <div className="recent-reviews">
            {stats.recentReviews && stats.recentReviews.length > 0 ? (
              stats.recentReviews.map((review) => (
                <div key={review._id} className="review-card">
                  <div className="review-header">
                    <div className="review-author">
                      {review.clientImage ? (
                        <img 
                          src={review.clientImage} 
                          alt={review.clientName}
                          className="review-avatar"
                        />
                      ) : (
                        <div className="review-avatar-placeholder">
                          {review.clientName.charAt(0)}
                        </div>
                      )}
                      <div className="review-info">
                        <h5>{review.clientName}</h5>
                        <p>for {review.photographerName}</p>
                      </div>
                    </div>
                    <div className="review-meta">
                      <div className="review-rating">
                        {'⭐'.repeat(review.rating)}
                      </div>
                      <span className="review-time">
                        {formatTimeAgo(review.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="review-content">
                    <p>{review.comment}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-data">
                <p>No recent reviews found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminOverview
