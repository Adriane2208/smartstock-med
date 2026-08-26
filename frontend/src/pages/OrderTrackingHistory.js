import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTruck, FaCheckCircle, FaClock, FaTimes, FaArrowLeft } from 'react-icons/fa';
import Layout from '../components/Layout';
import api from '../api/axios';

function OrderTrackingHistory() {
    const [deliveries, setDeliveries] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const response = await api.get('/deliveries/deliveries/');
            const allDeliveries = response.data || [];
            const userId = parseInt(localStorage.getItem('user_id'), 10);
            const myDeliveries = allDeliveries.filter(d => d.delivery_person === userId);
            setDeliveries(myDeliveries);
        } catch (error) {
            console.error('Erreur:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            'pending': { label: 'En attente', color: '#ffc107', icon: <FaClock /> },
            'assigned': { label: 'Assignée', color: '#17a2b8', icon: <FaClock /> },
            'in_progress': { label: 'En cours', color: '#007bff', icon: <FaTruck /> },
            'completed': { label: 'Livrée', color: '#28a745', icon: <FaCheckCircle /> },
            'failed': { label: 'Échouée', color: '#dc3545', icon: <FaTimes /> }
        };
        const s = statusMap[status] || { label: status, color: '#6c757d', icon: null };
        return <span className="badge" style={{ background: s.color, color: 'white' }}>{s.icon} {s.label}</span>;
    };

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
            <div className="container py-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 style={{ color: '#1a2a4f' }}>
                        <FaTruck className="me-2" /> Historique des livraisons
                    </h2>
                    <button 
                        className="btn btn-outline-primary"
                        onClick={() => navigate('/delivery-dashboard')}
                    >
                        <FaArrowLeft className="me-1" /> Retour
                    </button>
                </div>

                {deliveries.length === 0 ? (
                    <div className="alert alert-info">
                        Aucune livraison dans l'historique.
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
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {deliveries.map(delivery => (
                                    <tr key={delivery.id}>
                                        <td>#{delivery.id}</td>
                                        <td>{delivery.customer_name || '-'}</td>
                                        <td>{delivery.address || '-'}</td>
                                        <td>{getStatusBadge(delivery.status)}</td>
                                        <td>{new Date(delivery.created_at).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </Layout>
    );
}

export default OrderTrackingHistory;