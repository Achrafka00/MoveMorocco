import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Tag, User, Users, Star, MessageSquare } from 'lucide-react';

const Catalogue = () => {
  const [vehicles, setVehicles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
    fetchVehicles();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/vehicle-categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchVehicles = async (categoryId = null) => {
    setLoading(true);
    try {
      const url = categoryId
        ? `http://127.0.0.1:8000/api/vehicles?category_id=${categoryId}`
        : 'http://127.0.0.1:8000/api/vehicles';
      const response = await fetch(url);
      const data = await response.json();
      setVehicles(data);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryFilter = (categoryId) => {
    setSelectedCategory(categoryId);
    fetchVehicles(categoryId);
  };

  const handleBookVehicle = (vehicle) => {
    navigate('/booking', { state: { selectedVehicle: vehicle } });
  };

  // Helper to construct full image URL
  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const cleanPath = path.replace('public/', '');
    return `http://127.0.0.1:8000${cleanPath.startsWith('/') ? '' : '/'}${cleanPath}`;
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`star ${i <= rating ? 'filled' : ''}`}>
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <div className="catalogue-page section">
      <div className="container">
        <h1 className="text-center mb-4 flex items-center justify-center gap-3">
          <Car size={32} className="text-primary-600" /> Our Fleet
        </h1>
        <p className="text-center subtitle mb-8">
          Choose from our premium selection of vehicles
        </p>

        {/* Category Filter */}
        <div className="category-filter">
          <button
            className={`category-btn ${selectedCategory === null ? 'active' : ''}`}
            onClick={() => handleCategoryFilter(null)}
          >
            All Vehicles
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              className={`category-btn ${selectedCategory === category.id ? 'active' : ''} category-${category.name.toLowerCase()}`}
              onClick={() => handleCategoryFilter(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Vehicles Grid */}
        {loading ? (
          <div className="loading-state">Loading vehicles...</div>
        ) : (
          <div className="vehicles-grid">
            {vehicles.map((vehicle) => (
              <div key={vehicle.id} className="vehicle-card">
                <div className="vehicle-image">
                  <img src={getImageUrl(vehicle.image_url)} alt={vehicle.name} />
                  <div className={`category-badge category-${vehicle.category.name.toLowerCase()}`}>
                    {vehicle.category.name}
                  </div>
                </div>

                <div className="vehicle-content">
                  <h3>{vehicle.name}</h3>
                  <p className="vehicle-model">{vehicle.model} ({vehicle.year})</p>

                  {/* Driver Info */}
                  {vehicle.partner && (
                    <div className="driver-info">
                      <img
                        src={getImageUrl(vehicle.partner.avatar_url) || 'https://i.pravatar.cc/150?img=1'}
                        alt={vehicle.partner.name}
                        className="driver-avatar"
                      />
                      <div className="driver-details">
                        <strong>{vehicle.partner.name}</strong>
                        <div className="driver-rating">
                          {renderStars(Math.round(vehicle.partner.rating || 4.5))}
                          <span className="rating-value">{vehicle.partner.rating || '4.5'}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="vehicle-info">
                    <div className="info-item">
                      <span className="icon"><Users size={18} /></span>
                      <span>{vehicle.capacity} passengers</span>
                    </div>
                    <div className="info-item">
                      <span className="icon"><Tag size={18} /></span>
                      <span>{vehicle.price_per_km} MAD/km</span>
                    </div>
                  </div>

                  <div className="rating-section">
                    <div className="stars">
                      {renderStars(Math.round(vehicle.average_rating))}
                    </div>
                    <span className="rating-text">
                      {vehicle.average_rating || 'N/A'} ({vehicle.reviews_count} reviews)
                    </span>
                  </div>

                  <p className="vehicle-description">{vehicle.description}</p>

                  {/* Reviews */}
                  {vehicle.reviews && vehicle.reviews.length > 0 && (
                    <div className="reviews-preview">
                      <h4>Recent Reviews</h4>
                      {vehicle.reviews.slice(0, 2).map((review) => (
                        <div key={review.id} className="review-item">
                          <div className="review-header">
                            <strong>{review.user_name}</strong>
                            <div className="review-stars">
                              {renderStars(review.rating)}
                            </div>
                          </div>
                          <p className="review-comment">{review.comment}</p>
                          <span className="review-date">{review.created_at}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    className="btn btn-primary btn-block"
                    onClick={() => handleBookVehicle(vehicle)}
                  >
                    Book This Vehicle
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .catalogue-page {
          min-height: 100vh;
          background: var(--color-bg);
          padding-top: 5rem;
        }

        .subtitle {
          color: var(--color-text-muted);
          font-size: 1.125rem;
        }

        .category-filter {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
          margin-bottom: 3rem;
        }

        .category-btn {
          padding: 0.75rem 2rem;
          border: 2px solid var(--color-border);
          background: white;
          border-radius: var(--radius-full);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .category-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .category-btn.active {
          background: linear-gradient(135deg, #0d6efd, #5850ec);
          color: white;
          border-color: #0d6efd;
        }

        .category-btn.category-standard.active {
          background: linear-gradient(135deg, #10b981, #059669);
        }

        .category-btn.category-vip.active {
          background: linear-gradient(135deg, #f59e0b, #d97706);
        }

        .category-btn.category-vvip.active {
          background: linear-gradient(135deg, #dc2626, #991b1b);
        }

        .vehicles-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 2rem;
        }

        .vehicle-card {
          background: white;
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: var(--shadow-md);
          transition: all 0.3s ease;
        }

        .vehicle-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.15);
        }

        .vehicle-image {
          position: relative;
          height: 220px;
          overflow: hidden;
        }

        .vehicle-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .category-badge {
          position: absolute;
          top: 1rem;
          right: 1rem;
          padding: 0.5rem 1rem;
          border-radius: var(--radius-full);
          font-size: 0.875rem;
          font-weight: 700;
          color: white;
          backdrop-filter: blur(10px);
        }

        .category-badge.category-standard {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.9), rgba(5, 150, 105, 0.9));
        }

        .category-badge.category-vip {
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.9), rgba(217, 119, 6, 0.9));
        }

        .category-badge.category-vvip {
          background: linear-gradient(135deg, rgba(220, 38, 38, 0.9), rgba(153, 27, 27, 0.9));
        }

        .vehicle-content {
          padding: 1.5rem;
        }

        .vehicle-content h3 {
          margin: 0 0 0.5rem 0;
          color: var(--color-text);
        }

        .vehicle-model {
          color: var(--color-text-muted);
          margin-bottom: 1rem;
        }

        .driver-info {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: linear-gradient(135deg, rgba(13, 110, 253, 0.05), rgba(88, 80, 236, 0.05));
          border-radius: var(--radius-md);
          margin-bottom: 1rem;
          border: 1px solid rgba(13, 110, 253, 0.1);
        }

        .driver-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .driver-details {
          flex: 1;
        }

        .driver-details strong {
          display: block;
          color: var(--color-text);
          margin-bottom: 0.25rem;
        }

        .driver-rating {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .driver-rating .stars {
          display: flex;
        }

        .driver-rating .star {
          font-size: 0.875rem;
          color: #d1d5db;
        }

        .driver-rating .star.filled {
          color: #fbbf24;
        }

        .rating-value {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--color-primary);
        }

        .vehicle-info {
          display: flex;
          gap: 1.5rem;
          margin-bottom: 1rem;
          padding: 1rem;
          background: var(--color-bg);
          border-radius: var(--radius-md);
        }

        .info-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .icon {
          font-size: 1.25rem;
        }

        .rating-section {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .stars {
          display: flex;
        }

        .star {
          color: #d1d5db;
          font-size: 1.25rem;
        }

        .star.filled {
          color: #fbbf24;
        }

        .rating-text {
          color: var(--color-text-muted);
          font-size: 0.875rem;
        }

        .vehicle-description {
          color: var(--color-text-muted);
          margin-bottom: 1.5rem;
          line-height: 1.6;
        }

        .reviews-preview {
          border-top: 1px solid var(--color-border);
          padding-top: 1rem;
          margin-bottom: 1.5rem;
        }

        .reviews-preview h4 {
          font-size: 0.875rem;
          color: var(--color-text-muted);
          margin-bottom: 1rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .review-item {
          margin-bottom: 1rem;
          padding: 0.75rem;
          background: var(--color-bg);
          border-radius: var(--radius-md);
        }

        .review-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .review-stars .star {
          font-size: 0.875rem;
        }

        .review-comment {
          font-size: 0.875rem;
          color: var(--color-text);
          margin: 0.5rem 0;
          line-height: 1.5;
        }

        .review-date {
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }

        .btn-block {
          width: 100%;
        }

        .loading-state {
          text-align: center;
          padding: 4rem;
          color: var(--color-text-muted);
          font-size: 1.125rem;
        }

        .mb-4 { margin-bottom: 1rem; }
        .mb-8 { margin-bottom: 2rem; }
        .text-center { text-align: center; }
      `}</style>
    </div>
  );
};

export default Catalogue;
