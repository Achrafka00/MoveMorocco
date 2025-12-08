import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setUserDropdownOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">🚗</span>
          <span className="brand-text">MoveMorocco</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="navbar-links desktop-only">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/catalogue" className="nav-link">Vehicles</Link>
          <Link to="/booking" className="nav-link">Book Now</Link>

          {user?.role === 'admin' && (
            <Link to="/admin" className="nav-link admin-link">
              <span className="link-icon">⚙️</span>
              Admin
            </Link>
          )}

          {user?.role === 'partner' && (
            <Link to="/partner-dashboard" className="nav-link partner-link">
              <span className="link-icon">📊</span>
              Dashboard
            </Link>
          )}
        </div>

        {/* User Actions */}
        <div className="navbar-actions desktop-only">
          {user ? (
            <div className="user-menu">
              <button
                className="user-button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              >
                <div className="user-avatar">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="user-info">
                  <span className="user-name">{user.name}</span>
                  <span className="user-role">{user.role}</span>
                </div>
                <span className="dropdown-arrow">▼</span>
              </button>

              {userDropdownOpen && (
                <>
                  <div className="dropdown-backdrop" onClick={() => setUserDropdownOpen(false)}></div>
                  <div className="user-dropdown">
                    <div className="dropdown-header">
                      <strong>{user.name}</strong>
                      <small>{user.email}</small>
                    </div>
                    <div className="dropdown-divider"></div>
                    {user.role === 'partner' && (
                      <Link
                        to="/partner-dashboard"
                        className="dropdown-item"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <span>📊</span> Dashboard
                      </Link>
                    )}
                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        className="dropdown-item"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <span>⚙️</span> Admin Panel
                      </Link>
                    )}
                    <div className="dropdown-divider"></div>
                    <button className="dropdown-item logout" onClick={handleLogout}>
                      <span>🚪</span> Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-outline">Login</Link>
              <Link to="/partner/register" className="btn btn-primary">
                Become a Partner
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-button"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className={menuOpen ? 'hamburger open' : 'hamburger'}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mobile-menu">
          <div className="mobile-menu-content">
            {user && (
              <div className="mobile-user-info">
                <div className="user-avatar large">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <strong>{user.name}</strong>
                  <small>{user.role}</small>
                </div>
              </div>
            )}

            <div className="mobile-links">
              <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
              <Link to="/catalogue" onClick={() => setMenuOpen(false)}>Vehicles</Link>
              <Link to="/booking" onClick={() => setMenuOpen(false)}>Book Now</Link>

              {user?.role === 'admin' && (
                <Link to="/admin" onClick={() => setMenuOpen(false)}>
                  ⚙️ Admin Panel
                </Link>
              )}

              {user?.role === 'partner' && (
                <Link to="/partner-dashboard" onClick={() => setMenuOpen(false)}>
                  📊 Partner Dashboard
                </Link>
              )}
            </div>

            <div className="mobile-actions">
              {user ? (
                <button className="btn btn-outline full-width" onClick={handleLogout}>
                  Logout
                </button>
              ) : (
                <>
                  <Link to="/login" className="btn btn-outline full-width" onClick={() => setMenuOpen(false)}>
                    Login
                  </Link>
                  <Link to="/partner/register" className="btn btn-primary full-width" onClick={() => setMenuOpen(false)}>
                    Become a Partner
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
                .navbar {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    background: rgba(255, 255, 255, 0.98);
                    backdrop-filter: blur(10px);
                    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
                    z-index: 1000;
                }

                .navbar-container {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 0.75rem 2rem;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 2rem;
                }

                .navbar-brand {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    text-decoration: none;
                    color: var(--color-text);
                    font-weight: 700;
                    font-size: 1.5rem;
                    transition: transform 0.2s;
                }

                .navbar-brand:hover {
                    transform: scale(1.05);
                }

                .brand-icon {
                    font-size: 2rem;
                }

                .brand-text {
                    background: linear-gradient(135deg, #0d6efd, #5850ec);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .navbar-links {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                    flex: 1;
                    justify-content: center;
                }

                .nav-link {
                    text-decoration: none;
                    color: var(--color-text);
                    font-weight: 500;
                    font-size: 0.9375rem;
                    padding: 0.5rem 1rem;
                    border-radius: var(--radius-md);
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    white-space: nowrap;
                }

                .nav-link:hover {
                    background: var(--color-bg);
                    color: var(--color-primary);
                }

                .nav-link.admin-link {
                    color: #dc3545;
                }

                .nav-link.partner-link {
                    color: #5850ec;
                }

                .link-icon {
                    font-size: 1.125rem;
                }

                .navbar-actions {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .auth-buttons {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .user-menu {
                    position: relative;
                }

                .user-button {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.5rem 1rem 0.5rem 0.5rem;
                    background: white;
                    border: 2px solid var(--color-border);
                    border-radius: var(--radius-full);
                    cursor: pointer;
                    transition: all 0.2s;
                    min-width: 180px;
                }

                .user-button:hover {
                    border-color: var(--color-primary);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                }

                .user-avatar {
                    width: 36px;
                    height: 36px;
                    min-width: 36px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #0d6efd, #5850ec);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    font-size: 1rem;
                }

                .user-avatar.large {
                    width: 60px;
                    height: 60px;
                    min-width: 60px;
                    font-size: 1.75rem;
                }

                .user-info {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 0.125rem;
                    flex: 1;
                    min-width: 0;
                }

                .user-name {
                    font-weight: 600;
                    font-size: 0.875rem;
                    color: var(--color-text);
                    line-height: 1.2;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    width: 100%;
                }

                .user-role {
                    font-size: 0.75rem;
                    color: var(--color-text-muted);
                    text-transform: capitalize;
                    line-height: 1.2;
                    white-space: nowrap;
                }

                .dropdown-arrow {
                    font-size: 0.625rem;
                    color: var(--color-text-muted);
                    transition: transform 0.2s;
                    margin-left: 0.25rem;
                }

                .user-button:hover .dropdown-arrow {
                    transform: translateY(2px);
                }

                .dropdown-backdrop {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 999;
                }

                .user-dropdown {
                    position: absolute;
                    top: calc(100% + 0.5rem);
                    right: 0;
                    background: white;
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-lg);
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
                    min-width: 240px;
                    overflow: hidden;
                    animation: slideDown 0.2s ease-out;
                    z-index: 1000;
                }

                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .dropdown-header {
                    padding: 1rem;
                    background: var(--color-bg);
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                }

                .dropdown-header strong {
                    font-size: 0.875rem;
                    color: var(--color-text);
                }

                .dropdown-header small {
                    font-size: 0.75rem;
                    color: var(--color-text-muted);
                    word-break: break-all;
                }

                .dropdown-divider {
                    height: 1px;
                    background: var(--color-border);
                }

                .dropdown-item {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.75rem 1rem;
                    color: var(--color-text);
                    text-decoration: none;
                    background: none;
                    border: none;
                    width: 100%;
                    text-align: left;
                    cursor: pointer;
                    transition: background 0.2s;
                    font-size: 0.875rem;
                }

                .dropdown-item:hover {
                    background: var(--color-bg);
                }

                .dropdown-item.logout {
                    color: #dc3545;
                }

                .dropdown-item.logout:hover {
                    background: #fee2e2;
                }

                .mobile-menu-button {
                    display: none;
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 0.5rem;
                }

                .hamburger {
                    width: 24px;
                    height: 18px;
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                }

                .hamburger span {
                    width: 100%;
                    height: 2px;
                    background: var(--color-text);
                    border-radius: 2px;
                    transition: all 0.3s;
                }

                .hamburger.open span:nth-child(1) {
                    transform: rotate(45deg) translateY(8px);
                }

                .hamburger.open span:nth-child(2) {
                    opacity: 0;
                }

                .hamburger.open span:nth-child(3) {
                    transform: rotate(-45deg) translateY(-8px);
                }

                .mobile-menu {
                    display: none;
                    background: white;
                    border-top: 1px solid var(--color-border);
                    animation: slideDown 0.2s ease-out;
                }

                .mobile-menu-content {
                    padding: 1.5rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .mobile-user-info {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1rem;
                    background: var(--color-bg);
                    border-radius: var(--radius-lg);
                }

                .mobile-user-info strong {
                    display: block;
                    margin-bottom: 0.25rem;
                }

                .mobile-user-info small {
                    color: var(--color-text-muted);
                    text-transform: capitalize;
                }

                .mobile-links {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .mobile-links a {
                    padding: 0.75rem 1rem;
                    text-decoration: none;
                    color: var(--color-text);
                    border-radius: var(--radius-md);
                    transition: background 0.2s;
                    font-weight: 500;
                }

                .mobile-links a:hover {
                    background: var(--color-bg);
                }

                .mobile-actions {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                    padding-top: 1rem;
                    border-top: 1px solid var(--color-border);
                }

                .full-width {
                    width: 100%;
                }

                .desktop-only {
                    display: flex;
                }

                @media (max-width: 968px) {
                    .desktop-only {
                        display: none;
                    }

                    .mobile-menu-button {
                        display: block;
                    }

                    .mobile-menu {
                        display: block;
                    }

                    .navbar-container {
                        padding: 0.75rem 1.5rem;
                    }
                }

                @media (max-width: 640px) {
                    .brand-text {
                        display: none;
                    }

                    .navbar-container {
                        padding: 0.75rem 1rem;
                    }
                }
            `}</style>
    </nav>
  );
};

export default Navbar;
