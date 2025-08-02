"use client"

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import "../../styles/admin/AdminHeader.css"

const AdminHeader = ({ user, refreshDashboard }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem("user")
    navigate("/login")
  }

  return (
    <header className="admin-header">
      <div className="header-search">
       
      </div>

      <div className="header-right">
        <div className="header-user">
          <div className="user-profile" onClick={() => setShowProfileMenu(!showProfileMenu)}>
            <img
              src={user?.profileImage || "https://randomuser.me/api/portraits/men/1.jpg"}
              alt="Profile"
              className="user-avatar"
            />
            <span className="user-name">{user?.username || "Admin"}</span>
            <i className={`fas fa-chevron-${showProfileMenu ? "up" : "down"}`}></i>
          </div>

          {showProfileMenu && (
            <div className="user-dropdown">
              <div className="user-info">
                <p><strong>{user?.username}</strong></p>
                <p className="user-email">{user?.email}</p>
              </div>
              <div className="user-actions">
                <Link to="/admin-dashboard/settings" className="dropdown-item">
                  <i className="fas fa-cog"></i>
                  <span>Settings</span>
                </Link>
                <Link to="/" className="dropdown-item">
                  <i className="fas fa-home"></i>
                  <span>Go to Website</span>
                </Link>
                <div className="dropdown-divider"></div>
                <button onClick={handleLogout} className="dropdown-item">
                  <i className="fas fa-sign-out-alt"></i>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default AdminHeader
