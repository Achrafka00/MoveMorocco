import React, { useState, useEffect } from 'react';

const PriceEstimator = () => {
    const [cities, setCities] = useState([]);
    const [vehicleTypes, setVehicleTypes] = useState([]);
    const [formData, setFormData] = useState({
        from_city_id: '',
        to_city_id: '',
        vehicle_type_id: '',
        passengers: 1
    });
    const [estimate, setEstimate] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchCities();
        fetchVehicleTypes();
    }, []);

    const fetchCities = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/cities');
            const data = await response.json();
            setCities(data);
        } catch (error) {
            console.error('Error fetching cities:', error);
        }
    };

    const fetchVehicleTypes = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/vehicle-types');
            const data = await response.json();
            setVehicleTypes(data);
        } catch (error) {
            console.error('Error fetching vehicle types:', error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setEstimate(null);
    };

    const handleEstimate = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('http://127.0.0.1:8000/api/estimate-price', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const data = await response.json();
                setEstimate(data);
            } else {
                alert('Please fill all fields');
            }
        } catch (error) {
            console.error('Error estimating price:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="price-estimator">
            <h2 className="text-center mb-4">💰 Get Instant Price Estimate</h2>
            <p className="text-center mb-8" style={{ color: 'var(--color-text-muted)' }}>
                Calculate your trip cost in seconds
            </p>

            <form onSubmit={handleEstimate} className="estimator-form">
                <div className="form-row">
                    <div className="form-group">
                        <label>From</label>
                        <select name="from_city_id" value={formData.from_city_id} onChange={handleChange} required>
                            <option value="">Select City</option>
                            {cities.map(city => (
                                <option key={city.id} value={city.id}>{city.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>To</label>
                        <select name="to_city_id" value={formData.to_city_id} onChange={handleChange} required>
                            <option value="">Select City</option>
                            {cities.map(city => (
                                <option key={city.id} value={city.id}>{city.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Vehicle Type</label>
                        <select name="vehicle_type_id" value={formData.vehicle_type_id} onChange={handleChange} required>
                            <option value="">Select Vehicle</option>
                            {vehicleTypes.map(type => (
                                <option key={type.id} value={type.id}>
                                    {type.name} (Up to {type.capacity} passengers)
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Passengers</label>
                        <input
                            type="number"
                            name="passengers"
                            value={formData.passengers}
                            onChange={handleChange}
                            min="1"
                            max="20"
                            required
                        />
                    </div>
                </div>

                <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                    {loading ? 'Calculating...' : 'Calculate Price'}
                </button>
            </form>

            {estimate && (
                <div className="estimate-result">
                    <div className="result-header">
                        <h3>✅ Estimated Price</h3>
                        <p className="route">{estimate.route}</p>
                    </div>
                    <div className="result-details">
                        <div className="detail-item">
                            <span className="label">Distance:</span>
                            <span className="value">{estimate.distance_km} km</span>
                        </div>
                        <div className="detail-item">
                            <span className="label">Vehicle:</span>
                            <span className="value">{estimate.vehicle_type}</span>
                        </div>
                        <div className="price-range">
                            <div className="price-label">Estimated Cost</div>
                            <div className="price-value">
                                {estimate.estimated_price.min} - {estimate.estimated_price.max} {estimate.estimated_price.currency}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
        .price-estimator {
          max-width: 800px;
          margin: 0 auto;
          padding: var(--spacing-xl);
          background: white;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-md);
        }

        .estimator-form .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .estimator-form .form-group {
          display: flex;
          flex-direction: column;
        }

        .estimator-form label {
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: var(--color-text);
        }

        .estimator-form select,
        .estimator-form input {
          padding: 0.75rem;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          font-size: 1rem;
        }

        .btn-block {
          width: 100%;
          margin-top: 1rem;
        }

        .estimate-result {
          margin-top: 2rem;
          padding: 1.5rem;
          background: linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-primary) 100%);
          border-radius: var(--radius-lg);
          color: white;
        }

        .result-header h3 {
          margin: 0 0 0.5rem 0;
          color: white;
        }

        .route {
          font-size: 1.125rem;
          opacity: 0.9;
          margin: 0;
        }

        .result-details {
          margin-top: 1rem;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }

        .price-range {
          margin-top: 1.5rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(255,255,255,0.3);
          text-align: center;
        }

        .price-label {
          font-size: 0.875rem;
          opacity: 0.9;
          margin-bottom: 0.5rem;
        }

        .price-value {
          font-size: 2rem;
          font-weight: 700;
        }

        @media (max-width: 768px) {
          .estimator-form .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
        </div>
    );
};

export default PriceEstimator;
