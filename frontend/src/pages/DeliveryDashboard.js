import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    FaTruck, FaCheckCircle, FaClock, FaExclamationTriangle, 
    FaMapMarkerAlt, FaUser, FaSync, FaBox,
    FaPhone
} from 'react-icons/fa';
import Layout from '../components/Layout';
import api from '../api/axios';

function DeliveryDashboard() {
    const [deliveries, setDeliveries] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0
    });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [user, setUser] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(new Date());
    const navigate = useNavigate();

    useEffect(() => {
        loadUserInfo();
        loadDeliveries();
        const interval = setInterval(loadDeliveries, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadUserInfo = async () => {
        try {
            const userId = localStorage.getItem('user_id');
            if (userId) {
                const response = await api.get(`/users/${userId}/`);
                setUser(response.data);
            }
        } catch (error) {
            console.error('Erreur chargement utilisateur:', error);
        }
    };

    const loadDeliveries = async () => {
        try {
            setRefreshing(true);
            
            let deliveriesData = [];
            try {
                const response = await api.get('/deliveries/deliveries/my_deliveries/');
                deliveriesData = response.data || [];
            } catch (e) {
                console.warn('my_deliveries échoué, fallback');
                const response = await api.get('/deliveries/deliveries/');
                const allDeliveries = response.data || [];
                const userId = parseInt(localStorage.getItem('user_id'), 10);
                deliveriesData = allDeliveries.filter(d => d.delivery_person === userId);
            }
            
            setDeliveries(deliveriesData);
            
            const pending = deliveriesData.filter(d => d.status === 'pending' || d.status === 'assigned').length;
            const inProgress = deliveriesData.filter(d => d.status === 'in_progress').length;
            const completed = deliveriesData.filter(d => d.status === 'completed').length;
            
            setStats({
                total: deliveriesData.length,
                pending,
                inProgress,
                completed
            });
            
            setLastUpdate(new Date());
            
        } catch (error) {
            console.error('Erreur chargement livraisons:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const updateDeliveryStatus = async (deliveryId, newStatus) => {
        try {
            await api.patch(`/deliveries/deliveries/${deliveryId}/`, {
                status: newStatus
            });
            
            const updatedDeliveries = deliveries.map(d => 
                d.id === deliveryId ? { ...d, status: newStatus } : d
            );
            
            setDeliveries(updatedDeliveries);
            
            const pending = updatedDeliveries.filter(d => d.status === 'pending' || d.status === 'assigned').length;
            const inProgress = updatedDeliveries.filter(d => d.status === 'in_progress').length;
            const completed = updatedDeliveries.filter(d => d.status === 'completed').length;
            
            setStats({
                total: updatedDeliveries.length,
                pending,
                inProgress,
                completed
            });
            
            alert('✅ Statut mis à jour !');
            loadDeliveries(); // Recharger pour être sûr
        } catch (error) {
            console.error('Erreur mise à jour:', error);
            alert('Erreur lors de la mise à jour');
        }
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            'pending': { label: 'En attente', color: '#ffc107', icon: <FaClock /> },
            'assigned': { label: 'Assignée', color: '#17a2b8', icon: <FaUser /> },
            'in_progress': { label: 'En cours', color: '#007bff', icon: <FaTruck /> },
            'completed': { label: 'Livrée', color: '#28a745', icon: <FaCheckCircle /> },
            'failed': { label: 'Échouée', color: '#dc3545', icon: <FaExclamationTriangle /> }
        };
        const s = statusMap[status] || { label: status, color: '#6c757d', icon: null };
        return <span className="badge" style={{ background: s.color, color: 'white', padding: '0.4rem 0.8rem' }}>{s.icon} {s.label}</span>;
    };

    const StatCard = ({ icon, value, label, color }) => (
        <div className="stat-card" style={{
            background: 'white',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            borderLeft: `4px solid ${color}`,
            textAlign: 'center',
            transition: 'transform 0.2s, box-shadow 0.2s',
            cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)';
        }}
        >
            <div style={{ fontSize: '2rem', color: color }}>{icon}</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1a2a4f' }}>
                {value}
            </div>
            <div style={{ color: '#6c757d', fontSize: '0.9rem' }}>{label}</div>
        </div>
    );

    if (loading) {
        return (
            <Layout>
                <div className="text-center py-5">
                    <div className="spinner-border text-danger" role="status">
                        <span className="visually-hidden">Chargement...</span>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div style={{ padding: '0 0 2rem 0' }}>
                {/* En-tête */}
                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
                    <h2 style={{ color: '#1a2a4f', display: 'flex', alignItems: 'center' }}>
                        <FaTruck className="me-2" style={{ color: '#dc3545' }} />
                        Tableau de bord livreur
                    </h2>
                    <div className="d-flex align-items-center gap-2">
                        <span className="badge" style={{
                            background: '#1a2a4f',
                            color: 'white',
                            padding: '0.5rem 1rem',
                            borderRadius: '8px'
                        }}>
                            <FaUser className="me-2" />
                            {user?.username || 'Livreur'}
                        </span>
                        <button 
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => navigate('/profile')}
                            style={{ borderRadius: '20px' }}
                        >
                            <FaUser className="me-1" /> Profil
                        </button>
                    </div>
                </div>

                {/* Statistiques */}
                <div className="stats-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '1rem',
                    marginBottom: '2rem'
                }}>
                    <StatCard icon={<FaTruck />} value={stats.total} label="Total livraisons" color="#1a2a4f" />
                    <StatCard icon={<FaClock />} value={stats.pending} label="En attente" color="#ffc107" />
                    <StatCard icon={<FaTruck />} value={stats.inProgress} label="En cours" color="#17a2b8" />
                    <StatCard icon={<FaCheckCircle />} value={stats.completed} label="Livrées" color="#28a745" />
                </div>

                {/* Liste des livraisons */}
                <div className="card-custom" style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
                }}>
                    <div className="card-header" style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderBottom: '1px solid #e9ecef',
                        paddingBottom: '0.75rem',
                        marginBottom: '1rem'
                    }}>
                        <h5 style={{ margin: 0, color: '#1a2a4f' }}>
                            <FaTruck className="me-2" /> Mes livraisons
                        </h5>
                        <div>
                            <span className="badge bg-primary rounded-pill me-2">{deliveries.length}</span>
                            <button 
                                className="btn btn-sm btn-outline-primary"
                                onClick={loadDeliveries}
                                disabled={refreshing}
                                style={{ borderRadius: '20px' }}
                            >
                                <FaSync className={refreshing ? 'fa-spin' : ''} />
                            </button>
                        </div>
                    </div>

                    <div className="card-body">
                        {deliveries.length === 0 ? (
                            <div className="text-center text-muted py-5">
                                <FaTruck size={48} className="mb-3" style={{ opacity: 0.3 }} />
                                <p>Aucune livraison assignée</p>
                            </div>
                        ) : (
                            <div className="row">
                                {deliveries.map(delivery => (
                                    <div className="col-md-6 col-lg-4 mb-3" key={delivery.id}>
                                        <div className="card h-100" style={{
                                            borderRadius: '12px',
                                            border: '1px solid #e9ecef',
                                            transition: 'transform 0.2s, box-shadow 0.2s',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-4px)';
                                            e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                                        }}
                                        >
                                            <div className="card-header" style={{
                                                background: '#f8f9fa',
                                                borderBottom: '1px solid #e9ecef',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}>
                                                <span style={{ fontWeight: 'bold', color: '#1a2a4f' }}>
                                                    <FaBox className="me-1" /> #{delivery.id}
                                                </span>
                                                {getStatusBadge(delivery.status)}
                                            </div>
                                            <div className="card-body">
                                                <p className="mb-1">
                                                    <strong>Client:</strong> {delivery.customer_name || '-'}
                                                </p>
                                                <p className="mb-1 text-muted small">
                                                    <FaMapMarkerAlt className="text-danger me-1" />
                                                    {delivery.address || '-'}
                                                </p>
                                                {delivery.customer_phone && (
                                                    <p className="mb-0 text-muted small">
                                                        <FaPhone className="me-1" />
                                                        {delivery.customer_phone}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="card-footer" style={{
                                                background: 'white',
                                                borderTop: '1px solid #e9ecef'
                                            }}>
                                                {delivery.status === 'assigned' && (
                                                    <button
                                                        className="btn btn-primary btn-sm w-100"
                                                        onClick={() => updateDeliveryStatus(delivery.id, 'in_progress')}
                                                    >
                                                        <FaTruck className="me-1" /> Démarrer la livraison
                                                    </button>
                                                )}
                                                {delivery.status === 'in_progress' && (
                                                    <div className="d-flex gap-2">
                                                        <button
                                                            className="btn btn-success btn-sm flex-grow-1"
                                                            onClick={() => updateDeliveryStatus(delivery.id, 'completed')}
                                                        >
                                                            <FaCheckCircle className="me-1" /> Livrer
                                                        </button>
                                                        <button
                                                            className="btn btn-danger btn-sm"
                                                            onClick={() => updateDeliveryStatus(delivery.id, 'failed')}
                                                        >
                                                            <FaExclamationTriangle />
                                                        </button>
                                                    </div>
                                                )}
                                                {delivery.status === 'pending' && (
                                                    <span className="text-warning w-100 d-block text-center">
                                                        <FaClock className="me-1" /> En attente d'assignation
                                                    </span>
                                                )}
                                                {delivery.status === 'completed' && (
                                                    <span className="text-success w-100 d-block text-center">
                                                        <FaCheckCircle className="me-1" /> ✅ Livrée
                                                    </span>
                                                )}
                                                {delivery.status === 'failed' && (
                                                    <span className="text-danger w-100 d-block text-center">
                                                        <FaExclamationTriangle className="me-1" /> Échouée
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Pied de page */}
                <div className="text-center text-muted mt-3" style={{ fontSize: '0.8rem' }}>
                    <FaClock className="me-1" />
                    Dernière mise à jour: {lastUpdate.toLocaleString()}
                </div>
            </div>
        </Layout>
    );
}

export default DeliveryDashboard;