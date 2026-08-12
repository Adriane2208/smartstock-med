import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import './Layout.css';

function Layout({ children }) {
    const userRole = localStorage.getItem('user_role') || '';

    // Afficher la sidebar seulement pour les utilisateurs connectés
    const showSidebar = ['admin', 'manager', 'delivery', 'client'].includes(userRole);

    return (
        <div className="layout-container">
            {/* Navbar unifiée - une seule */}
            <Navbar />
            
            <div className="container-fluid mt-4">
                <div className="row">
                    {/* Sidebar - une seule */}
                    {showSidebar && (
                        <div className="col-md-2">
                            <Sidebar />
                        </div>
                    )}
                    
                    {/* Contenu principal */}
                    <div className={showSidebar ? "col-md-10" : "col-12"}>
                        <div className="main-content">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Layout;