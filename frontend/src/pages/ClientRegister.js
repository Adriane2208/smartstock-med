// frontend/src/pages/ClientRegister.js
// VERSION CORRIGÉE - INSCRIPTION AVEC EMAIL

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaMapMarkerAlt, FaArrowLeft, FaHospital } from 'react-icons/fa';
import './ClientRegister.css';
import logo from './logo.png';

function ClientRegister() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        password2: '',
        phone: '',
        address: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        if (formData.password !== formData.password2) {
            setError('Les mots de passe ne correspondent pas');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:8000/api/users/register/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                    phone: formData.phone || '',
                    address: formData.address || '',
                    role: 'client'
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setSuccess('✅ Inscription réussie ! Vous pouvez maintenant vous connecter.');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                let errorMsg = 'Erreur lors de l\'inscription';
                if (data.username) errorMsg = data.username;
                else if (data.email) errorMsg = data.email;
                else if (data.error) errorMsg = data.error;
                setError(errorMsg);
            }
        } catch (error) {
            console.error('Erreur:', error);
            setError('Erreur de connexion au serveur');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-container">
            <div 
                className="register-bg" 
                style={{ 
                    backgroundImage: `url(${logo})` 
                }}
            ></div>

            <div className="register-card">
                <div className="register-header">
                    <div className="logo-circle-modern">
                        <img 
                            src={logo} 
                            alt="Logo" 
                            className="register-logo-img" 
                            onError={(e)=>{e.target.style.display='none'; e.target.nextSibling.style.display='flex';}} 
                        />
                        <div className="register-logo-fallback" style={{display: 'none'}}>
                            <FaHospital size={28} color="white" />
                        </div>
                    </div>
                    <h2>Créer un compte client</h2>
                    <p>Rejoignez SmartStock Med pour passer vos commandes</p>
                </div>

                {error && (
                    <div className="register-error">
                        <span>⚠️</span> {error}
                    </div>
                )}

                {success && (
                    <div className="register-success">
                        <span>✅</span> {success}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="register-group">
                        <label>Nom d'utilisateur *</label>
                        <div className="register-input-wrapper">
                            <FaUser className="register-input-icon" />
                            <input 
                                type="text" 
                                name="username"
                                placeholder="Choisissez un nom d'utilisateur"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="register-group">
                        <label>Email *</label>
                        <div className="register-input-wrapper">
                            <FaEnvelope className="register-input-icon" />
                            <input 
                                type="email" 
                                name="email"
                                placeholder="votre@email.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="register-group">
                        <label>Téléphone</label>
                        <div className="register-input-wrapper">
                            <FaPhone className="register-input-icon" />
                            <input 
                                type="tel" 
                                name="phone"
                                placeholder="+237 6XX XX XX XX"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="register-group">
                        <label>Adresse</label>
                        <div className="register-input-wrapper">
                            <FaMapMarkerAlt className="register-input-icon" />
                            <input 
                                type="text" 
                                name="address"
                                placeholder="Votre adresse de livraison"
                                value={formData.address}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="register-group">
                        <label>Mot de passe *</label>
                        <div className="register-input-wrapper">
                            <FaLock className="register-input-icon" />
                            <input 
                                type="password" 
                                name="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="register-group">
                        <label>Confirmer le mot de passe *</label>
                        <div className="register-input-wrapper">
                            <FaLock className="register-input-icon" />
                            <input 
                                type="password" 
                                name="password2"
                                placeholder="••••••••"
                                value={formData.password2}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="register-btn" disabled={loading}>
                        {loading ? (
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        ) : (
                            <FaEnvelope className="me-2" />
                        )}
                        {loading ? 'Inscription en cours...' : 'Créer mon compte'}
                    </button>
                </form>

                <div className="register-footer">
                    <p>Déjà inscrit ? <Link to="/login">Se connecter</Link></p>
                    <Link to="/" className="register-back">
                        <FaArrowLeft className="me-1" /> Retour à l'accueil
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default ClientRegister;