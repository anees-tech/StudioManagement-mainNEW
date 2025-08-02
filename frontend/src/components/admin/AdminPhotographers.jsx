"use client"

import { useState, useEffect } from "react"
import { Edit, Trash2, Star, Search, Filter, ChevronLeft, ChevronRight, Eye } from "lucide-react"
import "../../styles/admin/AdminPhotographers.css"

const AdminPhotographers = () => {
  const [photographers, setPhotographers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [photographersPerPage] = useState(8)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [currentPhotographer, setCurrentPhotographer] = useState(null)
  const [filterSpecialization, setFilterSpecialization] = useState("all")

  useEffect(() => {
    fetchPhotographers()
  }, [])

  const fetchPhotographers = async () => {
    try {
      setLoading(true)
      const response = await fetch("http://localhost:5000/api/photographers")
      const data = await response.json()

      if (response.ok) {
        setPhotographers(data)
      } else {
        setError("Failed to fetch photographers")
      }
    } catch (error) {
      console.error("Error fetching photographers:", error)
      setError("An error occurred while fetching photographers")
    } finally {
      setLoading(false)
    }
  }

  const handleToggleFeatured = async (photographerId, currentFeatured) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/photographers/${photographerId}/featured`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ featured: !currentFeatured }),
      })

      if (response.ok) {
        // Update the photographer's featured status in the local state
        setPhotographers((prevPhotographers) =>
          prevPhotographers.map((photographer) =>
            photographer._id === photographerId ? { ...photographer, featured: !currentFeatured } : photographer,
          ),
        )
      } else {
        const data = await response.json()
        alert(data.message || "Failed to update featured status")
      }
    } catch (error) {
      console.error("Error updating featured status:", error)
      alert("An error occurred while updating featured status")
    }
  }

  const handleDeletePhotographer = async (photographerId) => {
    if (window.confirm("Are you sure you want to delete this photographer profile?")) {
      try {
        const response = await fetch(`http://localhost:5000/api/admin/photographers/${photographerId}`, {
          method: "DELETE",
        })

        if (response.ok) {
          fetchPhotographers()
        } else {
          const data = await response.json()
          alert(data.message || "Failed to delete photographer")
        }
      } catch (error) {
        console.error("Error deleting photographer:", error)
        alert("An error occurred while deleting the photographer")
      }
    }
  }

  const handleViewDetails = (photographer) => {
    setCurrentPhotographer(photographer)
    setShowDetailsModal(true)
  }

  // Filter and search photographers
  const filteredPhotographers = photographers.filter((photographer) => {
    const matchesSearch =
      photographer.userId.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      photographer.specialization.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesSpecialization =
      filterSpecialization === "all" ||
      photographer.specialization.toLowerCase().includes(filterSpecialization.toLowerCase())

    return matchesSearch && matchesSpecialization
  })

  // Pagination
  const indexOfLastPhotographer = currentPage * photographersPerPage
  const indexOfFirstPhotographer = indexOfLastPhotographer - photographersPerPage
  const currentPhotographers = filteredPhotographers.slice(indexOfFirstPhotographer, indexOfLastPhotographer)
  const totalPages = Math.ceil(filteredPhotographers.length / photographersPerPage)

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber)
    }
  }

  if (loading) {
    return <div className="admin-loading">Loading photographers...</div>
  }

  if (error) {
    return <div className="admin-error">{error}</div>
  }

  return (
    <div className="admin-photographers">
      <div className="admin-section-header">
        <h1>Photographer Management</h1>
      </div>

      <div className="admin-filters">
        <div className="search-container">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search photographers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-container">
          <Filter size={18} />
          <select value={filterSpecialization} onChange={(e) => setFilterSpecialization(e.target.value)}>
            <option value="all">All Specializations</option>
            <option value="wedding">Wedding</option>
            <option value="portrait">Portrait</option>
            <option value="landscape">Landscape</option>
            <option value="event">Event</option>
            <option value="commercial">Commercial</option>
          </select>
        </div>
      </div>

      <div className="photographers-grid">
        {currentPhotographers.length > 0 ? (
          currentPhotographers.map((photographer) => (
            <div className="photographer-card" key={photographer._id}>
              <div className="photographer-header">
                <div className="photographer-info">
                  <img
                    src={photographer.userId.profileImage || "/placeholder-profile.jpg"}
                    alt={photographer.userId.username}
                    className="photographer-avatar"
                  />
                  <div>
                    <h3>{photographer.userId.username}</h3>
                    <p className="specialization">{photographer.specialization}</p>
                  </div>
                </div>
                <div className="rating">
                  {"★".repeat(Math.round(photographer.rating))}
                  {"☆".repeat(5 - Math.round(photographer.rating))}
                  <span>({photographer.reviewCount})</span>
                </div>
              </div>

              <div className="photographer-services">
                <h4>Services:</h4>
                <div className="service-tags">
                  {photographer.services.slice(0, 3).map((service, index) => (
                    <span key={index} className="service-tag">
                      {service}
                    </span>
                  ))}
                  {photographer.services.length > 3 && (
                    <span className="service-tag more">+{photographer.services.length - 3}</span>
                  )}
                </div>
              </div>

              <div className="photographer-stats">
                <div className="stat">
                  <span className="stat-value">{photographer.portfolio ? photographer.portfolio.length : 0}</span>
                  <span className="stat-label">Portfolio Items</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{photographer.experience}</span>
                  <span className="stat-label">Years Exp.</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{photographer.pricing ? photographer.pricing.length : 0}</span>
                  <span className="stat-label">Packages</span>
                </div>
              </div>

              <div className="photographer-actions">
                <button
                  className={`featured-button ${photographer.featured ? "active" : ""}`}
                  onClick={() => handleToggleFeatured(photographer._id, photographer.featured)}
                  title={photographer.featured ? "Remove from featured" : "Add to featured"}
                >
                  <Star size={16} />
                  {photographer.featured ? "Featured" : "Feature"}
                </button>
                <button className="view-button" onClick={() => handleViewDetails(photographer)}>
                  <Eye size={16} />
                  Details
                </button>
                <button className="edit-button" onClick={() => alert("Edit functionality to be implemented")}>
                  <Edit size={16} />
                  Edit
                </button>
                <button className="delete-button" onClick={() => handleDeletePhotographer(photographer._id)}>
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-data">No photographers found</div>
        )}
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

      {/* Photographer Details Modal */}
      {showDetailsModal && currentPhotographer && (
        <div className="modal-overlay">
          <div className="modal photographer-details-modal">
            <div className="modal-header">
              <h2>Photographer Details</h2>
              <button className="close-button" onClick={() => setShowDetailsModal(false)}>
                &times;
              </button>
            </div>
            <div className="modal-content">
              <div className="photographer-profile">
                <div className="profile-header">
                  <img
                    src={currentPhotographer.userId.profileImage || "/placeholder-profile.jpg"}
                    alt={currentPhotographer.userId.username}
                    className="profile-image"
                  />
                  <div className="profile-info">
                    <h3>{currentPhotographer.userId.username}</h3>
                    <p className="specialization">{currentPhotographer.specialization}</p>
                    <div className="rating">
                      {"★".repeat(Math.round(currentPhotographer.rating))}
                      {"☆".repeat(5 - Math.round(currentPhotographer.rating))}
                      <span>({currentPhotographer.reviewCount} reviews)</span>
                    </div>
                    <p className="email">{currentPhotographer.userId.email}</p>
                  </div>
                </div>

                <div className="profile-section">
                  <h4>About</h4>
                  <p>{currentPhotographer.description}</p>
                </div>

                <div className="profile-section">
                  <h4>Services</h4>
                  <div className="service-tags">
                    {currentPhotographer.services.map((service, index) => (
                      <span key={index} className="service-tag">
                        {service}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="profile-section">
                  <h4>Pricing Packages</h4>
                  {currentPhotographer.pricing && currentPhotographer.pricing.length > 0 ? (
                    <div className="pricing-list">
                      {currentPhotographer.pricing.map((pkg, index) => (
                        <div className="pricing-item" key={index}>
                          <div className="pricing-header">
                            <h5>{pkg.service}</h5>
                            <span className="price">${pkg.price}</span>
                          </div>
                          <p>{pkg.description}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-items">No pricing packages available</p>
                  )}
                </div>

                <div className="profile-section">
                  <h4>Portfolio</h4>
                  {currentPhotographer.portfolio && currentPhotographer.portfolio.length > 0 ? (
                    <div className="portfolio-grid">
                      {currentPhotographer.portfolio.map((item, index) => (
                        <div className="portfolio-item" key={index}>
                          <img src={item.imageUrl || "/placeholder.svg"} alt={item.title} />
                          <div className="portfolio-item-info">
                            <h5>{item.title}</h5>
                            <p>{item.category}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-items">No portfolio items available</p>
                  )}
                </div>

                <div className="profile-section">
                  <h4>Reviews</h4>
                  {currentPhotographer.reviews && currentPhotographer.reviews.length > 0 ? (
                    <div className="reviews-list">
                      {currentPhotographer.reviews.map((review, index) => (
                        <div className="review-item" key={index}>
                          <div className="review-header">
                            <div className="review-rating">
                              {"★".repeat(review.rating)}
                              {"☆".repeat(5 - review.rating)}
                            </div>
                            <span className="review-date">{new Date(review.date).toLocaleDateString()}</span>
                          </div>
                          <p>{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-items">No reviews available</p>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer">
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

export default AdminPhotographers
