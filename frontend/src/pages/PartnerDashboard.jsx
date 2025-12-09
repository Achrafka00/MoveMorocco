import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

const PartnerDashboard = () => {
    const [activeTab, setActiveTab] = useState('vehicles');
    const [partner, setPartner] = useState(null);
    const [vehicles, setVehicles] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddVehicle, setShowAddVehicle] = useState(false);
    const [showAddDriver, setShowAddDriver] = useState(false);

    const { user, token } = useAuth();
    const navigate = useNavigate();
    const { success, error: toastError } = useToast();

    useEffect(() => {
        if (!user || user.role !== 'partner') {
            navigate('/');
            return;
        }
        fetchData();
    }, [user, navigate]);

    const fetchData = async () => {
        try {
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            };

            const [profileRes, vehiclesRes, driversRes, categoriesRes] = await Promise.all([
                fetch('http://127.0.0.1:8000/api/partner/profile', { headers }),
                fetch('http://127.0.0.1:8000/api/partner/vehicles', { headers }),
                fetch('http://127.0.0.1:8000/api/partner/drivers', { headers }),
                fetch('http://127.0.0.1:8000/api/vehicle-categories', { headers }),
            ]);

            const [profileData, vehiclesData, driversData, categoriesData] = await Promise.all([
                profileRes.json(),
                vehiclesRes.json(),
                driversRes.json(),
                categoriesRes.json(),
            ]);

            setPartner(profileData);
            setVehicles(vehiclesData);
            setDrivers(driversData);
            setCategories(categoriesData);
        } catch (err) {
            console.error('Error fetching data:', err);
            toastError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (file, url, fieldName = 'avatar') => {
        if (!file) return;

        // 1MB Limit Validation
        if (file.size > 1024 * 1024) {
            toastError('File is too large. Max 1MB allowed.');
            return;
        }

        const formData = new FormData();
        formData.append(fieldName, file);

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });

            if (response.ok) {
                success('Image uploaded successfully!');
                fetchData();
            } else {
                const err = await response.json();
                toastError(err.message || 'Upload failed');
            }
        } catch (err) {
            console.error('Upload error', err);
            toastError('Upload failed due to network error');
        }
    };

    const handleAddVehicle = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const imageFiles = e.target.images.files;

        // Validate images before submission
        for (let i = 0; i < imageFiles.length; i++) {
            if (imageFiles[i].size > 1024 * 1024) {
                toastError(`Image ${imageFiles[i].name} is too large. Max 1MB.`);
                return;
            }
        }

        // Create vehicle first
        try {
            const response = await fetch('http://127.0.0.1:8000/api/partner/vehicles', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json', // JSON for data
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    category_id: formData.get('category_id'),
                    name: formData.get('name'),
                    model: formData.get('model'),
                    year: formData.get('year'),
                    capacity: formData.get('capacity'),
                    price_per_km: formData.get('price_per_km'),
                    description: formData.get('description'),
                    driver_id: formData.get('driver_id') || null,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                const vehicleId = data.vehicle.id;

                // Handle Image Upload if files exist
                if (imageFiles.length > 0) {
                    const imageFormData = new FormData();
                    for (let i = 0; i < imageFiles.length; i++) {
                        imageFormData.append('images[]', imageFiles[i]);
                    }

                    const imgResponse = await fetch(`http://127.0.0.1:8000/api/partner/vehicles/${vehicleId}/upload-images`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}` },
                        body: imageFormData,
                    });

                    if (!imgResponse.ok) {
                        toastError('Vehicle added but image upload failed');
                    }
                }

                success('Vehicle added successfully');
                setShowAddVehicle(false);
                fetchData();
            } else {
                const err = await response.json();
                toastError(err.message || 'Failed to add vehicle');
            }
        } catch (error) {
            console.error('Error adding vehicle:', error);
            toastError('Failed to add vehicle');
        }
    };

    const handleAddDriver = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        try {
            const response = await fetch('http://127.0.0.1:8000/api/partner/drivers', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.get('name'),
                    phone: formData.get('phone'),
                    license_number: formData.get('license_number'),
                }),
            });

            if (response.ok) {
                success('Driver added successfully');
                setShowAddDriver(false);
                fetchData();
            } else {
                const err = await response.json();
                toastError(err.message || 'Failed to add driver');
            }
        } catch (error) {
            console.error('Error adding driver:', error);
            toastError('Failed to add driver');
        }
    };

    if (loading) {
        return <div className="dashboard-loading">Loading...</div>;
    }

    return (
        <div className="partner-dashboard">
            <div className="dashboard-header">
                <div className="container">
                    <h1>Partner Dashboard</h1>
                    <div className="partner-info">
                        <span>{partner?.type === 'company' ? partner?.company_name : partner?.name}</span>
                        <span className={`status-badge ${partner?.is_approved ? 'approved' : 'pending'}`}>
                            {partner?.is_approved ? '✓ Approved' : '⏳ Pending Approval'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="dashboard-content container">
                {!partner?.is_approved && (
                    <div className="alert alert-warning">
                        ⚠️ Your partner account is pending admin approval. You can add vehicles and drivers, but they won't be visible to clients until approved.
                    </div>
                )}

                <div className="dashboard-tabs">
                    <button
                        className={`tab ${activeTab === 'vehicles' ? 'active' : ''}`}
                        onClick={() => setActiveTab('vehicles')}
                    >
                        🚗 Vehicles ({vehicles.length})
                    </button>
                    {partner?.type === 'company' && (
                        <button
                            className={`tab ${activeTab === 'drivers' ? 'active' : ''}`}
                            onClick={() => setActiveTab('drivers')}
                        >
                            👤 Drivers ({drivers.length})
                        </button>
                    )}
                    <button
                        className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        ⚙️ Profile
                    </button>
                </div>

                <div className="tab-content">
                    {activeTab === 'vehicles' && (
                        <div className="vehicles-tab">
                            <div className="tab-header">
                                <h2>My Vehicles</h2>
                                <button className="btn btn-primary" onClick={() => setShowAddVehicle(true)}>
                                    + Add Vehicle
                                </button>
                            </div>

                            {showAddVehicle && (
                                <div className="modal-overlay" onClick={() => setShowAddVehicle(false)}>
                                    < div className="modal" onClick={(e) => e.stopPropagation()}>
                                        <h3>Add New Vehicle</h3>
                                        <form onSubmit={handleAddVehicle}>
                                            <div className="form-group">
                                                <label>Category *</label>
                                                <select name="category_id" required>
                                                    <option value="">Select category</option>
                                                    {categories.map(cat => (
                                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="form-row">
                                                <div className="form-group">
                                                    <label>Vehicle Name *</label>
                                                    <input type="text" name="name" required placeholder="e.g., Mercedes-Benz E-Class" />
                                                </div>
                                                <div className="form-group">
                                                    <label>Model *</label>
                                                    <input type="text" name="model" required placeholder="e.g., E 220 d" />
                                                </div>
                                            </div>
                                            <div className="form-row">
                                                <div className="form-group">
                                                    <label>Year *</label>
                                                    <input type="number" name="year" required min="1900" max="2025" />
                                                </div>
                                                <div className="form-group">
                                                    <label>Capacity *</label>
                                                    <input type="number" name="capacity" required min="1" max="50" />
                                                </div>
                                                <div className="form-group">
                                                    <label>Price/km (MAD) *</label>
                                                    <input type="number" step="0.01" name="price_per_km" required />
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <label>Vehicle Images (Max 5, 1MB each)</label>
                                                <input
                                                    type="file"
                                                    name="images"
                                                    multiple
                                                    accept="image/png, image/jpeg, image/jpg"
                                                    onChange={(e) => {
                                                        const files = Array.from(e.target.files);
                                                        const invalidFiles = files.filter(file => file.size > 1024 * 1024);
                                                        if (invalidFiles.length > 0) {
                                                            alert(`Some files are too large (${invalidFiles.map(f => f.name).join(', ')}). Max 1MB allowed.`);
                                                            e.target.value = '';
                                                        }
                                                    }}
                                                />
                                                <small style={{ color: 'gray' }}>Formats: JPG, PNG. Max 1MB per file.</small>
                                            </div>
                                            {partner?.type === 'company' && drivers.length > 0 && (
                                                <div className="form-group">
                                                    <label>Assign Driver</label>
                                                    <select name="driver_id">
                                                        <option value="">No driver assigned</option>
                                                        {drivers.map(driver => (
                                                            <option key={driver.id} value={driver.id}>{driver.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}
                                            <div className="form-group">
                                                <label>Description</label>
                                                <textarea name="description" rows="3" placeholder="Describe the vehicle features..."></textarea>
                                            </div>
                                            <div className="modal-actions">
                                                <button type="button" className="btn btn-secondary" onClick={() => setShowAddVehicle(false)}>
                                                    Cancel
                                                </button>
                                                <button type="submit" className="btn btn-primary">
                                                    Add Vehicle
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}

                            <div className="vehicles-grid">
                                {vehicles.map(vehicle => (
                                    <div key={vehicle.id} className="vehicle-card-mini">
                                        <div className="vehicle-header">
                                            <h4>{vehicle.name}</h4>
                                            <span className={`badge ${vehicle.is_approved ? 'approved' : 'pending'}`}>
                                                {vehicle.is_approved ? 'Approved' : 'Pending'}
                                            </span>
                                        </div>
                                        {/* Image Gallery Preview */}
                                        <div className="vehicle-images-preview" style={{ height: '150px', background: '#f3f4f6', borderRadius: '8px', marginBottom: '1rem', overflow: 'hidden' }}>
                                            {vehicle.image_url ? (
                                                <img src={vehicle.image_url} alt={vehicle.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af' }}>No Image</div>
                                            )}
                                        </div>

                                        <p>{vehicle.model} ({vehicle.year})</p>
                                        <div className="vehicle-details">
                                            <span>👥 {vehicle.capacity} seats</span>
                                            <span>💰 {vehicle.price_per_km} MAD/km</span>
                                        </div>
                                        {vehicle.driver && <p className="driver-info">Driver: {vehicle.driver.name}</p>}

                                        {/* Simple Upload Button for quick add */}
                                        <div style={{ marginTop: '1rem' }}>
                                            <label className="btn btn-sm btn-outline" style={{ cursor: 'pointer', fontSize: '0.8rem', padding: '0.25rem 0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}>
                                                📷 Add Photo
                                                <input
                                                    type="file"
                                                    multiple
                                                    accept="image/png, image/jpeg, image/jpg"
                                                    style={{ display: 'none' }}
                                                    onChange={(e) => {
                                                        const formData = new FormData();
                                                        Array.from(e.target.files).forEach(file => formData.append('images[]', file));
                                                        fetch(`http://127.0.0.1:8000/api/partner/vehicles/${vehicle.id}/upload-images`, {
                                                            method: 'POST',
                                                            headers: { 'Authorization': `Bearer ${token}` },
                                                            body: formData
                                                        }).then(res => {
                                                            if (res.ok) { success('Images uploaded!'); fetchData(); }
                                                            else { toastError('Upload failed'); }
                                                        });
                                                    }}
                                                />
                                            </label>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'drivers' && partner?.type === 'company' && (
                        <div className="drivers-tab">
                            <div className="tab-header">
                                <h2>My Drivers</h2>
                                <button className="btn btn-primary" onClick={() => setShowAddDriver(true)}>
                                    + Add Driver
                                </button>
                            </div>

                            {showAddDriver && (
                                <div className="modal-overlay" onClick={() => setShowAddDriver(false)}>
                                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                                        <h3>Add New Driver</h3>
                                        <form onSubmit={handleAddDriver}>
                                            <div className="form-group">
                                                <label>Driver Name *</label>
                                                <input type="text" name="name" required placeholder="Full name" />
                                            </div>
                                            <div className="form-group">
                                                <label>Phone *</label>
                                                <input type="tel" name="phone" required placeholder="+212 600 000 000" />
                                            </div>
                                            <div className="form-group">
                                                <label>License Number</label>
                                                <input type="text" name="license_number" placeholder="Optional" />
                                            </div>
                                            <div className="modal-actions">
                                                <button type="button" className="btn btn-secondary" onClick={() => setShowAddDriver(false)}>
                                                    Cancel
                                                </button>
                                                <button type="submit" className="btn btn-primary">
                                                    Add Driver
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}

                            <div className="drivers-list">
                                {drivers.map(driver => (
                                    <div key={driver.id} className="driver-card">
                                        <div className="driver-avatar" style={{ position: 'relative', cursor: 'pointer' }}>
                                            {driver.avatar_url ? (
                                                <img src={driver.avatar_url} alt={driver.name} />
                                            ) : (
                                                <div className="avatar-placeholder">👤</div>
                                            )}
                                            <label htmlFor={`driver-upload-${driver.id}`} style={{
                                                position: 'absolute', bottom: -5, right: -5, background: 'white', borderRadius: '50%', padding: '2px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', cursor: 'pointer'
                                            }}>
                                                📷
                                            </label>
                                            <input
                                                id={`driver-upload-${driver.id}`}
                                                type="file"
                                                accept="image/png, image/jpeg, image/jpg"
                                                style={{ display: 'none' }}
                                                onChange={(e) => handleFileUpload(e.target.files[0], `http://127.0.0.1:8000/api/partner/drivers/${driver.id}/upload-avatar`)}
                                            />
                                        </div>
                                        <div className="driver-details">
                                            <h4>{driver.name}</h4>
                                            <p>📞 {driver.phone}</p>
                                            {driver.license_number && <p>🪪 {driver.license_number}</p>}
                                            <span className={`status ${driver.is_active ? 'active' : 'inactive'}`}>
                                                {driver.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <div className="profile-tab">
                            <h2>Partner Profile</h2>
                            <div className="profile-header-section" style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', alignItems: 'center' }}>
                                <div className="profile-avatar-wrapper" style={{ position: 'relative' }}>
                                    <div className="profile-avatar" style={{
                                        width: '100px',
                                        height: '100px',
                                        borderRadius: '50%',
                                        overflow: 'hidden',
                                        background: '#eee',
                                        border: '3px solid white',
                                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                    }}>
                                        {partner?.avatar_url ? (
                                            <img src={partner.avatar_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>👤</div>
                                        )}
                                    </div>
                                    <label htmlFor="avatar-upload" className="avatar-upload-btn" style={{
                                        position: 'absolute',
                                        bottom: '0',
                                        right: '0',
                                        background: 'var(--color-primary)',
                                        color: 'white',
                                        width: '30px',
                                        height: '30px',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        fontSize: '1rem',
                                        border: '2px solid white'
                                    }}>
                                        📷
                                    </label>
                                    <input
                                        id="avatar-upload"
                                        type="file"
                                        accept="image/png, image/jpeg, image/jpg"
                                        style={{ display: 'none' }}
                                        onChange={(e) => handleFileUpload(e.target.files[0], 'http://127.0.0.1:8000/api/partner/upload-avatar', 'avatar')}
                                    />
                                </div>
                                <div className="profile-text-info">
                                    <h3>{partner?.name}</h3>
                                    <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>{partner?.type}</p>
                                </div>
                            </div>

                            <div className="profile-info">
                                <div className="info-row">
                                    <label>Name:</label>
                                    <span>{partner?.name}</span>
                                </div>
                                {partner?.type === 'company' && (
                                    <div className="info-row">
                                        <label>Company:</label>
                                        <span>{partner?.company_name}</span>
                                    </div>
                                )}
                                <div className="info-row">
                                    <label>Phone:</label>
                                    <span>{partner?.phone}</span>
                                </div>
                                <div className="info-row">
                                    <label>Type:</label>
                                    <span>{partner?.type === 'company' ? 'Company/Agency' : 'Individual Driver'}</span>
                                </div>
                                <div className="info-row">
                                    <label>Description:</label>
                                    <span>{partner?.description || 'No description'}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
        .partner-dashboard {
          min-height: 100vh;
          background: var(--color-bg);
          padding-top: 4rem;
        }

        .dashboard-header {
          background: linear-gradient(135deg, #0d6efd, #5850ec);
          color: white;
          padding: 2rem 0;
        }

        /* ... existing styles ... */
        .dashboard-header h1 { margin: 0 0 0.5rem 0; }
        .partner-info { display: flex; gap: 1rem; align-items: center; }
        .status-badge { padding: 0.5rem 1rem; border-radius: var(--radius-full); font-size: 0.875rem; font-weight: 600; }
        .status-badge.approved { background: #10b981; }
        .status-badge.pending { background: #f59e0b; }
        .dashboard-content { padding: 2rem 0; }
        .alert { padding: 1rem; border-radius: var(--radius-md); margin-bottom: 2rem; }
        .alert-warning { background: #fef3c7; color: #92400e; border-left: 4px solid #f59e0b; }
        .dashboard-tabs { display: flex; gap: 1rem; margin-bottom: 2rem; border-bottom: 2px solid var(--color-border); }
        .tab { padding: 1rem 2rem; background: none; border: none; cursor: pointer; font-weight: 600; color: var(--color-text-muted); border-bottom: 3px solid transparent; margin-bottom: -2px; }
        .tab.active { color: var(--color-primary); border-bottom-color: var(--color-primary); }
        .tab-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        .vehicles-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
        .vehicle-card-mini { background: white; padding: 1.5rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); }
        .vehicle-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem; }
        .vehicle-header h4 { margin: 0; }
        .badge { padding: 0.25rem 0.75rem; border-radius: var(--radius-full); font-size: 0.75rem; font-weight: 600; }
        .badge.approved { background: #d1fae5; color: #065f46; }
        .badge.pending { background: #fef3c7; color: #92400e; }
        .vehicle-details { display: flex; gap: 1rem; margin-top: 0.5rem; font-size: 0.875rem; }
        .drivers-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1.5rem; }
        .driver-card { background: white; padding: 1.5rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); display: flex; gap: 1rem; }
        .driver-avatar { width: 60px; height: 60px; border-radius: 50%; overflow: hidden; flex-shrink: 0; }
        .driver-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .avatar-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: var(--color-primary); color: white; font-size: 2rem; }
        .driver-card h4 { margin: 0 0 0.5rem 0; }
        .driver-card p { margin: 0.25rem 0; font-size: 0.875rem; }
        .status.active { color: #10b981; font-weight: 600; }
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal { background: white; padding: 2rem; border-radius: var(--radius-lg); max-width: 600px; width: 90%; max-height: 90vh; overflow-y: auto; }
        .modal h3 { margin-top: 0; }
        .form-group { margin-bottom: 1rem; }
        .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 600; }
        .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 0.75rem; border: 1px solid var(--color-border); border-radius: var(--radius-md); }
        .form-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; }
        .modal-actions { display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem; }
        .empty-state { text-align: center; padding: 4rem 2rem; color: var(--color-text-muted); }
        .profile-info { background: white; padding: 2rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); }
        .info-row { display: grid; grid-template-columns: 150px 1fr; padding: 1rem 0; border-bottom: 1px solid var(--color-border); }
        .info-row label { font-weight: 600; color: var(--color-text-muted); }
        .dashboard-loading { min-height: 100vh; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; color: var(--color-text-muted); }
      `}</style>
        </div>
    );
};

export default PartnerDashboard;
