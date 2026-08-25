import React, { useState, useEffect } from 'react';
import { FaChartLine } from 'react-icons/fa';
import Layout from '../components/Layout';
import api from '../api/axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function AnalyzeProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        lowStock: 0,
        outOfStock: 0,
        totalValue: 0
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const response = await api.get('/products/products/');
            const data = response.data;
            setProducts(data);
            
            const total = data.length;
            const lowStock = data.filter(p => p.quantity < 10 && p.quantity > 0).length;
            const outOfStock = data.filter(p => p.quantity === 0).length;
            const totalValue = data.reduce((sum, p) => sum + (p.price * p.quantity), 0);
            
            setStats({ total, lowStock, outOfStock, totalValue });
        } catch (error) {
            console.error('Erreur:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="text-center py-5">Chargement...</div>
            </Layout>
        );
    }

    const chartData = {
        labels: products.slice(0, 10).map(p => p.name),
        datasets: [{
            label: 'Quantité en stock',
            data: products.slice(0, 10).map(p => p.quantity),
            backgroundColor: products.slice(0, 10).map(p => p.quantity < 10 ? '#dc3545' : '#1a2a4f'),
            borderRadius: 4
        }]
    };

    return (
        <Layout>
            <div className="container-fluid py-4">
                <h2 className="mb-4" style={{ color: '#1a2a4f' }}>
                    <FaChartLine className="me-2" /> Analyse des produits
                </h2>

                <div className="row mb-4">
                    <div className="col-md-3">
                        <div className="stat-card" style={{
                            background: 'white',
                            borderRadius: '12px',
                            padding: '1.5rem',
                            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                            textAlign: 'center',
                            borderLeft: '4px solid #1a2a4f'
                        }}>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1a2a4f' }}>{stats.total}</div>
                            <div style={{ color: '#6c757d' }}>Total produits</div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="stat-card" style={{
                            background: 'white',
                            borderRadius: '12px',
                            padding: '1.5rem',
                            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                            textAlign: 'center',
                            borderLeft: '4px solid #ffc107'
                        }}>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ffc107' }}>{stats.lowStock}</div>
                            <div style={{ color: '#6c757d' }}>Stock faible</div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="stat-card" style={{
                            background: 'white',
                            borderRadius: '12px',
                            padding: '1.5rem',
                            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                            textAlign: 'center',
                            borderLeft: '4px solid #dc3545'
                        }}>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#dc3545' }}>{stats.outOfStock}</div>
                            <div style={{ color: '#6c757d' }}>Rupture de stock</div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="stat-card" style={{
                            background: 'white',
                            borderRadius: '12px',
                            padding: '1.5rem',
                            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                            textAlign: 'center',
                            borderLeft: '4px solid #28a745'
                        }}>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#28a745' }}>
                                {stats.totalValue.toLocaleString()} CFA
                            </div>
                            <div style={{ color: '#6c757d' }}>Valeur totale du stock</div>
                        </div>
                    </div>
                </div>

                <div className="card" style={{ borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
                    <div className="card-body">
                        <h5 className="card-title">Top 10 produits en stock</h5>
                        <div style={{ height: '300px' }}>
                            <Bar
                                data={chartData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: { display: false }
                                    },
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                            ticks: { stepSize: 1 }
                                        }
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

export default AnalyzeProducts;