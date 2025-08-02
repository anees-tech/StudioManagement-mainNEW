"use client"

import { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom"
import Home from "./pages/Home"
import BrowsePhotographers from "./pages/BrowsePhotographers"
import PhotographerProfile from "./pages/PhotographerProfile"
import BookingInterface from "./pages/BookingInterface"
import LoginRegister from "./pages/LoginRegister"
import AboutUs from "./pages/AboutUs"
import UserDashboard from "./pages/UserDashboard"
import PhotographerDashboard from "./pages/PhotographerDashboard"
import AdminDashboard from "./pages/AdminDashboard"
import DummyPortfolio from "./pages/DummyPortfolio"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import "./App.css"

// Protected route wrapper component
const ProtectedRoute = ({ children, allowedRoles, redirectPath = "/login" }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in from localStorage
    const loggedInUser = localStorage.getItem("user")
    if (loggedInUser) {
      setUser(JSON.parse(loggedInUser))
    }
    setLoading(false)
  }, [])

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  if (!user) {
    return <Navigate to={redirectPath} replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    if (user.role === "client") {
      return <Navigate to="/user-dashboard" replace />
    } else if (user.role === "photographer") {
      return <Navigate to="/photographer-dashboard" replace />
    } else if (user.role === "admin") {
      return <Navigate to="/admin-dashboard" replace />
    } else {
      return <Navigate to="/" replace />
    }
  }

  return children
}

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in from localStorage
    const loggedInUser = localStorage.getItem("user")
    if (loggedInUser) {
      const parsedUser = JSON.parse(loggedInUser)
      setUser(parsedUser)
    }
    setLoading(false)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("user")
    setUser(null)
  }

  return (
    <Router>
      <AppContent user={user} setUser={setUser} loading={loading} handleLogout={handleLogout} />
    </Router>
  )
}

// Separate component to access useLocation
function AppContent({ user, setUser, loading, handleLogout }) {
  const location = useLocation()

  // Don't show navbar/footer on login page or admin dashboard
  const hideNavbarFooter = location.pathname === "/login" || location.pathname.startsWith("/admin-dashboard")

  return (
    <>
      {!hideNavbarFooter && <Navbar user={user} onLogout={handleLogout} />}
      <main className="main-content">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/browse" element={<BrowsePhotographers />} />
          <Route path="/photographer-profile/:id" element={<PhotographerProfile />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/login" element={<LoginRegister onLogin={setUser} />} />
          <Route path="/portfolio" element={<DummyPortfolio />} />

          {/* Protected routes */}
          <Route
            path="/booking/:photographerId"
            element={
              <ProtectedRoute allowedRoles={["client"]}>
                <BookingInterface user={user} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/user-dashboard"
            element={
              <ProtectedRoute allowedRoles={["client"]}>
                <UserDashboard user={user} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/photographer-dashboard"
            element={
              <ProtectedRoute allowedRoles={["photographer"]}>
                <PhotographerDashboard user={user} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin-dashboard/*"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard user={user} />
              </ProtectedRoute>
            }
          />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      {!hideNavbarFooter && <Footer />}
    </>
  )
}

export default App
