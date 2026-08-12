import React, { useState, useEffect } from 'react';
import { FaReceipt, FaFilePdf } from 'react-icons/fa';
import ClientLayout from '../components/ClientLayout';
import api from '../api/axios';

function MyInvoices() {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadInvoices();
    }, []);

    const loadInvoices = async () => {
        try {
            // Le backend filtre déjà les factures par utilisateur
            const response = await api.get('/sales/invoices/');
            setInvoices(response.data);
        } catch (error) {
            console.error('Erreur:', error);
            if (error.response?.status === 403) {
                alert('Vous n\'avez pas la permission de voir les factures');
            }
        } finally {
            setLoading(false);
        }
    };

    const downloadPDF = async (id) => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await api.get(`/sales/invoices/${id}/pdf/`, {
                responseType: 'blob',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `facture_${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Erreur:', error);
            if (error.response?.status === 403) {
                alert('Vous n\'avez pas accès à cette facture');
            } else {
                alert('Erreur lors du téléchargement');
            }
        }
    };

    if (loading) {
        return (
            <ClientLayout title="Mes factures" icon={<FaReceipt />}>
                <div className="text-center py-5">
                    <div className="spinner-border text-light" role="status">
                        <span className="visually-hidden">Chargement...</span>
                    </div>
                </div>
            </ClientLayout>
        );
    }

    return (
        <ClientLayout title="Mes factures" icon={<FaReceipt />}>
            {invoices.length === 0 ? (
                <div className="text-center py-5">
                    <FaReceipt size={48} className="mb-3" style={{ opacity: 0.5, color: 'white' }} />
                    <p className="text-white">Aucune facture disponible</p>
                </div>
            ) : (
                <div className="client-card">
                    <div className="card-header">
                        <h5>Mes factures</h5>
                        <span className="badge-count">{invoices.length}</span>
                    </div>
                    <div className="table-responsive">
                        <table className="table-client">
                            <thead>
                                <tr>
                                    <th>N° Facture</th>
                                    <th>Date</th>
                                    <th>Total</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.map(invoice => (
                                    <tr key={invoice.id}>
                                        <td>{invoice.invoice_number || invoice.id}</td>
                                        <td>{new Date(invoice.created_at).toLocaleDateString()}</td>
                                        <td>
                                            <strong style={{ color: '#dc3545' }}>
                                                {parseFloat(invoice.total).toLocaleString()} CFA
                                            </strong>
                                        </td>
                                        <td>
                                            <button 
                                                className="btn-client-primary btn-sm" 
                                                onClick={() => downloadPDF(invoice.id)}
                                            >
                                                <FaFilePdf /> PDF
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </ClientLayout>
    );
}

export default MyInvoices;