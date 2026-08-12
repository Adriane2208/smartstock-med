import React, { useState, useEffect } from 'react';
import { FaTruck, FaPlus, FaTrash, FaUserPlus, FaCheck, FaUser } from 'react-icons/fa';
import api from '../api/axios';

function Deliveries() {
    const [deliveries, setDeliveries] = useState([]);
    const [deliveryPersons, setDeliveryPersons] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDelivery, setSelectedDelivery] = useState(null);
    const [selectedPerson, setSelectedPerson] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [creating, setCreating] = useState(false);
    const [newDelivery, setNewDelivery] = useState({
        invoice: '',
        address: '',
        customer_name: '',
        customer_phone: '',
        delivery_person: ''
    });

    useEffect(() => {
        loadData();
        loadInvoices();
        loadDeliveryPersons();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const response = await api.get('/deliveries/deliveries/');
            setDeliveries(response.data);
        } catch (error) {
            console.error('Erreur chargement livraisons:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadInvoices = async () => {
        try {
            const response = await api.get('/sales/invoices/');
            setInvoices(response.data);
        } catch (error) {
            console.error('Erreur chargement factures:', error);
        }
    };

    const loadDeliveryPersons = async () => {
        try {
            const response = await api.get('/deliveries/delivery-persons/');
            setDeliveryPersons(response.data);
        } catch (error) {
            console.error('Erreur chargement livreurs:', error);
        }
    };

    const assignDelivery = async (deliveryId) => {
        if (!selectedPerson) {
            alert('Veuillez sélectionner un livreur');
            return;
        }

        try {
            await api.post(`/deliveries/deliveries/${deliveryId}/assign_delivery/`, {
                delivery_person_id: parseInt(selectedPerson)
            });
            setSelectedDelivery(null);
            setSelectedPerson('');
            loadData();
            alert('✅ Livraison assignée avec succès !');
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de l\'assignation');
        }
    };

    const createDelivery = async (e) => {
        e.preventDefault();
        setCreating(true);
        
        try {
            if (!newDelivery.invoice) {
                alert('Veuillez sélectionner une facture');
                setCreating(false);
                return;
            }
            
            const deliveryData = {
                invoice: parseInt(newDelivery.invoice),
                address: newDelivery.address,
                customer_name: newDelivery.customer_name,
                customer_phone: newDelivery.customer_phone || '',
            };
            
            if (newDelivery.delivery_person) {
                deliveryData.delivery_person = parseInt(newDelivery.delivery_person);
            }
            
            await api.post('/deliveries/deliveries/', deliveryData);
            
            setShowCreateModal(false);
            setNewDelivery({
                invoice: '',
                address: '',
                customer_name: '',
                customer_phone: '',
                delivery_person: ''
            });
            loadData();
            alert('✅ Livraison créée avec succès !');
        } catch (error) {
            console.error('Erreur détaillée:', error);
            alert('Erreur lors de la création de la livraison');
        } finally {
            setCreating(false);
        }
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            'pending': { label: 'En attente', color: 'warning' },
            'assigned': { label: 'Assignée', color: 'info' },
            'in_progress': { label: 'En cours', color: 'primary' },
            'completed': { label: 'Livrée', color: 'success' },
            'failed': { label: 'Échouée', color: 'danger' }
        };
        const s = statusMap[status] || { label: status, color: 'secondary' };
        return <span className={`badge bg-${s.color}`}>{s.label}</span>;
    };

    const getDeliveryPersonName = (personId) => {
        const person = deliveryPersons.find(p => p.id === personId);
        return person ? person.username : 'Non assigné';
    };

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
                    <FaTruck className="me-2" /> Gestion des livraisons
                </h2>
                <button 
                    className="btn btn-primary" 
                    onClick={() => setShowCreateModal(true)}
                    style={{ backgroundColor: '#dc3545', borderColor: '#dc3545' }}
                >
                    <FaPlus className="me-1" /> Nouvelle livraison
                </button>
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
                        <FaTruck className="me-2" /> Liste des livraisons
                    </h5>
                    <span className="badge bg-primary rounded-pill">{deliveries.length}</span>
                </div>
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table table-hover">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Facture</th>
                                    <th>Client</th>
                                    <th>Adresse</th>
                                    <th>Livreur</th>
                                    <th>Statut</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {deliveries.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center text-muted py-4">
                                            <FaTruck size={40} className="mb-2" style={{ opacity: 0.3 }} />
                                            <p>Aucune livraison disponible</p>
                                        </td>
                                    </tr>
                                ) : (
                                    deliveries.map(delivery => (
                                        <tr key={delivery.id}>
                                            <td>#{delivery.id}</td>
                                            <td>{delivery.invoice_number || `INV-${delivery.invoice}`}</td>
                                            <td>{delivery.customer_name || '-'}</td>
                                            <td style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {delivery.address || '-'}
                                            </td>
                                            <td>
                                                {delivery.delivery_person ? (
                                                    <span className="text-success">
                                                        <FaUser className="me-1" />
                                                        {delivery.delivery_person_name || getDeliveryPersonName(delivery.delivery_person)}
                                                    </span>
                                                ) : (
                                                    <span className="text-warning">Non assigné</span>
                                                )}
                                            </td>
                                            <td>{getStatusBadge(delivery.status)}</td>
                                            <td>
                                                {delivery.status === 'pending' && (
                                                    <button 
                                                        className="btn btn-sm btn-primary me-1"
                                                        onClick={() => {
                                                            setSelectedDelivery(delivery.id);
                                                            setSelectedPerson('');
                                                            loadDeliveryPersons();
                                                        }}
                                                    >
                                                        <FaUserPlus /> Assigner
                                                    </button>
                                                )}
                                                <button className="btn btn-sm btn-danger" onClick={() => {}}>
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

            {/* Modal d'assignation */}
            {selectedDelivery && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
                    <div className="modal-dialog" style={{ zIndex: 1051 }}>
                        <div className="modal-content" style={{ borderRadius: '16px' }}>
                            <div className="modal-header" style={{ background: '#1a2a4f', color: 'white', borderRadius: '16px 16px 0 0' }}>
                                <h5 className="modal-title"><FaUserPlus className="me-2" /> Assigner un livreur</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedDelivery(null)}></button>
                            </div>
                            <div className="modal-body" style={{ padding: '1.5rem' }}>
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Choisir un livreur</label>
                                    <select className="form-control" value={selectedPerson}
                                        onChange={(e) => setSelectedPerson(e.target.value)}
                                        style={{ padding: '0.75rem', borderRadius: '10px' }}
                                    >
                                        <option value="">-- Sélectionner --</option>
                                        {deliveryPersons.map(person => (
                                            <option key={person.id} value={person.id}>
                                                {person.username} {person.phone ? `(${person.phone})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer" style={{ borderTop: '1px solid #e9ecef', padding: '1rem 1.5rem' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setSelectedDelivery(null)}>Annuler</button>
                                <button type="button" className="btn btn-primary" 
                                    onClick={() => assignDelivery(selectedDelivery)}
                                    disabled={!selectedPerson}
                                    style={{ backgroundColor: '#dc3545', borderColor: '#dc3545' }}
                                >
                                    <FaCheck className="me-1" /> Assigner
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Création livraison */}
            {showCreateModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
                    <div className="modal-dialog modal-lg" style={{ zIndex: 1051 }}>
                        <div className="modal-content" style={{ borderRadius: '16px' }}>
                            <div className="modal-header" style={{ background: '#1a2a4f', color: 'white', borderRadius: '16px 16px 0 0' }}>
                                <h5 className="modal-title"><FaPlus className="me-2" /> Nouvelle livraison</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowCreateModal(false)}></button>
                            </div>
                            <form onSubmit={createDelivery}>
                                <div className="modal-body" style={{ padding: '1.5rem' }}>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label fw-bold">Facture associée *</label>
                                            <select className="form-control" required value={newDelivery.invoice}
                                                onChange={(e) => {
                                                    const invoiceId = e.target.value;
                                                    const selectedInvoice = invoices.find(i => i.id === parseInt(invoiceId));
                                                    setNewDelivery({
                                                        ...newDelivery,
                                                        invoice: invoiceId,
                                                        customer_name: selectedInvoice?.customer_name || '',
                                                    });
                                                }}
                                                style={{ padding: '0.75rem', borderRadius: '10px' }}
                                            >
                                                <option value="">Sélectionner une facture</option>
                                                {invoices.map(inv => (
                                                    <option key={inv.id} value={inv.id}>
                                                        {inv.invoice_number || `#${inv.id}`} - {inv.customer_name} ({parseFloat(inv.total).toLocaleString()} CFA)
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label fw-bold">Client</label>
                                            <input type="text" className="form-control" 
                                                value={newDelivery.customer_name}
                                                onChange={(e) => setNewDelivery({...newDelivery, customer_name: e.target.value})}
                                                required
                                                style={{ padding: '0.75rem', borderRadius: '10px' }}
                                            />
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label fw-bold">Téléphone client</label>
                                            <input type="text" className="form-control"
                                                value={newDelivery.customer_phone}
                                                onChange={(e) => setNewDelivery({...newDelivery, customer_phone: e.target.value})}
                                                style={{ padding: '0.75rem', borderRadius: '10px' }}
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label fw-bold">Livreur</label>
                                            <select className="form-control" value={newDelivery.delivery_person}
                                                onChange={(e) => setNewDelivery({...newDelivery, delivery_person: e.target.value})}
                                                style={{ padding: '0.75rem', borderRadius: '10px' }}
                                            >
                                                <option value="">Non assigné</option>
                                                {deliveryPersons.map(person => (
                                                    <option key={person.id} value={person.id}>
                                                        {person.username} {person.phone ? `(${person.phone})` : ''}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Adresse de livraison *</label>
                                        <textarea className="form-control" rows="3" required
                                            value={newDelivery.address}
                                            onChange={(e) => setNewDelivery({...newDelivery, address: e.target.value})}
                                            style={{ padding: '0.75rem', borderRadius: '10px' }}
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer" style={{ borderTop: '1px solid #e9ecef', padding: '1rem 1.5rem' }}>
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Annuler</button>
                                    <button type="submit" className="btn btn-primary" 
                                        disabled={creating}
                                        style={{ backgroundColor: '#dc3545', borderColor: '#dc3545' }}
                                    >
                                        {creating ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                Création...
                                            </>
                                        ) : (
                                            <>
                                                <FaCheck className="me-1" /> Créer la livraison
                                            </>
                                        )}
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

export default Deliveries;