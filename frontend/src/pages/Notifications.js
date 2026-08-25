import React, { useState, useEffect } from 'react';
import { FaBell, FaCheck, FaExclamationTriangle, FaBox, FaTruck } from 'react-icons/fa';
import Layout from '../components/Layout';
import api from '../api/axios';
import './Notifications.css';

function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('unread');

    const loadNotifications = async () => {
        try {
            const response = await api.get(`/core/notifications/?unread=${filter === 'unread'}`);
            setNotifications(response.data);
        } catch (error) {
            console.error('Erreur:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNotifications();
        const interval = setInterval(loadNotifications, 60000);
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter]);

    const markAsRead = async (id) => {
        try {
            await api.post(`/core/notifications/mark-read/${id}/`);
            loadNotifications();
        } catch (error) {
            console.error('Erreur:', error);
        }
    };

    const getIcon = (type) => {
        switch(type) {
            case 'dormant_product': return <FaBox className="text-warning" />;
            case 'order_status': return <FaTruck className="text-primary" />;
            case 'stock_alert': return <FaExclamationTriangle className="text-danger" />;
            default: return <FaBell className="text-secondary" />;
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="text-center py-5">Chargement...</div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="notifications-container">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 style={{ color: '#1a2a4f' }}>
                        <FaBell className="me-2" /> Notifications
                    </h2>
                    <div>
                        <button 
                            className={`btn btn-sm ${filter === 'unread' ? 'btn-primary' : 'btn-outline-secondary'} me-2`}
                            onClick={() => setFilter('unread')}
                        >
                            Non lues
                        </button>
                        <button 
                            className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-outline-secondary'}`}
                            onClick={() => setFilter('all')}
                        >
                            Toutes
                        </button>
                    </div>
                </div>

                {notifications.length === 0 ? (
                    <div className="text-center py-5">
                        <FaBell size={50} className="text-muted mb-3" />
                        <p>Aucune notification</p>
                    </div>
                ) : (
                    <div className="notification-list">
                        {notifications.map((notif) => (
                            <div 
                                key={notif.id} 
                                className={`notification-item ${!notif.is_read ? 'unread' : ''}`}
                                onClick={() => !notif.is_read && markAsRead(notif.id)}
                            >
                                <div className="notification-icon">
                                    {getIcon(notif.type)}
                                </div>
                                <div className="notification-content">
                                    <div className="notification-type">{notif.type_label}</div>
                                    <div className="notification-message">{notif.message}</div>
                                    <div className="notification-time">
                                        {new Date(notif.created_at).toLocaleString()}
                                    </div>
                                </div>
                                <div className="notification-actions">
                                    {!notif.is_read && (
                                        <button 
                                            className="btn btn-sm btn-outline-primary"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                markAsRead(notif.id);
                                            }}
                                        >
                                            <FaCheck /> Marquer lue
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
}

export default Notifications;