import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PriceCalculator = () => {
    const [cities, setCities] = useState([]);
    const [categories, setCategories] = useState([]);
    const [originCity, setOriginCity] = useState('');
    const [destinationCity, setDestinationCity] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [price, setPrice] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchCities();
        fetchCategories();
    }, []);

    const fetchCities = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/cities');
            const data = await response.json();
            setCities(data);
        } catch (err) {
            console.error('Error fetching cities:', err);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/vehicle-categories');
            const data = await response.json();
            setCategories(data);
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    };

    const calculatePrice = async () => {
        if (!originCity || !destinationCity) {
            setError('Please select both cities');
            return;
        }

        if (originCity === destinationCity) {
            setError('Origin and destination must be different');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const body = {
                origin_city_id: parseInt(originCity),
                destination_city_id: parseInt(destinationCity),
            };

            if (categoryId) {
                body.category_id = parseInt(categoryId);
            }

            const response = await fetch('http://127.0.0.1:8000/api/calculate-price', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(body),
            });

            const data = await response.json();

            if (response.ok) {
                setPrice(data);
            } else {
                setError(data.error || 'Failed to calculate price');
            }
        } catch (err) {
            setError('Network error');
        } finally {
            setLoading(false);
        }
    };

    const handleBookNow = () => {
        navigate('/booking', {
            state: {
                originCity: cities.find(c => c.id === parseInt(originCity)),
                destinationCity: cities.find(c => c.id === parseInt(destinationCity)),
                categoryId: categoryId ? parseInt(categoryId) : null,
                estimatedPrice: price?.total_price
            }
        });
    };

    return (
        <div className="price-calculator">
            <div className="calculator-card">
                <h2>💰 Estimate Your Trip Cost</h2>
                <p className="subtitle">Get instant pricing for your journey across Morocco</p>

                <div className="calculator-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label>📍 From</label>
                            <select
                                value={originCity}
                                onChange={(e) => setOriginCity(e.target.value)}
                                className="city-select"
                            >
                                <option value="">Select origin city</option>
                                {cities.map(city => (
                                    <option key={city.id} value={city.id}>{city.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>📍 To</label>
                            <select
                                value={destinationCity}
                                onChange={(e) => setDestinationCity(e.target.value)}
                                className="city-select"
                            >
                                <option value="">Select destination city</option>
                                {cities.map(city => (
                                    <option key={city.id} value={city.id}>{city.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>🚗 Vehicle Category (Optional)</label>
                        <select
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className="city-select"
                        >
                            <option value="">Select vehicle type for accurate pricing</option>
                            {categories.map(category => (
                                <option key={category.id} value={category.id}>
                                    {category.name} ({category.description})
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={calculatePrice}
                        className="btn btn-primary btn-calculate"
                        disabled={loading || !originCity || !destinationCity}
                    >
                        {loading ? 'Calculating...' : '🔍 Calculate Price'}
                    </button>

                    {error && <div className="error-message">{error}</div>}

                    {price && (
                        <div className="price-result">
                            <div className="result-header">
                                <h3>Your Trip Details</h3>
                            </div>
                            <div className="result-details">
                                <div className="detail-row">
                                    <span className="label">Route:</span>
                                    <span className="value">{price.origin} → {price.destination}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Distance:</span>
                                    <span className="value">{price.distance_km} km</span>
                                </div>
                                {categoryId && (
                                    <div className="detail-row">
                                        <span className="label">Vehicle:</span>
                                        <span className="value">
                                            {categories.find(c => c.id === parseInt(categoryId))?.name || 'Standard'}
                                        </span>
                                    </div>
                                )}
                                <div className="detail-row">
                                    <span className="label">Rate:</span>
                                    <span className="value">{price.price_per_km} MAD/km</span>
                                </div>
                                <div className="detail-row total">
                                    <span className="label">Estimated Price:</span>
                                    <span className="value price">{price.total_price} MAD</span>
                                </div>
                            </div>
                            <button onClick={handleBookNow} className="btn btn-success btn-book">
                                📅 Book This Trip
                            </button>
                            <p className="disclaimer">
                                {categoryId
                                    ? '* Price based on selected vehicle category'
                                    : '* Final price may vary based on vehicle type selected'}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .price-calculator {
                    padding: 3rem 0;
                }

                .calculator-card {
                    background: white;
                    padding: 2rem;
                    border-radius: var(--radius-xl);
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
                    max-width: 600px;
                    margin: 0 auto;
                }

                .calculator-card h2 {
                    margin: 0 0 0.5rem 0;
                    text-align: center;
                    background: linear-gradient(135deg, #0d6efd, #5850ec);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .subtitle {
                    text-align: center;
                    color: var(--color-text-muted);
                    margin-bottom: 2rem;
                }

                .calculator-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .form-group label {
                    font-weight: 600;
                    font-size: 0.875rem;
                }

                .city-select {
                    padding: 0.875rem;
                    border: 2px solid var(--color-border);
                    border-radius: var(--radius-md);
                    font-size: 1rem;
                    transition: all 0.2s;
                }

                .city-select:focus {
                    outline: none;
                    border-color: var(--color-primary);
                    box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.1);
                }

                .btn-calculate {
                    width: 100%;
                    padding: 1rem;
                    font-size: 1.125rem;
                    font-weight: 600;
                }

                .btn-calculate:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .error-message {
                    background: #fee2e2;
                    color: #dc2626;
                    padding: 0.875rem;
                    border-radius: var(--radius-md);
                    text-align: center;
                    font-weight: 500;
                }

                .price-result {
                    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
                    border-radius: var(--radius-lg);
                    padding: 1.5rem;
                    border: 2px solid #0ea5e9;
                    animation: slideIn 0.3s ease-out;
                }

                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .result-header h3 {
                    margin: 0 0 1rem 0;
                    color: #0369a1;
                }

                .result-details {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                    margin-bottom: 1.5rem;
                }

                .detail-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0.5rem 0;
                }

                .detail-row.total {
                    border-top: 2px solid #0ea5e9;
                    padding-top: 1rem;
                    margin-top: 0.5rem;
                }

                .detail-row .label {
                    font-weight: 500;
                    color: var(--color-text-muted);
                }

                .detail-row .value {
                    font-weight: 600;
                    color: var(--color-text);
                }

                .detail-row.total .value.price {
                    font-size: 1.75rem;
                    color: #0369a1;
                }

                .btn-book {
                    width: 100%;
                    padding: 1rem;
                    font-size: 1.125rem;
                    margin-bottom: 0.5rem;
                }

                .disclaimer {
                    text-align: center;
                    font-size: 0.75rem;
                    color: var(--color-text-muted);
                    font-style: italic;
                    margin: 0;
                }

                @media (max-width: 640px) {
                    .form-row {
                        grid-template-columns: 1fr;
                    }

                    .calculator-card {
                        padding: 1.5rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default PriceCalculator;
