import React, { useState, useEffect, useRef } from 'react';
import { FaBell, FaCheck, FaTruck, FaFileInvoice, FaBoxes, FaShoppingCart } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

function NotificationBell() {
    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        loadNotifications();
        const interval = setInterval(loadNotifications, 10000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const loadNotifications = async () => {
        try {
            setLoading(true);
            const response = await api.get('/notifications/notifications/');
            const data = response.data || [];
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.is_read).length);
        } catch (error) {
            console.error('Erreur chargement notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.post(`/notifications/notifications/${id}/mark_read/`);
            loadNotifications();
        } catch (error) {
            console.error('Erreur:', error);
        }
    };

    const markAllRead = async () => {
        try {
            await api.post('/notifications/notifications/mark_all_read/');
            loadNotifications();
        } catch (error) {
            console.error('Erreur:', error);
        }
    };

    const getNotificationIcon = (type) => {
        const icons = {
            'delivery': <FaTruck style={{ color: '#17a2b8' }} />,
            'invoice': <FaFileInvoice style={{ color: '#28a745' }} />,
            'stock': <FaBoxes style={{ color: '#ffc107' }} />,
            'order': <FaShoppingCart style={{ color: '#007bff' }} />,
            'status': <FaCheck style={{ color: '#6f42c1' }} />,
            'default': <FaBell style={{ color: '#6c757d' }} />
        };
        return icons[type] || icons.default;
    };

    const getTimeAgo = (date) => {
        const diff = Math.floor((new Date() - new Date(date)) / 1000);
        if (diff < 60) return 'à l\'instant';
        if (diff < 3600) return `${Math.floor(diff / 60)} min`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
        if (diff < 604800) return `${Math.floor(diff / 86400)}j`;
        return new Date(date).toLocaleDateString();
    };

    const handleNotificationClick = (notification) => {
        if (!notification.is_read) {
            markAsRead(notification.id);
        }
        
        if (notification.link) {
            navigate(notification.link);
        } else if (notification.order_id) {
            navigate('/my-orders');
        } else if (notification.invoice_id) {
            navigate('/my-invoices');
        } else if (notification.delivery_id) {
            navigate('/order-tracking');
        }
        
        setShowDropdown(false);
    };

    return (
        <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button
                className="btn btn-link text-white position-relative"
                onClick={() => setShowDropdown(!showDropdown)}
                style={{ 
                    textDecoration: 'none', 
                    padding: '0.5rem',
                    fontSize: '1.2rem',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '50%',
                    width: '42px',
                    height: '42px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: 'none',
                    transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                }}
            >
                <FaBell />
                {unreadCount > 0 && (
                    <span className="badge bg-danger" style={{
                        position: 'absolute',
                        top: '-4px',
                        right: '-4px',
                        fontSize: '0.6rem',
                        padding: '0.2rem 0.4rem',
                        borderRadius: '50%',
                        minWidth: '18px',
                        height: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        animation: 'pulse 1.5s infinite'
                    }}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
                {loading && (
                    <div className="spinner-border spinner-border-sm text-light" 
                         style={{ position: 'absolute', width: '14px', height: '14px' }} 
                         role="status">
                        <span className="visually-hidden">Chargement...</span>
                    </div>
                )}
            </button>

            {showDropdown && (
                <div style={{
                    position: 'absolute',
                    right: 0,
                    top: 'calc(100% + 8px)',
                    width: '380px',
                    maxHeight: '450px',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                    zIndex: 1060,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <div style={{
                        padding: '0.75rem 1.25rem',
                        borderBottom: '1px solid #e9ecef',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: '#f8f9fa'
                    }}>
                        <h6 style={{ margin: 0, color: '#1a2a4f', fontWeight: 'bold' }}>
                            <FaBell className="me-2" style={{ color: '#dc3545' }} />
                            Notifications
                            {unreadCount > 0 && (
                                <span className="badge bg-danger ms-2">{unreadCount}</span>
                            )}
                        </h6>
                        {unreadCount > 0 && (
                            <button
                                className="btn btn-sm btn-link"
                                onClick={markAllRead}
                                style={{ color: '#dc3545', textDecoration: 'none', fontSize: '0.8rem' }}
                            >
                                Tout marquer lu
                            </button>
                        )}
                    </div>

                    <div style={{ 
                        overflowY: 'auto', 
                        maxHeight: '350px',
                        flex: 1
                    }}>
                        {notifications.length === 0 ? (
                            <div style={{ 
                                padding: '2rem', 
                                textAlign: 'center', 
                                color: '#6c757d' 
                            }}>
                                <FaBell size={32} style={{ opacity: 0.3, marginBottom: '8px' }} />
                                <p style={{ margin: 0, fontSize: '0.9rem' }}>Aucune notification</p>
                            </div>
                        ) : (
                            notifications.map(notif => (
                                <div
                                    key={notif.id}
                                    onClick={() => handleNotificationClick(notif)}
                                    style={{
                                        padding: '0.75rem 1.25rem',
                                        borderBottom: '1px solid #f1f3f5',
                                        backgroundColor: notif.is_read ? 'white' : '#f0f7ff',
                                        cursor: 'pointer',
                                        transition: 'background 0.2s',
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '12px'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#f8f9fa';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = notif.is_read ? 'white' : '#f0f7ff';
                                    }}
                                >
                                    <div style={{ marginTop: '2px', fontSize: '1.1rem' }}>
                                        {getNotificationIcon(notif.type || 'default')}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ 
                                            fontSize: '0.9rem', 
                                            color: notif.is_read ? '#6c757d' : '#1a2a4f',
                                            fontWeight: notif.is_read ? 'normal' : '500'
                                        }}>
                                            {notif.message}
                                        </div>
                                        <div style={{ 
                                            fontSize: '0.7rem', 
                                            color: '#adb5bd',
                                            marginTop: '4px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}>
                                            <span>{getTimeAgo(notif.created_at)}</span>
                                            {!notif.is_read && (
                                                <span className="badge bg-primary" style={{ fontSize: '0.6rem' }}>
                                                    Nouveau
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {!notif.is_read && (
                                        <button
                                            className="btn btn-sm btn-link"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                markAsRead(notif.id);
                                            }}
                                            style={{ color: '#28a745', padding: '0' }}
                                        >
                                            <FaCheck size={12} />
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    <div style={{
                        padding: '0.5rem 1.25rem',
                        borderTop: '1px solid #e9ecef',
                        textAlign: 'center',
                        background: '#f8f9fa'
                    }}>
                        <button
                            className="btn btn-sm btn-link"
                            onClick={() => {
                                loadNotifications();
                                setShowDropdown(false);
                                navigate('/profile');
                            }}
                            style={{ color: '#6c757d', textDecoration: 'none', fontSize: '0.8rem' }}
                        >
                            <FaBell className="me-1" /> Voir toutes les notifications
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default NotificationBell;