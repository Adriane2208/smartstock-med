// frontend/src/pages/Profile.js
// MON PROFIL AVEC DESIGN UNIFIÉ

import React, { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaEdit, FaSave, FaUserCog } from 'react-icons/fa';
import ClientLayout from '../components/ClientLayout';
import api from '../api/axios';

function Profile() {
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        phone: '',
        address: '',
        first_name: '',
        last_name: ''
    });

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        try {
            const userId = localStorage.getItem('user_id');
            if (userId) {
                const response = await api.get(`/users/${userId}/`);
                setFormData({
                    username: response.data.username || '',
                    email: response.data.email || '',
                    phone: response.data.phone || '',
                    address: response.data.address || '',
                    first_name: response.data.first_name || '',
                    last_name: response.data.last_name || ''
                });
            }
        } catch (error) {
            console.error('Erreur:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            const userId = localStorage.getItem('user_id');
            await api.put(`/users/${userId}/`, formData);
            setEditing(false);
            loadUser();
            alert('✅ Profil mis à jour !');
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de la mise à jour');
        }
    };

    if (loading) {
        return (
            <ClientLayout title="Mon profil" icon={<FaUserCog />}>
                <div className="text-center py-5">
                    <div className="spinner-border text-light" role="status">
                        <span className="visually-hidden">Chargement...</span>
                    </div>
                </div>
            </ClientLayout>
        );
    }

    return (
        <ClientLayout title="Mon profil" icon={<FaUserCog />}>
            <div className="client-card">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 style={{ color: '#1a2a4f', margin: 0 }}>
                        <FaUser className="me-2" /> Informations personnelles
                    </h5>
                    {!editing ? (
                        <button className="btn-client-primary btn-sm" onClick={() => setEditing(true)}>
                            <FaEdit /> Modifier
                        </button>
                    ) : (
                        <button className="btn-client-primary btn-sm" onClick={handleSave}>
                            <FaSave /> Enregistrer
                        </button>
                    )}
                </div>

                <div className="row">
                    <div className="col-md-6">
                        <div className="mb-3">
                            <label className="form-label" style={{ color: '#1a2a4f', fontWeight: '600' }}>
                                Nom d'utilisateur
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.username}
                                onChange={(e) => setFormData({...formData, username: e.target.value})}
                                disabled={!editing}
                                style={{ borderRadius: '10px', padding: '0.75rem' }}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label" style={{ color: '#1a2a4f', fontWeight: '600' }}>
                                Prénom
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.first_name}
                                onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                                disabled={!editing}
                                style={{ borderRadius: '10px', padding: '0.75rem' }}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label" style={{ color: '#1a2a4f', fontWeight: '600' }}>
                                Nom
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.last_name}
                                onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                                disabled={!editing}
                                style={{ borderRadius: '10px', padding: '0.75rem' }}
                            />
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="mb-3">
                            <label className="form-label" style={{ color: '#1a2a4f', fontWeight: '600' }}>
                                <FaEnvelope className="me-1" /> Email
                            </label>
                            <input
                                type="email"
                                className="form-control"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                disabled={!editing}
                                style={{ borderRadius: '10px', padding: '0.75rem' }}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label" style={{ color: '#1a2a4f', fontWeight: '600' }}>
                                <FaPhone className="me-1" /> Téléphone
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.phone}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                disabled={!editing}
                                style={{ borderRadius: '10px', padding: '0.75rem' }}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label" style={{ color: '#1a2a4f', fontWeight: '600' }}>
                                <FaMapMarkerAlt className="me-1" /> Adresse
                            </label>
                            <textarea
                                className="form-control"
                                rows="2"
                                value={formData.address}
                                onChange={(e) => setFormData({...formData, address: e.target.value})}
                                disabled={!editing}
                                style={{ borderRadius: '10px', padding: '0.75rem' }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </ClientLayout>
    );
}

export default Profile;