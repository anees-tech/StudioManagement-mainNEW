"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import "../styles/Navbar.css"

const Navbar = ({ user, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLogout = () => {
    onLogout()
    navigate("/")
    setIsMenuOpen(false)
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  const getDashboardLink = () => {
    if (!user || !user.role) return "/login"

    switch (user.role) {
      case "admin":
        return "/admin-dashboard"
      case "photographer":
        return "/photographer-dashboard"
      case "client":
        return "/user-dashboard"
      default:
        return "/login"
    }
  }

  const getDashboardText = () => {
    if (!user || !user.role) return "Dashboard"

    switch (user.role) {
      case "admin":
        return "Admin Dashboard"
      case "photographer":
        return "Photographer Dashboard"
      case "client":
        return "My Dashboard"
      default:
        return "Dashboard"
    }
  }

  return (
    <nav className={`navbar ${isScrolled ? "scrolled" : ""}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          <div className="brand-icon">📷</div>
          <span className="brand-text">Uzumaki Studio</span>
        </Link>

        <div className={`navbar-menu ${isMenuOpen ? "active" : ""}`}>
          <div className="navbar-nav">
            <Link to="/" className={`nav-link ${location.pathname === "/" ? "active" : ""}`} onClick={closeMenu}>
              <span className="nav-icon">🏠</span>
              Home
            </Link>

            <Link
              to="/browse"
              className={`nav-link ${location.pathname === "/browse" ? "active" : ""}`}
              onClick={closeMenu}
            >
              <span className="nav-icon">🔍</span>
              Browse Photographers
            </Link>

            <Link
              to="/about"
              className={`nav-link ${location.pathname === "/about" ? "active" : ""}`}
              onClick={closeMenu}
            >
              <span className="nav-icon">ℹ️</span>
              About
            </Link>

            <Link
              to="/portfolio"
              className={`nav-link ${location.pathname === "/portfolio" ? "active" : ""}`}
              onClick={closeMenu}
            >
              <span className="nav-icon">🖼️</span>
              Portfolio
            </Link>
          </div>

          <div className="navbar-actions">
            {user && user.username ? (
              <div className="user-menu">
                <div className="user-info">
                  <div className="user-avatar">
                    {user?.profileImage ? (
                      <img src={user.profileImage || "/placeholder.svg"} alt={user?.username || "User"} />
                    ) : (
                      <div className="avatar-placeholder">
                        {user?.username ? user.username.charAt(0).toUpperCase() : "U"}
                      </div>
                    )}
                  </div>
                  <div className="user-details">
                    <span className="user-name">{user?.username || "User"}</span>
                    <span className="user-role">{user?.role || "user"}</span>
                  </div>
                </div>

                <div className="user-dropdown">
                  <Link to={getDashboardLink()} className="dropdown-item" onClick={closeMenu}>
                    <span className="dropdown-icon">📊</span>
                    {getDashboardText()}
                  </Link>

                  <button onClick={handleLogout} className="dropdown-item logout-item">
                    <span className="dropdown-icon">🚪</span>
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="login-btn" onClick={closeMenu}>
                <span className="btn-icon">👤</span>
                Login / Register
              </Link>
            )}
          </div>
        </div>

        <button
          className={`navbar-toggle ${isMenuOpen ? "active" : ""}`}
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
        >
          <span className="toggle-line"></span>
          <span className="toggle-line"></span>
          <span className="toggle-line"></span>
        </button>
      </div>
    </nav>
  )
}

export default Navbar
