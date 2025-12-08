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
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedPartner, setSelectedPartner] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchStats(),
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

    const fetchStats = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/admin/stats', {
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
                fetchAllData();
            } else {
                toast.error('Failed to update booking status');
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
                    <button onClick={fetchAllData} className="btn btn-outline">
                        🔄 Refresh
                    </button>
                </div>

                {/* Commission Tracker Section */}
                <div className="commission-tracker">
                    <h2>💰 Commission Tracker (This Month)</h2>
                    <div className="stats-grid">
                        <div className="stat-card primary">
                            <div className="stat-icon">💵</div>
                            <div className="stat-content">
                                <h3>Total Revenue</h3>
                                <p className="stat-number">{stats.monthly_revenue.toFixed(2)} MAD</p>
                                <small>From {stats.total_rides} rides</small>
                            </div>
                        </div>
                        <div className="stat-card success">
                            <div className="stat-icon">📈</div>
                            <div className="stat-content">
                                <h3>Commission Earned</h3>
                                <p className="stat-number">{stats.monthly_commission.toFixed(2)} MAD</p>
                                <small>10% commission rate</small>
                            </div>
                        </div>
                        <div className="stat-card warning">
                            <div className="stat-icon">⏳</div>
                            <div className="stat-content">
                                <h3>Unpaid Commissions</h3>
                                <p className="stat-number">{stats.unpaid_commissions.toFixed(2)} MAD</p>
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
                                                    {booking.message && (
                                                        <button
                                                            className="btn-icon"
                                                            title={booking.message}
                                                        >
                                                            💬
                                                        </button>
                                                    )}
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
                                    <p>No pending approvals at the momento</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Partner Modal */}
            {showEditModal && selectedPartner && (
                <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h2>✏️ Edit Partner</h2>
                        <form onSubmit={handleUpdatePartner}>
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

            <style>{`
                .admin-dashboard {
                    padding: 2rem 0;
                    min-height: 100vh;
                    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
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
                    margin: 0 0 1.5rem 0;
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
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
                }

                .stat-item.highlight {
                    border-left: 4px solid #f59e0b;
                }

                .stat-label {
                    font-weight: 500;
                    color: var(--color-text-muted);
                }

                .stat-value {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: var(--color-primary);
                }

                .tabs {
                    display: flex;
                    gap: 0.5rem;
                    margin-bottom: 2rem;
                    background: white;
                    padding: 0.5rem;
                    border-radius: var(--radius-lg);
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
                }

                .tabs button {
                    flex: 1;
                    padding: 1rem;
                    background: none;
                    border: none;
                    border-radius: var(--radius-md);
                    font-weight: 500;
                    color: var(--color-text-muted);
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .tabs button.active {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                }

                .tabs button:hover:not(.active) {
                    background: var(--color-bg);
                }

                .tab-content {
                    background: white;
                    border-radius: var(--radius-lg);
                    padding: 2rem;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                }

                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                    flex-wrap: wrap;
                    gap: 1rem;
                }

                .search-input {
                    padding: 0.75rem 1rem;
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-md);
                    width: 300px;
                    max-width: 100%;
                }

                .table-container {
                    overflow-x: auto;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                }

                thead {
                    background: var(--color-bg);
                }

                th {
                    padding: 1rem;
                    text-align: left;
                    font-weight: 600;
                    color: var(--color-text-muted);
                    text-transform: uppercase;
                    font-size: 0.875rem;
                    letter-spacing: 0.5px;
                }

                td {
                    padding: 1rem;
                    border-top: 1px solid var(--color-border);
                }

                .partner-info {
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                }

                .partner-info small {
                    color: var(--color-text-muted);
                    font-size: 0.875rem;
                }

                .badge {
                    display: inline-block;
                    padding: 0.25rem 0.75rem;
                    background: var(--color-secondary);
                    color: white;
                    border-radius: var(--radius-sm);
                    font-size: 0.75rem;
                    text-transform: capitalize;
                }

                .status {
                    display: inline-block;
                    padding: 0.25rem 0.75rem;
                    border-radius: var(--radius-sm);
                    font-size: 0.875rem;
                    font-weight: 500;
                }

                .status-pending {
                    background: #fef3c7;
                    color: #f59e0b;
                }

                .status-approved {
                    background: #d1fae5;
                    color: #065f46;
                }

                .status-confirmed {
                    background: #dbeafe;
                    color: #1e40af;
                }

                .action-buttons {
                    display: flex;
                    gap: 0.5rem;
                }

                .btn-icon {
                    background: none;
                    border: 1px solid var(--color-border);
                    padding: 0.5rem;
                    border-radius: var(--radius-md);
                    cursor: pointer;
                    transition: all 0.2s;
                    font-size: 1.25rem;
                }

                .btn-icon:hover {
                    background: var(--color-bg);
                    transform: scale(1.1);
                }

                .btn-icon.btn-danger:hover {
                    background: #fee2e2;
                    border-color: #ef4444;
                }

                .btn-mini {
                    padding: 0.25rem 0.75rem;
                    font-size: 0.75rem;
                    border: none;
                    border-radius: var(--radius-sm);
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.2s;
                }

                .btn-mini.btn-success {
                    background: #10b981;
                    color: white;
                }

                .btn-mini.btn-success:hover {
                    background: #059669;
                }

                .partner-grid,
                .vehicle-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                }

                .approval-card {
                    border: 2px solid var(--color-border);
                    border-radius: var(--radius-lg);
                    padding: 1.5rem;
                    background: var(--color-bg);
                }

                .card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                }

                .card-header h3 {
                    margin: 0;
                }

                .card-body p {
                    margin: 0.5rem 0;
                }

                .vehicle-approval-card {
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-lg);
                    overflow: hidden;
                    background: white;
                }

                .vehicle-approval-card img {
                    width: 100%;
                    height: 200px;
                    object-fit: cover;
                }

                .vehicle-approval-card .vehicle-info {
                    padding: 1rem;
                }

                .vehicle-approval-card h3 {
                    margin: 0 0 0.5rem 0;
                }

                .vehicle-approval-card p {
                    margin: 0.25rem 0;
                    font-size: 0.875rem;
                    color: var(--color-text-muted);
                }

                .full-width {
                    width: 100%;
                }

                .empty-state {
                    text-align: center;
                    padding: 2rem;
                    color: var(--color-text-muted);
                }

                .empty-state-large {
                    text-align: center;
                    padding: 4rem 2rem;
                }

                .empty-icon {
                    font-size: 4rem;
                    margin-bottom: 1rem;
                }

                .empty-state-large h3 {
                    margin: 0 0 0.5rem 0;
                }

                .empty-state-large p {
                    color: var(--color-text-muted);
                }

                .status-select {
                    padding: 0.5rem;
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-md);
                    font-size: 0.875rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .status-select:hover {
                    border-color: var(--color-primary);
                }

                .status-select:focus {
                    outline: none;
                    border-color: var(--color-primary);
                    box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.1);
                }

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
                }

                .modal {
                    background: white;
                    padding: 2rem;
                    border-radius: var(--radius-lg);
                    max-width: 500px;
                    width: 90%;
                    max-height: 90vh;
                    overflow-y: auto;
                }

                .modal h2 {
                    margin: 0 0 1.5rem 0;
                }

                .form-group {
                    margin-bottom: 1rem;
                }

                .form-group label {
                    display: block;
                    margin-bottom: 0.5rem;
                    font-weight: 600;
                }

                .form-group input,
                .form-group textarea {
                    width: 100%;
                    padding: 0.75rem;
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-md);
                }

                .checkbox-group label {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    cursor: pointer;
                }

                .checkbox-group input[type="checkbox"] {
                    width: auto;
                }

                .modal-actions {
                    display: flex;
                    gap: 1rem;
                    justify-content: flex-end;
                    margin-top: 1.5rem;
                }

                @media (max-width: 768px) {
                    .stats-grid {
                        grid-template-columns: 1fr;
                    }

                    .quick-stats {
                        grid-template-columns: 1fr;
                    }

                    .section-header {
                        flex-direction: column;
                        align-items: stretch;
                    }

                    .search-input {
                        width: 100%;
                    }

                    .tabs {
                        overflow-x: auto;
                    }
                }
            `}</style>
        </div>
    );
};

export default Admin;
