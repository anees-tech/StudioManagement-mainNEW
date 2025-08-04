"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "../styles/BrowsePhotographers.css"

const BrowsePhotographers = () => {
  const [photographers, setPhotographers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filters, setFilters] = useState({
    service: "",
    specialization: "",
    rating: "",
    search: "",
  })
  const navigate = useNavigate()

  useEffect(() => {
    fetchPhotographers()
  }, [])

  const fetchPhotographers = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/photographers")
      const data = await response.json()

      if (response.ok) {
        setPhotographers(data)
      } else {
        setError("Failed to load photographers")
      }
    } catch (error) {
      console.error("Error fetching photographers:", error)
      setError("An error occurred while fetching photographers")
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const filteredPhotographers = photographers.filter((photographer) => {
    // Filter by search
    if (filters.search && !photographer.userId.username.toLowerCase().includes(filters.search.toLowerCase())) {
      return false
    }

    // Filter by service
    if (filters.service && !photographer.services.includes(filters.service)) {
      return false
    }

    // Filter by specialization
    if (filters.specialization && photographer.specialization !== filters.specialization) {
      return false
    }

    // Filter by rating
    if (filters.rating && photographer.rating < Number.parseInt(filters.rating)) {
      return false
    }

    return true
  })

  const handleViewProfile = (photographerId) => {
    navigate(`/photographer-profile/${photographerId}`)
  }

  const handleBookNow = (photographerId) => {
    const user = localStorage.getItem("user")
    if (!user) {
      navigate("/login")
      return
    }
    navigate(`/booking/${photographerId}`)
  }

  if (loading) {
    return (
      <div className="browse-loading">
        <div className="loading-spinner"></div>
        <p>Loading photographers...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="browse-error">
        <h2>Error Loading Photographers</h2>
        <p>{error}</p>
        <button onClick={fetchPhotographers} className="retry-btn">
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="browse-photographers">
      <div className="browse-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">
            Discover Amazing
            <span className="gradient-text"> Photographers</span>
          </h1>
          <p className="hero-subtitle">Connect with talented professionals who will capture your perfect moments</p>
        </div>
        <div className="hero-decoration">
          <div className="floating-element element-1">📸</div>
          <div className="floating-element element-2">🎨</div>
          <div className="floating-element element-3">✨</div>
        </div>
      </div>

      <div className="filters-section">
        <div className="filters-container">
          <div className="filter-controls">
            <div className="search-container">
              <input
                type="text"
                name="search"
                placeholder="Search photographers..."
                value={filters.search}
                onChange={handleFilterChange}
                className="search-input"
              />
              <div className="search-icon">🔍</div>
            </div>

            <div className="filter-group">
              <label>Service</label>
              <select name="service" value={filters.service} onChange={handleFilterChange} className="filter-select">
                <option value="">All Services</option>
                <option value="Wedding Photography">Wedding Photography</option>
                <option value="Portrait Photography">Portrait Photography</option>
                <option value="Event Photography">Event Photography</option>
                <option value="Commercial Photography">Commercial Photography</option>
                <option value="Nature Photography">Nature Photography</option>
                <option value="Fashion Photography">Fashion Photography</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Specialization</label>
              <select name="specialization" value={filters.specialization} onChange={handleFilterChange} className="filter-select">
                <option value="">All Specializations</option>
                <option value="Wedding">Wedding</option>
                <option value="Portrait">Portrait</option>
                <option value="Landscape">Landscape</option>
                <option value="Event">Event</option>
                <option value="Commercial">Commercial</option>
                <option value="Fashion">Fashion</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Rating</label>
              <select name="rating" value={filters.rating} onChange={handleFilterChange} className="filter-select">
                <option value="">Any Rating</option>
                <option value="5">5 Stars</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="results-section">
        <div className="results-header">
          <h2>
            {filteredPhotographers.length} Photographer{filteredPhotographers.length !== 1 ? "s" : ""} Found
          </h2>
        </div>

        <div className="photographers-grid">
          {filteredPhotographers.length > 0 ? (
            filteredPhotographers.map((photographer) => (
              <div key={photographer._id} className="photographer-card">
                <div className="card-image">
                  <img
                    src={photographer.userId.profileImage || "/placeholder.svg?height=300&width=300"}
                    alt={photographer.userId.username}
                   
                  />
                  <div className="card-overlay">
                    <div className="overlay-buttons">
                      <button onClick={() => handleViewProfile(photographer._id)} className="view-profile-btn">
                        View Profile
                      </button>
                      <button onClick={() => handleBookNow(photographer._id)} className="book-now-btn">
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>

                <div className="card-content">
                  <div className="photographer-header">
                    <h3 className="photographer-name">{photographer.userId.username}</h3>
                    </div>
                    <div className="rating">
                      <div className="stars">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={`star ${i < Math.round(photographer.rating) ? "filled" : ""}`}>
                            ⭐
                          </span>
                        ))}
                      </div>
                        <span className="rating-text">({photographer.reviewCount || 0})</span>
                  </div>

                  <p className="specialization">
                    <span className="spec-icon">🎯</span>
                    {photographer.specialization}
                  </p>

                  <div className="services">
                    {photographer.services.slice(0, 3).map((service, index) => (
                      <span key={index} className="service-tag">
                        {service}
                      </span>
                    ))}
                    {photographer.services.length > 3 && (
                      <span className="service-tag more">+{photographer.services.length - 3} more</span>
                    )}
                  </div>

                  <div className="card-footer">
                    <div className="price-info">
                      <span className="price-label">Starting from</span>
                      <span className="price">
                        $
                        {photographer.pricing && photographer.pricing.length > 0
                          ? Math.min(...photographer.pricing.map((p) => p.price))
                          : "99"}
                      </span>
                    </div>
                    <div className="experience">
                      <span className="exp-icon">📅</span>
                      <span>{photographer.experience || 0} years</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-results">
              <div className="no-results-icon">🔍</div>
              <h3>No photographers found</h3>
              <p>Try adjusting your search criteria or filters</p>
              <button
                onClick={() => setFilters({ service: "", specialization: "", rating: "", search: "" })}
                className="reset-filters-btn"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BrowsePhotographers
