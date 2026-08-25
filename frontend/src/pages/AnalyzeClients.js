import React, { useState, useEffect } from 'react';
import { FaChartLine } from 'react-icons/fa';
import Layout from '../components/Layout';
import api from '../api/axios';

function AnalyzeClients() {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const response = await api.get('/users/');
            setClients(response.data.filter(u => u.role === 'client'));
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

    return (
        <Layout>
            <div className="container-fluid py-4">
                <h2 className="mb-4" style={{ color: '#1a2a4f' }}>
                    <FaChartLine className="me-2" /> Analyse des clients
                </h2>

                <div className="row mb-4">
                    <div className="col-md-4">
                        <div className="stat-card" style={{
                            background: 'white',
                            borderRadius: '12px',
                            padding: '1.5rem',
                            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                            textAlign: 'center',
                            borderLeft: '4px solid #1a2a4f'
                        }}>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1a2a4f' }}>{clients.length}</div>
                            <div style={{ color: '#6c757d' }}>Total clients</div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="stat-card" style={{
                            background: 'white',
                            borderRadius: '12px',
                            padding: '1.5rem',
                            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                            textAlign: 'center',
                            borderLeft: '4px solid #28a745'
                        }}>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#28a745' }}>
                                {clients.filter(c => c.last_login).length}
                            </div>
                            <div style={{ color: '#6c757d' }}>Actifs</div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="stat-card" style={{
                            background: 'white',
                            borderRadius: '12px',
                            padding: '1.5rem',
                            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                            textAlign: 'center',
                            borderLeft: '4px solid #ffc107'  // ← ICI LA CORRECTION
                        }}>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ffc107' }}>
                                {clients.filter(c => !c.last_login).length}
                            </div>
                            <div style={{ color: '#6c757d' }}>Inactifs</div>
                        </div>
                    </div>
                </div>

                <div className="card" style={{ borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
                    <div className="card-body">
                        <h5 className="card-title">Liste des clients</h5>
                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Nom</th>
                                        <th>Email</th>
                                        <th>Téléphone</th>
                                        <th>Date d'inscription</th>
                                        <th>Statut</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {clients.map(client => (
                                        <tr key={client.id}>
                                            <td>{client.username}</td>
                                            <td>{client.email}</td>
                                            <td>{client.phone || '-'}</td>
                                            <td>{new Date(client.date_joined).toLocaleDateString()}</td>
                                            <td>
                                                <span className={`badge ${client.last_login ? 'bg-success' : 'bg-secondary'}`}>
                                                    {client.last_login ? 'Actif' : 'Inactif'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

export default AnalyzeClients;