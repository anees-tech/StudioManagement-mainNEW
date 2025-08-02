"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import "../styles/Home.css"

const Home = () => {
  const [featuredPhotographers, setFeaturedPhotographers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeaturedPhotographers = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/photographers/featured")
        const data = await response.json()

        if (response.ok) {
          setFeaturedPhotographers(data)
        }
      } catch (error) {
        console.error("Error fetching featured photographers:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedPhotographers()
  }, [])

  return (
    <div className="home-container">
      <section className="hero-section">
        <div className="hero-content">
          <div>
          <h1>Capture Your Special Moments</h1><br/>
          <p>Find the perfect photographer or videographer for your event</p>
          <Link to="/browse" className="cta-button">
            Browse Professionals
          </Link>
          </div>
        </div>
      </section>

      <section className="services-section">
        <h2>Our Services</h2>
        <div className="services-grid">
          <div className="service-card">
            <div className="service-icon">📸</div>
            <h3>Photography</h3>
            <p>Professional photography for weddings, events, portraits, and more</p>
          </div>
          <div className="service-card">
            <div className="service-icon">🎥</div>
            <h3>Videography</h3>
            <p>High-quality video production for all your special moments</p>
          </div>
          <div className="service-card">
            <div className="service-icon">✨</div>
            <h3>Photo Editing</h3>
            <p>Professional retouching and enhancement of your photos</p>
          </div>
          <div className="service-card">
            <div className="service-icon">🎬</div>
            <h3>Video Editing</h3>
            <p>Create stunning videos with professional editing services</p>
          </div>
        </div>
      </section>

      <section className="featured-section">
        <h2>Featured Photographers</h2>
        {loading ? (
          <p className="loading">Loading featured photographers...</p>
        ) : (
          <div className="featured-grid">
            {featuredPhotographers.length > 0 ? (
              featuredPhotographers.map((photographer) => (
                <div className="photographer-card" key={photographer._id}>
                  <div className="photographer-image">
                    <img src={photographer.profileImage || "/placeholder-profile.jpg"} alt={photographer.username} />
                  </div>
                  <div className="photographer-info">
                    <h3>{photographer.username}</h3>
                    <p className="specialization">{photographer.specialization}</p>
                    <div className="rating">
                      {"★".repeat(photographer.rating)} {"☆".repeat(5 - photographer.rating)}
                      <span>({photographer.reviewCount} reviews)</span>
                    </div>
                    <Link to={`/booking/${photographer._id}`} className="book-button">
                      Book Now
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-data">No featured photographers available at the moment.</p>
            )}
          </div>
        )}
        <div className="view-all">
          <Link to="/browse" className="view-all-button">
            View All Photographers
          </Link>
        </div>
      </section>

      <section className="testimonials-section">
        <h2>What Our Clients Say</h2>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div className="testimonial-text">
              "The photographer captured our wedding beautifully. Every moment was perfect!"
            </div>
            <div className="testimonial-author">- Sarah & John</div>
          </div>
          <div className="testimonial-card">
            <div className="testimonial-text">
              "Amazing videography service. The final video exceeded our expectations!"
            </div>
            <div className="testimonial-author">- Michael T.</div>
          </div>
          <div className="testimonial-card">
            <div className="testimonial-text">"The photo editing was superb. My portfolio looks professional now."</div>
            <div className="testimonial-author">- Emma L.</div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
