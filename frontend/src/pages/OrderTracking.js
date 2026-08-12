// frontend/src/pages/OrderTracking.js
// SUIVI COMMANDES AVEC DESIGN UNIFIÉ

import React, { useState, useEffect } from 'react';
import { FaTruck, FaClock, FaCheckCircle, FaExclamationTriangle, FaMapMarkerAlt } from 'react-icons/fa';
import ClientLayout from '../components/ClientLayout';
import api from '../api/axios';

function OrderTracking() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            const response = await api.get('/shop/my-orders/');
            setOrders(response.data.filter(o => o.status !== 'delivered' && o.status !== 'cancelled'));
        } catch (error) {
            console.error('Erreur:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        const icons = {
            'pending': <FaClock style={{ color: '#ffc107' }} />,
            'confirmed': <FaClock style={{ color: '#17a2b8' }} />,
            'preparing': <FaClock style={{ color: '#007bff' }} />,
            'shipped': <FaTruck style={{ color: '#6f42c1' }} />,
            'delivered': <FaCheckCircle style={{ color: '#28a745' }} />,
            'cancelled': <FaExclamationTriangle style={{ color: '#dc3545' }} />
        };
        return icons[status] || <FaClock />;
    };

    const getStatusLabel = (status) => {
        const labels = {
            'pending': 'En attente de validation',
            'confirmed': 'Confirmée',
            'preparing': 'En préparation',
            'shipped': 'Expédiée',
            'delivered': 'Livrée',
            'cancelled': 'Annulée'
        };
        return labels[status] || status;
    };

    const getStatusMessage = (status) => {
        const messages = {
            'pending': 'En attente de validation par l\'administrateur',
            'confirmed': 'Commande confirmée, préparation en cours',
            'preparing': 'Votre commande est en cours de préparation',
            'shipped': 'Votre commande est en route !',
            'delivered': 'Commande livrée avec succès',
            'cancelled': 'Commande annulée'
        };
        return messages[status] || '';
    };

    if (loading) {
        return (
            <ClientLayout title="Suivi commandes" icon={<FaTruck />}>
                <div className="text-center py-5">
                    <div className="spinner-border text-light" role="status">
                        <span className="visually-hidden">Chargement...</span>
                    </div>
                </div>
            </ClientLayout>
        );
    }

    return (
        <ClientLayout title="Suivi commandes" icon={<FaTruck />}>
            {orders.length === 0 ? (
                <div className="text-center py-5">
                    <FaTruck size={48} className="mb-3" style={{ opacity: 0.5, color: 'white' }} />
                    <p className="text-white">Aucune commande en cours</p>
                </div>
            ) : (
                <div className="row">
                    {orders.map(order => (
                        <div key={order.id} className="col-md-6 mb-4">
                            <div className="client-card" style={{ height: '100%' }}>
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h5 style={{ color: '#1a2a4f', margin: 0 }}>
                                        Commande #{order.id}
                                    </h5>
                                    <span className="badge bg-primary">
                                        {new Date(order.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="text-center py-3">
                                    <div style={{ fontSize: '3rem' }}>
                                        {getStatusIcon(order.status)}
                                    </div>
                                    <h6 className="mt-2" style={{ color: '#1a2a4f' }}>
                                        {getStatusLabel(order.status)}
                                    </h6>
                                    <p className="text-muted small">
                                        {getStatusMessage(order.status)}
                                    </p>
                                </div>
                                <hr />
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <small className="text-muted">Total</small>
                                        <div>
                                            <strong style={{ color: '#dc3545' }}>
                                                {parseFloat(order.total).toLocaleString()} CFA
                                            </strong>
                                        </div>
                                    </div>
                                    <button className="btn-client-primary btn-sm">
                                        <FaMapMarkerAlt /> Suivre
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </ClientLayout>
    );
}

export default OrderTracking;