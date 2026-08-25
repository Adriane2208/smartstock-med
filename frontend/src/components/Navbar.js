import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
   FaChevronDown, FaUser, FaEnvelope, FaPhone, 
  FaSignOutAlt, FaHospital
} from 'react-icons/fa';
import NotificationBell from './NotificationBell';
import api from '../api/axios';

function Navbar() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem('access_token');
                if (!token) return;
                
                const userId = localStorage.getItem('user_id');
                if (!userId) {
                    try {
                        const payload = JSON.parse(atob(token.split('.')[1]));
                        if (payload.user_id) {
                            localStorage.setItem('user_id', payload.user_id);
                        }
                    } catch (e) {}
                }
                
                const id = localStorage.getItem('user_id');
                if (id) {
                    const response = await api.get(`/users/${id}/`);
                    setUser(response.data);
                    if (response.data.role) {
                        localStorage.setItem('user_role', response.data.role);
                    }
                }
            } catch (error) {
                console.error('Erreur chargement utilisateur:', error);
            }
        };
        
        fetchUser();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_role');
        localStorage.removeItem('user_id');
        navigate('/');
    };

    const getRoleLabel = (role) => {
        const roles = {
            'admin': 'Administrateur',
            'manager': 'Gestionnaire',
            'delivery': 'Livreur',
            'client': 'Client'
        };
        return roles[role] || role;
    };

    const getInitials = (username) => {
        if (!username) return 'U';
        return username.charAt(0).toUpperCase();
    };

    const userDisplayName = user?.username || 'Utilisateur';
    const userRole = user?.role || localStorage.getItem('user_role') || '';
    const initials = getInitials(userDisplayName);

    return (
        <nav className="navbar navbar-custom sticky-top" style={{ 
            background: 'linear-gradient(135deg, #1a2a4f 0%, #2a3f6f 100%)', 
            padding: '0.75rem 0',
            boxShadow: '0 2px 12px rgba(0,0,0,0.15)'
        }}>
            <div className="container-fluid">
                {/* Logo et nom du logiciel */}
                <Link className="navbar-brand text-white d-flex align-items-center" to="/dashboard">
                    <div style={{
                        width: '40px',
                        height: '40px',
                        backgroundColor: '#dc3545',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '10px',
                        fontSize: '20px',
                        fontWeight: 'bold',
                        color: 'white'
                    }}>
                        <FaHospital size={22} />
                    </div>
                    <div>
                        <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>SmartStock Med</span>
                        <span style={{ 
                            fontSize: '0.6rem', 
                            backgroundColor: '#dc3545', 
                            padding: '2px 8px', 
                            borderRadius: '10px',
                            marginLeft: '8px',
                            verticalAlign: 'middle'
                        }}>
                            {userRole ? getRoleLabel(userRole) : 'v1.0'}
                        </span>
                    </div>
                </Link>
                
                <div className="d-flex align-items-center gap-3">
                    {/* Cloche de notifications */}
                    <NotificationBell />
                    
                    {/* Menu utilisateur */}
                    <div className="dropdown" style={{ position: 'relative' }}>
                        <button
                            className="btn btn-link text-white text-decoration-none d-flex align-items-center"
                            onClick={() => setShowDropdown(!showDropdown)}
                            style={{ 
                                background: 'rgba(255,255,255,0.1)', 
                                border: 'none', 
                                padding: '0.4rem 0.8rem',
                                borderRadius: '30px',
                                transition: 'all 0.3s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                            }}
                        >
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                backgroundColor: '#dc3545',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '14px',
                                marginRight: '8px'
                            }}>
                                {initials}
                            </div>
                            <span className="me-2" style={{ fontWeight: '500' }}>{userDisplayName}</span>
                            <FaChevronDown size={12} />
                        </button>
                        
                        {showDropdown && (
                            <>
                                <div className="dropdown-menu show" style={{ 
                                    position: 'absolute',
                                    right: 0,
                                    top: 'calc(100% + 8px)',
                                    minWidth: '280px',
                                    borderRadius: '12px',
                                    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                                    padding: '0.5rem 0',
                                    zIndex: 1050,
                                    backgroundColor: 'white',
                                    border: 'none'
                                }}>
                                    {/* En-tête du dropdown */}
                                    <div style={{ 
                                        padding: '1rem 1.25rem',
                                        borderBottom: '1px solid #e9ecef',
                                        background: '#f8f9fa',
                                        borderRadius: '12px 12px 0 0'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{
                                                width: '48px',
                                                height: '48px',
                                                borderRadius: '50%',
                                                backgroundColor: '#dc3545',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                fontWeight: 'bold',
                                                fontSize: '18px'
                                            }}>
                                                {initials}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 'bold', color: '#1a2a4f', fontSize: '1.1rem' }}>
                                                    {userDisplayName}
                                                </div>
                                                <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>
                                                    <span className="badge" style={{ background: '#dc3545', color: 'white' }}>
                                                        {getRoleLabel(userRole)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Informations utilisateur */}
                                    <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid #e9ecef' }}>
                                        <div style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '4px' }}>
                                            <FaEnvelope className="me-2" style={{ color: '#1a2a4f' }} />
                                            {user?.email || 'Email non défini'}
                                        </div>
                                        {user?.phone && (
                                            <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                                                <FaPhone className="me-2" style={{ color: '#1a2a4f' }} />
                                                {user.phone}
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Actions */}
                                    <div style={{ padding: '0.25rem 0' }}>
                                        <button
                                            className="dropdown-item"
                                            onClick={() => {
                                                setShowDropdown(false);
                                                navigate('/profile');
                                            }}
                                            style={{ 
                                                padding: '0.6rem 1.25rem',
                                                color: '#1a2a4f',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px'
                                            }}
                                        >
                                            <FaUser /> Mon profil
                                        </button>
                                        <hr className="my-1" />
                                        <button
                                            className="dropdown-item text-danger"
                                            onClick={handleLogout}
                                            style={{ 
                                                padding: '0.6rem 1.25rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                fontWeight: '500'
                                            }}
                                        >
                                            <FaSignOutAlt /> Déconnexion
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Overlay pour fermer le dropdown */}
                                <div
                                    style={{
                                        position: 'fixed',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        zIndex: 1040
                                    }}
                                    onClick={() => setShowDropdown(false)}
                                />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;