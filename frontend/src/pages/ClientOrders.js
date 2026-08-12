// frontend/src/pages/ClientOrders.js
// CORRIGÉ - SUPPRESSION DES VARIABLES INUTILISÉES

import React, { useState, useEffect } from 'react';
import { 
    FaShoppingCart, FaEye, FaClock, FaBox, FaTruck, 
    FaCheckCircle, FaTimes, FaFileInvoice, FaTrash
    // FaEdit SUPPRIMÉ - non utilisé
} from 'react-icons/fa';
import ClientLayout from '../components/ClientLayout';
import api from '../api/axios';

function ClientOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    // SUPPRIMER showInvoiceModal et setShowInvoiceModal
    // SUPPRIMER selectedOrderForInvoice et setSelectedOrderForInvoice
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        loadOrders();
        const interval = setInterval(loadOrders, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadOrders = async () => {
        try {
            const response = await api.get('/shop/client-orders/');
            setOrders(response.data);
        } catch (error) {
            console.error('Erreur:', error);
            if (error.response?.status === 403) {
                alert('Vous n\'avez pas la permission de voir les commandes');
            }
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, status) => {
        if (!window.confirm(`Changer le statut de la commande #${id} en "${status}" ?`)) {
            return;
        }

        try {
            await api.patch(`/shop/client-orders/${id}/update_status/`, { status });
            loadOrders();
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de la mise à jour du statut');
        }
    };

    const createInvoice = async (orderId) => {
        if (!window.confirm(`Créer une facture pour la commande #${orderId} ?`)) {
            return;
        }

        setCreating(true);
        try {
            const response = await api.post('/sales/invoices/create_from_order/', {
                order_id: orderId
            });
            
            if (response.data.success) {
                alert('✅ Facture créée avec succès !');
                loadOrders();
            }
        } catch (error) {
            console.error('Erreur:', error);
            if (error.response?.data?.error) {
                alert('Erreur: ' + error.response.data.error);
            } else {
                alert('Erreur lors de la création de la facture');
            }
        } finally {
            setCreating(false);
        }
    };

    const createDelivery = async (orderId) => {
        if (!window.confirm(`Créer une livraison pour la commande #${orderId} ?`)) {
            return;
        }

        try {
            const response = await api.post('/deliveries/deliveries/create_from_order/', {
                order_id: orderId
            });
            
            if (response.data.success) {
                alert('✅ Livraison créée avec succès !');
                loadOrders();
            }
        } catch (error) {
            console.error('Erreur:', error);
            if (error.response?.data?.error) {
                alert('Erreur: ' + error.response.data.error);
            } else {
                alert('Erreur lors de la création de la livraison');
            }
        }
    };

    const deleteOrder = async (id) => {
        if (!window.confirm(`Supprimer la commande #${id} ?`)) {
            return;
        }

        try {
            await api.delete(`/shop/client-orders/${id}/`);
            loadOrders();
            alert('✅ Commande supprimée');
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de la suppression');
        }
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            'pending': { label: 'En attente', color: 'warning', icon: <FaClock /> },
            'confirmed': { label: 'Confirmée', color: 'info', icon: <FaCheckCircle /> },
            'preparing': { label: 'En préparation', color: 'primary', icon: <FaBox /> },
            'shipped': { label: 'Expédiée', color: 'primary', icon: <FaTruck /> },
            'delivered': { label: 'Livrée', color: 'success', icon: <FaCheckCircle /> },
            'cancelled': { label: 'Annulée', color: 'danger', icon: <FaTimes /> }
        };
        const s = statusMap[status] || { label: status, color: 'secondary', icon: null };
        return (
            <span className={`badge-client ${s.color}`}>
                {s.icon} {s.label}
            </span>
        );
    };

    const getStatusOptions = () => {
        return [
            { value: 'pending', label: 'En attente' },
            { value: 'confirmed', label: 'Confirmée' },
            { value: 'preparing', label: 'En préparation' },
            { value: 'shipped', label: 'Expédiée' },
            { value: 'delivered', label: 'Livrée' },
            { value: 'cancelled', label: 'Annulée' }
        ];
    };

    if (loading) {
        return (
            <ClientLayout title="Commandes client" icon={<FaShoppingCart />}>
                <div className="text-center py-5">
                    <div className="spinner-border text-light" role="status">
                        <span className="visually-hidden">Chargement...</span>
                    </div>
                </div>
            </ClientLayout>
        );
    }

    return (
        <ClientLayout title="Commandes client" icon={<FaShoppingCart />}>
            <div className="client-card">
                <div className="card-header">
                    <h5>
                        <FaShoppingCart className="me-2" /> Liste des commandes
                    </h5>
                    <span className="badge-count">{orders.length}</span>
                </div>
                <div className="card-body">
                    {orders.length === 0 ? (
                        <div className="text-center py-5">
                            <FaShoppingCart size={48} className="mb-3" style={{ opacity: 0.3, color: '#6c757d' }} />
                            <p>Aucune commande</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table-client">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Client</th>
                                        <th>Téléphone</th>
                                        <th>Total</th>
                                        <th>Statut</th>
                                        <th>Facture</th>
                                        <th>Livraison</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map(order => (
                                        <tr key={order.id}>
                                            <td>
                                                <strong>#{order.id}</strong>
                                            </td>
                                            <td>
                                                <div>{order.customer_name}</div>
                                                <small className="text-muted">{order.customer_email}</small>
                                            </td>
                                            <td>{order.customer_phone || '-'}</td>
                                            <td>
                                                <strong style={{ color: '#dc3545' }}>
                                                    {parseFloat(order.total).toLocaleString()} CFA
                                                </strong>
                                            </td>
                                            <td>{getStatusBadge(order.status)}</td>
                                            <td>
                                                {order.invoice ? (
                                                    <span className="badge bg-success">
                                                        <FaFileInvoice /> {order.invoice.invoice_number || 'Facturée'}
                                                    </span>
                                                ) : (
                                                    <button
                                                        className="btn btn-sm btn-warning"
                                                        onClick={() => createInvoice(order.id)}
                                                        disabled={creating}
                                                        title="Créer une facture"
                                                    >
                                                        <FaFileInvoice /> Facturer
                                                    </button>
                                                )}
                                            </td>
                                            <td>
                                                {order.delivery ? (
                                                    <span className="badge bg-info">
                                                        <FaTruck /> Livrée
                                                    </span>
                                                ) : (
                                                    order.invoice && (
                                                        <button
                                                            className="btn btn-sm btn-primary"
                                                            onClick={() => createDelivery(order.id)}
                                                            title="Créer une livraison"
                                                        >
                                                            <FaTruck /> Livrer
                                                        </button>
                                                    )
                                                )}
                                            </td>
                                            <td>
                                                {new Date(order.created_at).toLocaleDateString()}
                                            </td>
                                            <td>
                                                <div className="d-flex flex-column gap-1">
                                                    <button 
                                                        className="btn btn-sm btn-info me-1" 
                                                        onClick={() => setSelectedOrder(order)}
                                                        title="Voir les détails"
                                                    >
                                                        <FaEye /> Détails
                                                    </button>
                                                    <select 
                                                        className="form-select form-select-sm"
                                                        value={order.status}
                                                        onChange={(e) => updateStatus(order.id, e.target.value)}
                                                        style={{ 
                                                            borderRadius: '8px',
                                                            minWidth: '120px',
                                                            fontSize: '0.75rem'
                                                        }}
                                                    >
                                                        {getStatusOptions().map(opt => (
                                                            <option key={opt.value} value={opt.value}>
                                                                {opt.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {order.status === 'pending' && (
                                                        <button
                                                            className="btn btn-sm btn-danger"
                                                            onClick={() => deleteOrder(order.id)}
                                                            title="Supprimer"
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Détails */}
            {selectedOrder && (
                <div className="modal show d-block" style={{ 
                    backgroundColor: 'rgba(0,0,0,0.5)', 
                    zIndex: 1050,
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0
                }}>
                    <div className="modal-dialog modal-lg" style={{ 
                        zIndex: 1051,
                        maxWidth: '800px',
                        margin: '2rem auto'
                    }}>
                        <div className="modal-content" style={{ 
                            borderRadius: '16px',
                            border: 'none',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                        }}>
                            <div className="modal-header" style={{ 
                                background: 'linear-gradient(135deg, #1a2a4f, #2a3f6f)',
                                color: 'white',
                                borderRadius: '16px 16px 0 0',
                                padding: '1.25rem 1.5rem'
                            }}>
                                <h5 className="modal-title">
                                    Commande #{selectedOrder.id} - {selectedOrder.customer_name}
                                </h5>
                                <button 
                                    className="btn-close btn-close-white" 
                                    onClick={() => setSelectedOrder(null)}
                                ></button>
                            </div>
                            <div className="modal-body" style={{ padding: '1.5rem' }}>
                                <div className="row">
                                    <div className="col-md-6">
                                        <h6 style={{ color: '#1a2a4f', fontWeight: '700' }}>
                                            Informations client
                                        </h6>
                                        <p style={{ fontSize: '0.9rem' }}>
                                            <strong>Nom:</strong> {selectedOrder.customer_name}<br />
                                            <strong>Email:</strong> {selectedOrder.customer_email || '-'}<br />
                                            <strong>Téléphone:</strong> {selectedOrder.customer_phone || '-'}<br />
                                            <strong>Adresse:</strong> {selectedOrder.customer_address || '-'}
                                        </p>
                                    </div>
                                    <div className="col-md-6">
                                        <h6 style={{ color: '#1a2a4f', fontWeight: '700' }}>
                                            Informations commande
                                        </h6>
                                        <p style={{ fontSize: '0.9rem' }}>
                                            <strong>Date:</strong> {new Date(selectedOrder.created_at).toLocaleString()}<br />
                                            <strong>Statut:</strong> {getStatusBadge(selectedOrder.status)}<br />
                                            <strong>Total:</strong> <strong style={{ color: '#dc3545' }}>
                                                {parseFloat(selectedOrder.total).toLocaleString()} CFA
                                            </strong>
                                        </p>
                                    </div>
                                </div>
                                <hr />
                                <h6 style={{ color: '#1a2a4f', fontWeight: '700' }}>Articles commandés</h6>
                                <div className="table-responsive">
                                    <table className="table table-sm">
                                        <thead>
                                            <tr>
                                                <th>Produit</th>
                                                <th>Quantité</th>
                                                <th>Prix unitaire</th>
                                                <th>Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedOrder.items && selectedOrder.items.length > 0 ? (
                                                selectedOrder.items.map((item, idx) => (
                                                    <tr key={idx}>
                                                        <td>{item.product_name || item.product?.name || 'Produit'}</td>
                                                        <td>{item.quantity}</td>
                                                        <td>{parseFloat(item.price).toLocaleString()} CFA</td>
                                                        <td>
                                                            <strong style={{ color: '#dc3545' }}>
                                                                {(item.quantity * parseFloat(item.price)).toLocaleString()} CFA
                                                            </strong>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="4" className="text-center text-muted">
                                                        Aucun article
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <hr />
                                <div className="text-end">
                                    <h5 style={{ color: '#1a2a4f' }}>
                                        Total: <strong style={{ color: '#dc3545' }}>
                                            {parseFloat(selectedOrder.total).toLocaleString()} CFA
                                        </strong>
                                    </h5>
                                </div>
                            </div>
                            <div className="modal-footer" style={{ 
                                borderTop: '1px solid #e9ecef',
                                padding: '1rem 1.5rem'
                            }}>
                                <button 
                                    className="btn btn-secondary" 
                                    onClick={() => setSelectedOrder(null)}
                                >
                                    Fermer
                                </button>
                                {!selectedOrder.invoice && (
                                    <button
                                        className="btn btn-warning"
                                        onClick={() => {
                                            createInvoice(selectedOrder.id);
                                            setSelectedOrder(null);
                                        }}
                                        disabled={creating}
                                    >
                                        <FaFileInvoice /> Créer facture
                                    </button>
                                )}
                                {selectedOrder.invoice && !selectedOrder.delivery && (
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => {
                                            createDelivery(selectedOrder.id);
                                            setSelectedOrder(null);
                                        }}
                                    >
                                        <FaTruck /> Créer livraison
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </ClientLayout>
    );
}

export default ClientOrders;