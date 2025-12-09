import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import WhatsAppButton from '../components/WhatsAppButton';

const Booking = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const toast = useToast();

    // Get data from price calculator if available
    const calculatorData = location.state || {};

    const [step, setStep] = useState(1);
    const [submitted, setSubmitted] = useState(false);
    const [categories, setCategories] = useState([]);
    const [vehicles, setVehicles] = useState([]);

    // Unified state for form data
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone_number: '',
        pickup_location: calculatorData.originCity?.name || '',
        dropoff_location: calculatorData.destinationCity?.name || '',
        pickup_date: '',
        pickup_time: '',
        passengers: 1,
        category_id: calculatorData.categoryId || '',
        vehicle_id: null,
        vehicle: null, // Store full vehicle object for review
        message: ''
    });

    const [loading, setLoading] = useState(false);
    const [estimatedPrice, setEstimatedPrice] = useState(calculatorData.estimatedPrice || null);

    useEffect(() => {
        fetchCategories();
        fetchVehicles();

        if (calculatorData.originCity && calculatorData.destinationCity) {
            toast.success(`✅ Trip details pre-filled: ${calculatorData.originCity.name} → ${calculatorData.destinationCity.name}`);
        }
    }, []); // Run once on mount

    const fetchCategories = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/vehicle-categories');
            if (!response.ok) throw new Error('Failed to fetch categories');
            const data = await response.json();
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchVehicles = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/vehicles?available=true');
            if (!response.ok) throw new Error('Failed to fetch vehicles');
            const data = await response.json();
            // Filter only approved and available vehicles
            setVehicles(data.filter(v => v.is_approved && v.available));
        } catch (error) {
            console.error('Error fetching vehicles:', error);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleVehicleSelect = (vehicle) => {
        setFormData({
            ...formData,
            vehicle_id: vehicle.id,
            vehicle: vehicle
        });
        // Feedback is good, but no need to toast on every click, visual selection is enough
    };

    const nextStep = () => {
        if (step === 1 && (!formData.pickup_location || !formData.dropoff_location || !formData.pickup_date)) {
            toast.warning('Please fill in all trip details');
            return;
        }
        if (step === 2 && !formData.vehicle_id) {
            toast.warning('Please select a vehicle');
            return;
        }
        if (step === 3 && (!formData.full_name || !formData.email || !formData.phone_number)) {
            toast.warning('Please fill in your contact information');
            return;
        }
        setStep(step + 1);
    };

    const prevStep = () => setStep(step - 1);

    const handleSubmit = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://127.0.0.1:8000/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setSubmitted(true);
                toast.success('Booking submitted successfully!');
            } else {
                const errorData = await response.json();
                toast.error('Booking failed: ' + (errorData.message || 'Please try again'));
            }
        } catch (error) {
            console.error('Error submitting booking:', error);
            toast.error('Network error: Please check your connection');
        } finally {
            setLoading(false);
        }
    };

    // Helper to get category name safely
    const getCategoryName = (vehicle) => {
        return vehicle.category?.name || 'Standard';
    };

    return (
        <div className="booking-page section container">
            <div className="booking-header">
                <h1>Book Your Trip</h1>
                <p className="subtitle">Secure your comfortable ride across Morocco</p>
            </div>

            {submitted ? (
                <div className="booking-success-card">
                    <div className="success-icon">✅</div>
                    <h2>Booking Request Received!</h2>
                    <p>Thank you, <strong>{formData.full_name}</strong>.</p>
                    <p>We will review your request for a trip from <strong>{formData.pickup_location}</strong> to <strong>{formData.dropoff_location}</strong> on <strong>{formData.pickup_date}</strong> and contact you shortly.</p>

                    <div className="whatsapp-action">
                        <p>Need a faster response?</p>
                        <WhatsAppButton
                            message={`Hello! I just submitted a booking request. Name: ${formData.full_name}, Route: ${formData.pickup_location} to ${formData.dropoff_location}.`}
                        />
                    </div>

                    <button className="btn btn-secondary mt-4" onClick={() => navigate('/')}>
                        Return Home
                    </button>
                </div>
            ) : (
                <div className="booking-container">
                    {/* Progress Steps */}
                    <div className="steps-indicator">
                        <div className={`step-item ${step >= 1 ? 'active' : ''}`}>1. Details</div>
                        <div className={`step-line ${step >= 2 ? 'active' : ''}`}></div>
                        <div className={`step-item ${step >= 2 ? 'active' : ''}`}>2. Vehicle</div>
                        <div className={`step-line ${step >= 3 ? 'active' : ''}`}></div>
                        <div className={`step-item ${step >= 3 ? 'active' : ''}`}>3. Contact</div>
                        <div className={`step-line ${step >= 4 ? 'active' : ''}`}></div>
                        <div className={`step-item ${step >= 4 ? 'active' : ''}`}>4. Review</div>
                    </div>

                    <div className="booking-card">
                        {step === 1 && (
                            <div className="step-content fade-in">
                                <h3>Trip Details</h3>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Pickup Date *</label>
                                        <input
                                            type="date"
                                            name="pickup_date"
                                            value={formData.pickup_date}
                                            onChange={handleChange}
                                            required
                                            className="form-control"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Pickup Time</label>
                                        <input
                                            type="time"
                                            name="pickup_time"
                                            value={formData.pickup_time}
                                            onChange={handleChange}
                                            className="form-control"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Pickup Location *</label>
                                        <input
                                            type="text"
                                            name="pickup_location"
                                            value={formData.pickup_location}
                                            onChange={handleChange}
                                            placeholder="e.g. Marrakech Airport"
                                            required
                                            className="form-control"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Dropoff Location *</label>
                                        <input
                                            type="text"
                                            name="dropoff_location"
                                            value={formData.dropoff_location}
                                            onChange={handleChange}
                                            placeholder="e.g. Hotel La Mamounia"
                                            required
                                            className="form-control"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Number of Passengers</label>
                                        <input
                                            type="number"
                                            name="passengers"
                                            value={formData.passengers}
                                            onChange={handleChange}
                                            min="1"
                                            max="50"
                                            className="form-control"
                                        />
                                    </div>
                                </div>
                                <div className="step-actions">
                                    <button className="btn btn-primary" onClick={nextStep}>
                                        Select Vehicle →
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="step-content fade-in">
                                <h3>Select Your Vehicle</h3>
                                <div className="vehicles-grid">
                                    {vehicles.length === 0 ? (
                                        <div className="empty-state">
                                            <p>Loading available vehicles...</p>
                                            <small>Make sure your backend is running!</small>
                                        </div>
                                    ) : (
                                        vehicles.map((vehicle) => (
                                            <div
                                                key={vehicle.id}
                                                className={`vehicle-card ${formData.vehicle_id === vehicle.id ? 'selected' : ''}`}
                                                onClick={() => handleVehicleSelect(vehicle)}
                                            >
                                                <div className="vehicle-image-wrapper">
                                                    {/* Use a reliable placeholder if image_url is missing or broken */}
                                                    <img
                                                        src={vehicle.image_url || 'https://placehold.co/600x400?text=No+Image'}
                                                        alt={vehicle.name}
                                                        onError={(e) => { e.target.src = 'https://placehold.co/600x400?text=Image+Unavailable'; }}
                                                    />
                                                    <div className={`category-badge ${getCategoryName(vehicle).toLowerCase()}`}>
                                                        {getCategoryName(vehicle)}
                                                    </div>
                                                    {formData.vehicle_id === vehicle.id && (
                                                        <div className="selected-overlay">
                                                            <span className="check-icon">✓</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="vehicle-details">
                                                    <div className="vehicle-header">
                                                        <h4>{vehicle.name}</h4>
                                                        <span className="vehicle-price">{vehicle.price_per_km} MAD<small>/km</small></span>
                                                    </div>
                                                    <p className="vehicle-sub">{vehicle.model} ({vehicle.year})</p>
                                                    <div className="vehicle-features">
                                                        <span>👤 {vehicle.capacity} Seats</span>
                                                        <span>❄️ A/C</span>
                                                        <span>🔋 Wifi</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <div className="step-actions">
                                    <button className="btn btn-secondary" onClick={prevStep}>← Back</button>
                                    <button className="btn btn-primary" onClick={nextStep} disabled={!formData.vehicle_id}>
                                        Enter Contact Details →
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="step-content fade-in">
                                <h3>Contact Information</h3>
                                <div className="form-group">
                                    <label>Full Name *</label>
                                    <input
                                        type="text"
                                        name="full_name"
                                        value={formData.full_name}
                                        onChange={handleChange}
                                        placeholder="Your Name"
                                        required
                                        className="form-control"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email Address *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="you@email.com"
                                        required
                                        className="form-control"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Phone Number (WhatsApp) *</label>
                                    <input
                                        type="tel"
                                        name="phone_number"
                                        value={formData.phone_number}
                                        onChange={handleChange}
                                        placeholder="+212 600 000 000"
                                        required
                                        className="form-control"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Special Requests</label>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        rows="3"
                                        placeholder="Child seat, extra luggage, etc..."
                                        className="form-control"
                                    />
                                </div>
                                <div className="step-actions">
                                    <button className="btn btn-secondary" onClick={prevStep}>← Back</button>
                                    <button className="btn btn-primary" onClick={nextStep}>
                                        Review Booking →
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="step-content fade-in">
                                <h3>Review Your Booking</h3>

                                <div className="review-summary">
                                    <div className="review-item">
                                        <h4>🗓 Trip</h4>
                                        <p>{formData.pickup_date} at {formData.pickup_time || 'TBD'}</p>
                                        <p>{formData.pickup_location} ➝ {formData.dropoff_location}</p>
                                        <p>{formData.passengers} Passengers</p>
                                    </div>

                                    {formData.vehicle && (
                                        <div className="review-item highlight">
                                            <h4>🚗 Vehicle</h4>
                                            <div className="review-vehicle-flex">
                                                <img
                                                    src={formData.vehicle.image_url || 'https://placehold.co/100x60'}
                                                    alt={formData.vehicle.name}
                                                    className="review-thumb"
                                                />
                                                <div>
                                                    <p><strong>{formData.vehicle.name}</strong></p>
                                                    <p>{formData.vehicle.model}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="review-item">
                                        <h4>👤 Contact</h4>
                                        <p>{formData.full_name}</p>
                                        <p>{formData.phone_number}</p>
                                        <p>{formData.email}</p>
                                    </div>
                                </div>

                                {estimatedPrice && (
                                    <div className="price-estimate-box">
                                        <span>Estimated Total</span>
                                        <span className="price-value">{estimatedPrice} MAD</span>
                                    </div>
                                )}

                                <div className="step-actions">
                                    <button className="btn btn-secondary" onClick={prevStep} disabled={loading}>← Back</button>
                                    <button className="btn btn-primary btn-lg" onClick={handleSubmit} disabled={loading}>
                                        {loading ? 'Submitting...' : 'Confirm Booking ✓'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <style>{`
                .booking-page {
                    padding-top: 4rem;
                    padding-bottom: 6rem;
                    background-color: var(--color-bg);
                    min-height: 80vh;
                }
                
                .booking-header {
                    text-align: center;
                    margin-bottom: 3.5rem;
                }
                
                .booking-header h1 {
                    font-size: 2.75rem;
                    color: var(--color-text);
                    margin-bottom: 0.75rem;
                    font-weight: 800;
                }
                
                .subtitle {
                    color: var(--color-text-muted);
                    font-size: 1.15rem;
                }

                .booking-container {
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 0 1.5rem; /* Add horizontal padding on container */
                }

                .booking-card {
                    background: white;
                    border-radius: 1.25rem;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.06);
                    padding: 3rem; /* Increased padding */
                    border: 1px solid rgba(0,0,0,0.04);
                }

                .steps-indicator {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 3rem; /* Increased spacing */
                    padding: 0 1rem;
                }

                .step-item {
                    font-weight: 600;
                    color: var(--color-text-muted);
                    font-size: 0.95rem;
                    transition: color 0.3s;
                }

                .step-item.active {
                    color: var(--color-primary);
                }

                .step-line {
                    flex-grow: 1;
                    height: 2px;
                    background: #e5e7eb;
                    margin: 0 1.5rem;
                }

                .step-line.active {
                    background: var(--color-primary);
                }

                .form-control {
                    width: 100%;
                    padding: 1rem; /* Larger input padding */
                    border: 1px solid #d1d5db;
                    border-radius: 0.75rem;
                    font-size: 1rem;
                    transition: border-color 0.2s, box-shadow 0.2s;
                    max-width: 100%;
                    background: #f9fafb; /* Slight bg for inputs */
                }

                .form-control:focus {
                    outline: none;
                    border-color: var(--color-primary);
                    box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
                    background: white;
                }

                .form-group {
                    margin-bottom: 1.75rem; /* Increased spacing between fields */
                }

                .form-group label {
                    display: block;
                    margin-bottom: 0.6rem;
                    font-weight: 600;
                    color: var(--color-text);
                    font-size: 0.95rem;
                }

                .step-actions {
                    margin-top: 3rem; /* Increased top margin for buttons */
                    display: flex;
                    justify-content: space-between;
                    gap: 1rem;
                    border-top: 1px solid #f3f4f6;
                    padding-top: 2rem;
                }

                /* Mobile Optimizations */
                @media (max-width: 640px) {
                    .booking-page {
                        padding-top: 2rem;
                        padding-bottom: 4rem;
                    }
                    .booking-card {
                        padding: 1.5rem;
                        border-radius: 1rem;
                    }
                    .booking-header {
                        margin-bottom: 2rem;
                    }
                    .booking-header h1 {
                        font-size: 2rem;
                    }
                }
                
                /* Keep remaining styles for grid/vehicle cards... */
                /* Vehicle Grid & Cards */
                .vehicles-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 1.5rem;
                    margin-top: 1rem;
                }

                .vehicle-card {
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 1rem;
                    overflow: hidden;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    flex-direction: column;
                }

                .vehicle-card:hover {
                    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                    transform: translateY(-4px);
                }

                .vehicle-card.selected {
                    border: 2px solid var(--color-primary);
                    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
                }

                .vehicle-image-wrapper {
                    position: relative;
                    height: 180px; 
                    width: 100%;
                    background: #f3f4f6;
                    overflow: hidden;
                }

                .vehicle-image-wrapper img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.5s ease;
                }

                .vehicle-card:hover .vehicle-image-wrapper img {
                    transform: scale(1.05); 
                }

                .category-badge {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    padding: 4px 10px;
                    background: rgba(0,0,0,0.75);
                    color: white;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .selected-overlay {
                    position: absolute;
                    inset: 0;
                    background: rgba(37, 99, 235, 0.2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .check-icon {
                    background: var(--color-primary);
                    color: white;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.2rem;
                    font-weight: bold;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.2);
                }

                .vehicle-details {
                    padding: 1.25rem;
                    flex-grow: 1;
                    display: flex;
                    flex-direction: column;
                }

                .vehicle-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.5rem;
                }

                .vehicle-header h4 {
                    font-size: 1.1rem;
                    font-weight: 700;
                    margin: 0;
                    color: var(--color-text);
                }

                .vehicle-price {
                    color: var(--color-primary);
                    font-weight: 800;
                    font-size: 1.1rem;
                }
                
                .vehicle-price small {
                    font-size: 0.8rem;
                    font-weight: 500;
                    color: var(--color-text-muted);
                }

                .vehicle-sub {
                    color: var(--color-text-muted);
                    font-size: 0.85rem;
                    margin-bottom: 1rem;
                }

                .vehicle-features {
                    display: flex;
                    gap: 1rem;
                    margin-top: auto;
                    font-size: 0.85rem;
                    color: #4b5563;
                }

                /* Review Section */
                .review-summary {
                    display: grid;
                    gap: 1rem;
                }

                .review-item {
                    background: #f9fafb;
                    padding: 1rem;
                    border-radius: 0.5rem;
                    border: 1px solid #e5e7eb;
                }
                
                .review-item h4 {
                    font-size: 0.9rem;
                    text-transform: uppercase;
                    color: var(--color-text-muted);
                    margin-bottom: 0.5rem;
                }

                .review-item p {
                    margin: 0.25rem 0;
                    font-weight: 500;
                }

                .review-vehicle-flex {
                    display: flex;
                    gap: 1rem;
                    align-items: center;
                }

                .review-thumb {
                    width: 80px;
                    height: 60px;
                    object-fit: cover;
                    border-radius: 0.25rem;
                }

                .price-estimate-box {
                    margin-top: 1.5rem;
                    background: #ecfdf5; 
                    border: 1px solid #10b981;
                    padding: 1.25rem;
                    border-radius: 0.5rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .price-value {
                    font-size: 1.5rem;
                    font-weight: 800;
                    color: #047857;
                }

                /* Success State */
                .booking-success-card {
                    text-align: center;
                    max-width: 500px;
                    margin: 2rem auto;
                    background: white;
                    padding: 3rem 2rem;
                    border-radius: 1.5rem;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.1);
                }

                .success-icon {
                    font-size: 4rem;
                    margin-bottom: 1rem;
                }

                /* Animations */
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .fade-in {
                    animation: fadeIn 0.4s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default Booking;
