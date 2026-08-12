// frontend/src/pages/Cart.js
// CORRIGÉ - SUPPRESSION DU WARNING useEffect

import React, { useState, useEffect } from 'react';
import { FaShoppingCart, FaTrash, FaPlus, FaMinus, FaArrowLeft, FaCreditCard } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import ClientLayout from '../components/ClientLayout';
import ProductImage from '../components/ProductImage';

function Cart() {
    const [cart, setCart] = useState([]);
    const [total, setTotal] = useState(0);
    const navigate = useNavigate();

    // Définir loadCart en dehors du useEffect
    const loadCart = () => {
        const cartData = JSON.parse(localStorage.getItem('cart') || '[]');
        setCart(cartData);
        calculateTotal(cartData);
    };

    const calculateTotal = (cartData) => {
        const sum = cartData.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        setTotal(sum);
    };

    useEffect(() => {
        loadCart();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Ajouter le commentaire eslint pour ignorer le warning

    const updateQuantity = (productId, change) => {
        const cartData = cart.map(item => {
            if (item.id === productId) {
                const newQuantity = item.quantity + change;
                if (newQuantity <= 0) return null;
                return { ...item, quantity: newQuantity };
            }
            return item;
        }).filter(item => item !== null);
        
        localStorage.setItem('cart', JSON.stringify(cartData));
        setCart(cartData);
        calculateTotal(cartData);
    };

    const removeItem = (productId) => {
        const cartData = cart.filter(item => item.id !== productId);
        localStorage.setItem('cart', JSON.stringify(cartData));
        setCart(cartData);
        calculateTotal(cartData);
    };

    const clearCart = () => {
        if (window.confirm('Vider le panier ?')) {
            localStorage.setItem('cart', JSON.stringify([]));
            setCart([]);
            setTotal(0);
        }
    };

    const goToCheckout = () => {
        if (cart.length === 0) {
            alert('Votre panier est vide');
            return;
        }
        navigate('/checkout');
    };

    if (cart.length === 0) {
        return (
            <ClientLayout title="Mon panier" icon={<FaShoppingCart />}>
                <div className="text-center py-5">
                    <FaShoppingCart size={64} className="mb-3" style={{ opacity: 0.5, color: 'white' }} />
                    <h4 className="text-white">Votre panier est vide</h4>
                    <p className="text-white-50">Parcourez la boutique pour ajouter des produits</p>
                    <button 
                        className="btn-client-primary mt-3"
                        onClick={() => navigate('/shop')}
                    >
                        <FaArrowLeft /> Retour à la boutique
                    </button>
                </div>
            </ClientLayout>
        );
    }

    return (
        <ClientLayout title="Mon panier" icon={<FaShoppingCart />}>
            <div className="row">
                <div className="col-md-8">
                    <div className="client-card">
                        <div className="card-header">
                            <h5>
                                <FaShoppingCart /> Articles
                                <span className="badge-count">{cart.length}</span>
                            </h5>
                            <button 
                                className="btn btn-sm btn-outline-danger"
                                onClick={clearCart}
                            >
                                <FaTrash /> Vider
                            </button>
                        </div>
                        <div className="table-responsive">
                            <table className="table-client">
                                <thead>
                                    <tr>
                                        <th>Produit</th>
                                        <th>Prix</th>
                                        <th>Quantité</th>
                                        <th>Total</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cart.map(item => (
                                        <tr key={item.id}>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <ProductImage 
                                                        image={item.image} 
                                                        name={item.name}
                                                        width="50px"
                                                        height="50px"
                                                        className="me-3"
                                                    />
                                                    <div>
                                                        <div style={{ fontWeight: '600', color: '#1a2a4f' }}>{item.name}</div>
                                                        <small className="text-muted">{item.category_name || ''}</small>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{parseFloat(item.price).toLocaleString()} CFA</td>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <button 
                                                        className="btn btn-sm btn-outline-secondary"
                                                        onClick={() => updateQuantity(item.id, -1)}
                                                    >
                                                        <FaMinus />
                                                    </button>
                                                    <span className="mx-2" style={{ minWidth: '30px', textAlign: 'center', fontWeight: '600' }}>
                                                        {item.quantity}
                                                    </span>
                                                    <button 
                                                        className="btn btn-sm btn-outline-secondary"
                                                        onClick={() => updateQuantity(item.id, 1)}
                                                    >
                                                        <FaPlus />
                                                    </button>
                                                </div>
                                            </td>
                                            <td>
                                                <strong style={{ color: '#dc3545' }}>
                                                    {(item.price * item.quantity).toLocaleString()} CFA
                                                </strong>
                                            </td>
                                            <td>
                                                <button 
                                                    className="btn btn-sm btn-danger"
                                                    onClick={() => removeItem(item.id)}
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

                <div className="col-md-4">
                    <div className="client-card" style={{ position: 'sticky', top: '100px' }}>
                        <h5 style={{ color: '#1a2a4f', fontWeight: '700' }}>Résumé</h5>
                        <hr />
                        <div className="d-flex justify-content-between mb-2">
                            <span>Sous-total</span>
                            <span>{total.toLocaleString()} CFA</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                            <span>Livraison</span>
                            <span className="text-success">Gratuite</span>
                        </div>
                        <hr />
                        <div className="d-flex justify-content-between mb-3">
                            <strong style={{ color: '#1a2a4f' }}>Total</strong>
                            <strong style={{ color: '#dc3545', fontSize: '1.2rem' }}>
                                {total.toLocaleString()} CFA
                            </strong>
                        </div>
                        <button 
                            className="btn-client-primary w-100"
                            onClick={goToCheckout}
                            style={{ justifyContent: 'center' }}
                        >
                            <FaCreditCard /> Passer la commande
                        </button>
                        <button 
                            className="btn-client-outline w-100 mt-2"
                            onClick={() => navigate('/shop')}
                            style={{ justifyContent: 'center' }}
                        >
                            <FaArrowLeft /> Continuer mes achats
                        </button>
                    </div>
                </div>
            </div>
        </ClientLayout>
    );
}

export default Cart;