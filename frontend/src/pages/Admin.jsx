import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Admin = () => {
    const { token } = useAuth();
    const toast = useToast();

    const [stats, setStats] = useState({
        monthly_revenue: 0,
        monthly_commission: 0,
        unpaid_commissions: 0,
        total_rides: 0,
        total_bookings: 0,
        total_partners: 0,
        total_vehicles: 0,
        pending_partners: 0,
        pending_vehicles: 0,
        top_partner: null,
        recent_bookings: []
    });
    const [partners, setPartners] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');
    const [viewMode, setViewMode] = useState('month'); // 'month' or 'year'

    // Partner Edit State
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedPartner, setSelectedPartner] = useState(null);

    // Booking Edit State
    const [showBookingEditModal, setShowBookingEditModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);

    // Creative Alert State
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAllData();
    }, []);

    // Re-fetch stats when viewMode changes (skip initial load to prevent double fetch)
    useEffect(() => {
        if (!loading) fetchStats(viewMode);
    }, [viewMode]);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchStats(viewMode),
                fetchPartners(),
                fetchVehicles()
            ]);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async (period = viewMode) => {
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/admin/stats?period=${period}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const fetchPartners = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/admin/partners', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            if (response.ok) {
                const data = await response.json();
                setPartners(data);
            }
        } catch (error) {
            console.error('Error fetching partners:', error);
        }
    };

    const fetchVehicles = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/admin/vehicles', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            if (response.ok) {
                const data = await response.json();
                setVehicles(data);
            }
        } catch (error) {
            console.error('Error fetching vehicles:', error);
        }
    };

    const handleEditPartner = (partner) => {
        setSelectedPartner({ ...partner });
        setShowEditModal(true);
    };

    const handleUpdatePartner = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/admin/partners/${selectedPartner.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(selectedPartner)
            });

            if (response.ok) {
                toast.success('Partner updated successfully');
                setShowEditModal(false);
                fetchPartners();
            } else {
                const error = await response.json();
                toast.error(error.message || 'Failed to update partner');
            }
        } catch (error) {
            toast.error('Network error');
        }
    };

    const handleAdminFileUpload = async (e, partnerId) => {
        const file = e.target.files[0];
        if (!file) return;

        // 1MB Validation
        if (file.size > 1024 * 1024) {
            toast.error('File size exceeds 1MB limit');
            return;
        }

        const formData = new FormData();
        formData.append('avatar', file);

        const toastId = toast.loading('Uploading avatar...');

        try {
            const response = await fetch(`http://127.0.0.1:8000/api/admin/partners/${partnerId}/upload-avatar`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json' // Do not set Content-Type for FormData, browser sets it with boundary
                },
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                toast.dismiss(toastId);
                toast.success('Avatar uploaded successfully!');

                // Update local state immediately
                setSelectedPartner(prev => ({ ...prev, avatar_url: data.avatar_url }));

                // Also update the partners list
                setPartners(prevPartners => prevPartners.map(p =>
                    p.id === partnerId ? { ...p, avatar_url: data.avatar_url } : p
                ));
            } else {
                toast.dismiss(toastId);
                toast.error(data.message || 'Upload failed');
            }
        } catch (error) {
            toast.dismiss(toastId);
            toast.error('Network error during upload');
        }
    };

    const handleDeletePartner = async (id) => {
        if (!confirm('⚠️ Delete partner and ALL associated data?\n\nThis will delete:\n- Partner account\n- All vehicles\n- All drivers\n- User account\n\nThis cannot be undone!')) return;

        try {
            const response = await fetch(`http://127.0.0.1:8000/api/admin/partners/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                toast.success('Partner deleted successfully');
                fetchAllData();
            } else {
                toast.error('Failed to delete partner');
            }
        } catch (error) {
            toast.error('Network error');
        }
    };

    const handleApprovePartner = async (id) => {
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/admin/partners/${id}/approve`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                toast.success('Partner approved successfully');
                fetchAllData();
            } else {
                toast.error('Failed to approve partner');
            }
        } catch (error) {
            toast.error('Network error');
        }
    };

    const handleApproveVehicle = async (id) => {
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/admin/vehicles/${id}/approve`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                toast.success('✅ Vehicle approved successfully');
                fetchAllData();
            } else {
                toast.error('Failed to approve vehicle');
            }
        } catch (error) {
            toast.error('Network error');
        }
    };

    const handleUpdateBookingStatus = async (id, newStatus) => {
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/admin/bookings/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                toast.success(`Booking #${id} status updated to ${newStatus}`);
                fetchStats(viewMode); // Refresh list
            } else {
                toast.error('Failed to update booking status');
            }
        } catch (error) {
            toast.error('Network error');
        }
    };

    // --- Booking Management Handlers ---

    const handleEditBooking = (booking) => {
        const formattedBooking = {
            ...booking,
            time: booking.time ? booking.time.substring(0, 5) : ''
        };
        setSelectedBooking(formattedBooking);
        setShowBookingEditModal(true);
    };

    const handleUpdateBooking = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/admin/bookings/${selectedBooking.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(selectedBooking)
            });

            if (response.ok) {
                toast.success('✨ Booking info updated successfully!');
                setShowBookingEditModal(false);
                fetchStats(viewMode);
            } else {
                const error = await response.json();
                toast.error(error.message || 'Failed to update booking');
            }
        } catch (error) {
            toast.error('Network error');
        }
    };

    const handleDeleteBooking = (booking) => {
        setDeleteTarget(booking);
        setShowDeleteAlert(true);
    };

    const performDeleteBooking = async (id) => {
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/admin/bookings/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                setShowDeleteAlert(false);
                toast.success('🗑️ Booking deleted permanently.');
                fetchStats(viewMode);
            } else {
                toast.error('Failed to delete booking');
            }
        } catch (error) {
            toast.error('Network error');
        }
    };


    const filteredPartners = partners.filter(p =>
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.company_name && p.company_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const pendingVehicles = vehicles.filter(v => !v.is_approved);
    const pendingPartners = partners.filter(p => !p.is_approved);

    if (loading) {
        return <div className="admin-loading">Loading dashboard...</div>;
    }

    return (
        <div className="admin-dashboard">
            <div className="container">
                <div className="dashboard-header">
                    <div>
                        <h1>⚙️ Admin Dashboard</h1>
                        <p>Comprehensive system overview and management</p>
                    </div>
                    <button onClick={() => fetchAllData()} className="btn btn-outline">
                        🔄 Refresh
                    </button>
                </div>

                {/* Commission Tracker Section */}
                <div className="commission-tracker">
                    <div className="section-header-flex">
                        <h2>💰 Commission Tracker ({viewMode === 'year' ? 'This Year' : 'This Month'})</h2>
                        <div className="toggle-group">
                            <button
                                className={`toggle-btn ${viewMode === 'month' ? 'active' : ''}`}
                                onClick={() => setViewMode('month')}
                            >
                                This Month
                            </button>
                            <button
                                className={`toggle-btn ${viewMode === 'year' ? 'active' : ''}`}
                                onClick={() => setViewMode('year')}
                            >
                                Whole Year
                            </button>
                        </div>
                    </div>

                    <div className="stats-grid">
                        <div className="stat-card primary">
                            <div className="stat-icon">💵</div>
                            <div className="stat-content">
                                <h3>Total Revenue</h3>
                                <p className="stat-number">{stats.monthly_revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })} MAD</p>
                                <small>From {stats.total_rides} rides</small>
                            </div>
                        </div>
                        <div className="stat-card success">
                            <div className="stat-icon">📈</div>
                            <div className="stat-content">
                                <h3>Commission Earned</h3>
                                <p className="stat-number">{stats.monthly_commission.toLocaleString('en-US', { minimumFractionDigits: 2 })} MAD</p>
                                <small>10% commission rate</small>
                            </div>
                        </div>
                        <div className="stat-card warning">
                            <div className="stat-icon">⏳</div>
                            <div className="stat-content">
                                <h3>Unpaid Commissions</h3>
                                <p className="stat-number">{stats.unpaid_commissions.toLocaleString('en-US', { minimumFractionDigits: 2 })} MAD</p>
                                <small>Awaiting payment</small>
                            </div>
                        </div>
                        <div className="stat-card info">
                            <div className="stat-icon">🏆</div>
                            <div className="stat-content">
                                <h3>Top Partner</h3>
                                <p className="stat-name">
                                    {stats.top_partner ? (stats.top_partner.company_name || stats.top_partner.name) : 'N/A'}
                                </p>
                                <small>{stats.top_partner?.bookings_count || 0} bookings</small>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="quick-stats">
                    <div className="stat-item">
                        <span className="stat-label">📊 Total Bookings</span>
                        <span className="stat-value">{stats.total_bookings}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">🚗 Total Vehicles</span>
                        <span className="stat-value">{stats.total_vehicles}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">👥 Total Partners</span>
                        <span className="stat-value">{stats.total_partners}</span>
                    </div>
                    <div className="stat-item highlight">
                        <span className="stat-label">⚠️ Pending Approvals</span>
                        <span className="stat-value">{stats.pending_partners + stats.pending_vehicles}</span>
                    </div>
                </div>

                {/* Tabs */}
                <div className="tabs">
                    <button
                        className={activeTab === 'overview' ? 'active' : ''}
                        onClick={() => setActiveTab('overview')}
                    >
                        📊 Overview
                    </button>
                    <button
                        className={activeTab === 'partners' ? 'active' : ''}
                        onClick={() => setActiveTab('partners')}
                    >
                        👥 Partners ({partners.length})
                    </button>
                    <button
                        className={activeTab === 'bookings' ? 'active' : ''}
                        onClick={() => setActiveTab('bookings')}
                    >
                        📅 Bookings ({stats.total_bookings})
                    </button>
                    <button
                        className={activeTab === 'approvals' ? 'active' : ''}
                        onClick={() => setActiveTab('approvals')}
                    >
                        ⏳ Pending Approvals ({pendingVehicles.length + pendingPartners.length})
                    </button>
                </div>

                {/* Tab Content */}
                <div className="tab-content">
                    {activeTab === 'overview' && (
                        <div className="overview-section">
                            <h2>Recent Bookings</h2>
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Customer</th>
                                            <th>Date</th>
                                            <th>Route</th>
                                            <th>Passengers</th>
                                            <th>Price</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.recent_bookings.slice(0, 10).map(booking => (
                                            <tr key={booking.id}>
                                                <td>#{booking.id}</td>
                                                <td>{booking.name}</td>
                                                <td>{booking.date}</td>
                                                <td>{booking.pickup} → {booking.dropoff}</td>
                                                <td>{booking.passengers}</td>
                                                <td>{booking.price} MAD</td>
                                                <td>
                                                    <span className={`status status-${booking.status}`}>
                                                        {booking.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {stats.recent_bookings.length === 0 && (
                                    <p className="empty-state">No bookings yet</p>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'partners' && (
                        <div className="partners-section">
                            <div className="section-header">
                                <h2>Partner Management</h2>
                                <input
                                    type="search"
                                    placeholder="🔍 Search partners..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="search-input"
                                />
                            </div>

                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Name</th>
                                            <th>Type</th>
                                            <th>Phone</th>
                                            <th>Vehicles</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredPartners.map(partner => (
                                            <tr key={partner.id}>
                                                <td>#{partner.id}</td>
                                                <td>
                                                    <div className="partner-info">
                                                        <strong>{partner.name}</strong>
                                                        {partner.company_name && (
                                                            <small>{partner.company_name}</small>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="badge">{partner.type || 'individual'}</span>
                                                </td>
                                                <td>{partner.phone}</td>
                                                <td>{partner.vehicles?.length || 0}</td>
                                                <td>
                                                    {partner.is_approved ? (
                                                        <span className="status status-approved">✓ Approved</span>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleApprovePartner(partner.id)}
                                                            className="btn-mini btn-success"
                                                        >
                                                            ✓ Approve
                                                        </button>
                                                    )}
                                                </td>
                                                <td>
                                                    <div className="action-buttons">
                                                        <button
                                                            onClick={() => handleEditPartner(partner)}
                                                            className="btn-icon"
                                                            title="Edit"
                                                        >
                                                            ✏️
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeletePartner(partner.id)}
                                                            className="btn-icon btn-danger"
                                                            title="Delete"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {filteredPartners.length === 0 && (
                                    <p className="empty-state">No partners found</p>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'bookings' && (
                        <div className="bookings-section">
                            <div className="section-header">
                                <h2>Booking Management</h2>
                            </div>

                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Customer</th>
                                            <th>Contact</th>
                                            <th>Route</th>
                                            <th>Date & Time</th>
                                            <th>Passengers</th>
                                            <th>Price</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.recent_bookings.map(booking => (
                                            <tr key={booking.id}>
                                                <td>#{booking.id}</td>
                                                <td>{booking.name}</td>
                                                <td>
                                                    <div style={{ fontSize: '0.875rem' }}>
                                                        <div>{booking.email}</div>
                                                        <div>{booking.phone}</div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <strong>{booking.pickup}</strong>
                                                    <br />↓<br />
                                                    <strong>{booking.dropoff}</strong>
                                                </td>
                                                <td>
                                                    <div>{booking.date}</div>
                                                    <div>{booking.time}</div>
                                                </td>
                                                <td>{booking.passengers}</td>
                                                <td><strong>{booking.price} MAD</strong></td>
                                                <td>
                                                    <select
                                                        value={booking.status}
                                                        onChange={(e) => handleUpdateBookingStatus(booking.id, e.target.value)}
                                                        className="status-select"
                                                    >
                                                        <option value="pending">⏳ Pending</option>
                                                        <option value="confirmed">✅ Confirmed</option>
                                                        <option value="completed">🎉 Completed</option>
                                                        <option value="cancelled">❌ Cancelled</option>
                                                    </select>
                                                </td>
                                                <td>
                                                    <div className="action-buttons">
                                                        {booking.message && (
                                                            <button
                                                                className="btn-icon"
                                                                title={booking.message}
                                                            >
                                                                💬
                                                            </button>
                                                        )}
                                                        <button
                                                            className="btn-icon"
                                                            title="Edit Info"
                                                            onClick={() => handleEditBooking(booking)}
                                                        >
                                                            ✏️
                                                        </button>
                                                        <button
                                                            className="btn-icon btn-danger"
                                                            title="Delete Booking"
                                                            onClick={() => handleDeleteBooking(booking)}
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {stats.recent_bookings.length === 0 && (
                                    <p className="empty-state">No bookings yet</p>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'approvals' && (
                        <div className="approvals-section">
                            {/* Pending Partners */}
                            {pendingPartners.length > 0 && (
                                <>
                                    <h2>👥 Pending Partner Approvals ({pendingPartners.length})</h2>
                                    <div className="partner-grid">
                                        {pendingPartners.map(partner => (
                                            <div key={partner.id} className="approval-card">
                                                <div className="card-header">
                                                    <h3>{partner.name}</h3>
                                                    <span className="badge">{partner.type}</span>
                                                </div>
                                                <div className="card-body">
                                                    {partner.company_name && <p><strong>Company:</strong> {partner.company_name}</p>}
                                                    <p><strong>Phone:</strong> {partner.phone}</p>
                                                    <p><strong>Vehicle Type:</strong> {partner.vehicle_type}</p>
                                                    {partner.description && <p>{partner.description}</p>}
                                                </div>
                                                <button
                                                    onClick={() => handleApprovePartner(partner.id)}
                                                    className="btn btn-success full-width"
                                                >
                                                    ✓ Approve Partner
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}

                            {/* Pending Vehicles */}
                            {pendingVehicles.length > 0 && (
                                <>
                                    <h2 style={{ marginTop: '2rem' }}>🚗 Pending Vehicle Approvals ({pendingVehicles.length})</h2>
                                    <div className="vehicle-grid">
                                        {pendingVehicles.map(vehicle => (
                                            <div key={vehicle.id} className="vehicle-approval-card">
                                                <img src={vehicle.image_url} alt={vehicle.name} />
                                                <div className="vehicle-info">
                                                    <h3>{vehicle.name}</h3>
                                                    <p>{vehicle.model} ({vehicle.year})</p>
                                                    <p><strong>Partner:</strong> {vehicle.partner?.name}</p>
                                                    <p><strong>Category:</strong> {vehicle.category?.name}</p>
                                                    <p><strong>Capacity:</strong> {vehicle.capacity} passengers</p>
                                                    <p><strong>Price:</strong> {vehicle.price_per_km} MAD/km</p>
                                                </div>
                                                <button
                                                    onClick={() => handleApproveVehicle(vehicle.id)}
                                                    className="btn btn-primary full-width"
                                                >
                                                    ✓ Approve Vehicle
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}

                            {pendingVehicles.length === 0 && pendingPartners.length === 0 && (
                                <div className="empty-state-large">
                                    <div className="empty-icon">✅</div>
                                    <h3>All Caught Up!</h3>
                                    <p>No pending approvals at the moment</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Partner Modal */}
            {showEditModal && selectedPartner && (
                <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="modal expanded-modal" onClick={(e) => e.stopPropagation()}>
                        <h2>✏️ Edit Partner</h2>
                        <form onSubmit={handleUpdatePartner} className="partner-form">
                            <div className="partner-form-layout">
                                {/* Left Column: Avatar */}
                                <div className="partner-avatar-section">
                                    <div className="avatar-wrapper">
                                        <div className="avatar-placeholder large">
                                            {selectedPartner.avatar_url ? (
                                                <img src={selectedPartner.avatar_url} alt={selectedPartner.name} />
                                            ) : (
                                                <span>{selectedPartner.name?.charAt(0)}</span>
                                            )}
                                            <label className="avatar-upload-overlay">
                                                <input
                                                    type="file"
                                                    accept="image/jpeg,image/png,image/jpg"
                                                    hidden
                                                    onChange={(e) => handleAdminFileUpload(e, selectedPartner.id)}
                                                />
                                                <span className="camera-icon">📷</span>
                                            </label>
                                        </div>
                                    </div>
                                    <p className="avatar-hint">Click to upload new photo</p>
                                </div>

                                {/* Right Column: Details */}
                                <div className="partner-details-section">
                                    <div className="form-group">
                                        <label>Name *</label>
                                        <input
                                            type="text"
                                            value={selectedPartner.name || ''}
                                            onChange={(e) => setSelectedPartner({ ...selectedPartner, name: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Phone *</label>
                                        <input
                                            type="tel"
                                            value={selectedPartner.phone || ''}
                                            onChange={(e) => setSelectedPartner({ ...selectedPartner, phone: e.target.value })}
                                            required
                                        />
                                    </div>

                                    {selectedPartner.type === 'company' && (
                                        <div className="form-group">
                                            <label>Company Name</label>
                                            <input
                                                type="text"
                                                value={selectedPartner.company_name || ''}
                                                onChange={(e) => setSelectedPartner({ ...selectedPartner, company_name: e.target.value })}
                                            />
                                        </div>
                                    )}

                                    <div className="form-group">
                                        <label>Description</label>
                                        <textarea
                                            value={selectedPartner.description || ''}
                                            onChange={(e) => setSelectedPartner({ ...selectedPartner, description: e.target.value })}
                                            rows="3"
                                        />
                                    </div>

                                    <div className="form-group checkbox-group">
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={selectedPartner.is_approved || false}
                                                onChange={(e) => setSelectedPartner({ ...selectedPartner, is_approved: e.target.checked })}
                                            />
                                            {' '}Approved Partner
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowEditModal(false)} className="btn btn-secondary">
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    💾 Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Booking Modal */}
            {showBookingEditModal && selectedBooking && (
                <div className="modal-overlay" onClick={() => setShowBookingEditModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h2>✏️ Edit Booking #{selectedBooking.id}</h2>
                        <form onSubmit={handleUpdateBooking}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Customer Name</label>
                                    <input
                                        type="text"
                                        value={selectedBooking.name || ''}
                                        onChange={(e) => setSelectedBooking({ ...selectedBooking, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        value={selectedBooking.email || ''}
                                        onChange={(e) => setSelectedBooking({ ...selectedBooking, email: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Phone</label>
                                    <input
                                        type="tel"
                                        value={selectedBooking.phone || ''}
                                        onChange={(e) => setSelectedBooking({ ...selectedBooking, phone: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Passengers</label>
                                    <input
                                        type="number"
                                        value={selectedBooking.passengers || 1}
                                        onChange={(e) => setSelectedBooking({ ...selectedBooking, passengers: e.target.value })}
                                        min="1"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Pickup Location</label>
                                    <input
                                        type="text"
                                        value={selectedBooking.pickup || ''}
                                        onChange={(e) => setSelectedBooking({ ...selectedBooking, pickup: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Dropoff Location</label>
                                    <input
                                        type="text"
                                        value={selectedBooking.dropoff || ''}
                                        onChange={(e) => setSelectedBooking({ ...selectedBooking, dropoff: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Date</label>
                                    <input
                                        type="date"
                                        value={selectedBooking.date || ''}
                                        onChange={(e) => setSelectedBooking({ ...selectedBooking, date: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Time</label>
                                    <input
                                        type="time"
                                        value={selectedBooking.time ? selectedBooking.time.substring(0, 5) : ''}
                                        onChange={(e) => setSelectedBooking({ ...selectedBooking, time: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Price (MAD)</label>
                                <input
                                    type="number"
                                    value={selectedBooking.price || ''}
                                    onChange={(e) => setSelectedBooking({ ...selectedBooking, price: e.target.value })}
                                    step="0.01"
                                    required
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowBookingEditModal(false)} className="btn btn-secondary">
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    💾 Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Creative Delete Alert Modal */}
            {showDeleteAlert && deleteTarget && (
                <div className="modal-overlay alert-overlay" onClick={() => setShowDeleteAlert(false)}>
                    <div className="creative-alert" onClick={(e) => e.stopPropagation()}>
                        <div className="alert-icon-wrapper">
                            <div className="alert-icon">🗑️</div>
                        </div>
                        <h3>Are you absolutely sure?</h3>
                        <p>
                            You are about to delete Booking <strong>#{deleteTarget.id}</strong>.
                            This action cannot be undone and will remove all record of this reservation.
                        </p>
                        <div className="alert-actions">
                            <button className="btn btn-outline" onClick={() => setShowDeleteAlert(false)}>
                                No, Keep it
                            </button>
                            <button className="btn btn-danger-glow" onClick={() => performDeleteBooking(deleteTarget.id)}>
                                Yes, Delete it!
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .admin-dashboard {
                    padding: 2rem 0;
                    min-height: 100vh;
                    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                }
                
                .section-header-flex {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                }
                
                .toggle-group {
                    background: #f1f5f9;
                    padding: 4px;
                    border-radius: 8px;
                    display: flex;
                    gap: 4px;
                }
                
                .toggle-btn {
                    border: none;
                    background: transparent;
                    padding: 6px 16px;
                    border-radius: 6px;
                    font-size: 0.875rem;
                    cursor: pointer;
                    font-weight: 500;
                    color: var(--color-text-muted);
                    transition: all 0.2s;
                }
                
                .toggle-btn.active {
                    background: white;
                    color: var(--color-primary);
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                    font-weight: 600;
                }

                .admin-loading {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                    color: var(--color-text-muted);
                }

                .dashboard-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                }

                .dashboard-header h1 {
                    margin: 0 0 0.5rem 0;
                    font-size: 2.5rem;
                }

                .dashboard-header p {
                    margin: 0;
                    color: var(--color-text-muted);
                }

                .commission-tracker {
                    background: white;
                    padding: 2rem;
                    border-radius: var(--radius-lg);
                    margin-bottom: 2rem;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                }

                .commission-tracker h2 {
                    margin: 0;
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 1.5rem;
                }

                .stat-card {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: 1.5rem;
                    border-radius: var(--radius-lg);
                    color: white;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                    transition: transform 0.2s;
                }

                .stat-card:hover {
                    transform: translateY(-5px);
                }

                .stat-card.primary {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                }

                .stat-card.success {
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                }

                .stat-card.warning {
                    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                }

                .stat-card.info {
                    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                }

                .stat-icon {
                    font-size: 3rem;
                }

                .stat-content h3 {
                    margin: 0 0 0.5rem 0;
                    font-size: 0.875rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    opacity: 0.9;
                }

                .stat-number {
                    margin: 0;
                    font-size: 2rem;
                    font-weight: bold;
                    line-height: 1;
                }

                .stat-name {
                    margin: 0;
                    font-size: 1.25rem;
                    font-weight: 600;
                }

                .stat-content small {
                    opacity: 0.8;
                    font-size: 0.75rem;
                }

                .quick-stats {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1rem;
                    margin-bottom: 2rem;
                }

                .stat-item {
                    background: white;
                    padding: 1rem  1.5rem;
                    border-radius: var(--radius-md);
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .stat-item.highlight {
                    background: #fff5f5;
                    border: 1px solid #fed7d7;
                }

                .stat-label {
                    color: var(--color-text-muted);
                    font-weight: 500;
                }

                .stat-value {
                    font-size: 1.25rem;
                    font-weight: bold;
                    color: var(--color-primary);
                }

                .tabs {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                    overflow-x: auto;
                    padding-bottom: 0.5rem;
                }

                .tabs button {
                    padding: 0.75rem 1.5rem;
                    background: white;
                    border: none;
                    border-radius: var(--radius-md);
                    font-weight: 600;
                    color: var(--color-text-muted);
                    cursor: pointer;
                    transition: all 0.2s;
                    white-space: nowrap;
                }

                .tabs button.active {
                    background: var(--color-primary);
                    color: white;
                    box-shadow: 0 4px 10px rgba(37, 99, 235, 0.2);
                }

                .tab-content {
                    background: white;
                    padding: 2rem;
                    border-radius: var(--radius-lg);
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
                }

                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                }

                .search-input {
                    padding: 0.5rem 1rem;
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-md);
                    width: 250px;
                }

                .table-container {
                    overflow-x: auto;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                }

                th, td {
                    padding: 1rem;
                    text-align: left;
                    border-bottom: 1px solid var(--color-border);
                }

                th {
                    font-weight: 600;
                    color: var(--color-text-muted);
                    background: #f8fafc;
                }

                .partner-info small {
                    display: block;
                    color: var(--color-text-muted);
                }

                .badge {
                    display: inline-block;
                    padding: 0.25rem 0.5rem;
                    border-radius: 4px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    background: #e2e8f0;
                    color: #475569;
                    text-transform: capitalize;
                }

                .status {
                    display: inline-flex;
                    padding: 0.25rem 0.75rem;
                    border-radius: 9999px;
                    font-size: 0.85rem;
                    font-weight: 500;
                }

                .status-approved, .status-confirmed, .status-completed {
                    background: #dcfce7;
                    color: #166534;
                }

                .status-pending {
                    background: #fef9c3;
                    color: #854d0e;
                }

                .status-cancelled {
                    background: #fee2e2;
                    color: #991b1b;
                }

                .btn-mini {
                    padding: 0.25rem 0.5rem;
                    font-size: 0.75rem;
                    border-radius: 4px;
                }

                .action-buttons {
                    display: flex;
                    gap: 0.5rem;
                }

                .btn-icon {
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-size: 1.1rem;
                    padding: 0.25rem;
                    border-radius: 4px;
                }
                
                .btn-icon:hover {
                    background: #f1f5f9;
                }

                .btn-icon.btn-danger:hover {
                    background: #fee2e2;
                }

                .status-select {
                    padding: 0.25rem 0.5rem;
                    border-radius: 4px;
                    border: 1px solid #cbd5e1;
                    background: white;
                    font-size: 0.875rem;
                }

                .empty-state {
                    text-align: center;
                    padding: 3rem;
                    color: var(--color-text-muted);
                    font-style: italic;
                    background: #f8fafc;
                    border-radius: var(--radius-md);
                    margin-top: 1rem;
                }

                .table-container {
                    overflow-x: auto;
                    border: 1px solid #e2e8f0;
                    border-radius: var(--radius-md);
                    background: white;
                }

                table {
                    width: 100%;
                    border-collapse: separate; 
                    border-spacing: 0;
                }
                
                th {
                    background-color: #f8fafc;
                    font-weight: 600;
                    color: #475569;
                    padding: 1rem 1.5rem;
                    border-bottom: 1px solid #e2e8f0;
                    white-space: nowrap;
                    text-align: left;
                }
                
                td {
                    padding: 1rem 1.5rem;
                    border-bottom: 1px solid #f1f5f9;
                    color: #1e293b;
                    text-align: left;
                }

                tr:last-child td {
                    border-bottom: none;
                }

                .approval-card, .vehicle-approval-card {
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-md);
                    padding: 1.5rem;
                    background: #fff;
                    margin-bottom: 1rem;
                }

                .partner-grid, .vehicle-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 1.5rem;
                }

                .card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                    padding-bottom: 0.5rem;
                    border-bottom: 1px solid #f1f5f9;
                }

                .card-header h3 {
                    margin: 0;
                    font-size: 1.1rem;
                }

                .card-body p {
                    margin: 0.5rem 0;
                    font-size: 0.9rem;
                }

                .full-width {
                    width: 100%;
                    margin-top: 1rem;
                }

                .vehicle-approval-card {
                    display: flex;
                    flex-direction: column;
                }

                .vehicle-approval-card img {
                    width: 100%;
                    height: 160px;
                    object-fit: cover;
                    border-radius: var(--radius-md);
                    margin-bottom: 1rem;
                }

                .vehicle-info h3 {
                    margin: 0 0 0.5rem 0;
                }

                .vehicle-info p {
                    margin: 0.25rem 0;
                    font-size: 0.9rem;
                }

                .empty-state-large {
                    text-align: center;
                    padding: 4rem;
                }

                .empty-icon {
                    font-size: 4rem;
                    margin-bottom: 1rem;
                }

                /* Modal Styles */
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    backdrop-filter: blur(4px);
                }

                .modal {
                    background: white;
                    padding: 2rem;
                    border-radius: var(--radius-lg);
                    width: 100%;
                    max-width: 500px;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                }
                
                .expanded-modal {
                    max-width: 700px; /* Wider for 2 cols */
                }

                .modal h2 {
                    margin-top: 0;
                    margin-bottom: 1.5rem;
                }

                .modal-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 1rem;
                    margin-top: 2rem;
                }
                
                /* Partner Form Layout */
                .partner-form-layout {
                    display: flex;
                    gap: 2rem;
                }
                
                .partner-avatar-section {
                    flex: 0 0 150px;
                    text-align: center;
                }
                
                .partner-details-section {
                    flex: 1;
                }
                
                .avatar-placeholder.large {
                    width: 120px;
                    height: 120px;
                    border-radius: 50%;
                    background: #f1f5f9;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 3rem;
                    color: var(--color-primary);
                    font-weight: bold;
                    margin: 0 auto;
                    position: relative;
                    overflow: hidden;
                    border: 3px solid white;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                }
                
                .avatar-placeholder.large img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                
                .avatar-upload-overlay {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: rgba(0,0,0,0.5);
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                
                .avatar-upload-overlay:hover {
                    background: rgba(0,0,0,0.7);
                }
                
                .camera-icon {
                    font-size: 1.2rem;
                    color: white;
                }
                
                .avatar-hint {
                    margin-top: 0.5rem;
                    font-size: 0.75rem;
                    color: var(--color-text-muted);
                }

                /* Creative Alert Styles */
                .alert-overlay {
                    backdrop-filter: blur(5px);
                    background: rgba(0, 0, 0, 0.7);
                }
                .creative-alert {
                    background: white;
                    padding: 2.5rem;
                    border-radius: 20px;
                    text-align: center;
                    max-width: 400px;
                    animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                }
                @keyframes popIn {
                    from { transform: scale(0.8); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .alert-icon-wrapper {
                    width: 80px;
                    height: 80px;
                    background: #fee2e2;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 1.5rem;
                }
                .alert-icon { font-size: 2.5rem; }
                .creative-alert h3 { margin: 0 0 0.5rem; color: #1f2937; }
                .creative-alert p { color: #6b7280; margin-bottom: 2rem; line-height: 1.5; }
                .alert-actions { display: flex; gap: 1rem; justify-content: center; }
                .btn-danger-glow {
                    background: #ef4444;
                    color: white;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    box-shadow: 0 4px 14px 0 rgba(239, 68, 68, 0.39);
                    transition: transform 0.2s;
                }
                .btn-danger-glow:hover { transform: scale(1.05); background: #dc2626; }
                
                /* Standard form groups */
                .form-group { margin-bottom: 1rem; }
                .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 500; color: #1e293b; }
                .form-group input, .form-group textarea, .form-group select {
                    width: 100%;
                    padding: 0.75rem;
                    border: 1px solid #cbd5e1;
                    border-radius: 6px;
                    transition: border-color 0.2s;
                }
                .form-group input:focus, .form-group textarea:focus {
                    outline: none;
                    border-color: var(--color-primary);
                    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
                }
                .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
            `}</style>
        </div>
    );
};

export default Admin;
