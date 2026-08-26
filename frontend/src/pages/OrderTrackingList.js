import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTruck, FaCheckCircle, FaMapMarkerAlt } from 'react-icons/fa';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import ClientLayout from '../components/ClientLayout';
import api from '../api/axios';

// Correction des icônes par défaut de Leaflet avec Webpack/React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function OrderTrackingList() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            const response = await api.get('/shop/client-orders/');
            setOrders(response.data);
            const trackable = response.data.filter(o => o.status !== 'cancelled' && o.status !== 'pending');
            if (trackable.length > 0) {
                setSelectedOrder(trackable[0]);
            }
        } catch (error) {
            console.error('Erreur:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTracking = (orderId) => {
        navigate(`/tracking/${orderId}`);
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
    const defaultPosition = [4.0511, 9.7679]; // Douala coordinates example
    const orderPosition = selectedOrder?.latitude && selectedOrder?.longitude 
        ? [selectedOrder.latitude, selectedOrder.longitude] 
        : defaultPosition;

    return (
        <ClientLayout title="Suivi des commandes" icon={<FaTruck />}>
            {trackableOrders.length === 0 ? (
                <div className="text-center py-5">
                    <FaTruck size={64} className="mb-3" style={{ opacity: 0.5, color: 'white' }} />
                    <h4 className="text-white">Aucune commande disponible</h4>
                    <p className="text-white-50">Vous n'avez pas encore de commandes à suivre.</p>
                </div>
            ) : (
                <div className="row">
                    {/* Tableau des commandes */}
                    <div className="col-lg-7 mb-4">
                        <div className="client-card">
                            <div className="card-header">
                                <h5><FaTruck className="me-2" /> Commandes à suivre</h5>
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
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {trackableOrders.map(order => (
                                                <tr 
                                                    key={order.id} 
                                                    onClick={() => setSelectedOrder(order)}
                                                    style={{ cursor: 'pointer', background: selectedOrder?.id === order.id ? 'rgba(255,255,255,0.05)' : 'transparent' }}
                                                >
                                                    <td>#{order.id}</td>
                                                    <td>{new Date(order.created_at).toLocaleDateString()}</td>
                                                    <td>{parseFloat(order.total).toLocaleString()} CFA</td>
                                                    <td>
                                                        <span className={`badge-client ${order.status}`}>
                                                            {order.status === 'pending' && '⏳ En attente'}
                                                            {order.status === 'confirmed' && '✅ Confirmée'}
                                                            {order.status === 'preparing' && '📦 En préparation'}
                                                            {order.status === 'shipped' && <><FaTruck className="me-1" /> Expédiée</>}
                                                            {order.status === 'delivered' && <><FaCheckCircle className="me-1" /> Livrée</>}
                                                            {order.status === 'cancelled' && '❌ Annulée'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button 
                                                            className="btn btn-sm btn-primary"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleTracking(order.id);
                                                            }}
                                                            disabled={order.status === 'pending'}
                                                        >
                                                            <FaTruck className="me-1" /> 
                                                            {order.status === 'pending' ? 'En attente...' : 'Suivre'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section Carte GPS en temps réel */}
                    <div className="col-lg-5 mb-4">
                        <div className="client-card h-100">
                            <div className="card-header d-flex align-items-center">
                                <h5><FaMapMarkerAlt className="me-2" /> Carte GPS {selectedOrder ? `(Commande #${selectedOrder.id})` : ''}</h5>
                            </div>
                            <div className="card-body p-0" style={{ minHeight: '350px', height: '100%', position: 'relative' }}>
                                <MapContainer 
                                    center={orderPosition} 
                                    zoom={13} 
                                    style={{ height: '100%', width: '100%', minHeight: '350px', borderRadius: '0 0 8px 8px' }}
                                >
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    <Marker position={orderPosition}>
                                        <Popup>
                                            {selectedOrder ? (
                                                <div>
                                                    <strong>Commande #{selectedOrder.id}</strong><br />
                                                    Statut : {selectedOrder.status}
                                                </div>
                                            ) : (
                                                'Position de la commande'
                                            )}
                                        </Popup>
                                    </Marker>
                                </MapContainer>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </ClientLayout>
    );
}

export default OrderTrackingList;