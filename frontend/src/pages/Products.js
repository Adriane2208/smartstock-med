import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaBoxes, FaSearch } from 'react-icons/fa';
import ProductImage from '../components/ProductImage';
import api from '../api/axios';
// IMPORTANT: Plus besoin d'importer Layout

function Products() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        quantity: '',
        description: '',
        category: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [productsRes, categoriesRes] = await Promise.all([
                api.get('/products/products/'),
                api.get('/products/categories/')
            ]);
            setProducts(productsRes.data);
            setCategories(categoriesRes.data);
        } catch (error) {
            console.error('Erreur:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            formDataToSend.append('price', parseFloat(formData.price));
            formDataToSend.append('quantity', parseInt(formData.quantity));
            formDataToSend.append('description', formData.description || '');
            
            if (formData.category) {
                formDataToSend.append('category', parseInt(formData.category));
            }
            
            if (imageFile) {
                formDataToSend.append('image', imageFile);
            }
            
            let response;
            if (editingId) {
                response = await api.put(`/products/products/${editingId}/`, formDataToSend, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                response = await api.post('/products/products/', formDataToSend, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            
            if (response.status === 200 || response.status === 201) {
                setShowModal(false);
                resetForm();
                loadData();
                alert(editingId ? 'Produit modifié !' : 'Produit créé !');
            }
        } catch (error) {
            console.error('Erreur détaillée:', error);
            alert('Erreur lors de la sauvegarde');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Supprimer ce produit ?')) {
            try {
                await api.delete(`/products/products/${id}/`);
                loadData();
            } catch (error) {
                console.error('Erreur:', error);
                alert('Erreur lors de la suppression');
            }
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({ name: '', price: '', quantity: '', description: '', category: '' });
        setImageFile(null);
        setImagePreview(null);
    };

    const openModal = (product = null) => {
        if (product) {
            setEditingId(product.id);
            setFormData({
                name: product.name,
                price: product.price,
                quantity: product.quantity,
                description: product.description || '',
                category: product.category || ''
            });
            if (product.image) {
                setImagePreview(`http://localhost:8000${product.image}`);
            }
        } else {
            resetForm();
        }
        setShowModal(true);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const getCategoryName = (categoryId) => {
        const cat = categories.find(c => c.id === categoryId);
        return cat ? cat.name : '';
    };

    const filteredProducts = products.filter(p => 
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                    <FaBoxes /> Gestion des produits
                </h2>
                <div className="header-actions">
                    <button className="btn-primary-custom" onClick={() => openModal()}>
                        <FaPlus /> Nouveau produit
                    </button>
                </div>
            </div>

            {/* Barre de recherche */}
            <div className="filters-bar">
                <div className="row align-items-center">
                    <div className="col-md-6">
                        <div className="input-group">
                            <span className="input-group-text bg-white border-end-0">
                                <FaSearch style={{ color: '#6c757d' }} />
                            </span>
                            <input
                                type="text"
                                className="form-control border-start-0"
                                placeholder="Rechercher un produit..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ borderRadius: '0 10px 10px 0' }}
                            />
                        </div>
                    </div>
                    <div className="col-md-6 text-end">
                        <span className="badge bg-primary rounded-pill">
                            {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''}
                        </span>
                    </div>
                </div>
            </div>

            {/* Liste des produits */}
            <div className="card-custom">
                <div className="card-header">
                    <h5>
                        <FaBoxes /> Liste des produits
                    </h5>
                    <span className="badge-count">{filteredProducts.length}</span>
                </div>
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table-custom">
                            <thead>
                                <tr>
                                    <th>Image</th>
                                    <th>ID</th>
                                    <th>Nom</th>
                                    <th>Catégorie</th>
                                    <th>Prix</th>
                                    <th>Stock</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map(product => (
                                    <tr key={product.id}>
                                        <td>
                                            <ProductImage 
                                                image={product.image} 
                                                name={product.name} 
                                                width="50px" 
                                                height="50px"
                                            />
                                        </td>
                                        <td>{product.id}</td>
                                        <td>{product.name}</td>
                                        <td>{getCategoryName(product.category)}</td>
                                        <td>{parseFloat(product.price).toLocaleString()} CFA</td>
                                        <td>
                                            <span className={`badge-status ${product.quantity < 10 ? 'bg-danger' : 'bg-success'}`}>
                                                {product.quantity}
                                            </span>
                                        </td>
                                        <td>
                                            <button className="btn btn-sm btn-info me-1" onClick={() => openModal(product)}>
                                                <FaEdit />
                                            </button>
                                            <button className="btn btn-sm btn-danger" onClick={() => handleDelete(product.id)}>
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
                <div className="modal show d-block modal-custom" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
                    <div className="modal-dialog" style={{ zIndex: 1051 }}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{editingId ? 'Modifier' : 'Ajouter'} un produit</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label-custom">Nom</label>
                                        <input type="text" className="form-control-custom" required
                                            value={formData.name} 
                                            onChange={(e) => setFormData({...formData, name: e.target.value})} 
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label-custom">Prix (CFA)</label>
                                        <input type="number" className="form-control-custom" required
                                            value={formData.price} 
                                            onChange={(e) => setFormData({...formData, price: e.target.value})} 
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label-custom">Stock</label>
                                        <input type="number" className="form-control-custom" required
                                            value={formData.quantity} 
                                            onChange={(e) => setFormData({...formData, quantity: e.target.value})} 
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label-custom">Catégorie</label>
                                        <select className="form-control-custom"
                                            value={formData.category}
                                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                                        >
                                            <option value="">Sélectionner une catégorie</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label-custom">Image</label>
                                        <input type="file" className="form-control-custom" accept="image/*" onChange={handleImageChange} />
                                        {imagePreview && (
                                            <div className="mt-2">
                                                <img src={imagePreview} alt="Aperçu" style={{ maxWidth: '100px', borderRadius: '8px' }} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label-custom">Description</label>
                                        <textarea className="form-control-custom" rows="3"
                                            value={formData.description} 
                                            onChange={(e) => setFormData({...formData, description: e.target.value})} 
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Annuler</button>
                                    <button type="submit" className="btn-primary-custom">Enregistrer</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Products;