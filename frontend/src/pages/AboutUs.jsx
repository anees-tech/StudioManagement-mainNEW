import "../styles/AboutUs.css"

const AboutUs = () => {
  return (
    <div className="about-container">
      <div className="about-header">
        <h1>About Uzumaki Studio</h1>
        <p>We believe every STORY is worth sharing</p>
      </div>

      <section className="about-section">
        <div className="about-content">
          <h2>Our Story</h2>
          <p>
            Uzumaki Studio was founded in 2023 by a group of passionate photographers and videographers who wanted to
            create a platform that connects creative professionals with clients seeking to capture their special
            moments.
          </p>
          <p>
            Our mission is to make professional photography and videography services accessible to everyone, while
            providing a platform for talented professionals to showcase their work and grow their business.
          </p>
        </div>
        <div className="about-image">
          <img src="/about-image.jpg" alt="Team of photographers" />
        </div>
      </section>

      <section className="team-section">
        <h2>Our Team</h2>
        <div className="team-grid">
          <div className="team-member">
            <div className="member-image">
              <img src="/team-member1.jpg" alt="Alishba Sarwar" />
            </div>
            <h3>Alishba Sarwar</h3>
            <p className="member-role">Founder & Lead Developer</p>
            <p className="member-bio">Computer Science student with a passion for web development and photography.</p>
          </div>

          <div className="team-member">
            <div className="member-image">
              <img src="/team-member2.jpg" alt="Ayesha Ghani" />
            </div>
            <h3>Ayesha Ghani</h3>
            <p className="member-role">Co-Founder & UI Designer</p>
            <p className="member-bio">Creative designer with expertise in user experience and interface design.</p>
          </div>

          <div className="team-member">
            <div className="member-image">
              <img src="/team-member3.jpg" alt="Maryam Nazir" />
            </div>
            <h3>Maryam Nazir</h3>
            <p className="member-role">Co-Founder & Backend Developer</p>
            <p className="member-bio">
              Backend specialist with a focus on database management and system architecture.
            </p>
          </div>
        </div>
      </section>

      <section className="vision-section">
        <div className="vision-content">
          <h2>Our Vision</h2>
          <p>
            We envision a world where capturing and preserving memories is accessible to everyone, regardless of their
            location or budget. We strive to create a community where photographers and clients can connect,
            collaborate, and create beautiful memories together.
          </p>
          <p>
            Our platform is designed to simplify the process of finding and booking professional photography and
            videography services, while providing photographers with the tools they need to manage their business
            effectively.
          </p>
        </div>
      </section>

      <section className="values-section">
        <h2>Our Values</h2>
        <div className="values-grid">
          <div className="value-card">
            <div className="value-icon">🤝</div>
            <h3>Collaboration</h3>
            <p>We believe in the power of collaboration between clients and photographers.</p>
          </div>
          <div className="value-card">
            <div className="value-icon">✨</div>
            <h3>Creativity</h3>
            <p>We encourage creativity and innovation in all aspects of our work.</p>
          </div>
          <div className="value-card">
            <div className="value-icon">🔍</div>
            <h3>Quality</h3>
            <p>We are committed to providing high-quality services and experiences.</p>
          </div>
          <div className="value-card">
            <div className="value-icon">💡</div>
            <h3>Innovation</h3>
            <p>We continuously strive to improve and innovate our platform.</p>
          </div>
        </div>
      </section>

      <section className="contact-section">
        <h2>Contact Us</h2>
        <div className="contact-info">
          <div className="contact-item">
            <h3>Address</h3>
            <p>Government Graduate College for Women</p>
            <p>Samundri, Department of Computer Science</p>
          </div>
          <div className="contact-item">
            <h3>Email</h3>
            <p>info@uzumakistudio.com</p>
          </div>
          <div className="contact-item">
            <h3>Phone</h3>
            <p>+92 123 456 7890</p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AboutUs
