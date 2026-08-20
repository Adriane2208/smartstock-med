import React, { useState, useEffect } from 'react';
import { FaUsers, FaUserPlus, FaEdit, FaTrash } from 'react-icons/fa';
import api from '../api/axios';

function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'client',
        phone: '',
        address: ''
    });

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const response = await api.get('/users/');
            setUsers(response.data);
        } catch (error) {
            console.error('Erreur:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingUser) {
                await api.put(`/users/${editingUser.id}/`, formData);
            } else {
                await api.post('/users/register/', formData);
            }
            setShowModal(false);
            resetForm();
            loadUsers();
            alert(editingUser ? '✅ Utilisateur modifié !' : '✅ Utilisateur créé !');
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de la sauvegarde');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Supprimer cet utilisateur ?')) {
            try {
                await api.delete(`/users/${id}/`);
                loadUsers();
                alert('✅ Utilisateur supprimé');
            } catch (error) {
                console.error('Erreur:', error);
                alert('Erreur lors de la suppression');
            }
        }
    };

    const resetForm = () => {
        setEditingUser(null);
        setFormData({
            username: '',
            email: '',
            password: '',
            role: 'client',
            phone: '',
            address: ''
        });
    };

    const openModal = (user = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                username: user.username,
                email: user.email,
                password: '',
                role: user.role,
                phone: user.phone || '',
                address: user.address || ''
            });
        } else {
            resetForm();
        }
        setShowModal(true);
    };

    const getRoleBadge = (role) => {
        const roles = {
            'admin': { label: 'Administrateur', color: 'danger' },
            'manager': { label: 'Gestionnaire', color: 'primary' },
            'delivery': { label: 'Livreur', color: 'info' },
            'client': { label: 'Client', color: 'success' }
        };
        const r = roles[role] || { label: role, color: 'secondary' };
        return <span className={`badge bg-${r.color}`}>{r.label}</span>;
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
        <div className="page-container">
            {/* En-tête */}
            <div className="page-header">
                <h2>
                    <FaUsers className="me-2" /> Gestion des utilisateurs
                </h2>
                <button className="btn-primary-custom" onClick={() => openModal()}>
                    <FaUserPlus className="me-1" /> Nouvel utilisateur
                </button>
            </div>

            {/* Liste des utilisateurs */}
            <div className="card-custom">
                <div className="card-header">
                    <h5>
                        <FaUsers className="me-2" /> Liste des utilisateurs
                    </h5>
                    <span className="badge-count">{users.length}</span>
                </div>
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table-custom">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nom d'utilisateur</th>
                                    <th>Email</th>
                                    <th>Téléphone</th>
                                    <th>Rôle</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id}>
                                        <td>{user.id}</td>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <div style={{
                                                    width: '32px',
                                                    height: '32px',
                                                    borderRadius: '50%',
                                                    backgroundColor: '#dc3545',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: 'white',
                                                    fontWeight: 'bold',
                                                    marginRight: '8px'
                                                }}>
                                                    {user.username.charAt(0).toUpperCase()}
                                                </div>
                                                {user.username}
                                            </div>
                                        </td>
                                        <td>{user.email}</td>
                                        <td>{user.phone || '-'}</td>
                                        <td>{getRoleBadge(user.role)}</td>
                                        <td>
                                            <button 
                                                className="btn btn-sm btn-info me-1" 
                                                onClick={() => openModal(user)}
                                            >
                                                <FaEdit />
                                            </button>
                                            <button 
                                                className="btn btn-sm btn-danger" 
                                                onClick={() => handleDelete(user.id)}
                                                disabled={user.role === 'admin'}
                                            >
                                                <FaTrash />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal show d-block modal-custom" style={{ 
                    backgroundColor: 'rgba(0,0,0,0.5)', 
                    zIndex: 1050 
                }}>
                    <div className="modal-dialog" style={{ zIndex: 1051 }}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {editingUser ? 'Modifier' : 'Ajouter'} un utilisateur
                                </h5>
                                <button 
                                    type="button" 
                                    className="btn-close btn-close-white" 
                                    onClick={() => setShowModal(false)}
                                ></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label-custom">Nom d'utilisateur *</label>
                                        <input 
                                            type="text" 
                                            className="form-control-custom" 
                                            required
                                            value={formData.username}
                                            onChange={(e) => setFormData({...formData, username: e.target.value})}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label-custom">Email *</label>
                                        <input 
                                            type="email" 
                                            className="form-control-custom" 
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label-custom">
                                            {editingUser ? 'Nouveau mot de passe (laisser vide pour ne pas changer)' : 'Mot de passe *'}
                                        </label>
                                        <input 
                                            type="password" 
                                            className="form-control-custom" 
                                            required={!editingUser}
                                            value={formData.password}
                                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label-custom">Rôle</label>
                                        <select 
                                            className="form-control-custom"
                                            value={formData.role}
                                            onChange={(e) => setFormData({...formData, role: e.target.value})}
                                        >
                                            <option value="admin">Administrateur</option>
                                            <option value="manager">Gestionnaire</option>
                                            <option value="delivery">Livreur</option>
                                            <option value="client">Client</option>
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label-custom">Téléphone</label>
                                        <input 
                                            type="text" 
                                            className="form-control-custom"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label-custom">Adresse</label>
                                        <textarea 
                                            className="form-control-custom"
                                            rows="2"
                                            value={formData.address}
                                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button 
                                        type="button" 
                                        className="btn btn-secondary" 
                                        onClick={() => setShowModal(false)}
                                    >
                                        Annuler
                                    </button>
                                    <button type="submit" className="btn-primary-custom">
                                        {editingUser ? 'Modifier' : 'Créer'}
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

export default Users;