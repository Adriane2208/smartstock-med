import React, { useState, useEffect } from 'react';
import { FaFileInvoice, FaPlus, FaTrash, FaFilePdf, FaSearch, FaFilter } from 'react-icons/fa';
import api from '../api/axios';

function Invoices() {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [formData, setFormData] = useState({
        customer_name: '',
        customer_email: '',
        items: []
    });
    const [currentItem, setCurrentItem] = useState({ product: '', quantity: 1 });

    useEffect(() => {
        loadInvoices();
        loadProducts();
    }, []);

    const loadInvoices = async () => {
        try {
            const response = await api.get('/sales/invoices/');
            setInvoices(response.data);
        } catch (error) {
            console.error('Erreur:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadProducts = async () => {
        try {
            const response = await api.get('/products/products/');
            setProducts(response.data);
        } catch (error) {
            console.error('Erreur:', error);
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
            console.error('Erreur téléchargement PDF:', error);
            alert('Erreur lors du téléchargement du PDF');
        }
    };

    const deleteInvoice = async (id) => {
        if (window.confirm('Supprimer cette facture ?')) {
            try {
                await api.delete(`/sales/invoices/${id}/`);
                loadInvoices();
                alert('✅ Facture supprimée');
            } catch (error) {
                console.error('Erreur:', error);
                alert('Erreur lors de la suppression');
            }
        }
    };

    const addItem = () => {
        if (currentItem.product && currentItem.quantity > 0) {
            const product = products.find(p => p.id === parseInt(currentItem.product));
            setFormData({
                ...formData,
                items: [...formData.items, {
                    product: parseInt(currentItem.product),
                    quantity: currentItem.quantity,
                    price: parseFloat(product.price)
                }]
            });
            setCurrentItem({ product: '', quantity: 1 });
        }
    };

    const removeItem = (index) => {
        const newItems = [...formData.items];
        newItems.splice(index, 1);
        setFormData({ ...formData, items: newItems });
    };

    const getTotal = () => {
        return formData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/sales/invoices/', {
                customer_name: formData.customer_name,
                customer_email: formData.customer_email,
                items: formData.items
            });
            setShowModal(false);
            setFormData({ customer_name: '', customer_email: '', items: [] });
            loadInvoices();
            alert('✅ Facture créée avec succès !');
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de la création');
        }
    };

    const filteredInvoices = invoices.filter(invoice => {
        const matchSearch = invoice.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           invoice.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchDate = filterDate ? new Date(invoice.created_at).toDateString() === new Date(filterDate).toDateString() : true;
        return matchSearch && matchDate;
    });

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
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 style={{ color: '#1a2a4f' }}>
                    <FaFileInvoice className="me-2" /> Gestion des factures
                </h2>
                <button 
                    className="btn btn-primary" 
                    onClick={() => setShowModal(true)}
                    style={{ backgroundColor: '#dc3545', borderColor: '#dc3545' }}
                >
                    <FaPlus className="me-1" /> Nouvelle facture
                </button>
            </div>

            {/* Filtres */}
            <div className="card-custom mb-4" style={{
                background: 'white',
                borderRadius: '16px',
                padding: '1rem 1.5rem',
                boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
            }}>
                <div className="row align-items-center">
                    <div className="col-md-5">
                        <div className="input-group">
                            <span className="input-group-text bg-white">
                                <FaSearch style={{ color: '#6c757d' }} />
                            </span>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Rechercher par client ou numéro..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ borderLeft: 'none' }}
                            />
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="input-group">
                            <span className="input-group-text bg-white">
                                <FaFilter style={{ color: '#6c757d' }} />
                            </span>
                            <input
                                type="date"
                                className="form-control"
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                                style={{ borderLeft: 'none' }}
                            />
                        </div>
                    </div>
                    <div className="col-md-3 text-end">
                        <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => {
                                setSearchTerm('');
                                setFilterDate('');
                            }}
                        >
                            Réinitialiser
                        </button>
                        <span className="badge bg-primary ms-2">
                            {filteredInvoices.length} facture{filteredInvoices.length > 1 ? 's' : ''}
                        </span>
                    </div>
                </div>
            </div>

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
                        <FaFileInvoice className="me-2" /> Liste des factures
                    </h5>
                    <span className="badge bg-primary rounded-pill">{filteredInvoices.length}</span>
                </div>
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table table-hover">
                            <thead>
                                <tr>
                                    <th>N°</th>
                                    <th>Date</th>
                                    <th>Client</th>
                                    <th>Email</th>
                                    <th>Total</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredInvoices.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center text-muted py-4">
                                            <FaFileInvoice size={40} className="mb-2" style={{ opacity: 0.3 }} />
                                            <p>Aucune facture trouvée</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredInvoices.map(invoice => (
                                        <tr key={invoice.id}>
                                            <td><strong>{invoice.invoice_number || invoice.id}</strong></td>
                                            <td>{new Date(invoice.created_at).toLocaleDateString()}</td>
                                            <td>{invoice.customer_name}</td>
                                            <td>{invoice.customer_email || '-'}</td>
                                            <td><strong style={{ color: '#1a2a4f' }}>{parseFloat(invoice.total).toLocaleString()} CFA</strong></td>
                                            <td>
                                                <button className="btn btn-sm btn-info me-1" onClick={() => downloadPDF(invoice.id)}>
                                                    <FaFilePdf /> PDF
                                                </button>
                                                <button className="btn btn-sm btn-danger" onClick={() => deleteInvoice(invoice.id)}>
                                                    <FaTrash />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal création facture */}
            {showModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
                    <div className="modal-dialog modal-lg" style={{ zIndex: 1051 }}>
                        <div className="modal-content" style={{ borderRadius: '16px' }}>
                            <div className="modal-header" style={{ background: '#1a2a4f', color: 'white', borderRadius: '16px 16px 0 0' }}>
                                <h5 className="modal-title"><FaPlus className="me-2" /> Nouvelle facture</h5>
                                <button className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body" style={{ padding: '1.5rem' }}>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <label className="form-label fw-bold">Client *</label>
                                            <input type="text" className="form-control" required
                                                value={formData.customer_name}
                                                onChange={e => setFormData({...formData, customer_name: e.target.value})}
                                                style={{ padding: '0.75rem', borderRadius: '10px' }}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-bold">Email</label>
                                            <input type="email" className="form-control"
                                                value={formData.customer_email}
                                                onChange={e => setFormData({...formData, customer_email: e.target.value})}
                                                style={{ padding: '0.75rem', borderRadius: '10px' }}
                                            />
                                        </div>
                                    </div>
                                    <hr className="my-3" />
                                    <h6 className="mb-3">Articles</h6>
                                    <div className="row mb-2">
                                        <div className="col-6">
                                            <select className="form-control" value={currentItem.product}
                                                onChange={e => setCurrentItem({...currentItem, product: e.target.value})}
                                                style={{ padding: '0.75rem', borderRadius: '10px' }}
                                            >
                                                <option value="">Sélectionner un produit</option>
                                                {products.map(p => (
                                                    <option key={p.id} value={p.id}>
                                                        {p.name} - {parseFloat(p.price).toLocaleString()} CFA
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-3">
                                            <input type="number" className="form-control" placeholder="Qté"
                                                value={currentItem.quantity} 
                                                onChange={e => setCurrentItem({...currentItem, quantity: parseInt(e.target.value)})}
                                                style={{ padding: '0.75rem', borderRadius: '10px' }}
                                                min="1"
                                            />
                                        </div>
                                        <div className="col-3">
                                            <button type="button" className="btn btn-primary w-100" onClick={addItem}
                                                style={{ backgroundColor: '#dc3545', borderColor: '#dc3545' }}
                                            >
                                                <FaPlus /> Ajouter
                                            </button>
                                        </div>
                                    </div>
                                    {formData.items.length > 0 && (
                                        <div className="table-responsive mt-3">
                                            <table className="table table-sm">
                                                <thead>
                                                    <tr><th>Produit</th><th>Qté</th><th>Prix unitaire</th><th>Total</th><th></th></tr>
                                                </thead>
                                                <tbody>
                                                    {formData.items.map((item, idx) => {
                                                        const product = products.find(p => p.id === item.product);
                                                        return (
                                                            <tr key={idx}>
                                                                <td>{product?.name}</td>
                                                                <td>{item.quantity}</td>
                                                                <td>{item.price.toLocaleString()} CFA</td>
                                                                <td>{(item.price * item.quantity).toLocaleString()} CFA</td>
                                                                <td>
                                                                    <button type="button" className="btn btn-sm btn-danger"
                                                                        onClick={() => removeItem(idx)}
                                                                    >
                                                                        <FaTrash />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                    <hr />
                                    <div className="text-end">
                                        <h4 style={{ color: '#1a2a4f' }}>
                                            Total: <strong>{getTotal().toLocaleString()} CFA</strong>
                                        </h4>
                                    </div>
                                </div>
                                <div className="modal-footer" style={{ borderTop: '1px solid #e9ecef', padding: '1rem 1.5rem' }}>
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Annuler</button>
                                    <button type="submit" className="btn btn-primary" 
                                        style={{ backgroundColor: '#dc3545', borderColor: '#dc3545' }}
                                        disabled={formData.items.length === 0}
                                    >
                                        <FaFileInvoice className="me-2" /> Créer la facture
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Invoices;