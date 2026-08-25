// frontend/src/pages/MyOrders.js
// MES COMMANDES - VERSION COMPLÈTE ET CORRIGÉE

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    FaShoppingCart, FaEye, FaClock, FaCheckCircle, 
    FaTruck, FaBox, FaTimes, FaFileInvoice 
} from 'react-icons/fa';
import ClientLayout from '../components/ClientLayout';
import api from '../api/axios';

function MyOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        loadOrders();
        const interval = setInterval(loadOrders, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadOrders = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await api.get('/shop/my-orders/');
            console.log('📦 Commandes chargées:', response.data);
            setOrders(response.data);
            
        } catch (error) {
            console.error('❌ Erreur chargement commandes:', error);
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

    const handleTracking = (orderId) => {
        console.log('🔍 Navigation vers tracking avec ID:', orderId);
        if (!orderId) {
            alert('ID de commande invalide');
            return;
        }
        navigate(`/tracking/${orderId}`);
    };

    const showDetails = (order) => {
        const items = order.items || [];
        let message = `📋 Détails de la commande #${order.id}\n`;
        message += `📅 Date: ${new Date(order.created_at).toLocaleString()}\n`;
        message += `💰 Total: ${parseFloat(order.total).toLocaleString()} CFA\n`;
        message += `📊 Statut: ${order.status}\n`;
        message += `\n📦 Articles:\n`;
        if (items.length > 0) {
            items.forEach((item, idx) => {
                const productName = item.product_name || item.product?.name || 'Produit';
                const price = parseFloat(item.price) || 0;
                const quantity = item.quantity || 0;
                message += `  ${idx + 1}. ${productName} x ${quantity} = ${(price * quantity).toLocaleString()} CFA\n`;
            });
        } else {
            message += '  Aucun article';
        }
        alert(message);
    };

    if (loading) {
        return (
            <ClientLayout title="Mes commandes" icon={<FaShoppingCart />}>
                <div className="text-center py-5">
                    <div className="spinner-border text-light" role="status">
                        <span className="visually-hidden">Chargement...</span>
                    </div>
                    <p className="text-white-50 mt-2">Chargement de vos commandes...</p>
                </div>
            </ClientLayout>
        );
    }

    if (error) {
        return (
            <ClientLayout title="Mes commandes" icon={<FaShoppingCart />}>
                <div className="alert alert-danger shadow-sm" style={{ borderRadius: '16px' }}>
                    <div className="d-flex align-items-center">
                        <span style={{ fontSize: '2rem', marginRight: '1rem' }}>❌</span>
                        <div>
                            <strong>Erreur:</strong> {error}
                        </div>
                    </div>
                    <button 
                        className="btn btn-primary btn-sm mt-2" 
                        onClick={loadOrders} 
                        style={{ backgroundColor: '#dc3545', borderColor: '#dc3545' }}
                    >
                        <FaTruck className="me-1" /> Réessayer
                    </button>
                </div>
            </ClientLayout>
        );
    }

    return (
        <ClientLayout title="Mes commandes" icon={<FaShoppingCart />}>
            {orders.length === 0 ? (
                <div className="text-center py-5">
                    <FaShoppingCart size={64} className="mb-3" style={{ opacity: 0.5, color: 'white' }} />
                    <h4 className="text-white">Aucune commande passée</h4>
                    <p className="text-white-50">Commencez vos achats dès maintenant !</p>
                    <button 
                        className="btn-client-primary mt-3"
                        onClick={() => navigate('/shop')}
                    >
                        <FaShoppingCart className="me-2" /> Visiter la boutique
                    </button>
                </div>
            ) : (
                <div className="client-card">
                    <div className="card-header">
                        <h5>
                            <FaShoppingCart className="me-2" /> Historique des commandes
                        </h5>
                        <span className="badge-count">{orders.length} commande{orders.length > 1 ? 's' : ''}</span>
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
                                    {orders.map(order => {
                                        const canTrack = order.status !== 'pending' && order.status !== 'cancelled';
                                        return (
                                            <tr key={order.id}>
                                                <td>
                                                    <strong>#{order.id}</strong>
                                                    {order.invoice && (
                                                        <div>
                                                            <small className="text-muted">
                                                                <FaFileInvoice className="me-1" />
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
                                                    <div className="d-flex gap-1 flex-wrap">
                                                        <button 
                                                            className="btn btn-sm btn-info"
                                                            onClick={() => showDetails(order)}
                                                            title="Voir les détails"
                                                        >
                                                            <FaEye /> Détails
                                                        </button>
                                                        {canTrack && (
                                                            <button 
                                                                className="btn btn-sm btn-primary"
                                                                onClick={() => handleTracking(order.id)}
                                                                title="Suivre la commande"
                                                            >
                                                                <FaTruck /> Suivre
                                                            </button>
                                                        )}
                                                        {order.invoice && (
                                                            <button 
                                                                className="btn btn-sm btn-success"
                                                                onClick={() => {
                                                                    alert(`📄 Téléchargement de la facture #${order.invoice.invoice_number || order.invoice.id}\nFonctionnalité disponible prochainement.`);
                                                                }}
                                                                title="Télécharger la facture"
                                                            >
                                                                <FaFileInvoice /> PDF
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
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