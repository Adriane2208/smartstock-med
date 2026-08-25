import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTruck, FaCheckCircle, FaClock, FaEye, FaBox, FaTimes } from 'react-icons/fa';
import ClientLayout from '../components/ClientLayout';
import api from '../api/axios';

function OrderTrackingList() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            const response = await api.get('/shop/client-orders/');
            setOrders(response.data);
        } catch (error) {
            console.error('Erreur:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTracking = (orderId) => {
        navigate(`/tracking/${orderId}`);
    };

    const getStatusInfo = (status) => {
        const map = {
            'pending': { label: 'En attente', color: '#ffc107', icon: <FaClock /> },
            'confirmed': { label: 'Confirmée', color: '#17a2b8', icon: <FaCheckCircle /> },
            'preparing': { label: 'En préparation', color: '#007bff', icon: <FaBox /> },
            'shipped': { label: 'Expédiée', color: '#6f42c1', icon: <FaTruck /> },
            'delivered': { label: 'Livrée', color: '#28a745', icon: <FaCheckCircle /> },
            'cancelled': { label: 'Annulée', color: '#dc3545', icon: <FaTimes /> }
        };
        return map[status] || { label: status, color: '#6c757d', icon: <FaClock /> };
    };

    if (loading) {
        return (
            <ClientLayout title="Suivi des commandes" icon={<FaTruck />}>
                <div className="text-center py-5">
                    <div className="spinner-border text-light" role="status">
                        <span className="visually-hidden">Chargement...</span>
                    </div>
                </div>
            </ClientLayout>
        );
    }

    const trackableOrders = orders.filter(o => o.status !== 'cancelled');

    return (
        <ClientLayout title="Suivi des commandes" icon={<FaTruck />}>
            {trackableOrders.length === 0 ? (
                <div className="text-center py-5">
                    <FaTruck size={64} className="mb-3" style={{ opacity: 0.5, color: 'white' }} />
                    <h4 className="text-white">Aucune commande disponible</h4>
                    <p className="text-white-50">Vous n'avez pas encore de commandes à suivre.</p>
                </div>
            ) : (
                <div className="orders-grid">
                    {trackableOrders.map(order => {
                        const status = getStatusInfo(order.status);
                        const canTrack = order.status !== 'pending';
                        
                        return (
                            <div key={order.id} className="order-card">
                                {/* En-tête avec ID et statut */}
                                <div className="order-card-header">
                                    <span className="order-id">Commande #{order.id}</span>
                                    <span className="order-status" style={{ backgroundColor: status.color }}>
                                        {status.icon} {status.label}
                                    </span>
                                </div>

                                {/* Corps de la carte */}
                                <div className="order-card-body">
                                    <div className="order-info">
                                        <div className="order-date">
                                            <span className="label">📅 Date</span>
                                            <span className="value">
                                                {new Date(order.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="order-total">
                                            <span className="label">💰 Total</span>
                                            <span className="value" style={{ color: '#dc3545', fontWeight: '700' }}>
                                                {parseFloat(order.total).toLocaleString()} CFA
                                            </span>
                                        </div>
                                    </div>

                                    {/* Articles (si disponibles) */}
                                    {order.items && order.items.length > 0 && (
                                        <div className="order-items">
                                            <span className="label">📦 Articles</span>
                                            <div className="items-list">
                                                {order.items.slice(0, 3).map((item, idx) => (
                                                    <span key={idx} className="item-tag">
                                                        {item.product_name || item.product?.name || 'Produit'} 
                                                        x{item.quantity || 1}
                                                    </span>
                                                ))}
                                                {order.items.length > 3 && (
                                                    <span className="item-tag more">
                                                        +{order.items.length - 3} autres
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Client */}
                                    <div className="order-client">
                                        <span className="label">👤 Client</span>
                                        <span className="value">{order.customer_name || 'Client'}</span>
                                    </div>
                                </div>

                                {/* Pied de carte avec bouton Suivre */}
                                <div className="order-card-footer">
                                    {canTrack ? (
                                        <button 
                                            className="btn-track"
                                            onClick={() => handleTracking(order.id)}
                                            title="Suivre la commande"
                                        >
                                            <FaEye className="btn-icon" />
                                            Suivre
                                        </button>
                                    ) : (
                                        <span className="btn-disabled">
                                            <FaClock className="btn-icon" />
                                            En attente
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Styles CSS */}
            <style>{`
                .orders-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: 1.5rem;
                    padding: 0.5rem 0;
                }

                .order-card {
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 2px 12px rgba(0,0,0,0.08);
                    overflow: hidden;
                    transition: all 0.3s ease;
                    display: flex;
                    flex-direction: column;
                }

                .order-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
                }

                .order-card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1rem 1.25rem;
                    background: #f8f9fa;
                    border-bottom: 1px solid #e9ecef;
                }

                .order-id {
                    font-weight: 700;
                    color: #1a2a4f;
                    font-size: 1rem;
                }

                .order-status {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.4rem;
                    padding: 0.25rem 0.75rem;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: white;
                }

                .order-card-body {
                    padding: 1.25rem;
                    flex: 1;
                }

                .order-info {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 0.75rem;
                    padding-bottom: 0.75rem;
                    border-bottom: 1px solid #f1f3f5;
                }

                .order-date, .order-total {
                    display: flex;
                    flex-direction: column;
                }

                .label {
                    font-size: 0.7rem;
                    color: #adb5bd;
                    text-transform: uppercase;
                    letter-spacing: 0.3px;
                    font-weight: 600;
                }

                .value {
                    font-size: 0.95rem;
                    color: #1a2a4f;
                    margin-top: 2px;
                }

                .order-items {
                    margin-bottom: 0.75rem;
                    padding-bottom: 0.75rem;
                    border-bottom: 1px solid #f1f3f5;
                }

                .order-client {
                    display: flex;
                    flex-direction: column;
                }

                .items-list {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.4rem;
                    margin-top: 4px;
                }

                .item-tag {
                    background: #f1f3f5;
                    padding: 0.2rem 0.6rem;
                    border-radius: 12px;
                    font-size: 0.75rem;
                    color: #495057;
                }

                .item-tag.more {
                    background: #e9ecef;
                    color: #6c757d;
                }

                .order-card-footer {
                    padding: 0.75rem 1.25rem;
                    background: #f8f9fa;
                    border-top: 1px solid #e9ecef;
                    display: flex;
                    justify-content: flex-end;
                }

                .btn-track {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 1.25rem;
                    border: none;
                    border-radius: 25px;
                    background: linear-gradient(135deg, #dc3545 0%, #b02a37 100%);
                    color: white;
                    font-weight: 600;
                    font-size: 0.85rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .btn-track:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 16px rgba(220, 53, 69, 0.35);
                }

                .btn-track .btn-icon {
                    font-size: 1rem;
                }

                .btn-disabled {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 1.25rem;
                    border-radius: 25px;
                    background: #e9ecef;
                    color: #adb5bd;
                    font-weight: 600;
                    font-size: 0.85rem;
                }

                .btn-disabled .btn-icon {
                    font-size: 1rem;
                }

                @media (max-width: 768px) {
                    .orders-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </ClientLayout>
    );
}

export default OrderTrackingList;