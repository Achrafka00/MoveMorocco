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
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        pickup_location: calculatorData.originCity?.name || '',
        dropoff_location: calculatorData.destinationCity?.name || '',
        pickup_date: '',
        pickup_time: '',
        passengers: 1,
        category_id: calculatorData.categoryId || '',
        vehicle_id: null,
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [estimatedPrice, setEstimatedPrice] = useState(calculatorData.estimatedPrice || null);

    useEffect(() => {
        fetchCategories();
        fetchVehicles();

        // If coming from price calculator, show notification
        if (calculatorData.originCity && calculatorData.destinationCity) {
            toast.success(`✅ Trip details pre-filled: ${calculatorData.originCity.name} → ${calculatorData.destinationCity.name}`);
        }
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/vehicle-categories');
            const data = await response.json();
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('Failed to load categories');
        }
    };

    const fetchVehicles = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/vehicles?available=true');
            const data = await response.json();
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
        });
        toast.success(`${vehicle.name} selected!`);
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
        if (step === 3 && (!formData.name || !formData.email || !formData.phone)) {
            toast.warning('Please fill in your contact information');
            return;
        }
        setStep(step + 1);
    };

    const prevStep = () => setStep(step - 1);

    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <span key={i} className={`star ${i <= rating ? 'filled' : ''}`}>★</span>
            );
        }
        return stars;
    };

    const handleSubmit = async () => {
        try {
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
        }
    };

    return (
        <div className="booking-page section container">
            <h1 className="text-center mb-8">Book Your Trip</h1>

            {submitted ? (
                <div className="booking-wizard card text-center">
                    <h2 style={{ color: 'var(--color-primary)', marginBottom: '1rem' }}>✅ Booking Submitted!</h2>
                    <p style={{ marginBottom: '2rem' }}>Thank you, {formData.full_name}! We've received your booking request.</p>
                    <p style={{ marginBottom: '2rem' }}>Our team will contact you shortly to confirm your trip from <strong>{formData.pickup_location}</strong> to <strong>{formData.dropoff_location}</strong> on <strong>{formData.pickup_date}</strong>.</p>
                    <p style={{ marginBottom: '2rem' }}>For immediate assistance, contact us on WhatsApp:</p>
                    <WhatsAppButton
                        message={`Hello! I just submitted a booking for ${formData.pickup_location} to ${formData.dropoff_location} on ${formData.pickup_date}. My name is ${formData.full_name}.`}
                    />
                </div>
            ) : (
                <div className="booking-wizard card">
                    <div className="wizard-progress mb-8">
                        Step {step} of 4
                    </div>

                    {step === 1 && (
                        <div className="step-content">
                            <h3>Trip Details</h3>
                            <div className="form-group">
                                <label>Pickup Date *</label>
                                <input
                                    type="date"
                                    name="pickup_date"
                                    value={formData.pickup_date}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Pickup Time</label>
                                <input
                                    type="time"
                                    name="pickup_time"
                                    value={formData.pickup_time}
                                    onChange={handleChange}
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
                                />
                            </div>
                            <div className="step-actions">
                                <button className="btn btn-primary" onClick={nextStep}>
                                    Next Step →
                                </button>
                            </div>
                        </div>
                    )}
                    {step === 2 && (
                        <div className="step-content">
                            <h3>Select Your Vehicle</h3>

                            <div className="vehicles-grid">
                                {vehicles.length === 0 ? (
                                    <p className="empty-message">No vehicles available at the moment.</p>
                                ) : (
                                    vehicles.map((vehicle) => (
                                        <div
                                            key={vehicle.id}
                                            className={`vehicle-card ${formData.vehicle_id === vehicle.id ? 'selected' : ''}`}
                                            onClick={() => handleVehicleSelect(vehicle)}
                                        >
                                            <div className="vehicle-image">
                                                <img src={vehicle.image_url || 'https://via.placeholder.com/300x200'} alt={vehicle.name} />
                                                <span className={`category-badge category-${vehicle.category.name.toLowerCase()}`}>
                                                    {vehicle.category.name}
                                                </span>
                                            </div>
                                            <div className="vehicle-info">
                                                <h4>{vehicle.name}</h4>
                                                <p className="vehicle-model">{vehicle.model} ({vehicle.year})</p>
                                                <div className="vehicle-specs">
                                                    <span>👥 {vehicle.capacity} passengers</span>
                                                    <span className="price">{vehicle.price_per_km} MAD/km</span>
                                                </div>
                                            </div>
                                            {formData.vehicle_id === vehicle.id && (
                                                <div className="selected-check">✓</div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="step-actions">
                                <button className="btn btn-secondary" onClick={prevStep}>
                                    ← Back
                                </button>
                                <button className="btn btn-primary" onClick={nextStep}>
                                    Continue to Contact Info →
                                </button>
                            </div>
                        </div>
                    )}
                    {step === 3 && (
                        <div className="step-content">
                            <h3>Your Information</h3>

                            <div className="form-group">
                                <label>Full Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Mohammed Ali"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Email *</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="mohammed@email.com"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Phone Number *</label>
                                <input
                                    type="tel"
                                    name="phone_number"
                                    value={formData.phone_number}
                                    onChange={handleChange}
                                    placeholder="+212 600 000 000"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Additional Message</label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    rows="4"
                                    placeholder="Any special requests..."
                                />
                            </div>
                            <div className="step-actions">
                                <button className="btn btn-secondary" onClick={prevStep}>
                                    ← Back
                                </button>
                                <button className="btn btn-primary" onClick={nextStep}>
                                    Review Booking →
                                </button>
                            </div>
                        </div>
                    )}

                    {
                        step === 3 && (
                            <div className="step-content">
                                <h3>Contact Information</h3>
                                <div className="form-group">
                                    <label>Full Name *</label>
                                    <input
                                        type="text"
                                        name="full_name"
                                        value={formData.full_name}
                                        onChange={handleChange}
                                        placeholder="Your full name"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="you@example.com"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Phone Number *</label>
                                    <input
                                        type="tel"
                                        name="phone_number"
                                        value={formData.phone_number}
                                        onChange={handleChange}
                                        placeholder="+212 600 000 000"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Additional Message</label>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        rows="4"
                                        placeholder="Any special requests..."
                                    />
                                </div>
                                <div className="step-actions">
                                    <button className="btn btn-secondary" onClick={prevStep}>
                                        ← Back
                                    </button>
                                    <button className="btn btn-primary" onClick={nextStep}>
                                        Review Booking →
                                    </button>
                                </div>
                            </div>
                        )
                    }

                    {step === 4 && (
                        <div className="step-content">
                            <h3>Review Your Booking</h3>
                            <div className="review-section">
                                <h4>Trip Details</h4>
                                <p><strong>Date:</strong> {formData.pickup_date} {formData.pickup_time && `at ${formData.pickup_time}`}</p>
                                <p><strong>To:</strong> {formData.dropoff_location}</p>
                                <p><strong>Passengers:</strong> {formData.passengers}</p>
                            </div>

                            {formData.vehicle && (
                                <div className="review-section">
                                    <h4>Selected Vehicle</h4>
                                    <div className="selected-vehicle-review">
                                        <img src={formData.vehicle.image_url} alt={formData.vehicle.name} />
                                        <div>
                                            <p><strong>{formData.vehicle.name}</strong></p>
                                            <p>{formData.vehicle.model} ({formData.vehicle.year})</p>
                                            <p>Price: {formData.vehicle.price_per_km} MAD/km</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="review-section">
                                <h4>Contact Information</h4>
                                <p><strong>Name:</strong> {formData.full_name}</p>
                                <p><strong>Email:</strong> {formData.email}</p>
                                <p><strong>Phone:</strong> {formData.phone_number}</p>
                                {formData.message && <p><strong>Message:</strong> {formData.message}</p>}
                            </div>

                            <div className="step-actions">
                                <button className="btn btn-secondary" onClick={prevStep}>
                                    ← Back
                                </button>
                                <button className="btn btn-primary" onClick={handleSubmit}>
                                    Confirm Booking ✓
                                </button>
                            </div>
                        </div>
                    )
                    }
                </div >
            )
            }

            <style>{`
        .booking-wizard {
            max-width: 600px;
            margin: 0 auto;
        }
        .form-group {
            margin-bottom: 1rem;
            display: flex;
            flex-direction: column;
        }
        .form-group label {
            margin-bottom: 0.5rem;
            font-weight: 500;
        }
        .form-group input {
            padding: 0.75rem;
            border: 1px solid var(--color-border);
            border-radius: var(--radius-md);
            font-size: 1rem;
        }
        .actions {
            display: flex;
            gap: 1rem;
            margin-top: 2rem;
        }
        .step-actions button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .category-filter {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .filter-btn {
          padding: 0.75rem 1.5rem;
          border: 2px solid var(--color-border);
          background: white;
          border-radius: var(--radius-full);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .filter-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }

        .filter-btn.active {
          background: var(--color-primary);
          color: white;
          border-color: var(--color-primary);
        }

        .vehicles-selection {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
          max-height: 500px;
          overflow-y: auto;
          padding: 1rem;
        }

        .vehicle-option {
          background: white;
          border: 2px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
        }

        .vehicle-option:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.1);
        }

        .vehicle-option.selected {
          border-color: var(--color-primary);
          background: linear-gradient(135deg, rgba(13, 110, 253, 0.05), rgba(88, 80, 236, 0.05));
        }

        .vehicle-image-small {
          position: relative;
          height: 140px;
          border-radius: var(--radius-md);
          overflow: hidden;
          margin-bottom: 1rem;
        }

        .vehicle-image-small img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .category-tag {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          padding: 0.25rem 0.75rem;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 700;
          color: white;
        }

        .category-tag.category-standard {
          background: #10b981;
        }

        .category-tag.category-vip {
          background: #f59e0b;
        }

        .category-tag.category-vvip {
          background: #dc2626;
        }

        .vehicle-info-booking h4 {
          margin: 0 0 0.25rem 0;
          font-size: 1.125rem;
        }

        .vehicle-model {
          color: var(--color-text-muted);
          font-size: 0.875rem;
          margin: 0 0 0.75rem 0;
        }

        .driver-compact {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
          font-size: 0.875rem;
        }

        .driver-thumb {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          object-fit: cover;
        }

        .vehicle-specs {
          display: flex;
          gap: 1rem;
          font-size: 0.875rem;
          color: var(--color-text-muted);
        }

        .vehicle-specs .price {
          color: var(--color-primary);
          font-weight: 700;
        }

        .selected-check {
          position: absolute;
          top: 0.5rem;
          left: 0.5rem;
          width: 32px;
          height: 32px;
          background: var(--color-primary);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          font-weight: bold;
        }

        .empty-message {
          text-align: center;
          padding: 3rem;
          color: var(--color-text-muted);
        }

        .star {
          color: #d1d5db;
          font-size: 1rem;
        }

        .star.filled {
          color: #fbbf24;
        }

        .review-section {
          background: var(--color-bg);
          padding: 1.5rem;
          border-radius: var(--radius-md);
          margin-bottom: 1.5rem;
        }

        .review-section h4 {
          margin: 0 0 1rem 0;
          color: var(--color-primary);
        }

        .review-section p {
          margin: 0.5rem 0;
        }

        .selected-vehicle-review {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .selected-vehicle-review img {
          width: 120px;
          height: 80px;
          object-fit: cover;
          border-radius: var(--radius-md);
        }

        .form-group label {
          font-weight: 600;
          margin-bottom: 0.5rem;
          display: block;
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          font-size: 1rem;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.1);
        }
      `}</style>
        </div >
    );
};
export default Booking;
