import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { 
    FaMapMarkerAlt, FaTruck, FaCheckCircle, FaClock, 
    FaUser, FaArrowLeft, FaPhone, FaEnvelope, FaBox,
    FaTimes
} from 'react-icons/fa';
import Layout from '../components/Layout';
import api from '../api/axios';

function OrderTracking() {
    const { orderId } = useParams();
    const location = useLocation();
    const [order, setOrder] = useState(null);
    const [delivery, setDelivery] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const id = orderId || location.state?.orderId || '';

    console.log('📌 Order ID from URL:', id);

    const loadData = async () => {
        if (!id || id === 'undefined' || id === 'null' || id === '') {
            setError('ID de commande invalide');
            setLoading(false);
            return;
        }

        try {
            console.log('🔍 Recherche de la commande:', id);
            
            // Récupérer TOUTES les commandes et filtrer
            const response = await api.get('/shop/client-orders/');
            const allOrders = response.data;
            console.log('📦 Toutes les commandes:', allOrders);
            
            // Trouver la commande avec l'ID correspondant
            const foundOrder = allOrders.find(o => o.id === parseInt(id));
            
            if (foundOrder) {
                console.log('✅ Commande trouvée:', foundOrder);
                setOrder(foundOrder);
                setError(null);
            } else {
                console.log('❌ Commande non trouvée avec ID:', id);
                setError('Commande non trouvée');
                setOrder(null);
            }
            
            // Récupérer la livraison si elle existe
            try {
                const deliveryRes = await api.get(`/deliveries/deliveries/?order=${id}`);
                console.log('🚚 Livraison:', deliveryRes.data);
                setDelivery(deliveryRes.data[0] || null);
            } catch (deliveryErr) {
                console.log('⚠️ Aucune livraison trouvée');
                setDelivery(null);
            }
            
        } catch (err) {
            console.error('❌ Erreur:', err);
            
            if (err.response?.status === 404) {
                setError('Commande non trouvée');
            } else if (err.response?.status === 403) {
                setError('Vous n\'avez pas accès à cette commande');
            } else if (err.response?.status === 401) {
                setError('Veuillez vous reconnecter');
            } else {
                setError('Impossible de charger les informations de suivi');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id && id !== 'undefined' && id !== 'null' && id !== '') {
            loadData();
            const interval = setInterval(loadData, 30000);
            return () => clearInterval(interval);
        } else {
            setError('ID de commande invalide');
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    // ... le reste du code reste identique
    const getStatusIcon = (status) => {
        const icons = {
            'pending': <FaClock style={{ color: '#ffc107' }} />,
            'confirmed': <FaCheckCircle style={{ color: '#17a2b8' }} />,
            'preparing': <FaBox style={{ color: '#007bff' }} />,
            'shipped': <FaTruck style={{ color: '#6f42c1' }} />,
            'delivered': <FaCheckCircle style={{ color: '#28a745' }} />,
            'cancelled': <FaTimes style={{ color: '#dc3545' }} />
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

    const getStatusClass = (status) => {
        const classes = {
            'pending': 'warning',
            'confirmed': 'info',
            'preparing': 'primary',
            'shipped': 'primary',
            'delivered': 'success',
            'cancelled': 'danger'
        };
        return classes[status] || 'secondary';
    };

    const getStatusColor = (status) => {
        const colors = {
            'warning': '#ffc107',
            'info': '#17a2b8',
            'primary': '#007bff',
            'success': '#28a745',
            'danger': '#dc3545',
            'secondary': '#6c757d'
        };
        return colors[getStatusClass(status)] || '#6c757d';
    };

    if (loading) {
        return (
            <Layout>
                <div className="text-center py-5">
                    <div className="spinner-border text-danger" role="status">
                        <span className="visually-hidden">Chargement...</span>
                    </div>
                    <p className="mt-2 text-muted">Chargement des informations...</p>
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout>
                <div className="container py-5">
                    <div className="alert alert-danger shadow-sm" style={{ borderRadius: '16px' }}>
                        <div className="d-flex align-items-center">
                            <span style={{ fontSize: '2rem', marginRight: '1rem' }}>❌</span>
                            <div>
                                <strong>Erreur:</strong> {error}
                                <br />
                                <small>Veuillez réessayer ou contacter le support.</small>
                            </div>
                        </div>
                        <button 
                            className="btn btn-primary mt-3"
                            onClick={loadData}
                            style={{ backgroundColor: '#dc3545', borderColor: '#dc3545' }}
                        >
                            <FaTruck className="me-1" /> Réessayer
                        </button>
                        <Link to="/my-orders" className="btn btn-outline-secondary mt-3 ms-2">
                            <FaArrowLeft className="me-1" /> Retour à mes commandes
                        </Link>
                    </div>
                </div>
            </Layout>
        );
    }

    if (!order) {
        return (
            <Layout>
                <div className="container py-5 text-center">
                    <FaTruck size={64} className="mb-3" style={{ opacity: 0.3, color: '#6c757d' }} />
                    <h3>Commande non trouvée</h3>
                    <p className="text-muted">La commande que vous recherchez n'existe pas ou a été supprimée.</p>
                    <Link to="/my-orders" className="btn btn-primary mt-3">
                        <FaArrowLeft className="me-1" /> Retour à mes commandes
                    </Link>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="container py-4">
                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
                    <h2 style={{ color: '#1a2a4f' }}>
                        <FaTruck className="me-2" style={{ color: '#dc3545' }} />
                        Suivi de la commande #{order.id}
                    </h2>
                    <Link to="/my-orders" className="btn btn-outline-primary">
                        <FaArrowLeft className="me-1" /> Mes commandes
                    </Link>
                </div>

                {/* Informations commande */}
                <div className="row mb-4">
                    <div className="col-md-8">
                        <div className="card shadow-sm" style={{ borderRadius: '16px', border: 'none' }}>
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center flex-wrap">
                                    <div>
                                        <span className="badge" style={{ 
                                            background: getStatusColor(order.status),
                                            color: 'white',
                                            fontSize: '1rem',
                                            padding: '0.5rem 1.5rem',
                                            borderRadius: '20px'
                                        }}>
                                            {getStatusIcon(order.status)} {getStatusLabel(order.status)}
                                        </span>
                                        <span className="ms-3 text-muted">
                                            <FaClock className="me-1" />
                                            {new Date(order.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div>
                                        <strong style={{ color: '#dc3545', fontSize: '1.2rem' }}>
                                            {parseFloat(order.total).toLocaleString()} CFA
                                        </strong>
                                    </div>
                                </div>
                                {delivery && (
                                    <div className="mt-2 text-muted small">
                                        <FaTruck className="me-1" />
                                        Livreur: {delivery.delivery_person_name || 'En cours d\'assignation'}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card shadow-sm" style={{ borderRadius: '16px', border: 'none' }}>
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <FaUser className="me-2" style={{ color: '#1a2a4f' }} />
                                    <div>
                                        <div style={{ fontWeight: '600' }}>{order.customer_name}</div>
                                        <small className="text-muted">
                                            <FaEnvelope className="me-1" />
                                            {order.customer_email}
                                        </small>
                                        {order.customer_phone && (
                                            <div>
                                                <small className="text-muted">
                                                    <FaPhone className="me-1" />
                                                    {order.customer_phone}
                                                </small>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Timeline */}
                <div className="card shadow-sm" style={{ borderRadius: '16px', border: 'none' }}>
                    <div className="card-header" style={{ 
                        background: '#f8f9fa', 
                        borderRadius: '16px 16px 0 0',
                        borderBottom: '1px solid #e9ecef'
                    }}>
                        <h6 className="mb-0">📋 Historique du suivi</h6>
                    </div>
                    <div className="card-body">
                        <div className="timeline">
                            <div className="timeline-item">
                                <div className="timeline-icon bg-success">
                                    <FaCheckCircle />
                                </div>
                                <div className="timeline-content">
                                    <h6>Commande passée</h6>
                                    <p className="text-muted small">
                                        {new Date(order.created_at).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            {order.status !== 'pending' && (
                                <div className="timeline-item">
                                    <div className="timeline-icon bg-info">
                                        <FaCheckCircle />
                                    </div>
                                    <div className="timeline-content">
                                        <h6>Commande confirmée</h6>
                                        <p className="text-muted small">
                                            {new Date(order.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {(order.status === 'preparing' || order.status === 'shipped' || order.status === 'delivered') && (
                                <div className="timeline-item">
                                    <div className="timeline-icon bg-primary">
                                        <FaBox />
                                    </div>
                                    <div className="timeline-content">
                                        <h6>En préparation</h6>
                                        <p className="text-muted small">
                                            Votre commande est en cours de préparation
                                        </p>
                                    </div>
                                </div>
                            )}

                            {(order.status === 'shipped' || order.status === 'delivered') && (
                                <div className="timeline-item">
                                    <div className="timeline-icon bg-primary">
                                        <FaTruck />
                                    </div>
                                    <div className="timeline-content">
                                        <h6>Expédiée</h6>
                                        <p className="text-muted small">
                                            Votre commande est en route !
                                        </p>
                                    </div>
                                </div>
                            )}

                            {order.status === 'delivered' && (
                                <div className="timeline-item">
                                    <div className="timeline-icon bg-success">
                                        <FaCheckCircle />
                                    </div>
                                    <div className="timeline-content">
                                        <h6>Livrée !</h6>
                                        <p className="text-success">
                                            ✅ Votre commande a été livrée avec succès
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Adresse */}
                {order.customer_address && (
                    <div className="card shadow-sm mt-4" style={{ borderRadius: '16px', border: 'none' }}>
                        <div className="card-body">
                            <h6 className="mb-2">
                                <FaMapMarkerAlt className="me-2" style={{ color: '#dc3545' }} />
                                Adresse de livraison
                            </h6>
                            <p className="mb-0">{order.customer_address}</p>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                .timeline {
                    position: relative;
                    padding-left: 30px;
                }
                .timeline::before {
                    content: '';
                    position: absolute;
                    left: 10px;
                    top: 0;
                    bottom: 0;
                    width: 2px;
                    background: #e9ecef;
                }
                .timeline-item {
                    position: relative;
                    padding: 10px 0 10px 20px;
                }
                .timeline-item:last-child {
                    padding-bottom: 0;
                }
                .timeline-icon {
                    position: absolute;
                    left: -24px;
                    top: 10px;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 14px;
                }
                .timeline-icon.bg-success { background: #28a745; }
                .timeline-icon.bg-info { background: #17a2b8; }
                .timeline-icon.bg-primary { background: #007bff; }
                .timeline-content h6 {
                    margin: 0;
                    font-size: 0.95rem;
                    color: #1a2a4f;
                }
                .timeline-content p {
                    margin: 0;
                }
                @media (max-width: 768px) {
                    .timeline {
                        padding-left: 20px;
                    }
                    .timeline-icon {
                        width: 24px;
                        height: 24px;
                        font-size: 10px;
                        left: -18px;
                        top: 8px;
                    }
                    .timeline-item {
                        padding: 8px 0 8px 15px;
                    }
                }
            `}</style>
        </Layout>
    );
}

export default OrderTracking;