"use client"

import { useState, useEffect } from "react"
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom"
import AdminSidebar from "../components/admin/AdminSidebar"
import AdminHeader from "../components/admin/AdminHeader"
import AdminOverview from "../components/admin/AdminOverview"
import AdminUsers from "../components/admin/AdminUsers"
import AdminPhotographers from "../components/admin/AdminPhotographers"
import AdminBookings from "../components/admin/AdminBookings"
import AdminPhotoEditRequests from "../components/admin/AdminPhotoEditRequests"
import AdminTestimonials from "../components/admin/AdminTestimonials"
import "../styles/AdminDashboard.css"

const AdminDashboard = ({ user }) => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPhotographers: 0,
    totalBookings: 0,
    revenue: 0,
    recentBookings: [],
    monthlyStats: [],
    statusStats: [],
    topPhotographers: [],
    recentReviews: [],
    summary: {
      pendingBookings: 0,
      confirmedBookings: 0,
      completedBookings: 0,
      cancelledBookings: 0,
      totalReviews: 0,
      averageRating: 0
    }
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const navigate = useNavigate()
  const location = useLocation()

  // Extract the active section from the URL path
  const getActiveSection = () => {
    const path = location.pathname.split("/").pop()
    if (path === "admin-dashboard" || path === "") return "overview"
    return path
  }

  const [activeSection, setActiveSection] = useState(getActiveSection())

  useEffect(() => {
    setActiveSection(getActiveSection())
  }, [location])

  useEffect(() => {
    // Check if user is admin
    if (!user || user.role !== "admin") {
      navigate("/login")
      return
    }

    fetchDashboardStats()
  }, [user, navigate, refreshKey])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("http://localhost:5000/api/admin/stats", {
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        const errorData = await response.json()
        setError(errorData.message || "Failed to fetch dashboard data")
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
      setError("Failed to load dashboard data. Please check your connection.")
    } finally {
      setLoading(false)
    }
  }

  // Function to refresh dashboard data
  const refreshDashboard = () => {
    setRefreshKey(prev => prev + 1)
  }

  // Handle section change
  const handleSectionChange = (section) => {
    setActiveSection(section)
    navigate(`/admin-dashboard/${section === "overview" ? "" : section}`)
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Checking admin privileges...</p>
      </div>
    )
  }

  return (
    <div className="admin-dashboard">
      <AdminSidebar activeSection={activeSection} setActiveSection={handleSectionChange} />
      <div className="admin-main">
        <AdminHeader user={user} refreshDashboard={refreshDashboard} />
        <div className="admin-content">
          {error && (
            <div className="error-message">
              <span>{error}</span>
              <button onClick={refreshDashboard} className="retry-btn">
                Retry
              </button>
            </div>
          )}

          <Routes>
            <Route 
              path="/" 
              element={
                <AdminOverview 
                  stats={stats} 
                  loading={loading} 
                  refreshDashboard={refreshDashboard}
                />
              } 
            />
            <Route 
              path="/overview" 
              element={
                <AdminOverview 
                  stats={stats} 
                  loading={loading} 
                  refreshDashboard={refreshDashboard}
                />
              } 
            />
            <Route 
              path="/users" 
              element={<AdminUsers refreshDashboard={refreshDashboard} />} 
            />
            <Route 
              path="/photographers" 
              element={<AdminPhotographers refreshDashboard={refreshDashboard} />} 
            />
            <Route 
              path="/bookings" 
              element={<AdminBookings refreshDashboard={refreshDashboard} />} 
            />
            <Route 
              path="/photo-edit-requests" 
              element={<AdminPhotoEditRequests refreshDashboard={refreshDashboard} />} 
            />
            <Route 
              path="/testimonials" 
              element={<AdminTestimonials refreshDashboard={refreshDashboard} />} 
            />
          
            <Route path="*" element={<Navigate to="/admin-dashboard" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
