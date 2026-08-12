import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaUser, FaLock, FaHospital } from 'react-icons/fa';
import axios from 'axios';
import './Login.css';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // 1. Obtenir le token JWT
            const response = await axios.post('http://localhost:8000/api/token/', {
                username,
                password
            });

            if (response.data.access) {
                // Stocker les tokens
                localStorage.setItem('access_token', response.data.access);
                localStorage.setItem('refresh_token', response.data.refresh);
                
                // 2. Récupérer les informations de l'utilisateur
                const token = response.data.access;
                const payload = JSON.parse(atob(token.split('.')[1]));
                const userId = payload.user_id;
                localStorage.setItem('username', username);

                // 3. Récupérer le rôle de l'utilisateur depuis l'API
                try {
                    const userResponse = await axios.get(`http://localhost:8000/api/users/${userId}/`, {
                        headers: {
                            'Authorization': `Bearer ${response.data.access}`
                        }
                    });
                    
                    const userRole = userResponse.data.role || 'client';
                    localStorage.setItem('user_role', userRole);

                    // 4. Rediriger selon le rôle
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
                    // Si on ne peut pas récupérer le rôle, par défaut client
                    console.error('Erreur récupération rôle:', userError);
                    localStorage.setItem('user_role', 'client');
                    navigate('/shop');
                }
            }
        } catch (err) {
            console.error('Erreur:', err);
            setError('Identifiants incorrects');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page-container">
            {/* Background avec logo flouté */}
            <div 
                className="login-bg-blur" 
                style={{ 
                    backgroundImage: 'url(/logo.png)',
                    backgroundRepeat: 'repeat',
                    backgroundSize: '80px',
                    opacity: 0.06,
                    filter: 'blur(4px)'
                }}
            ></div>

            <div className="login-card-modern">
                <div className="login-header-modern">
                    <div className="logo-circle-modern">
                        <FaHospital size={32} color="white" />
                    </div>
                    <h2>SmartStock Med</h2>
                    <p>Connexion à votre espace</p>
                </div>

                {error && (
                    <div className="alert-custom-modern alert-error-modern">
                        <span>⚠️</span> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="input-group-modern">
                        <label className="input-label-modern">Nom d'utilisateur</label>
                        <div className="input-field-wrapper-modern">
                            <span className="input-icon-modern">
                                <FaUser />
                            </span>
                            <input
                                type="text"
                                className="input-field-modern"
                                placeholder="Entrez votre nom d'utilisateur"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group-modern">
                        <label className="input-label-modern">Mot de passe</label>
                        <div className="input-field-wrapper-modern">
                            <span className="input-icon-modern">
                                <FaLock />
                            </span>
                            <input
                                type="password"
                                className="input-field-modern"
                                placeholder="Entrez votre mot de passe"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn-login-modern" disabled={loading}>
                        {loading ? (
                            <span className="spinner-modern"></span>
                        ) : (
                            <>
                                <span>🔐</span> Se connecter
                            </>
                        )}
                    </button>
                </form>

                <div className="login-footer-modern">
                    <p className="text-center text-muted small">
                        Pas encore de compte ? <Link to="/register">Inscrivez-vous</Link>
                    </p>
                    <Link to="/shop" className="shop-link-modern">
                        🛒 Accéder à la boutique
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Login;