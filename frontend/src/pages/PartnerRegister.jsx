import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Car, CheckCircle, ArrowLeft, ArrowRight, User } from 'lucide-react';

const PartnerRegister = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        // User account
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        // Partner info
        phone: '',
        type: 'individual',
        company_name: '',
        description: '',
        vehicle_type: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleNext = (e) => {
        e.preventDefault();
        if (step === 1) {
            if (!formData.name || !formData.email || !formData.password) {
                toast.error('Please fill all required fields');
                return;
            }
            if (formData.password !== formData.password_confirmation) {
                toast.error('Passwords do not match');
                return;
            }
            setStep(2);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Register user
        const result = await register(
            formData.name,
            formData.email,
            formData.password,
            formData.password_confirmation,
            'partner'
        );

        if (result.success) {
            // Create partner profile
            try {
                const response = await fetch('http://127.0.0.1:8000/api/partner/profile', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${result.token || localStorage.getItem('token')}`,
                    },
                    body: JSON.stringify({
                        phone: formData.phone,
                        type: formData.type,
                        company_name: formData.type === 'company' ? formData.company_name : null,
                        description: formData.description,
                        vehicle_type: formData.vehicle_type,
                    }),
                });

                const data = await response.json();

                if (response.ok) {
                    toast.success('Partner profile created! Waiting for approval.');
                    navigate('/partner-dashboard');
                } else {
                    toast.error(data.message || 'Partner profile creation failed');
                    setError(data.message || 'Partner profile creation failed');
                }
            } catch (err) {
                toast.error('Network error');
                setError('Network error');
            }
        } else {
            toast.error(result.error || 'Registration failed');
            setError(result.error);
        }

        setLoading(false);
    };

    return (
        <div className="partner-register-page">
            <div className="register-container">
                <div className="register-card">
                    <h1 className="flex items-center gap-2 mb-2"><Car size={32} className="text-primary-600" /> Become a Partner</h1>
                    <p className="subtitle">
                        {step === 1 ? 'Create your account' : 'Complete your profile'}
                    </p>

                    {/* Progress indicator */}
                    <div className="progress-steps">
                        <div className={`step ${step >= 1 ? 'active' : ''}`}>1. Account</div>
                        <div className={`step ${step >= 2 ? 'active' : ''}`}>2. Partner Info</div>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    {step === 1 ? (
                        <form onSubmit={handleNext}>
                            <div className="form-group">
                                <label>Full Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="Your full name"
                                />
                            </div>

                            <div className="form-group">
                                <label>Email *</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="you@example.com"
                                />
                            </div>

                            <div className="form-group">
                                <label>Password *</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    minLength="6"
                                    placeholder="••••••••"
                                />
                            </div>

                            <div className="form-group">
                                <label>Confirm Password *</label>
                                <input
                                    type="password"
                                    name="password_confirmation"
                                    value={formData.password_confirmation}
                                    onChange={handleChange}
                                    required
                                    placeholder="••••••••"
                                />
                            </div>

                            <button type="submit" className="btn btn-primary btn-block flex items-center justify-center gap-2">
                                Next Step <ArrowRight size={16} />
                            </button>

                            <div className="toggle-form">
                                Already have an account?
                                <button type="button" onClick={() => navigate('/login')} className="link-button">
                                    Login
                                </button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Partner Type *</label>
                                <div className="radio-group">
                                    <label className="radio-label">
                                        <input
                                            type="radio"
                                            name="type"
                                            value="individual"
                                            checked={formData.type === 'individual'}
                                            onChange={handleChange}
                                        />
                                        <span>Individual Driver</span>
                                        <small>I am a single driver with my own vehicle(s)</small>
                                    </label>
                                    <label className="radio-label">
                                        <input
                                            type="radio"
                                            name="type"
                                            value="company"
                                            checked={formData.type === 'company'}
                                            onChange={handleChange}
                                        />
                                        <span>Company/Agency</span>
                                        <small>I manage multiple drivers and vehicles</small>
                                    </label>
                                </div>
                            </div>

                            {formData.type === 'company' && (
                                <div className="form-group">
                                    <label>Company Name *</label>
                                    <input
                                        type="text"
                                        name="company_name"
                                        value={formData.company_name}
                                        onChange={handleChange}
                                        required={formData.type === 'company'}
                                        placeholder="Your company name"
                                    />
                                </div>
                            )}

                            <div className="form-group">
                                <label>Phone Number *</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    placeholder="+212 600 000 000"
                                />
                            </div>

                            <div className="form-group">
                                <label>Vehicle Type</label>
                                <input
                                    type="text"
                                    name="vehicle_type"
                                    value={formData.vehicle_type}
                                    onChange={handleChange}
                                    placeholder="e.g., Sedan, SUV, Van"
                                />
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="4"
                                    placeholder="Tell us about your services..."
                                />
                            </div>

                            <div className="form-actions">
                                <button type="button" onClick={() => setStep(1)} className="btn btn-secondary flex items-center justify-center gap-2">
                                    <ArrowLeft size={16} /> Back
                                </button>
                                <button type="submit" className="btn btn-primary flex items-center justify-center gap-2" disabled={loading}>
                                    {loading ? 'Creating...' : 'Complete Registration'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            <style>{`
        .partner-register-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #0d6efd 0%, #5850ec 100%);
          padding: 2rem;
        }

        .register-container {
          width: 100%;
          max-width: 600px;
        }

        .register-card {
          background: white;
          padding: 3rem;
          border-radius: var(--radius-lg);
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }

        .register-card h1 {
          margin: 0 0 0.5rem 0;
          color: var(--color-text);
        }

        .subtitle {
          color: var(--color-text-muted);
          margin-bottom: 2rem;
        }

        .progress-steps {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .progress-steps .step {
          flex: 1;
          padding: 0.75rem;
          background: var(--color-bg);
          border-radius: var(--radius-md);
          text-align: center;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--color-text-muted);
        }

        .progress-steps .step.active {
          background: linear-gradient(135deg, #0d6efd, #5850ec);
          color: white;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: var(--color-text);
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          font-size: 1rem;
        }

        .form-group textarea {
          resize: vertical;
        }

        .radio-group {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .radio-label {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 1rem;
          border: 2px solid var(--color-border);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .radio-label:hover {
          border-color: var(--color-primary);
        }

        .radio-label input[type="radio"] {
          width: auto;
          margin-top: 0.25rem;
        }

        .radio-label input[type="radio"]:checked ~ span {
          color: var(--color-primary);
          font-weight: 700;
        }

        .radio-label span {
          font-weight: 600;
        }

        .radio-label small {
          display: block;
          color: var(--color-text-muted);
          margin-top: 0.25rem;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }

        .form-actions .btn {
          flex: 1;
        }

        .btn-block {
          width: 100%;
        }

        .error-message {
          background-color: #fee2e2;
          color: #dc2626;
          padding: 0.75rem;
          border-radius: var(--radius-md);
          margin-bottom: 1rem;
        }

        .toggle-form {
          text-align: center;
          margin-top: 1.5rem;
          color: var(--color-text-muted);
        }

        .link-button {
          background: none;
          border: none;
          color: var(--color-primary);
          font-weight: 600;
          cursor: pointer;
          text-decoration: underline;
          margin-left: 0.5rem;
        }
      `}</style>
        </div>
    );
};

export default PartnerRegister;
