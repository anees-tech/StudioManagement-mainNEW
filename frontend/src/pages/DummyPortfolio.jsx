import React, { useState, useEffect } from 'react';
import '../styles/DummyPortfolio.css';

// Dummy data for portfolio items
const portfolioItemsData = [
  { id: 1, title: 'Sunset Serenity', category: 'Landscape', imageUrl: '/img/img1.webp', description: 'Capturing the breathtaking beauty of a sunset over the mountains. This project involved a week-long trek to find the perfect vantage point.', client: 'Nature Magazine', date: '2024-03-15' },
  { id: 2, title: 'Urban Elegance', category: 'Architecture', imageUrl: '/img/img2.jpg', description: 'A striking shot of modern architecture in the city, highlighting its clean lines and reflective surfaces.', client: 'City Developments Ltd.', date: '2024-01-20' },
  { id: 3, title: 'Joyful Moments', category: 'Portraits', imageUrl: '/img/img3.webp', description: 'A candid portrait capturing pure joy and laughter during a family gathering.', client: 'The Anderson Family', date: '2023-11-05' },
  { id: 4, title: 'Culinary Delights', category: 'Food Photography', imageUrl: '/img/img4.webp', description: 'Mouth-watering close-up of a gourmet dish, styled to perfection for a new restaurant menu.', client: 'Le Gourmet Bistro', date: '2024-02-10' },
  { id: 5, title: 'Wilderness Adventure', category: 'Nature', imageUrl: '/img/img5.webp', description: 'Exploring the untamed beauty of the wilderness, showcasing diverse flora and fauna.', client: 'Adventure Seekers Co.', date: '2023-09-22' },
  { id: 6, title: 'Product Showcase', category: 'Commercial', imageUrl: '/img/img6.webp', description: 'Elegant product photography for a luxury watch brand, focusing on detail and craftsmanship.', client: 'Timeless Pieces Inc.', date: '2024-04-01' },
  { id: 7, title: 'Event Highlights', category: 'Event Photography', imageUrl: '/img/img7.webp', description: 'Key moments from a vibrant corporate event, capturing the energy and networking.', client: 'Innovate Corp Summit', date: '2023-12-10' },
  { id: 8, title: 'Fashion Forward', category: 'Fashion', imageUrl: '/img/men-fashion1.jpeg', description: 'A stylish shot from a recent fashion campaign, showcasing the latest trends.', client: 'Mode Collective', date: '2024-05-05' },
  { id: 9, title: 'Mountain Majesty', category: 'Landscape', imageUrl: '/img/img8.webp', description: 'Awe-inspiring view of snow-capped mountains under a clear blue sky.', client: 'TravelScapes', date: '2023-10-18' },
  { id: 10, title: 'City Lights', category: 'Architecture', imageUrl: '/img/img9.webp', description: 'Dynamic cityscape at night, capturing the vibrant energy of urban life.', client: 'Urban Aesthetics Magazine', date: '2024-03-30' },
];

const Modal = ({ item, onClose }) => {
  if (!item) return null;

  return (
    <div className="portfolio-modal-backdrop-main" onClick={onClose}>
      <div className="portfolio-modal-content-main" onClick={(e) => e.stopPropagation()}>
        <button className="portfolio-modal-close-main" onClick={onClose}>&times;</button>
        <img src={item.imageUrl} alt={item.title} className="portfolio-modal-image-main" />
        <h2 className="portfolio-modal-title-main">{item.title}</h2>
        <p className="portfolio-modal-category-main"><strong>Category:</strong> {item.category}</p>
        {item.client && <p className="portfolio-modal-client-main"><strong>Client:</strong> {item.client}</p>}
        {item.date && <p className="portfolio-modal-date-main"><strong>Date:</strong> {new Date(item.date).toLocaleDateString()}</p>}
        <p className="portfolio-modal-description-main">{item.description}</p>
      </div>
    </div>
  );
};


const DummyPortfolio = () => {
  const [filter, setFilter] = useState('All');
  const [filteredItems, setFilteredItems] = useState(portfolioItemsData);
  const [selectedItem, setSelectedItem] = useState(null);

  const categories = ['All', ...new Set(portfolioItemsData.map(item => item.category))];

  useEffect(() => {
    if (filter === 'All') {
      setFilteredItems(portfolioItemsData);
    } else {
      setFilteredItems(portfolioItemsData.filter(item => item.category === filter));
    }
  }, [filter]);

  const handleViewProject = (item) => {
    setSelectedItem(item);
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
  };


  return (
    <div className="dummy-portfolio-container">
      <header className="portfolio-header-main">
        <h1>Our Masterpieces</h1>
        <p>A Glimpse into Our Creative World</p>
      </header>

      <nav className="portfolio-filter-nav-main">
        {categories.map(category => (
          <button
            key={category}
            className={`filter-button-main ${filter === category ? 'active' : ''}`}
            onClick={() => setFilter(category)}
          >
            {category}
          </button>
        ))}
      </nav>

      <section className="portfolio-grid-main">
        {filteredItems.map(item => (
          <div key={item.id} className="portfolio-item-card-main">
            <div className="portfolio-item-image-wrapper-main">
              <img src={item.imageUrl} alt={item.title} className="portfolio-item-image-main" />
              <div className="portfolio-item-overlay-main">
                <h3 className="portfolio-item-title-overlay-main">{item.title}</h3>
                <p className="portfolio-item-category-overlay-main">{item.category}</p>
              </div>
            </div>
            <div className="portfolio-item-content-main">
              <h3 className="portfolio-item-title-main">{item.title}</h3>
              <p className="portfolio-item-category-main">{item.category}</p>
              <p className="portfolio-item-description-main">{item.description.substring(0, 100)}...</p>
              <button className="portfolio-item-view-button-main" onClick={() => handleViewProject(item)}>View Project</button>
            </div>
          </div>
        ))}
      </section>

      {selectedItem && <Modal item={selectedItem} onClose={handleCloseModal} />}

      <section className="portfolio-cta-main">
        <h2>Inspired by Our Work?</h2>
        <p>Let's collaborate to bring your vision to life. Contact us today for a consultation.</p>
        <button className="cta-button-portfolio-main">Get in Touch</button>
      </section>
    </div>
  );
};

export default DummyPortfolio;