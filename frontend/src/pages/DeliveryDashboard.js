import React, { useState, useEffect } from 'react';
import { FaTruck, FaCheckCircle, FaClock, FaExclamationTriangle, FaMapMarkerAlt, FaUser, FaSync } from 'react-icons/fa';
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
                const userId = parseInt(localStorage.getItem('user_id'));
                deliveriesData = allDeliveries.filter(d => d.delivery_person === userId);
            }
            
            setDeliveries(deliveriesData);
            
            const pending = deliveriesData.filter(d => d.status === 'pending' || d.status === 'assigned').length;
            const inProgress = deliveriesData.filter(d => d.status === 'in_progress').length;
            const completed = deliveriesData.filter(d => d.status === 'completed').length;
            
            setStats({
                total: deliveriesData.length,
                pending: pending,
                inProgress: inProgress,
                completed: completed
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
            
            setDeliveries(prev => 
                prev.map(d => d.id === deliveryId ? { ...d, status: newStatus } : d)
            );
            
            // Recalculer les stats
            const updatedDeliveries = deliveries.map(d => 
                d.id === deliveryId ? { ...d, status: newStatus } : d
            );
            const pending = updatedDeliveries.filter(d => d.status === 'pending' || d.status === 'assigned').length;
            const inProgress = updatedDeliveries.filter(d => d.status === 'in_progress').length;
            const completed = updatedDeliveries.filter(d => d.status === 'completed').length;
            
            setStats({
                total: updatedDeliveries.length,
                pending: pending,
                inProgress: inProgress,
                completed: completed
            });
            
            alert('✅ Statut mis à jour !');
        } catch (error) {
            console.error('Erreur mise à jour:', error);
            alert('Erreur lors de la mise à jour');
        }
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            'pending': { label: 'En attente', color: 'warning', icon: <FaClock /> },
            'assigned': { label: 'Assignée', color: 'info', icon: <FaUser /> },
            'in_progress': { label: 'En cours', color: 'primary', icon: <FaTruck /> },
            'completed': { label: 'Livrée', color: 'success', icon: <FaCheckCircle /> },
            'failed': { label: 'Échouée', color: 'danger', icon: <FaExclamationTriangle /> }
        };
        const s = statusMap[status] || { label: status, color: 'secondary', icon: null };
        return <span className={`badge bg-${s.color} px-3 py-2`}>{s.icon} {s.label}</span>;
    };

    const StatCard = ({ icon, value, label, color }) => (
        <div className="stat-card" style={{
            background: 'white',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            borderLeft: `4px solid ${color}`,
            textAlign: 'center'
        }}>
            <div style={{ fontSize: '2rem', color: color }}>{icon}</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1a2a4f' }}>
                {value}
            </div>
            <div style={{ color: '#6c757d', fontSize: '0.9rem' }}>{label}</div>
        </div>
    );

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-danger" role="status">
                    <span className="visually-hidden">Chargement...</span>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '0 0 2rem 0' }}>
            {/* En-tête */}
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
                <h2 style={{ color: '#1a2a4f', display: 'flex', alignItems: 'center' }}>
                    <FaTruck className="me-2" style={{ color: '#dc3545' }} />
                    Tableau de bord livreur
                </h2>
                <div>
                    <span className="badge" style={{
                        background: '#1a2a4f',
                        color: 'white',
                        padding: '0.5rem 1rem',
                        borderRadius: '8px'
                    }}>
                        <FaUser className="me-2" />
                        {user?.username || 'Livreur'}
                    </span>
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
                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead>
                                    <tr>
                                        <th>#ID</th>
                                        <th>Client</th>
                                        <th>Adresse</th>
                                        <th>Statut</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {deliveries.map(delivery => (
                                        <tr key={delivery.id}>
                                            <td><strong>#{delivery.id}</strong></td>
                                            <td>{delivery.customer_name || '-'}</td>
                                            <td>
                                                <FaMapMarkerAlt className="text-danger me-1" />
                                                {delivery.address || '-'}
                                            </td>
                                            <td>{getStatusBadge(delivery.status)}</td>
                                            <td>
                                                {delivery.status === 'assigned' && (
                                                    <button
                                                        className="btn btn-sm btn-primary"
                                                        onClick={() => updateDeliveryStatus(delivery.id, 'in_progress')}
                                                    >
                                                        Démarrer
                                                    </button>
                                                )}
                                                {delivery.status === 'in_progress' && (
                                                    <button
                                                        className="btn btn-sm btn-success"
                                                        onClick={() => updateDeliveryStatus(delivery.id, 'completed')}
                                                    >
                                                        <FaCheckCircle className="me-1" /> Terminer
                                                    </button>
                                                )}
                                                {delivery.status === 'pending' && (
                                                    <span className="text-warning">En attente d'assignation</span>
                                                )}
                                                {delivery.status === 'completed' && (
                                                    <span className="text-success">✅ Livrée</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
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
    );
}

export default DeliveryDashboard;