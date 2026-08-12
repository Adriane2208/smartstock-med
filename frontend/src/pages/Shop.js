// frontend/src/pages/Shop.js
// VERSION COMPLÈTE CORRIGÉE

import React, { useState, useEffect } from 'react';
import { FaSearch, FaShoppingCart, FaStore } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import ClientLayout from '../components/ClientLayout';
import ProductImage from '../components/ProductImage';
import api from '../api/axios';

function Shop() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [cartCount, setCartCount] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        loadProducts();
        loadCategories();
        updateCartCount();
    }, []);

    const loadProducts = async () => {
        try {
            const response = await api.get('/products/products/');
            setProducts(response.data);
        } catch (error) {
            console.error('Erreur:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadCategories = async () => {
        try {
            const response = await api.get('/products/categories/');
            setCategories(response.data);
        } catch (error) {
            console.error('Erreur:', error);
        }
    };

    const updateCartCount = () => {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0));
    };

    const addToCart = (product) => {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existingItem = cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        alert(`✅ ${product.name} ajouté au panier !`);
    };

    const filteredProducts = products.filter(product => {
        const matchSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchCategory = selectedCategory ? product.category === parseInt(selectedCategory) : true;
        return matchSearch && matchCategory;
    });

    if (loading) {
        return (
            <ClientLayout title="Boutique" icon={<FaStore />}>
                <div className="text-center py-5">
                    <div className="spinner-border text-light" role="status">
                        <span className="visually-hidden">Chargement...</span>
                    </div>
                </div>
            </ClientLayout>
        );
    }

    return (
        <ClientLayout title="Boutique" icon={<FaStore />}>
            {/* En-tête avec panier */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div></div>
                <button 
                    className="btn-client-primary"
                    onClick={() => navigate('/cart')}
                >
                    <FaShoppingCart />
                    Mon panier
                    {cartCount > 0 && (
                        <span className="badge bg-white text-danger ms-2 rounded-pill">
                            {cartCount}
                        </span>
                    )}
                </button>
            </div>

            {/* Filtres */}
            <div className="filters-client">
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
                            />
                        </div>
                    </div>
                    <div className="col-md-4">
                        <select 
                            className="form-control"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            <option value="">Toutes les catégories</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="col-md-2 text-end">
                        <span className="badge bg-white text-danger rounded-pill">
                            {filteredProducts.length} produits
                        </span>
                    </div>
                </div>
            </div>

            {/* Liste des produits */}
            {filteredProducts.length === 0 ? (
                <div className="text-center py-5">
                    <FaStore size={48} className="mb-3" style={{ opacity: 0.5, color: 'white' }} />
                    <p className="text-white">Aucun produit trouvé</p>
                </div>
            ) : (
                <div className="row">
                    {filteredProducts.map(product => (
                        <div key={product.id} className="col-md-3 mb-4">
                            <div className="product-card-client">
                                <div className="product-image">
                                    <ProductImage 
                                        image={product.image} 
                                        name={product.name}
                                        width="150px"
                                        height="150px"
                                    />
                                </div>
                                <div className="product-body">
                                    <h6>{product.name}</h6>
                                    <p className="text-muted small" style={{ height: '36px', overflow: 'hidden' }}>
                                        {product.description || 'Aucune description'}
                                    </p>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span className="price">
                                            {parseFloat(product.price).toLocaleString()} CFA
                                        </span>
                                        <span className={`stock badge ${product.quantity > 0 ? 'bg-success' : 'bg-danger'}`}>
                                            {product.quantity > 0 ? `Stock: ${product.quantity}` : 'Rupture'}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-3 pt-0">
                                    <button 
                                        className="btn-client-primary w-100"
                                        onClick={() => addToCart(product)}
                                        disabled={product.quantity === 0}
                                        style={{ 
                                            opacity: product.quantity === 0 ? 0.5 : 1,
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <FaShoppingCart />
                                        {product.quantity > 0 ? 'Ajouter au panier' : 'Indisponible'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </ClientLayout>
    );
}

export default Shop;