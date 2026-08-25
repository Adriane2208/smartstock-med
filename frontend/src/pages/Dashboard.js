import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    FaChartLine, FaBoxes, FaFileInvoice, FaTruck, 
    FaExclamationTriangle, FaCheckCircle,
    FaShoppingCart, FaUsers, FaBrain  // ← AJOUTER FaBrain
} from 'react-icons/fa';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
    Filler
} from 'chart.js';
import ProductImage from '../components/ProductImage';
import api from '../api/axios';
import './Dashboard.css';

// Enregistrement des composants Chart.js
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
    Filler
);

function Dashboard() {
    const [stats, setStats] = useState({
        ca: 0,
        caMonth: 0,
        stockCount: 0,
        invoiceCount: 0,
        deliveryCount: 0,
        pendingOrders: 0,
        totalClients: 0,
        topProducts: [],
        lowStock: [],
        recentOrders: []
    });
    
    const [chartData, setChartData] = useState({
        salesTrend: { labels: [], data: [] },
        categoryDistribution: { labels: [], data: [], colors: [] },
        topProductsChart: { labels: [], data: [] },
        orderStatus: { labels: [], data: [], colors: [] }
    });
    
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('month');
    const navigate = useNavigate();

    // Couleurs pour les graphiques
    const CHART_COLORS = [
        '#dc3545', '#1a2a4f', '#28a745', '#ffc107', '#17a2b8',
        '#6f42c1', '#fd7e14', '#20c997', '#e83e8c', '#007bff'
    ];

    // Fonction pour lancer l'analyse intelligente
    const runIntelligence = async () => {
        try {
            const response = await api.post('/core/run-intelligence/');
            alert(`✅ ${response.data.alerts} produits dormants détectés`);
            loadDashboard();
        } catch (error) {
            alert('Erreur lors de l\'analyse');
        }
    };

    const loadDashboard = async () => {
        try {
            setLoading(true);
            
            const [productsResp, invoicesResp, deliveriesResp, ordersResp, usersResp] = await Promise.all([
                api.get('/products/products/'),
                api.get('/sales/invoices/'),
                api.get('/deliveries/deliveries/'),
                api.get('/shop/client-orders/').catch(() => ({ data: [] })),
                api.get('/users/').catch(() => ({ data: [] }))
            ]);

            const products = productsResp.data || [];
            const invoices = invoicesResp.data || [];
            const deliveries = deliveriesResp.data || [];
            const orders = ordersResp.data || [];
            const users = usersResp.data || [];

            // ===== CALCUL DES STATISTIQUES =====
            let caTotal = 0;
            let caMonth = 0;
            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();

            invoices.forEach(inv => {
                const total = parseFloat(inv.total || 0);
                caTotal += total;
                
                const invDate = new Date(inv.created_at);
                if (invDate.getMonth() === currentMonth && invDate.getFullYear() === currentYear) {
                    caMonth += total;
                }
            });

            const stockCount = products.reduce((sum, p) => sum + (p.quantity || 0), 0);
            const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'confirmed').length;
            const totalClients = users.filter(u => u.role === 'client').length;
            const topProducts = [...products].sort((a, b) => (b.quantity || 0) - (a.quantity || 0)).slice(0, 5);
            const lowStock = products.filter(p => (p.quantity || 0) < 10).slice(0, 10);
            const recentOrders = orders.slice(0, 5);

            setStats({
                ca: caTotal,
                caMonth: caMonth,
                stockCount: stockCount,
                invoiceCount: invoices.length,
                deliveryCount: deliveries.length,
                pendingOrders: pendingOrders,
                totalClients: totalClients,
                topProducts: topProducts,
                lowStock: lowStock,
                recentOrders: recentOrders
            });

            // ===== PRÉPARATION DES DONNÉES POUR LES GRAPHIQUES =====
            const categoryMap = {};
            products.forEach(p => {
                const catName = p.category_name || 'Non catégorisé';
                categoryMap[catName] = (categoryMap[catName] || 0) + 1;
            });
            const categoryLabels = Object.keys(categoryMap);
            const categoryData = Object.values(categoryMap);

            const top5Products = [...products]
                .sort((a, b) => (b.quantity || 0) - (a.quantity || 0))
                .slice(0, 5);

            const monthlySales = {};
            invoices.forEach(inv => {
                const date = new Date(inv.created_at);
                const monthKey = date.toLocaleString('fr', { month: 'short', year: 'numeric' });
                monthlySales[monthKey] = (monthlySales[monthKey] || 0) + parseFloat(inv.total || 0);
            });
            
            const months = [];
            const salesData = [];
            const monthKeys = Object.keys(monthlySales).slice(-6);
            monthKeys.forEach(key => {
                months.push(key);
                salesData.push(monthlySales[key]);
            });

            const statusMap = {};
            orders.forEach(o => {
                const status = o.status || 'pending';
                const statusLabels = {
                    'pending': 'En attente',
                    'confirmed': 'Confirmée',
                    'preparing': 'En préparation',
                    'shipped': 'Expédiée',
                    'delivered': 'Livrée',
                    'cancelled': 'Annulée'
                };
                const label = statusLabels[status] || status;
                statusMap[label] = (statusMap[label] || 0) + 1;
            });

            setChartData({
                salesTrend: {
                    labels: months.length > 0 ? months : ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
                    data: salesData.length > 0 ? salesData : [0, 0, 0, 0, 0, 0]
                },
                categoryDistribution: {
                    labels: categoryLabels,
                    data: categoryData,
                    colors: categoryData.map((_, i) => CHART_COLORS[i % CHART_COLORS.length])
                },
                topProductsChart: {
                    labels: top5Products.map(p => p.name || 'Sans nom'),
                    data: top5Products.map(p => p.quantity || 0)
                },
                orderStatus: {
                    labels: Object.keys(statusMap),
                    data: Object.values(statusMap),
                    colors: Object.keys(statusMap).map(status => {
                        const statusColors = {
                            'En attente': '#ffc107',
                            'Confirmée': '#17a2b8',
                            'En préparation': '#007bff',
                            'Expédiée': '#6f42c1',
                            'Livrée': '#28a745',
                            'Annulée': '#dc3545'
                        };
                        return statusColors[status] || '#6c757d';
                    })
                }
            });

        } catch (error) {
            console.error('Erreur chargement dashboard:', error);
            if (error.response?.status === 401 || error.response?.status === 403) {
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboard();
        const interval = setInterval(loadDashboard, 60000);
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const StatCard = ({ icon, value, label, color, subtitle }) => (
        <div className="stat-card" style={{ 
            background: 'white',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            cursor: 'pointer',
            borderLeft: `4px solid ${color}`
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
                    <div className="stat-value" style={{ 
                        fontSize: '2rem', 
                        fontWeight: 'bold',
                        color: '#1a2a4f'
                    }}>
                        {typeof value === 'number' ? value.toLocaleString() : value}
                    </div>
                    <div className="stat-label" style={{ color: '#6c757d', fontSize: '0.9rem' }}>
                        {label}
                    </div>
                    {subtitle && (
                        <div style={{ fontSize: '0.8rem', color: '#28a745', marginTop: '4px' }}>
                            {subtitle}
                        </div>
                    )}
                </div>
                <div className="stat-icon" style={{ 
                    color: color,
                    fontSize: '2rem',
                    opacity: 0.8
                }}>
                    {icon}
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="dashboard-loader" style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '60vh'
            }}>
                <div className="spinner-border text-danger" role="status" style={{ width: '3rem', height: '3rem' }}>
                    <span className="visually-hidden">Chargement...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container" style={{ padding: '0 0 2rem 0' }}>
            {/* En-tête */}
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
                <h2 style={{ color: '#1a2a4f', display: 'flex', alignItems: 'center' }}>
                    <FaChartLine className="me-2" style={{ color: '#dc3545' }} /> 
                    Tableau de bord
                </h2>
                <div className="d-flex align-items-center gap-2">
                    <button 
                        className="btn btn-warning me-2"
                        onClick={runIntelligence}
                        style={{ borderRadius: '20px' }}
                    >
                        <FaBrain className="me-1" /> Lancer l'analyse
                    </button>
                    <span className="badge" style={{ 
                        background: '#1a2a4f', 
                        color: 'white',
                        padding: '0.5rem 1rem',
                        borderRadius: '8px'
                    }}>
                        Dernière mise à jour: {new Date().toLocaleString()}
                    </span>
                </div>
            </div>

            {/* Cartes de statistiques */}
            <div className="stats-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem'
            }}>
                <StatCard 
                    icon={<FaChartLine />}
                    value={stats.ca}
                    label="Chiffre d'affaires total (CFA)"
                    color="#dc3545"
                    subtitle={`+${stats.caMonth.toLocaleString()} CFA ce mois`}
                />
                <StatCard 
                    icon={<FaBoxes />}
                    value={stats.stockCount}
                    label="Unités en stock"
                    color="#1a2a4f"
                />
                <StatCard 
                    icon={<FaFileInvoice />}
                    value={stats.invoiceCount}
                    label="Factures"
                    color="#17a2b8"
                />
                <StatCard 
                    icon={<FaTruck />}
                    value={stats.deliveryCount}
                    label="Livraisons"
                    color="#28a745"
                />
                <StatCard 
                    icon={<FaShoppingCart />}
                    value={stats.pendingOrders}
                    label="Commandes en attente"
                    color="#ffc107"
                />
                <StatCard 
                    icon={<FaUsers />}
                    value={stats.totalClients}
                    label="Clients inscrits"
                    color="#6f42c1"
                />
            </div>

            {/* Graphiques - Ligne 1 */}
            <div className="dashboard-grid" style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr',
                gap: '1.5rem',
                marginBottom: '1.5rem'
            }}>
                {/* Graphique des ventes */}
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
                        marginBottom: '1rem',
                        borderBottom: '1px solid #e9ecef',
                        paddingBottom: '0.75rem'
                    }}>
                        <h6 style={{ margin: 0, color: '#1a2a4f' }}>
                            📈 Évolution des ventes
                        </h6>
                        <select 
                            className="form-select form-select-sm" 
                            style={{ width: 'auto' }}
                            value={period}
                            onChange={(e) => setPeriod(e.target.value)}
                        >
                            <option value="week">Cette semaine</option>
                            <option value="month">Ce mois</option>
                            <option value="year">Cette année</option>
                        </select>
                    </div>
                    <div className="card-body" style={{ height: '280px' }}>
                        <Line
                            data={{
                                labels: chartData.salesTrend.labels,
                                datasets: [{
                                    label: 'Ventes (CFA)',
                                    data: chartData.salesTrend.data,
                                    borderColor: '#dc3545',
                                    backgroundColor: 'rgba(220, 53, 69, 0.1)',
                                    tension: 0.4,
                                    fill: true,
                                    pointBackgroundColor: '#dc3545',
                                    pointBorderColor: '#fff',
                                    pointBorderWidth: 2,
                                    pointRadius: 4
                                }]
                            }}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        display: false
                                    },
                                    tooltip: {
                                        callbacks: {
                                            label: function(context) {
                                                return context.parsed.y.toLocaleString() + ' CFA';
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
                </div>

                {/* Distribution par catégorie */}
                <div className="card-custom" style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
                }}>
                    <div className="card-header" style={{
                        borderBottom: '1px solid #e9ecef',
                        paddingBottom: '0.75rem',
                        marginBottom: '1rem'
                    }}>
                        <h6 style={{ margin: 0, color: '#1a2a4f' }}>
                            🏷️ Produits par catégorie
                        </h6>
                    </div>
                    <div className="card-body" style={{ height: '280px' }}>
                        {chartData.categoryDistribution.labels.length > 0 ? (
                            <Doughnut
                                data={{
                                    labels: chartData.categoryDistribution.labels,
                                    datasets: [{
                                        data: chartData.categoryDistribution.data,
                                        backgroundColor: chartData.categoryDistribution.colors,
                                        borderWidth: 2,
                                        borderColor: '#fff'
                                    }]
                                }}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            position: 'bottom',
                                            labels: {
                                                padding: 10,
                                                font: { size: 11 }
                                            }
                                        }
                                    },
                                    cutout: '60%'
                                }}
                            />
                        ) : (
                            <div className="text-center text-muted py-5">
                                <FaBoxes size={48} className="mb-3" style={{ opacity: 0.3 }} />
                                <p>Aucune catégorie disponible</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Graphiques - Ligne 2 */}
            <div className="dashboard-grid" style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1.5rem',
                marginBottom: '1.5rem'
            }}>
                {/* Top 5 produits */}
                <div className="card-custom" style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
                }}>
                    <div className="card-header" style={{
                        borderBottom: '1px solid #e9ecef',
                        paddingBottom: '0.75rem',
                        marginBottom: '1rem'
                    }}>
                        <h6 style={{ margin: 0, color: '#1a2a4f' }}>
                            🏆 Top 5 produits en stock
                        </h6>
                    </div>
                    <div className="card-body" style={{ height: '250px' }}>
                        {chartData.topProductsChart.labels.length > 0 ? (
                            <Bar
                                data={{
                                    labels: chartData.topProductsChart.labels,
                                    datasets: [{
                                        label: 'Quantité en stock',
                                        data: chartData.topProductsChart.data,
                                        backgroundColor: '#1a2a4f',
                                        borderRadius: 4
                                    }]
                                }}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    indexAxis: 'y',
                                    plugins: {
                                        legend: {
                                            display: false
                                        },
                                        tooltip: {
                                            callbacks: {
                                                label: function(context) {
                                                    return context.parsed.x + ' unités';
                                                }
                                            }
                                        }
                                    },
                                    scales: {
                                        x: {
                                            beginAtZero: true,
                                            ticks: {
                                                stepSize: 1
                                            }
                                        }
                                    }
                                }}
                            />
                        ) : (
                            <div className="text-center text-muted py-5">
                                <FaBoxes size={48} className="mb-3" style={{ opacity: 0.3 }} />
                                <p>Aucun produit disponible</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Statut des commandes */}
                <div className="card-custom" style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
                }}>
                    <div className="card-header" style={{
                        borderBottom: '1px solid #e9ecef',
                        paddingBottom: '0.75rem',
                        marginBottom: '1rem'
                    }}>
                        <h6 style={{ margin: 0, color: '#1a2a4f' }}>
                            📊 Statut des commandes
                        </h6>
                    </div>
                    <div className="card-body" style={{ height: '250px' }}>
                        {chartData.orderStatus.labels.length > 0 ? (
                            <Doughnut
                                data={{
                                    labels: chartData.orderStatus.labels,
                                    datasets: [{
                                        data: chartData.orderStatus.data,
                                        backgroundColor: chartData.orderStatus.colors,
                                        borderWidth: 2,
                                        borderColor: '#fff'
                                    }]
                                }}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            position: 'bottom',
                                            labels: {
                                                padding: 8,
                                                font: { size: 10 }
                                            }
                                        }
                                    },
                                    cutout: '55%'
                                }}
                            />
                        ) : (
                            <div className="text-center text-muted py-5">
                                <FaShoppingCart size={48} className="mb-3" style={{ opacity: 0.3 }} />
                                <p>Aucune commande disponible</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Section basse - Alertes et dernières commandes */}
            <div className="dashboard-grid" style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1.5rem'
            }}>
                {/* Alertes stock faible */}
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
                        <h6 style={{ margin: 0, color: '#dc3545' }}>
                            <FaExclamationTriangle className="me-2" />
                            Alertes stock faible
                        </h6>
                        <span className="badge bg-danger rounded-pill">
                            {stats.lowStock.length}
                        </span>
                    </div>
                    <div className="card-body" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {stats.lowStock.length > 0 ? (
                            <ul className="list-group list-group-flush">
                                {stats.lowStock.map((product, index) => (
                                    <li key={index} className="list-group-item d-flex align-items-center" style={{
                                        padding: '0.75rem 0',
                                        borderBottom: '1px solid #f1f3f5'
                                    }}>
                                        <ProductImage 
                                            image={product.image} 
                                            name={product.name}
                                            width="40px"
                                            height="40px"
                                            className="me-3"
                                        />
                                        <div className="flex-grow-1">
                                            <div style={{ fontWeight: '500', fontSize: '0.9rem' }}>
                                                {product.name}
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>
                                                {product.category_name || 'Non catégorisé'}
                                            </div>
                                        </div>
                                        <div className="text-end">
                                            <span className="badge bg-danger">
                                                {product.quantity || 0} unités
                                            </span>
                                            <div style={{ fontSize: '0.7rem', color: '#6c757d', marginTop: '2px' }}>
                                                Seuil: {product.threshold || 10}
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-center text-success py-4">
                                <FaCheckCircle size={40} className="mb-2" />
                                <p className="mb-0">✅ Tous les stocks sont suffisants</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Dernières commandes */}
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
                        <h6 style={{ margin: 0, color: '#1a2a4f' }}>
                            <FaShoppingCart className="me-2" />
                            Dernières commandes
                        </h6>
                        <button 
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => navigate('/client-orders')}
                            style={{ borderRadius: '20px' }}
                        >
                            Voir tout
                        </button>
                    </div>
                    <div className="card-body" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {stats.recentOrders.length > 0 ? (
                            <ul className="list-group list-group-flush">
                                {stats.recentOrders.map((order, index) => (
                                    <li key={index} className="list-group-item d-flex justify-content-between align-items-center" style={{
                                        padding: '0.75rem 0',
                                        borderBottom: '1px solid #f1f3f5'
                                    }}>
                                        <div>
                                            <div style={{ fontWeight: '500', fontSize: '0.9rem' }}>
                                                #{order.id} - {order.customer_name || 'Client'}
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>
                                                {new Date(order.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div className="text-end">
                                            <div style={{ fontWeight: 'bold', color: '#1a2a4f' }}>
                                                {parseFloat(order.total || 0).toLocaleString()} CFA
                                            </div>
                                            <span className={`badge ${
                                                order.status === 'pending' ? 'bg-warning' :
                                                order.status === 'confirmed' ? 'bg-info' :
                                                order.status === 'preparing' ? 'bg-primary' :
                                                order.status === 'shipped' ? 'bg-primary' :
                                                order.status === 'delivered' ? 'bg-success' :
                                                'bg-danger'
                                            }`}>
                                                {order.status || 'En attente'}
                                            </span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-center text-muted py-4">
                                <FaShoppingCart size={40} className="mb-3" style={{ opacity: 0.3 }} />
                                <p className="mb-0">Aucune commande récente</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;