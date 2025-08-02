"use client"

import { useState, useEffect } from "react"
import { Edit, Trash2, UserPlus, Search, Filter, ChevronLeft, ChevronRight } from "lucide-react"
import "../../styles/admin/AdminUsers.css"

const AdminUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [usersPerPage] = useState(10)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "client",
  })
  const [filterRole, setFilterRole] = useState("all")

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch("http://localhost:5000/api/admin/users")
      const data = await response.json()

      if (response.ok) {
        setUsers(data)
      } else {
        setError("Failed to fetch users")
      }
    } catch (error) {
      console.error("Error fetching users:", error)
      setError("An error occurred while fetching users")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleAddUser = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch("http://localhost:5000/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        fetchUsers()
        setShowAddModal(false)
        setFormData({
          username: "",
          email: "",
          password: "",
          role: "client",
        })
      } else {
        const data = await response.json()
        alert(data.message || "Failed to add user")
      }
    } catch (error) {
      console.error("Error adding user:", error)
      alert("An error occurred while adding the user")
    }
  }

  const handleEditUser = (user) => {
    setCurrentUser(user)
    setFormData({
      username: user.username,
      email: user.email,
      password: "",
      role: user.role,
    })
    setShowEditModal(true)
  }

  const handleUpdateUser = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${currentUser._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        fetchUsers()
        setShowEditModal(false)
      } else {
        const data = await response.json()
        alert(data.message || "Failed to update user")
      }
    } catch (error) {
      console.error("Error updating user:", error)
      alert("An error occurred while updating the user")
    }
  }

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
          method: "DELETE",
        })

        if (response.ok) {
          fetchUsers()
        } else {
          const data = await response.json()
          alert(data.message || "Failed to delete user")
        }
      } catch (error) {
        console.error("Error deleting user:", error)
        alert("An error occurred while deleting the user")
      }
    }
  }

  // Filter and search users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = filterRole === "all" || user.role === filterRole

    return matchesSearch && matchesRole
  })

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage
  const indexOfFirstUser = indexOfLastUser - usersPerPage
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser)
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage)

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber)
    }
  }

  if (loading) {
    return <div className="admin-loading">Loading users...</div>
  }

  if (error) {
    return <div className="admin-error">{error}</div>
  }

  return (
    <div className="admin-users">
      <div className="admin-section-header">
        <h1>User Management</h1>
        <button className="add-button" onClick={() => setShowAddModal(true)}>
          <UserPlus size={18} />
          Add User
        </button>
      </div>

      <div className="admin-filters">
        <div className="search-container">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-container">
          <Filter size={18} />
          <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="photographer">Photographer</option>
            <option value="client">Client</option>
          </select>
        </div>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.length > 0 ? (
              currentUsers.map((user) => (
                <tr key={user._id}>
                  <td>
                    <div className="user-info">
                      <img
                        src={user.profileImage || "/placeholder-profile.jpg"}
                        alt={user.username}
                        className="user-avatar"
                      />
                      <span>{user.username}</span>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`role-badge ${user.role}`}>{user.role}</span>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="edit-button" onClick={() => handleEditUser(user)}>
                        <Edit size={16} />
                      </button>
                      <button className="delete-button" onClick={() => handleDeleteUser(user._id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-data">
                  No users found
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

      {/* Add User Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Add New User</h2>
              <button className="close-button" onClick={() => setShowAddModal(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleAddUser}>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="role">Role</label>
                <select id="role" name="role" value={formData.role} onChange={handleInputChange} required>
                  <option value="client">Client</option>
                  <option value="photographer">Photographer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="form-actions">
                <button type="button" className="cancel-button" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-button">
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Edit User</h2>
              <button className="close-button" onClick={() => setShowEditModal(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleUpdateUser}>
              <div className="form-group">
                <label htmlFor="edit-username">Username</label>
                <input
                  type="text"
                  id="edit-username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-email">Email</label>
                <input
                  type="email"
                  id="edit-email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-password">Password (leave blank to keep current)</label>
                <input
                  type="password"
                  id="edit-password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-role">Role</label>
                <select id="edit-role" name="role" value={formData.role} onChange={handleInputChange} required>
                  <option value="client">Client</option>
                  <option value="photographer">Photographer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="form-actions">
                <button type="button" className="cancel-button" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-button">
                  Update User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminUsers
