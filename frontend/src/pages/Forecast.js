import React, { useState, useEffect } from 'react';
import { 
    FaChartLine, FaBoxes, FaExclamationTriangle, 
    FaShoppingCart, FaClock, FaLightbulb, FaTruck
} from 'react-icons/fa';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import api from '../api/axios';
import { FaCheckCircle } from 'react-icons/fa';

// Enregistrement des composants Chart.js
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

function Forecast() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [days, setDays] = useState(30);

    const loadData = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/core/forecast-dashboard/?days=${days}`);
            setData(response.data);
        } catch (error) {
            console.error('Erreur chargement prévisions:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 300000); // Rafraîchir toutes les 5 minutes
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [days]);

    const StatsCard = ({ icon, value, label, color, subtitle }) => (
        <div className="stat-card" style={{
            background: 'white',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            borderLeft: `4px solid ${color}`,
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
            <div className="d-flex justify-content-between align-items-start">
                <div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1a2a4f' }}>
                        {typeof value === 'number' ? value.toLocaleString() : value}
                    </div>
                    <div style={{ color: '#6c757d', fontSize: '0.9rem' }}>{label}</div>
                    {subtitle && (
                        <div style={{ fontSize: '0.8rem', color: color, marginTop: '4px' }}>
                            {subtitle}
                        </div>
                    )}
                </div>
                <div style={{ color: color, fontSize: '2rem', opacity: 0.8 }}>{icon}</div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="text-center py-5" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div>
                    <div className="spinner-border text-danger mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
                        <span className="visually-hidden">Chargement...</span>
                    </div>
                    <p className="text-muted">Chargement des prévisions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="forecast-container" style={{ padding: '0 0 2rem 0' }}>
            {/* En-tête */}
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
                <h2 style={{ color: '#1a2a4f', display: 'flex', alignItems: 'center' }}>
                    <FaChartLine className="me-2" style={{ color: '#dc3545' }} />
                    Module de prévision
                </h2>
                <div className="d-flex align-items-center gap-2 flex-wrap">
                    <label className="me-2" style={{ color: '#6c757d' }}>Période:</label>
                    <select 
                        className="form-select form-select-sm"
                        value={days}
                        onChange={(e) => setDays(parseInt(e.target.value))}
                        style={{ width: 'auto', borderRadius: '10px', padding: '0.4rem 1rem' }}
                    >
                        <option value="7">7 jours</option>
                        <option value="15">15 jours</option>
                        <option value="30">30 jours</option>
                        <option value="60">60 jours</option>
                        <option value="90">90 jours</option>
                    </select>
                    <button 
                        className="btn btn-sm btn-outline-primary"
                        onClick={loadData}
                        style={{ borderRadius: '10px', padding: '0.4rem 1rem' }}
                    >
                        <FaChartLine className="me-1" /> Actualiser
                    </button>
                </div>
            </div>

            {/* Cartes de statistiques */}
            <div className="stats-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem'
            }}>
                <StatsCard 
                    icon={<FaShoppingCart />}
                    value={data?.dashboard_stats?.monthly_sales || 0}
                    label="Ventes du mois (CFA)"
                    color="#dc3545"
                    subtitle={`${data?.dashboard_stats?.daily_sales || 0} CFA aujourd'hui`}
                />
                <StatsCard 
                    icon={<FaClock />}
                    value={data?.dashboard_stats?.pending_orders || 0}
                    label="Commandes en cours"
                    color="#ffc107"
                />
                <StatsCard 
                    icon={<FaBoxes />}
                    value={data?.dashboard_stats?.total_products || 0}
                    label="Total produits"
                    color="#1a2a4f"
                />
                <StatsCard 
                    icon={<FaExclamationTriangle />}
                    value={data?.dashboard_stats?.low_stock_count || 0}
                    label="Produits en stock bas"
                    color="#dc3545"
                    subtitle={data?.dashboard_stats?.low_stock_count > 0 ? '⚠️ À réapprovisionner' : '✅ Stock OK'}
                />
            </div>

            {/* Graphique des tendances */}
            <div className="card-custom mb-4" style={{
                background: 'white',
                borderRadius: '16px',
                padding: '1.5rem',
                boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
            }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 style={{ color: '#1a2a4f', margin: 0 }}>
                        📈 Tendance des ventes
                    </h5>
                    <span className="badge bg-primary rounded-pill">
                        Moyenne: {data?.sales_trend?.avg_daily?.toLocaleString() || 0} CFA/jour
                    </span>
                </div>
                <div style={{ height: '300px' }}>
                    <Line
                        data={{
                            labels: data?.sales_trend?.dates || [],
                            datasets: [
                                {
                                    label: 'Ventes réelles',
                                    data: data?.sales_trend?.amounts || [],
                                    borderColor: '#dc3545',
                                    backgroundColor: 'rgba(220, 53, 69, 0.1)',
                                    tension: 0.4,
                                    fill: true,
                                    pointBackgroundColor: '#dc3545',
                                    pointBorderColor: '#fff',
                                    pointBorderWidth: 2,
                                    pointRadius: 4
                                },
                                {
                                    label: 'Prévision',
                                    data: data?.sales_trend?.forecast?.map(f => f.predicted) || [],
                                    borderColor: '#1a2a4f',
                                    backgroundColor: 'rgba(26, 42, 79, 0.05)',
                                    borderDash: [5, 5],
                                    tension: 0.4,
                                    fill: false,
                                    pointBackgroundColor: '#1a2a4f',
                                    pointBorderColor: '#fff',
                                    pointBorderWidth: 2,
                                    pointRadius: 4
                                }
                            ]
                        }}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    position: 'bottom',
                                    labels: {
                                        padding: 20,
                                        usePointStyle: true
                                    }
                                },
                                tooltip: {
                                    callbacks: {
                                        label: function(context) {
                                            return context.dataset.label + ': ' + context.parsed.y.toLocaleString() + ' CFA';
                                        }
                                    }
                                }
                            },
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    ticks: {
                                        callback: function(value) {
                                            return value.toLocaleString() + ' CFA';
                                        }
                                    }
                                }
                            }
                        }}
                    />
                </div>
                {data?.sales_trend?.forecast?.length > 0 && (
                    <div className="mt-3 text-muted" style={{ fontSize: '0.85rem' }}>
                        <FaChartLine className="me-1" />
                        Prévision sur les 7 prochains jours basée sur la tendance actuelle
                    </div>
                )}
            </div>

            <div className="row">
                {/* Suggestions de réapprovisionnement */}
                <div className="col-md-6 mb-4">
                    <div className="card-custom" style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                        height: '100%'
                    }}>
                        <h5 style={{ color: '#1a2a4f', marginBottom: '1rem' }}>
                            <FaTruck className="me-2" style={{ color: '#17a2b8' }} />
                            Suggestions de réapprovisionnement
                            <span className="badge bg-primary ms-2">{data?.replenishment?.length || 0}</span>
                        </h5>
                        {data?.replenishment?.length === 0 ? (
                            <div className="text-center py-4">
                                <FaCheckCircle size={40} className="text-success mb-2" />
                                <p className="text-muted mb-0">✅ Aucun produit à réapprovisionner</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-sm table-hover">
                                    <thead>
                                        <tr>
                                            <th>Produit</th>
                                            <th>Stock</th>
                                            <th>Ventes/jour</th>
                                            <th>Jours restants</th>
                                            <th>À commander</th>
                                            <th>Priorité</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data?.replenishment?.map((item, index) => (
                                            <tr key={index}>
                                                <td style={{ fontWeight: '500' }}>{item.product_name}</td>
                                                <td>{item.current_stock}</td>
                                                <td>{item.daily_sales}</td>
                                                <td>{item.days_until_out}</td>
                                                <td><strong>{item.suggested_order}</strong></td>
                                                <td>
                                                    <span className={`badge ${
                                                        item.priority === 'high' ? 'bg-danger' :
                                                        item.priority === 'medium' ? 'bg-warning' :
                                                        'bg-success'
                                                    }`}>
                                                        {item.priority === 'high' ? '🚨 Urgent' :
                                                         item.priority === 'medium' ? '⚠️ Moyen' : '✅ Normal'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Produits à écouler */}
                <div className="col-md-6 mb-4">
                    <div className="card-custom" style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                        height: '100%'
                    }}>
                        <h5 style={{ color: '#1a2a4f', marginBottom: '1rem' }}>
                            <FaLightbulb className="me-2" style={{ color: '#ffc107' }} />
                            Produits à écouler
                            <span className="badge bg-warning ms-2">{data?.products_to_sell?.length || 0}</span>
                        </h5>
                        {data?.products_to_sell?.length === 0 ? (
                            <div className="text-center py-4">
                                <FaCheckCircle size={40} className="text-success mb-2" />
                                <p className="text-muted mb-0">✅ Aucun produit à écouler</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-sm table-hover">
                                    <thead>
                                        <tr>
                                            <th>Produit</th>
                                            <th>Stock</th>
                                            <th>Ventes 30j</th>
                                            <th>Jours pour écouler</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data?.products_to_sell?.map((item, index) => (
                                            <tr key={index}>
                                                <td style={{ fontWeight: '500' }}>{item.product_name}</td>
                                                <td>{item.stock}</td>
                                                <td>{item.sales_30d}</td>
                                                <td>{item.days_to_sell}</td>
                                                <td>
                                                    <button className="btn btn-sm btn-warning">
                                                        🏷️ Promo
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Alertes stock bas */}
            <div className="card-custom" style={{
                background: 'white',
                borderRadius: '16px',
                padding: '1.5rem',
                boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
            }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 style={{ color: '#1a2a4f', margin: 0 }}>
                        <FaExclamationTriangle className="me-2" style={{ color: '#dc3545' }} />
                        Alertes stock bas
                    </h5>
                    <span className="badge bg-danger rounded-pill">{data?.low_stock?.length || 0}</span>
                </div>
                {data?.low_stock?.length === 0 ? (
                    <div className="text-center py-4">
                        <FaCheckCircle size={40} className="text-success mb-2" />
                        <p className="text-muted mb-0">✅ Tous les stocks sont suffisants</p>
                    </div>
                ) : (
                    <div className="row">
                        {data?.low_stock?.map((product) => (
                            <div key={product.id} className="col-md-3 col-sm-6 mb-3">
                                <div className="card h-100" style={{ 
                                    borderLeft: '4px solid #dc3545',
                                    borderRadius: '10px',
                                    transition: 'transform 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                                >
                                    <div className="card-body">
                                        <h6 className="card-title" style={{ fontSize: '0.9rem' }}>{product.name}</h6>
                                        <p className="card-text">
                                            <span className="text-danger">
                                                <strong>Stock: {product.quantity}</strong>
                                            </span>
                                            <br />
                                            <small className="text-muted">{product.category || 'Non catégorisé'}</small>
                                        </p>
                                        <button className="btn btn-sm btn-outline-danger w-100">
                                            Réapprovisionner
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Pied de page */}
            <div className="text-center text-muted mt-3" style={{ fontSize: '0.8rem' }}>
                <FaChartLine className="me-1" />
                Données mises à jour automatiquement toutes les 5 minutes
                <span className="mx-2">|</span>
                <FaClock className="me-1" />
                Dernière mise à jour: {new Date().toLocaleString()}
            </div>
        </div>
    );
}

export default Forecast;