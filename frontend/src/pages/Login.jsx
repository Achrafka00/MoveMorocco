import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'customer'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        let result;
        if (isLogin) {
            result = await login(formData.email, formData.password);
        } else {
            if (formData.password !== formData.password_confirmation) {
                setError('Passwords do not match');
                setLoading(false);
                return;
            }
            result = await register(
                formData.name,
                formData.email,
                formData.password,
                formData.password_confirmation,
                formData.role
            );
        }

        setLoading(false);

        if (result.success) {
            // Redirect based on role
            if (result.user.role === 'admin') {
                navigate('/admin');
            } else if (result.user.role === 'partner') {
                navigate('/partner-dashboard');
            } else {
                navigate('/');
            }
        } else {
            setError(result.error);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-card">
                    <h1>{isLogin ? 'Login' : 'Register'}</h1>
                    <p className="subtitle">
                        {isLogin ? 'Welcome back to MoveMorocco' : 'Create your MoveMorocco account'}
                    </p>

                    {error && <div className="error-message">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        {!isLogin && (
                            <div className="form-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter your name"
                                />
                            </div>
                        )}

                        <div className="form-group">
                            <label>Email</label>
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
                            <label>Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                placeholder="••••••••"
                                minLength="6"
                            />
                        </div>

                        {!isLogin && (
                            <>
                                <div className="form-group">
                                    <label>Confirm Password</label>
                                    <input
                                        type="password"
                                        name="password_confirmation"
                                        value={formData.password_confirmation}
                                        onChange={handleChange}
                                        required
                                        placeholder="••••••••"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>I am a...</label>
                                    <select name="role" value={formData.role} onChange={handleChange}>
                                        <option value="customer">Customer</option>
                                        <option value="partner">Partner (Driver/Agency)</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                            </>
                        )}

                        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                            {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Register')}
                        </button>
                    </form>

                    <div className="toggle-form">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button onClick={() => setIsLogin(!isLogin)} className="link-button">
                            {isLogin ? 'Register' : 'Login'}
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-primary) 100%);
          padding: 2rem;
        }

        .login-container {
          width: 100%;
          max-width: 450px;
        }

        .login-card {
          background: white;
          padding: 3rem;
          border-radius: var(--radius-lg);
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }

        .login-card h1 {
          margin: 0 0 0.5rem 0;
          color: var(--color-text);
        }

        .subtitle {
          color: var(--color-text-muted);
          margin-bottom: 2rem;
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
        .form-group select {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          font-size: 1rem;
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: var(--color-primary);
        }

        .btn-block {
          width: 100%;
          margin-top: 1rem;
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
        }

        .link-button:hover {
          color: var(--color-primary-dark);
        }
      `}</style>
        </div>
    );
};

export default Login;
