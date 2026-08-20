import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaEnvelope, FaLock, FaHospital, FaStethoscope, FaPills, FaSyringe, FaBoxes, FaShieldAlt, FaShoppingCart } from 'react-icons/fa';
import axios from 'axios';
import './Login.css';
import logo from './logo.png';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        console.log('📧 Tentative de connexion avec email:', email);

        try {
            // ✅ Envoyer 'email' au lieu de 'username'
            const response = await axios.post('http://localhost:8000/api/token/', {
                email: email,
                password: password
            });

            console.log('✅ Réponse token:', response.data);

            if (response.data.access) {
                localStorage.setItem('access_token', response.data.access);
                localStorage.setItem('refresh_token', response.data.refresh);
                
                // Récupérer les infos utilisateur
                const token = response.data.access;
                const payload = JSON.parse(atob(token.split('.')[1]));
                const userId = payload.user_id;
                localStorage.setItem('user_id', userId);
                localStorage.setItem('user_email', email);

                try {
                    const userResponse = await axios.get(`http://localhost:8000/api/users/${userId}/`, {
                        headers: {
                            'Authorization': `Bearer ${response.data.access}`
                        }
                    });
                    
                    console.log('👤 Utilisateur:', userResponse.data);
                    
                    const userRole = userResponse.data.role || 'client';
                    localStorage.setItem('user_role', userRole);
                    localStorage.setItem('username', userResponse.data.username || email);

                    // Rediriger selon le rôle
                    switch(userRole) {
                        case 'admin':
                            navigate('/dashboard');
                            break;
                        case 'delivery':
                            navigate('/delivery-dashboard');
                            break;
                        case 'manager':
                            navigate('/dashboard');
                            break;
                        default:
                            navigate('/shop');
                            break;
                    }
                } catch (userError) {
                    console.error('Erreur récupération rôle:', userError);
                    localStorage.setItem('user_role', 'client');
                    navigate('/shop');
                }
            }
        } catch (err) {
            console.error('❌ Erreur:', err);
            console.error('❌ Response:', err.response?.data);
            
            if (err.response?.status === 400) {
                const errorData = err.response.data;
                if (errorData.email) {
                    setError('Email requis');
                } else if (errorData.password) {
                    setError('Mot de passe requis');
                } else {
                    setError('Email ou mot de passe incorrect');
                }
            } else if (err.response?.status === 401) {
                setError('Email ou mot de passe incorrect');
            } else {
                setError('Une erreur est survenue. Veuillez réessayer.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page-container">
            <div 
                className="login-bg-logo" 
                style={{ 
                    backgroundImage: `url(${logo})` 
                }}
            ></div>

            <div className="login-floating-icons">
                <FaStethoscope className="login-float-icon l-icon-1" />
                <FaPills className="login-float-icon l-icon-2" />
                <FaSyringe className="login-float-icon l-icon-3" />
                <FaBoxes className="login-float-icon l-icon-4" />
                <FaShieldAlt className="login-float-icon l-icon-5" />
            </div>

            <div className="login-card-modern">
                <div className="login-header-modern">
                    <div className="logo-circle-modern">
                        <img src={logo} alt="Logo" className="login-logo-img" onError={(e)=>{e.target.style.display='none'; e.target.nextSibling.style.display='flex';}} />
                        <div className="login-logo-fallback" style={{display: 'none'}}>
                            <FaHospital size={28} color="white" />
                        </div>
                    </div>
                    <h2>SmartStock Med</h2>
                    <p>Connexion à votre espace professionnel</p>
                </div>

                {error && (
                    <div className="alert-custom-modern alert-error-modern">
                        <FaShieldAlt className="me-2" /> <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                    <div className="input-group-modern">
                        <label htmlFor="login-email" className="input-label-modern">Email</label>
                        <div className="input-field-wrapper-modern">
                            <span className="input-icon-modern">
                                <FaEnvelope />
                            </span>
                            <input
                                id="login-email"
                                name="email"
                                type="email"
                                className="input-field-modern"
                                placeholder="Entrez votre email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="input-group-modern">
                        <label htmlFor="login-password" className="input-label-modern">Mot de passe</label>
                        <div className="input-field-wrapper-modern">
                            <span className="input-icon-modern">
                                <FaLock />
                            </span>
                            <input
                                id="login-password"
                                name="password"
                                type="password"
                                className="input-field-modern"
                                placeholder="Entrez votre mot de passe"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn-login-modern" disabled={loading}>
                        {loading ? (
                            <span className="spinner-modern"></span>
                        ) : (
                            <>
                                <FaLock className="me-2" /> Se connecter
                            </>
                        )}
                    </button>
                </form>

                <div className="login-footer-modern">
                    <p className="text-center text-muted small mb-2">
                        Pas encore de compte ? <Link to="/register">Inscrivez-vous</Link>
                    </p>
                    <Link to="/shop" className="shop-link-modern">
                        <FaShoppingCart className="me-1" /> Accéder à la boutique
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Login;