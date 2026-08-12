import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaTachometerAlt, FaBoxes, FaFileInvoice, FaTruck, FaShoppingCart, 
  FaSignOutAlt, FaHospital, FaChevronDown, FaUser,
  FaEnvelope, FaPhone, FaStore, FaCartPlus, FaClipboardList, 
  FaReceipt, FaUserCog, FaHistory, FaUserCheck,
  FaHeartbeat, FaSyringe, FaPills, FaAmbulance, 
  FaMicroscope, FaUserMd, FaBandAid, FaThermometerHalf, 
  FaWeight, FaVial, FaTooth
} from 'react-icons/fa';
import NotificationBell from './NotificationBell';
import api from '../api/axios';
import './ClientLayout.css';

const floatingIcons = [
    { icon: FaHeartbeat, delay: 0, duration: 22, top: 5, left: 3 },
    { icon: FaSyringe, delay: 3, duration: 25, top: 12, left: 85 },
    { icon: FaPills, delay: 6, duration: 20, top: 22, left: 8 },
    { icon: FaAmbulance, delay: 9, duration: 28, top: 35, left: 88 },
    { icon: FaMicroscope, delay: 12, duration: 24, top: 48, left: 5 },
    { icon: FaHospital, delay: 15, duration: 26, top: 60, left: 90 },
    { icon: FaUserMd, delay: 18, duration: 22, top: 72, left: 7 },
    { icon: FaBandAid, delay: 21, duration: 30, top: 85, left: 85 },
    { icon: FaThermometerHalf, delay: 24, duration: 23, top: 90, left: 10 },
    { icon: FaWeight, delay: 27, duration: 27, top: 3, left: 92 },
    { icon: FaVial, delay: 30, duration: 21, top: 42, left: 92 },
    { icon: FaTooth, delay: 33, duration: 29, top: 78, left: 2 },
];

function ClientLayout({ children, title, icon }) {
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const userRole = localStorage.getItem('user_role') || '';

    // Menu pour ADMIN et MANAGER
    const adminMenu = [
        { path: '/dashboard', name: 'Dashboard', icon: <FaTachometerAlt /> },
        { path: '/products', name: 'Produits', icon: <FaBoxes /> },
        { path: '/invoices', name: 'Factures', icon: <FaFileInvoice /> },
        { path: '/deliveries', name: 'Livraisons', icon: <FaTruck /> },
        { path: '/client-orders', name: 'Commandes client', icon: <FaShoppingCart /> },
    ];

    // Menu pour LIVREUR
    const deliveryMenu = [
        { path: '/delivery-dashboard', name: 'Dashboard', icon: <FaTachometerAlt /> },
        { path: '/delivery-dashboard', name: 'Mes livraisons', icon: <FaTruck /> },
        { path: '/delivery-dashboard', name: 'Historique', icon: <FaHistory /> },
        { path: '/profile', name: 'Mon profil', icon: <FaUserCheck /> },
    ];

    // Menu pour CLIENT
    const clientMenu = [
        { path: '/shop', name: 'Boutique', icon: <FaStore /> },
        { path: '/cart', name: 'Mon panier', icon: <FaCartPlus /> },
        { path: '/my-orders', name: 'Mes commandes', icon: <FaClipboardList /> },
        { path: '/my-invoices', name: 'Mes factures', icon: <FaReceipt /> },
        { path: '/order-tracking', name: 'Suivi commandes', icon: <FaTruck /> },
        { path: '/profile', name: 'Mon profil', icon: <FaUserCog /> },
    ];

    let menuItems = [];
    if (userRole === 'admin' || userRole === 'manager') {
        menuItems = adminMenu;
    } else if (userRole === 'delivery') {
        menuItems = deliveryMenu;
    } else if (userRole === 'client') {
        menuItems = clientMenu;
    }

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
        window.location.href = '/';
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
    const initials = getInitials(userDisplayName);

    const isActive = (path) => location.pathname === path;

    return (
        <div className="client-layout">
            {/* ===== NAVBAR ===== */}
            <nav className="navbar navbar-custom sticky-top" style={{ 
                background: 'linear-gradient(135deg, #1a2a4f 0%, #2a3f6f 100%)', 
                padding: '0.75rem 0',
                boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
                zIndex: 1030
            }}>
                <div className="container-fluid">
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
                        <NotificationBell />
                        
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
                                        
                                        <div style={{ padding: '0.25rem 0' }}>
                                            <button
                                                className="dropdown-item"
                                                onClick={() => {
                                                    setShowDropdown(false);
                                                    window.location.href = '/profile';
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

            {/* ===== CONTENU AVEC SIDEBAR ET DESIGN CLIENT ===== */}
            <div className="container-fluid mt-4">
                <div className="row">
                    {/* Sidebar */}
                    {menuItems.length > 0 && (
                        <div className="col-md-2">
                            <div className="sidebar" style={{
                                background: 'white',
                                borderRadius: '16px',
                                padding: '1rem 0',
                                boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                                height: 'fit-content'
                            }}>
                                <div style={{
                                    padding: '0 1rem 0.75rem 1rem',
                                    borderBottom: '1px solid #e9ecef',
                                    marginBottom: '0.5rem'
                                }}>
                                    <small style={{ 
                                        color: '#6c757d', 
                                        textTransform: 'uppercase', 
                                        fontSize: '0.65rem',
                                        fontWeight: 'bold',
                                        letterSpacing: '0.5px'
                                    }}>
                                        {userRole === 'admin' ? 'Administration' :
                                         userRole === 'manager' ? 'Gestion' :
                                         userRole === 'delivery' ? 'Livraison' :
                                         userRole === 'client' ? 'Espace client' : 'Menu'}
                                    </small>
                                </div>
                                
                                {menuItems.map((item) => (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: '0.75rem 1.25rem',
                                            margin: '0 0.5rem',
                                            borderRadius: '10px',
                                            color: isActive(item.path) ? 'white' : '#6c757d',
                                            backgroundColor: isActive(item.path) ? '#dc3545' : 'transparent',
                                            textDecoration: 'none',
                                            transition: 'all 0.2s ease',
                                            gap: '12px',
                                            fontSize: '0.9rem'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isActive(item.path)) {
                                                e.currentTarget.style.backgroundColor = '#f8f9fa';
                                                e.currentTarget.style.color = '#1a2a4f';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isActive(item.path)) {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                                e.currentTarget.style.color = '#6c757d';
                                            }
                                        }}
                                    >
                                        <span style={{ fontSize: '1.1rem', minWidth: '20px' }}>{item.icon}</span>
                                        <span>{item.name}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Contenu principal avec design client */}
                    <div className={menuItems.length > 0 ? "col-md-10" : "col-12"}>
                        <div className="client-content-wrapper" style={{ position: 'relative' }}>
                            {/* Icônes flottantes */}
                            {floatingIcons.map((item, index) => (
                                <div 
                                    key={index}
                                    className="floating-icon-client"
                                    style={{
                                        animationDelay: `${item.delay}s`,
                                        animationDuration: `${item.duration}s`,
                                        top: `${item.top}%`,
                                        left: `${item.left}%`,
                                        position: 'absolute',
                                        fontSize: '2rem',
                                        color: 'rgba(255,255,255,0.06)',
                                        pointerEvents: 'none',
                                        zIndex: 0
                                    }}
                                >
                                    <item.icon />
                                </div>
                            ))}

                            {/* Contenu avec fond dégradé */}
                            <div className="client-content" style={{
                                background: 'linear-gradient(135deg, #1a2a4f 0%, #2a3f6f 40%, #dc3545 100%)',
                                borderRadius: '16px',
                                padding: '1.5rem',
                                position: 'relative',
                                zIndex: 1,
                                minHeight: '500px',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                            }}>
                                {title && (
                                    <h2 className="client-title" style={{
                                        color: 'white',
                                        fontWeight: '700',
                                        marginBottom: '1.5rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        textShadow: '0 2px 8px rgba(0,0,0,0.2)'
                                    }}>
                                        {icon && <span>{icon}</span>}
                                        {title}
                                    </h2>
                                )}
                                {children}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ClientLayout;