"use client"

import { useState } from "react"
import { FaEye, FaEyeSlash } from "react-icons/fa"
import { LuEyeClosed } from "react-icons/lu"
import { useNavigate } from "react-router-dom"
import "../styles/LoginRegister.css"

const LoginRegister = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "client",
    // Photographer specific fields
    specialization: "",
    services: [],
    experience: "",
    description: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const serviceOptions = [
    "Photo Editing",
    "Videography",
    "Video Editing", 
    "Photo Shoot Retouching",
    "Studio Lighting Services",
    "Underwater Photography",
    "Nature Photography",
    "Wedding Photography",
    "Engagement Photography",
  ]

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target

    if (type === "checkbox" && name === "services") {
      setFormData((prev) => ({
        ...prev,
        services: checked ? [...prev.services, value] : prev.services.filter((service) => service !== value),
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register"
      const payload = isLogin ? { username: formData.username, password: formData.password } : formData

      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem("user", JSON.stringify(data.user))
        onLogin(data.user)

        // Redirect based on role
        if (data.user.role === "admin") {
          navigate("/admin-dashboard")
        } else if (data.user.role === "photographer") {
          navigate("/photographer-dashboard")
        } else {
          navigate("/user-dashboard")
        }
      } else {
        setError(data.message || "An error occurred")
      }
    } catch (error) {
      console.error("Auth error:", error)
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
      role: "client",
      specialization: "",
      services: [],
      experience: "",
      description: "",
    })
    setError("")
  }

  const switchMode = () => {
    setIsLogin(!isLogin)
    resetForm()
  }

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
        </div>
      </div>

      <div className="auth-content">
        <div className="auth-card">
          <div className="auth-header">
            <h1>{isLogin ? "Welcome Back" : "Join Uzumaki Studio"}</h1>
            <p>
              {isLogin
                ? "Sign in to access your photography dashboard"
                : "Create your account and start your photography journey"}
            </p>
          </div>

          <div className="auth-tabs">
            <button className={`tab-btn ${isLogin ? "active" : ""}`} onClick={() => setIsLogin(true)}>
              Sign In
            </button>
            <button className={`tab-btn ${!isLogin ? "active" : ""}`} onClick={() => setIsLogin(false)}>
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <div className="role-selection">
                <h3>I want to join as:</h3>
                <div className="role-options">
                  <label className={`role-option ${formData.role === "client" ? "selected" : ""}`}>
                    <input
                      type="radio"
                      name="role"
                      value="client"
                      checked={formData.role === "client"}
                      onChange={handleInputChange}
                    />
                    <div className="role-card">
                      <div className="role-icon">👤</div>
                      <h4>Client</h4>
                      <p>Book photography sessions</p>
                    </div>
                  </label>
                  <label className={`role-option ${formData.role === "photographer" ? "selected" : ""}`}>
                    <input
                      type="radio"
                      name="role"
                      value="photographer"
                      checked={formData.role === "photographer"}
                      onChange={handleInputChange}
                    />
                    <div className="role-card">
                      <div className="role-icon">📸</div>
                      <h4>Photographer</h4>
                      <p>Offer photography services</p>
                    </div>
                  </label>
                </div>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
                placeholder="Enter your username"
              />
            </div>

            {!isLogin && (
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your email"
                />
              </div>
            )}

            <div className="form-group password-group">
              <label htmlFor="password">Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="eye-btn"
                  tabIndex={-1}
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FaEye /> :<LuEyeClosed /> }
                </button>
              </div>
            </div>

            {!isLogin && formData.role === "photographer" && (
              <div className="photographer-fields">
                <div className="form-group">
                  <label htmlFor="specialization">Specialization</label>
                  <input
                    type="text"
                    id="specialization"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Wedding Photography, Portraits"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="experience">Years of Experience</label>
                  <input
                    type="number"
                    id="experience"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    required
                    min="0"
                    max="50"
                    placeholder="0"
                  />
                </div>

                <div className="services-form-group">
                  <label>Services Offered</label>
                  <div className="services-grid">
                    {serviceOptions.map((service) => (
                      <label key={service} className="service-checkbox">
                        <input
                          type="checkbox"
                          name="services"
                          value={service}
                          checked={formData.services.includes(service)}
                          onChange={handleInputChange}
                        />
                        <span className="checkmark"></span>
                        <span className="service-label">{service}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="description">About You</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows="4"
                    placeholder="Tell clients about your photography style and experience..."
                  />
                </div>
              </div>
            )}

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? <div className="loading-spinner"></div> : isLogin ? "Sign In" : "Create Account"}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button onClick={switchMode} className="switch-btn">
                {isLogin ? "Sign Up" : "Sign In"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginRegister
