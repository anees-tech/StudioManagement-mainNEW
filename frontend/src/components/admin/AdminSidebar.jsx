"use client"

import { Link } from "react-router-dom"
import "../../styles/admin/AdminSidebar.css"

const AdminSidebar = ({ activeSection, setActiveSection }) => {
  const menuItems = [
    { id: "overview", label: "Dashboard", icon: "fas fa-tachometer-alt" },
    { id: "users", label: "Users", icon: "fas fa-users" },
    { id: "photographers", label: "Photographers", icon: "fas fa-camera" },
    { id: "bookings", label: "Bookings", icon: "fas fa-calendar-check" },
    { id: "photo-edit-requests", label: "Photo Editing", icon: "fas fa-image" },
    { id: "testimonials", label: "Testimonials", icon: "fas fa-quote-right" },
  ]

  return (
    <div className="admin-sidebar">
      <div className="sidebar-header">
        <h2>Admin Panel</h2>
      </div>
      <nav className="sidebar-nav">
        <ul>
          {menuItems.map((item) => (
            <li key={item.id}>
              <Link
                to={`/admin-dashboard${item.id === "overview" ? "" : `/${item.id}`}`}
                className={`sidebar-link ${activeSection === item.id ? "active" : ""}`}
                onClick={() => setActiveSection(item.id)}
              >
                <i className={item.icon}></i>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="sidebar-footer">
        <Link to="/" className="back-to-site">
          <i className="fas fa-arrow-left"></i>
          <span>Back to Site</span>
        </Link>
      </div>
    </div>
  )
}

export default AdminSidebar
