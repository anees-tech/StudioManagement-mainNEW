
import { Link } from "react-router-dom"
import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa"
import "../styles/Footer.css"

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>Uzumaki Studio</h3>
          <p>We believe every STORY is worth sharing</p>
          <div className="social-icons">
            <a href="https://www.google.com" className="social-icon" aria-label="Facebook" target="_blank">
              <FaFacebookF />
            </a>
            <a href="#" className="social-icon" aria-label="Instagram">
              <FaInstagram />
            </a>
            <a href="#" className="social-icon" aria-label="Twitter">
              <FaTwitter />
            </a>
            <a href="#" className="social-icon" aria-label="YouTube">
              <FaYoutube />
            </a>
          </div>
        </div>

        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul className="footer-links">
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/browse">Browse Photographers</Link>
            </li>
            <li>
              <Link to="/about">About Us</Link>
            </li>
            <li>
              <Link to="/login">Login / Register</Link>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Services</h3>
          <ul className="footer-links">
            <li>
              <Link to="/browse?service=photography">Photography</Link>
            </li>
            <li>
              <Link to="/browse?service=videography">Videography</Link>
            </li>
            <li>
              <Link to="/browse?service=editing">Photo Editing</Link>
            </li>
            <li>
              <Link to="/browse?service=video-editing">Video Editing</Link>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Contact Us</h3>
          <p>Government Graduate College for Women</p>
          <p>Samundri, Department of Computer Science</p>
          <p>Email: info@uzumakistudio.com</p>
          <p>Phone: +92 123 456 7890</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Uzumaki Studio. All rights reserved.</p>
        <p>Designed by Alishba Sarwar, Ayesha Ghani, Maryam Nazir</p>
      </div>
    </footer>
  )
}

export default Footer
