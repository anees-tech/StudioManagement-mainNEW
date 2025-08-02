"use client"

import { useState, useEffect } from "react"
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  User,
  Camera,
} from "lucide-react"
// import "../../styles/admin/AdminBookings.css"

const AdminBookings = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [bookingsPerPage] = useState(10)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [currentBooking, setCurrentBooking] = useState(null)
  const [filterStatus, setFilterStatus] = useState("all")
  const [dateFilter, setDateFilter] = useState({ from: "", to: "" })

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const response = await fetch("http://localhost:5000/api/admin/bookings")
      const data = await response.json()

      if (response.ok) {
        setBookings(data)
      } else {
        setError("Failed to fetch bookings")
      }
    } catch (error) {
      console.error("Error fetching bookings:", error)
      setError("An error occurred while fetching bookings")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateBookingStatus = async (bookingId, status) => {
    try {
      const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        // Update the booking status in the local state
        setBookings((prevBookings) =>
          prevBookings.map((booking) => (booking._id === bookingId ? { ...booking, status } : booking)),
        )

        if (currentBooking && currentBooking._id === bookingId) {
          setCurrentBooking({ ...currentBooking, status })
        }

        alert(`Booking status updated to ${status}`)
      } else {
        const data = await response.json()
        alert(data.message || `Failed to update booking status to ${status}`)
      }
    } catch (error) {
      console.error("Error updating booking status:", error)
      alert("An error occurred while updating the booking status")
    }
  }

  const handleViewDetails = (booking) => {
    setCurrentBooking(booking)
    setShowDetailsModal(true)
  }

  // Filter and search bookings
  const filteredBookings = bookings.filter((booking) => {
    // Search term filter
    const matchesSearch =
      (booking.clientName && booking.clientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (booking.photographerName && booking.photographerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      booking.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.location.toLowerCase().includes(searchTerm.toLowerCase())

    // Status filter
    const matchesStatus = filterStatus === "all" || booking.status === filterStatus

    // Date filter
    let matchesDate = true
    if (dateFilter.from) {
      const bookingDate = new Date(booking.date)
      const fromDate = new Date(dateFilter.from)
      matchesDate = bookingDate >= fromDate
    }
    if (dateFilter.to && matchesDate) {
      const bookingDate = new Date(booking.date)
      const toDate = new Date(dateFilter.to)
      // Set time to end of day
      toDate.setHours(23, 59, 59, 999)
      matchesDate = bookingDate <= toDate
    }

    return matchesSearch && matchesStatus && matchesDate
  })

  // Pagination
  const indexOfLastBooking = currentPage * bookingsPerPage
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage
  const currentBookings = filteredBookings.slice(indexOfFirstBooking, indexOfLastBooking)
  const totalPages = Math.ceil(filteredBookings.length / bookingsPerPage)

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber)
    }
  }

  if (loading) {
    return <div className="admin-loading">Loading bookings...</div>
  }

  if (error) {
    return <div className="admin-error">{error}</div>
  }

  return (
    <div className="admin-bookings">
      <div className="admin-section-header">
        <h1>Booking Management</h1>
      </div>

      <div className="admin-filters">
        <div className="search-container">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search bookings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-container">
          <Filter size={18} />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="date-filter">
          <div className="date-input">
            <label>From:</label>
            <input
              type="date"
              value={dateFilter.from}
              onChange={(e) => setDateFilter({ ...dateFilter, from: e.target.value })}
            />
          </div>
          <div className="date-input">
            <label>To:</label>
            <input
              type="date"
              value={dateFilter.to}
              onChange={(e) => setDateFilter({ ...dateFilter, to: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Client</th>
              <th>Photographer</th>
              <th>Service</th>
              <th>Date</th>
              <th>Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentBookings.length > 0 ? (
              currentBookings.map((booking) => (
                <tr key={booking._id}>
                  <td>#{booking._id.substring(0, 6)}</td>
                  <td>{booking.clientName}</td>
                  <td>{booking.photographerName}</td>
                  <td>{booking.service}</td>
                  <td>{new Date(booking.date).toLocaleDateString()}</td>
                  <td>${booking.price}</td>
                  <td>
                    <span className={`status-badge ${booking.status}`}>{booking.status}</span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="view-button" onClick={() => handleViewDetails(booking)}>
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="no-data">
                  No bookings found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button className="pagination-button" onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>
            <ChevronLeft size={18} />
          </button>
          <span className="pagination-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="pagination-button"
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Booking Details Modal */}
      {showDetailsModal && currentBooking && (
        <div className="modal-overlay">
          <div className="modal booking-details-modal">
            <div className="modal-header">
              <h2>Booking Details</h2>
              <button className="close-button" onClick={() => setShowDetailsModal(false)}>
                &times;
              </button>
            </div>
            <div className="modal-content">
              <div className="booking-details">
                <div className="booking-id">
                  <h3>Booking #{currentBooking._id.substring(0, 6)}</h3>
                  <span className={`status-badge ${currentBooking.status}`}>{currentBooking.status}</span>
                </div>

                <div className="booking-info-grid">
                  <div className="booking-info-item">
                    <div className="info-icon">
                      <User size={18} />
                    </div>
                    <div className="info-content">
                      <h4>Client</h4>
                      <p>{currentBooking.clientName}</p>
                      <p className="info-secondary">{currentBooking.clientEmail}</p>
                    </div>
                  </div>

                  <div className="booking-info-item">
                    <div className="info-icon">
                      <Camera size={18} />
                    </div>
                    <div className="info-content">
                      <h4>Photographer</h4>
                      <p>{currentBooking.photographerName}</p>
                      <p className="info-secondary">{currentBooking.photographerEmail}</p>
                    </div>
                  </div>

                  <div className="booking-info-item">
                    <div className="info-icon">
                      <Calendar size={18} />
                    </div>
                    <div className="info-content">
                      <h4>Date</h4>
                      <p>{new Date(currentBooking.date).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="booking-info-item">
                    <div className="info-icon">
                      <Clock size={18} />
                    </div>
                    <div className="info-content">
                      <h4>Time</h4>
                      <p>
                        {currentBooking.timeSlot.start} - {currentBooking.timeSlot.end}
                      </p>
                    </div>
                  </div>

                  <div className="booking-info-item">
                    <div className="info-icon">
                      <MapPin size={18} />
                    </div>
                    <div className="info-content">
                      <h4>Location</h4>
                      <p>{currentBooking.location}</p>
                    </div>
                  </div>

                  <div className="booking-info-item">
                    <div className="info-icon">
                      <DollarSign size={18} />
                    </div>
                    <div className="info-content">
                      <h4>Price</h4>
                      <p>${currentBooking.price}</p>
                    </div>
                  </div>
                </div>

                <div className="booking-service">
                  <h4>Service</h4>
                  <p>{currentBooking.service}</p>
                </div>

                {currentBooking.notes && (
                  <div className="booking-notes">
                    <h4>Notes</h4>
                    <p>{currentBooking.notes}</p>
                  </div>
                )}

                <div className="booking-timeline">
                  <h4>Booking Timeline</h4>
                  <div className="timeline">
                    <div
                      className={`timeline-item ${currentBooking.status === "pending" || currentBooking.status === "confirmed" || currentBooking.status === "completed" ? "active" : ""}`}
                    >
                      <div className="timeline-point"></div>
                      <div className="timeline-content">
                        <h5>Pending</h5>
                        <p>Booking created</p>
                      </div>
                    </div>
                    <div
                      className={`timeline-item ${currentBooking.status === "confirmed" || currentBooking.status === "completed" ? "active" : ""}`}
                    >
                      <div className="timeline-point"></div>
                      <div className="timeline-content">
                        <h5>Confirmed</h5>
                        <p>Booking confirmed by photographer</p>
                      </div>
                    </div>
                    <div className={`timeline-item ${currentBooking.status === "completed" ? "active" : ""}`}>
                      <div className="timeline-point"></div>
                      <div className="timeline-content">
                        <h5>Completed</h5>
                        <p>Service delivered</p>
                      </div>
                    </div>
                    <div className={`timeline-item ${currentBooking.status === "cancelled" ? "active cancelled" : ""}`}>
                      <div className="timeline-point"></div>
                      <div className="timeline-content">
                        <h5>Cancelled</h5>
                        <p>Booking was cancelled</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              {currentBooking.status === "pending" && (
                <>
                  <button
                    className="confirm-button"
                    onClick={() => handleUpdateBookingStatus(currentBooking._id, "confirmed")}
                  >
                    Confirm Booking
                  </button>
                  <button
                    className="cancel-button"
                    onClick={() => handleUpdateBookingStatus(currentBooking._id, "cancelled")}
                  >
                    Cancel Booking
                  </button>
                </>
              )}
              {currentBooking.status === "confirmed" && (
                <button
                  className="complete-button"
                  onClick={() => handleUpdateBookingStatus(currentBooking._id, "completed")}
                >
                  Mark as Completed
                </button>
              )}
              <button className="close-button" onClick={() => setShowDetailsModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminBookings
