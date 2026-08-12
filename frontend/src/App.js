// frontend/src/App.js
// CORRIGÉ - SUPPRESSION DE ClientLayout INUTILISÉ

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Pages publiques
import Home from './pages/Home';
import Login from './pages/Login';
import Shop from './pages/Shop';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import ClientRegister from './pages/ClientRegister';

// Pages admin
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Invoices from './pages/Invoices';
import Deliveries from './pages/Deliveries';
import ClientOrders from './pages/ClientOrders';

// Pages livreur
import DeliveryDashboard from './pages/DeliveryDashboard';

// Pages client
import MyOrders from './pages/MyOrders';
import MyInvoices from './pages/MyInvoices';
import OrderTracking from './pages/OrderTracking';
import Profile from './pages/Profile';
import Users from './pages/Users';
import Forecast from './pages/Forecast';

// Layout principal (pour admin et livreur)
import Layout from './components/Layout';
// ClientLayout SUPPRIMÉ - non utilisé dans App.js (les pages client l'importent directement)

// Composant de protection des routes
const PrivateRoute = ({ children, allowedRoles = [] }) => {
    const token = localStorage.getItem('access_token');
    const userRole = localStorage.getItem('user_role');

    if (!token) {
        return <Navigate to="/login" />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
        if (userRole === 'delivery') {
            return <Navigate to="/delivery-dashboard" />;
        } else if (userRole === 'admin' || userRole === 'manager') {
            return <Navigate to="/dashboard" />;
        } else if (userRole === 'client') {
            return <Navigate to="/shop" />;
        } else {
            return <Navigate to="/" />;
        }
    }

    return children;
};

function App() {
    return (
        <Router>
            <Routes>
                {/* Pages publiques (SANS Layout) */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<ClientRegister />} />

                {/* Routes Admin et Manager (AVEC Layout principal) */}
                <Route path="/dashboard" element={
                    <PrivateRoute allowedRoles={['admin', 'manager']}>
                        <Layout><Dashboard /></Layout>
                    </PrivateRoute>
                } />
                <Route path="/products" element={
                    <PrivateRoute allowedRoles={['admin', 'manager']}>
                        <Layout><Products /></Layout>
                    </PrivateRoute>
                } />
                <Route path="/invoices" element={
                    <PrivateRoute allowedRoles={['admin', 'manager']}>
                        <Layout><Invoices /></Layout>
                    </PrivateRoute>
                } />
                <Route path="/deliveries" element={
                    <PrivateRoute allowedRoles={['admin', 'manager']}>
                        <Layout><Deliveries /></Layout>
                    </PrivateRoute>
                } />
                <Route path="/client-orders" element={
                    <PrivateRoute allowedRoles={['admin', 'manager']}>
                        <ClientOrders />
                    </PrivateRoute>
                } />
                <Route path="/users" element={
                    <PrivateRoute allowedRoles={['admin', 'manager']}>
                        <Layout><Users /></Layout>
                    </PrivateRoute>
                } />
                <Route path="/forecast" element={
                    <PrivateRoute allowedRoles={['admin', 'manager']}>
                        <Layout><Forecast /></Layout>
                    </PrivateRoute>
                } />

                {/* Routes Livreur (AVEC Layout principal) */}
                <Route path="/delivery-dashboard" element={
                    <PrivateRoute allowedRoles={['delivery']}>
                        <Layout><DeliveryDashboard /></Layout>
                    </PrivateRoute>
                } />

                {/* Routes Client (AVEC ClientLayout - importé dans chaque page) */}
                <Route path="/shop" element={
                    <PrivateRoute allowedRoles={['client', 'admin', 'manager']}>
                        <Shop />
                    </PrivateRoute>
                } />
                <Route path="/cart" element={
                    <PrivateRoute allowedRoles={['client', 'admin', 'manager']}>
                        <Cart />
                    </PrivateRoute>
                } />
                <Route path="/checkout" element={
                    <PrivateRoute allowedRoles={['client', 'admin', 'manager']}>
                        <Checkout />
                    </PrivateRoute>
                } />
                <Route path="/my-orders" element={
                    <PrivateRoute allowedRoles={['client']}>
                        <MyOrders />
                    </PrivateRoute>
                } />
                <Route path="/my-invoices" element={
                    <PrivateRoute allowedRoles={['client']}>
                        <MyInvoices />
                    </PrivateRoute>
                } />
                <Route path="/order-tracking" element={
                    <PrivateRoute allowedRoles={['client']}>
                        <OrderTracking />
                    </PrivateRoute>
                } />
                <Route path="/profile" element={
                    <PrivateRoute allowedRoles={['client', 'delivery', 'admin', 'manager']}>
                        <Profile />
                    </PrivateRoute>
                } />

                {/* Redirection 404 */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
}

export default App;