import React from 'react';
import { Link } from 'react-router-dom';
import {
    FaHospital, FaBoxes, FaFileInvoice, FaTruck,
    FaShoppingCart, FaBrain, FaShieldAlt,
    FaArrowRight, FaCheckCircle
} from 'react-icons/fa';
import './Home.css';

function Home() {
    return (
        <div className="home-page">

            {/* ─── Navbar ─── */}
            <nav className="home-navbar">
                <div className="container">
                    <Link className="home-brand" to="/">
                        <span className="home-brand-icon"><FaHospital /></span>
                        SmartStock<span className="home-brand-med"> Med</span>
                    </Link>
                    <div className="home-nav-actions">
                        <Link to="/login"    className="home-btn-ghost">Connexion</Link>
                        <Link to="/register" className="home-btn-ghost">Inscription</Link>
                        <Link to="/shop"     className="home-btn-primary">
                            Boutique <FaArrowRight className="home-btn-icon" />
                        </Link>
                    </div>
                </div>
            </nav>

            {/* ─── Hero ─── */}
            <section className="home-hero">
                <div className="home-hero-grid"   aria-hidden="true"></div>
                <div className="home-orb home-orb-1" aria-hidden="true"></div>
                <div className="home-orb home-orb-2" aria-hidden="true"></div>

                <div className="container home-hero-inner">
                    <div className="row align-items-center">
                        <div className="col-lg-7">
                            <div className="home-hero-eyebrow">
                                <span className="home-pulse"></span>
                                Solution médicale nouvelle génération
                            </div>
                            <h1 className="home-hero-title">
                                Gérez vos équipements médicaux
                                <span className="home-hero-accent"> intelligemment</span>
                            </h1>
                            <p className="home-hero-text">
                                SmartStock Med centralise la gestion des stocks, la facturation
                                et le suivi des livraisons de vos dispositifs médicaux — en temps réel.
                            </p>
                            <div className="home-hero-trust">
                                {['Sécurisé', 'Temps réel', 'Multi-utilisateurs'].map((t, i) => (
                                    <span key={i} className="home-trust-pill">
                                        <FaCheckCircle className="home-trust-icon" /> {t}
                                    </span>
                                ))}
                            </div>
                            <div className="home-hero-cta">
                                <Link to="/shop"  className="home-cta-primary">
                                    <FaShoppingCart className="me-2" /> Commencer mes achats
                                </Link>
                                <Link to="/login" className="home-cta-secondary">
                                    Espace admin <FaArrowRight className="home-btn-icon" />
                                </Link>
                            </div>
                        </div>
                        <div className="col-lg-5 d-none d-lg-flex justify-content-center">
                            <div className="home-hero-visual">
                                <FaHospital className="home-hero-icon" />
                                <div className="home-hero-ring home-hero-ring-1"></div>
                                <div className="home-hero-ring home-hero-ring-2"></div>
                                <div className="home-hero-ring home-hero-ring-3"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Features ─── */}
            <section className="home-features">
                <div className="container">
                    <div className="home-section-head">
                        <span className="home-section-eyebrow">Ce que nous offrons</span>
                        <h2 className="home-features-title">Tout ce dont vous avez besoin</h2>
                        <p className="home-features-sub">
                            Une plateforme unifiée pour piloter chaque aspect de votre
                            chaîne d'approvisionnement médicale.
                        </p>
                    </div>
                    <div className="row">
                        {[
                            { icon: <FaBoxes />,       title: 'Gestion des stocks',  desc: 'Suivi en temps réel avec alertes stock faible et réapprovisionnement automatique.',          badge: 'Temps réel'  },
                            { icon: <FaFileInvoice />, title: 'Facturation',          desc: 'Génération automatique de factures PDF conformes aux normes médicales.',                    badge: 'PDF'         },
                            { icon: <FaTruck />,       title: 'Livraisons',           desc: 'Traçabilité complète et statuts de livraison mis à jour en direct.',                        badge: 'Traçable'    },
                            { icon: <FaShoppingCart />,title: 'Espace client',        desc: 'Portail de commandes en ligne avec suivi personnalisé pour chaque client.',                  badge: 'Self-service'},
                            { icon: <FaBrain />,       title: 'Module intelligent',   desc: "Suggestions de réapprovisionnement basées sur l'historique et les tendances.",              badge: 'IA'          },
                            { icon: <FaShieldAlt />,   title: 'Sécurité',             desc: "Authentification renforcée et gestion granulaire des droits d'accès.",                      badge: 'Sécurisé'    }
                        ].map((feature, index) => (
                            <div className="col-md-4 mb-4" key={index}>
                                <div className="home-feature-card">
                                    <div className="home-feature-top">
                                        <div className="home-feature-icon-wrap">
                                            {feature.icon}
                                        </div>
                                        <span className="home-feature-badge">{feature.badge}</span>
                                    </div>
                                    <h5 className="home-feature-title">{feature.title}</h5>
                                    <p className="home-feature-desc">{feature.desc}</p>
                                    <div className="home-feature-arrow">
                                        <FaArrowRight />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── CTA Band ─── */}
            <section className="home-cta-band">
                <div className="home-cta-band-orb" aria-hidden="true"></div>
                <div className="container text-center">
                    <h2 className="home-cta-band-title">
                        Prêt à moderniser votre gestion médicale&nbsp;?
                    </h2>
                    <p className="home-cta-band-text">
                        Rejoignez les établissements qui font confiance à SmartStock Med.
                    </p>
                    <Link to="/shop" className="home-cta-primary home-cta-lg">
                        <FaShoppingCart className="me-2" /> Accéder à la boutique
                    </Link>
                </div>
            </section>

            {/* ─── Footer ─── */}
            <footer className="home-footer">
                <div className="container">
                    <div className="home-footer-brand">
                        <FaHospital className="me-2" /> SmartStock Med
                    </div>
                    <p className="home-footer-copy">&copy; 2025 SmartStock Med — Tous droits réservés</p>
                    <p className="home-footer-sub">Solution intelligente de gestion médicale</p>
                </div>
            </footer>
        </div>
    );
}

export default Home;