// frontend/src/pages/MyOrders.js
// MES COMMANDES - VERSION CORRIGÉE

import React, { useState, useEffect } from 'react';
import { FaShoppingCart, FaEye, FaClock, FaCheckCircle, FaTruck, FaBox, FaTimes } from 'react-icons/fa';
import ClientLayout from '../components/ClientLayout';
import api from '../api/axios';

function MyOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadOrders();
        // Rafraîchir toutes les 30 secondes
        const interval = setInterval(loadOrders, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadOrders = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Récupérer les commandes du client connecté
            const response = await api.get('/shop/my-orders/');
            console.log('Commandes chargées:', response.data);
            setOrders(response.data);
            
        } catch (error) {
            console.error('Erreur chargement commandes:', error);
            setError('Impossible de charger vos commandes');
            
            if (error.response?.status === 401) {
                setError('Veuillez vous reconnecter');
            } else if (error.response?.status === 403) {
                setError('Vous n\'avez pas la permission de voir vos commandes');
            }
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            'pending': { label: 'En attente', class: 'pending', icon: <FaClock /> },
            'confirmed': { label: 'Confirmée', class: 'confirmed', icon: <FaCheckCircle /> },
            'preparing': { label: 'En préparation', class: 'preparing', icon: <FaBox /> },
            'shipped': { label: 'Expédiée', class: 'shipped', icon: <FaTruck /> },
            'delivered': { label: 'Livrée', class: 'delivered', icon: <FaCheckCircle /> },
            'cancelled': { label: 'Annulée', class: 'cancelled', icon: <FaTimes /> }
        };
        const s = statusMap[status] || { label: status, class: 'pending', icon: null };
        return (
            <span className={`badge-client ${s.class}`}>
                {s.icon} {s.label}
            </span>
        );
    };

    if (loading) {
        return (
            <ClientLayout title="Mes commandes" icon={<FaShoppingCart />}>
                <div className="text-center py-5">
                    <div className="spinner-border text-light" role="status">
                        <span className="visually-hidden">Chargement...</span>
                    </div>
                </div>
            </ClientLayout>
        );
    }

    if (error) {
        return (
            <ClientLayout title="Mes commandes" icon={<FaShoppingCart />}>
                <div className="alert alert-danger">
                    <strong>Erreur:</strong> {error}
                    <button className="btn btn-sm btn-link" onClick={loadOrders}>Réessayer</button>
                </div>
            </ClientLayout>
        );
    }

    return (
        <ClientLayout title="Mes commandes" icon={<FaShoppingCart />}>
            {orders.length === 0 ? (
                <div className="text-center py-5">
                    <FaShoppingCart size={48} className="mb-3" style={{ opacity: 0.5, color: 'white' }} />
                    <p className="text-white">Aucune commande passée</p>
                    <button 
                        className="btn-client-primary mt-3"
                        onClick={() => window.location.href = '/shop'}
                    >
                        <FaShoppingCart /> Visiter la boutique
                    </button>
                </div>
            ) : (
                <div className="client-card">
                    <div className="card-header">
                        <h5>
                            <FaShoppingCart className="me-2" /> Historique des commandes
                        </h5>
                        <span className="badge-count">{orders.length}</span>
                    </div>
                    <div className="card-body">
                        <div className="table-responsive">
                            <table className="table-client">
                                <thead>
                                    <tr>
                                        <th>#Commande</th>
                                        <th>Date</th>
                                        <th>Total</th>
                                        <th>Statut</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map(order => (
                                        <tr key={order.id}>
                                            <td>
                                                <strong>#{order.id}</strong>
                                                {order.invoice && (
                                                    <div>
                                                        <small className="text-muted">
                                                            Facture: {order.invoice.invoice_number || 'N°' + order.invoice.id}
                                                        </small>
                                                    </div>
                                                )}
                                            </td>
                                            <td>
                                                {new Date(order.created_at).toLocaleDateString()}
                                                <br />
                                                <small className="text-muted">
                                                    {new Date(order.created_at).toLocaleTimeString()}
                                                </small>
                                            </td>
                                            <td>
                                                <strong style={{ color: '#dc3545' }}>
                                                    {parseFloat(order.total).toLocaleString()} CFA
                                                </strong>
                                            </td>
                                            <td>{getStatusBadge(order.status)}</td>
                                            <td>
                                                <button 
                                                    className="btn btn-sm btn-info"
                                                    onClick={() => {
                                                        // Afficher les détails - à implémenter
                                                        alert(`Détails de la commande #${order.id}\nTotal: ${parseFloat(order.total).toLocaleString()} CFA\nStatut: ${order.status}`);
                                                    }}
                                                >
                                                    <FaEye /> Détails
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </ClientLayout>
    );
}

export default MyOrders;