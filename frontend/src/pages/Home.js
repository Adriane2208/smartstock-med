import React from 'react';
import { Link } from 'react-router-dom';
import { FaHospital, FaBoxes, FaFileInvoice, FaTruck, FaShoppingCart, FaBrain, FaShieldAlt } from 'react-icons/fa';
import './Home.css';  // ← Import du CSS

function Home() {
    return (
        <div className="home-page">
            {/* Navbar */}
            <nav className="home-navbar navbar navbar-expand-lg">
                <div className="container">
                    <Link className="home-brand" to="/">
                        <FaHospital className="me-2" />
                        SmartStock Med
                    </Link>
                    <div className="ms-auto">
                        <Link to="/login" className="btn home-btn-outline rounded-pill px-4 me-2">
                            Connexion
                        </Link>
                        <Link to="/register" className="btn btn-outline-light rounded-pill px-4">
                            Inscription
                        </Link>
                        <Link to="/shop" className="btn home-btn-danger rounded-pill px-4">
                            Boutique
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="home-hero">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-lg-7">
                            <h1 className="home-hero-title">
                                Gérez vos équipements médicaux <span className="home-hero-accent">intelligemment</span>
                            </h1>
                            <p className="home-hero-text">
                                SmartStock Med est la solution complète pour la gestion des stocks, 
                                la facturation et le suivi des livraisons de vos dispositifs médicaux.
                            </p>
                            <Link to="/shop" className="btn home-btn-light rounded-pill px-4 py-2 me-2">
                                <FaShoppingCart className="me-2" /> Commencer mes achats
                            </Link>
                            
                        </div>
                        <div className="col-lg-5 text-center">
                            <FaHospital className="home-hero-icon" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Features */}
            <div className="home-features">
                <div className="container">
                    <h2 className="home-features-title">Fonctionnalités principales</h2>
                    <div className="row">
                        {[
                            { icon: <FaBoxes />, title: 'Gestion des stocks', desc: 'Suivi en temps réel avec alertes stock faible' },
                            { icon: <FaFileInvoice />, title: 'Facturation', desc: 'Génération automatique de factures PDF' },
                            { icon: <FaTruck />, title: 'Livraisons', desc: 'Traçabilité complète des livraisons' },
                            { icon: <FaShoppingCart />, title: 'Espace client', desc: 'Commandes en ligne et suivi' },
                            { icon: <FaBrain />, title: 'Module intelligent', desc: 'Suggestions de réapprovisionnement' },
                            { icon: <FaShieldAlt />, title: 'Sécurité', desc: 'Authentification et gestion des accès' }
                        ].map((feature, index) => (
                            <div className="col-md-4 mb-4" key={index}>
                                <div className="home-feature-card card h-100 text-center p-4">
                                    <div className="home-feature-icon">
                                        {feature.icon}
                                    </div>
                                    <h5 className="home-feature-title">{feature.title}</h5>
                                    <p className="text-muted">{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="home-footer">
                <div className="container">
                    <p>&copy; 2025 SmartStock Med - Tous droits réservés</p>
                    <p className="home-footer-sub">Solution intelligente de gestion médicale</p>
                </div>
            </footer>
        </div>
    );
}

export default Home;