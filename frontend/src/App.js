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
import DeliveriesAdmin from './pages/Deliveries';
import ClientOrders from './pages/ClientOrders';
import Users from './pages/Users';
import Forecast from './pages/Forecast';
import Notifications from './pages/Notifications';
import AnalyzeProducts from './pages/AnalyzeProducts';
import AnalyzeClients from './pages/AnalyzeClients';

// Pages livreur
import DeliveryDashboard from './pages/DeliveryDashboard';
import DeliveriesLivreur from './pages/Deliveries';
import OrderTrackingHistory from './pages/OrderTrackingHistory';

// Pages client
import MyOrders from './pages/MyOrders';
import MyInvoices from './pages/MyInvoices';
import OrderTracking from './pages/OrderTracking';
import Profile from './pages/Profile';
import OrderTrackingList from './pages/OrderTrackingList';

// Layout
import Layout from './components/Layout';

// Composant de protection
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
                {/* Pages publiques */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<ClientRegister />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={
                    <PrivateRoute allowedRoles={['client', 'admin', 'manager']}>
                        <Checkout />
                    </PrivateRoute>
                } />

                {/* Routes Admin - AVEC Layout dans la route */}
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
                <Route path="/deliveries-admin" element={
                    <PrivateRoute allowedRoles={['admin', 'manager']}>
                        <Layout><DeliveriesAdmin /></Layout>
                    </PrivateRoute>
                } />
                <Route path="/client-orders" element={
                    <PrivateRoute allowedRoles={['admin', 'manager']}>
                        <Layout><ClientOrders /></Layout>
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
                <Route path="/notifications" element={
                    <PrivateRoute allowedRoles={['admin', 'manager']}>
                        <Layout><Notifications /></Layout>
                    </PrivateRoute>
                } />
                <Route path="/analyze-products" element={
                    <PrivateRoute allowedRoles={['admin', 'manager']}>
                        <Layout><AnalyzeProducts /></Layout>
                    </PrivateRoute>
                } />
                <Route path="/analyze-clients" element={
                    <PrivateRoute allowedRoles={['admin', 'manager']}>
                        <Layout><AnalyzeClients /></Layout>
                    </PrivateRoute>
                } />

                {/* Routes Livreur  */}
                <Route path="/delivery-dashboard" element={
                    <PrivateRoute allowedRoles={['delivery']}>
                        <DeliveryDashboard />
                    </PrivateRoute>
                } />
                <Route path="/deliveries" element={
                    <PrivateRoute allowedRoles={['delivery']}>
                        <Layout><DeliveriesLivreur /></Layout>
                    </PrivateRoute>
                } />
                <Route path="/order-tracking" element={
                    <PrivateRoute allowedRoles={['delivery', 'client']}>
                        <OrderTrackingHistory />
                    </PrivateRoute>
                } />
                <Route path="/profile" element={
                    <PrivateRoute allowedRoles={['client', 'delivery', 'admin', 'manager']}>
                        <Profile />
                    </PrivateRoute>
                } />

                {/* Routes Client */}
                <Route path="/my-orders" element={
                    <PrivateRoute allowedRoles={['client']}>
                        <Layout><MyOrders /></Layout>
                    </PrivateRoute>
                } />
                <Route path="/my-invoices" element={
                    <PrivateRoute allowedRoles={['client']}>
                        <Layout><MyInvoices /></Layout>
                    </PrivateRoute>
                } />
                <Route path="/tracking/:orderId" element={<OrderTracking />} />
                <Route path="/order-tracking-list" element={
                    <PrivateRoute allowedRoles={['client']}>
                        <Layout><OrderTrackingList /></Layout>
                    </PrivateRoute>
                } />

                {/* Redirection 404 */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
}

export default App;