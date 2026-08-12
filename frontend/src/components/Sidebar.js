import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaTachometerAlt, FaBoxes, FaFileInvoice, FaTruck, FaShoppingCart,
  FaUsers, FaChartBar, FaHistory, FaClipboardList, FaUserCheck,
  FaStore, FaCartPlus, FaReceipt, FaUserCog
} from 'react-icons/fa';

function Sidebar() {
    const location = useLocation();
    const userRole = localStorage.getItem('user_role') || '';

    // Menu pour ADMIN et MANAGER
    const adminMenu = [
        { path: '/dashboard', name: 'Dashboard', icon: <FaTachometerAlt /> },
        { path: '/products', name: 'Produits', icon: <FaBoxes /> },
        { path: '/invoices', name: 'Factures', icon: <FaFileInvoice /> },
        { path: '/deliveries', name: 'Livraisons', icon: <FaTruck /> },
        { path: '/client-orders', name: 'Commandes client', icon: <FaShoppingCart /> },
        { path: '/users', name: 'Utilisateurs', icon: <FaUsers /> },
        { path: '/forecast', name: 'Prévisions', icon: <FaChartBar /> },
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

    // Choisir le menu selon le rôle
    let menuItems = [];
    if (userRole === 'admin' || userRole === 'manager') {
        menuItems = adminMenu;
    } else if (userRole === 'delivery') {
        menuItems = deliveryMenu;
    } else if (userRole === 'client') {
        menuItems = clientMenu;
    }

    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
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
    );
}

export default Sidebar;