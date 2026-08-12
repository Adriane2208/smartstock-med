// frontend/src/pages/Checkout.js
// CORRIGÉ POUR LE PAIEMENT

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    FaArrowLeft, FaShoppingCart, FaCreditCard,
    FaHeartbeat, FaSyringe, FaPills, FaAmbulance, FaMicroscope, FaHospital
} from 'react-icons/fa';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '../api/axios';
import './Checkout.css';

const stripePromise = loadStripe('pk_test_51Qz2TGAcvnzaA71xtPkLpCurBGazt55GdbgFgJwmnhSmVbuTZAgnEGWsz3HARSCLslnpDtt2qNKZiN4QjN06Ood500jnjf9xiB');

function PaymentForm({ cart, total, customerInfo, onSuccess, onError }) {
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);
    const [paymentError, setPaymentError] = useState(null);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setProcessing(true);
        setPaymentError(null);

        if (!stripe || !elements) {
            setPaymentError('Stripe n\'est pas chargé. Veuillez réessayer.');
            setProcessing(false);
            return;
        }

        try {
            // 1. Récupérer le token
            const token = localStorage.getItem('access_token');
            if (!token) {
                throw new Error('Vous devez être connecté pour effectuer un paiement');
            }

            console.log('1. Création de la commande...');
            
            // 2. Créer la commande avec le token dans les headers
            const orderResponse = await api.post('/shop/create-order/', {
                customer_name: customerInfo.customer_name,
                customer_email: customerInfo.customer_email,
                customer_phone: customerInfo.customer_phone,
                customer_address: customerInfo.customer_address,
                items: cart.map(item => ({
                    product_id: item.id,
                    quantity: item.quantity
                }))
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('2. Réponse commande:', orderResponse.data);

            if (!orderResponse.data.success) {
                throw new Error(orderResponse.data.error || 'Erreur lors de la création de la commande');
            }

            console.log('3. Création du paiement Stripe...');

            // 3. Créer le payment intent avec le token
            const paymentResponse = await api.post('/payments/create-payment-intent/', {
                order_id: orderResponse.data.order_id,
                amount: total,
                currency: 'XAF'
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('4. Réponse paiement:', paymentResponse.data);

            const { clientSecret } = paymentResponse.data;
            const cardElement = elements.getElement(CardElement);
            const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: cardElement,
                    billing_details: {
                        name: customerInfo.customer_name,
                        email: customerInfo.customer_email,
                    },
                },
            });

            if (error) {
                setPaymentError(error.message);
                onError(error.message);
            } else if (paymentIntent.status === 'succeeded') {
                onSuccess(orderResponse.data.order_id);
            }
        } catch (error) {
            console.error('❌ Erreur complète:', error);
            console.error('❌ Response:', error.response);
            
            // Message d'erreur plus explicite
            if (error.response?.status === 403) {
                setPaymentError('Vous n\'avez pas la permission d\'effectuer ce paiement. Veuillez vous reconnecter.');
                onError('Permission refusée. Veuillez vous reconnecter.');
            } else if (error.response?.status === 401) {
                setPaymentError('Votre session a expiré. Veuillez vous reconnecter.');
                onError('Session expirée. Veuillez vous reconnecter.');
            } else {
                setPaymentError(error.message || 'Erreur lors du paiement');
                onError(error.message);
            }
        } finally {
            setProcessing(false);
        }
    };

    const cardElementOptions = {
        style: {
            base: {
                fontSize: '16px',
                color: '#1a2a4f',
                fontFamily: 'Inter, sans-serif',
                '::placeholder': {
                    color: '#aab7c4',
                },
            },
            invalid: {
                color: '#dc3545',
            },
        },
    };

    return (
        <form onSubmit={handleSubmit} className="payment-form">
            <div className="payment-card-element">
                <CardElement options={cardElementOptions} />
            </div>
            
            {paymentError && (
                <div className="payment-error" style={{
                    color: '#dc3545',
                    background: '#f8d7da',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    marginTop: '0.5rem',
                    fontSize: '0.9rem'
                }}>
                    <span>⚠️</span> {paymentError}
                </div>
            )}

            <button 
                type="submit" 
                className="btn-pay"
                disabled={!stripe || processing}
                style={{
                    background: 'linear-gradient(135deg, #dc3545, #b02a37)',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem',
                    borderRadius: '12px',
                    fontWeight: '600',
                    width: '100%',
                    marginTop: '1rem',
                    transition: 'all 0.3s ease',
                    cursor: (!stripe || processing) ? 'not-allowed' : 'pointer',
                    opacity: (!stripe || processing) ? 0.6 : 1
                }}
            >
                {processing ? (
                    <span className="spinner-payment"></span>
                ) : (
                    <>
                        <FaCreditCard /> Payer {total.toLocaleString()} CFA
                    </>
                )}
            </button>
        </form>
    );
}

function Checkout() {
    const [cart, setCart] = useState([]);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [orderId, setOrderId] = useState(null);
    const [formData, setFormData] = useState({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        customer_address: ''
    });
    const navigate = useNavigate();

    const token = localStorage.getItem('access_token');
    const userRole = localStorage.getItem('user_role');

    useEffect(() => {
        const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
        if (savedCart.length === 0) {
            navigate('/shop');
        }
        setCart(savedCart);
    }, [navigate]);

    useEffect(() => {
        if (!token) {
            navigate('/login');
        } else if (userRole === 'admin') {
            navigate('/dashboard');
        }
    }, [token, userRole, navigate]);

    const getTotal = () => {
        return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    const handlePaymentSuccess = (orderId) => {
        setOrderId(orderId);
        setPaymentSuccess(true);
        localStorage.removeItem('cart');
        setTimeout(() => {
            navigate('/shop');
        }, 3000);
    };

    const handlePaymentError = (error) => {
        // Ne pas alerter ici car le message est déjà affiché dans le formulaire
        console.error('Erreur de paiement:', error);
    };

    const floatingIcons = [
        { icon: FaHeartbeat, delay: 0, duration: 20, top: 5, left: 5 },
        { icon: FaSyringe, delay: 3, duration: 25, top: 15, left: 80 },
        { icon: FaPills, delay: 6, duration: 22, top: 30, left: 10 },
        { icon: FaAmbulance, delay: 9, duration: 28, top: 50, left: 85 },
        { icon: FaMicroscope, delay: 12, duration: 24, top: 70, left: 8 },
        { icon: FaHospital, delay: 15, duration: 26, top: 85, left: 75 }
    ];

    if (paymentSuccess) {
        return (
            <div className="checkout-page">
                <div className="checkout-bg-gradient"></div>
                <div className="container py-5 checkout-success">
                    <div className="text-center">
                        <div className="success-icon">✅</div>
                        <h2>Commande confirmée !</h2>
                        <p>Votre commande a été passée avec succès.</p>
                        <p className="text-muted">ID de commande: #{orderId}</p>
                        <Link to="/shop" className="btn btn-custom-primary mt-3">
                            <FaArrowLeft /> Retour à la boutique
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="checkout-page">
            <div className="checkout-bg-gradient"></div>
            {floatingIcons.map((item, index) => (
                <div 
                    key={index}
                    className="floating-icon-checkout"
                    style={{
                        animationDelay: `${item.delay}s`,
                        animationDuration: `${item.duration}s`,
                        top: `${item.top}%`,
                        left: `${item.left}%`
                    }}
                >
                    <item.icon />
                </div>
            ))}

            <div className="container py-4 checkout-content">
                <h2 className="checkout-title">
                    <FaShoppingCart className="me-2" /> Validation de la commande
                </h2>

                <div className="row">
                    <div className="col-lg-7">
                        <div className="checkout-card">
                            <div className="checkout-card-body">
                                <h5 className="checkout-section-title">
                                    <span className="checkout-step">1</span> Informations de livraison
                                </h5>
                                <form>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label className="form-label">Nom complet *</label>
                                                <input 
                                                    type="text" 
                                                    className="form-input"
                                                    placeholder="Votre nom"
                                                    required
                                                    value={formData.customer_name}
                                                    onChange={e => setFormData({...formData, customer_name: e.target.value})} 
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label className="form-label">Email *</label>
                                                <input 
                                                    type="email" 
                                                    className="form-input"
                                                    placeholder="email@exemple.com"
                                                    required
                                                    value={formData.customer_email}
                                                    onChange={e => setFormData({...formData, customer_email: e.target.value})} 
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Téléphone *</label>
                                        <input 
                                            type="tel" 
                                            className="form-input"
                                            placeholder="+237 6XX XX XX XX"
                                            required
                                            value={formData.customer_phone}
                                            onChange={e => setFormData({...formData, customer_phone: e.target.value})} 
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Adresse de livraison *</label>
                                        <textarea 
                                            className="form-input"
                                            rows="3"
                                            placeholder="Votre adresse complète"
                                            required
                                            value={formData.customer_address}
                                            onChange={e => setFormData({...formData, customer_address: e.target.value})} 
                                        />
                                    </div>
                                </form>

                                <hr className="checkout-divider" />

                                <h5 className="checkout-section-title">
                                    <span className="checkout-step">2</span> Paiement sécurisé
                                </h5>
                                <Elements stripe={stripePromise}>
                                    <PaymentForm 
                                        cart={cart}
                                        total={getTotal()}
                                        customerInfo={formData}
                                        onSuccess={handlePaymentSuccess}
                                        onError={handlePaymentError}
                                    />
                                </Elements>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-5">
                        <div className="checkout-summary">
                            <h5 className="summary-title">Récapitulatif</h5>
                            <div className="summary-items">
                                {cart.map(item => (
                                    <div key={item.id} className="summary-item">
                                        <span>{item.name} x {item.quantity}</span>
                                        <span>{(item.price * item.quantity).toLocaleString()} CFA</span>
                                    </div>
                                ))}
                            </div>
                            <hr className="summary-divider" />
                            <div className="summary-total">
                                <span>Total</span>
                                <span className="total-amount">{getTotal().toLocaleString()} CFA</span>
                            </div>
                            <Link to="/cart" className="btn-back-cart">
                                <FaArrowLeft /> Retour au panier
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Checkout;