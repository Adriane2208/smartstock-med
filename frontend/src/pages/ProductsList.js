import React, { useState, useEffect } from 'react';
import api from '../api/axios';

function ProductsList() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProducts();
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

    const deleteProduct = async (id) => {
        if (window.confirm('Supprimer ce produit ?')) {
            await api.delete(`/products/products/${id}/`);
            loadProducts();
        }
    };

    if (loading) return <div>Chargement...</div>;

    return (
        <div className="container">
            <h1>Produits</h1>
            <table className="table">
                <thead>
                    <tr><th>Nom</th><th>Prix</th><th>Stock</th><th>Actions</th></tr>
                </thead>
                <tbody>
                    {products.map(product => (
                        <tr key={product.id}>
                            <td>{product.name}</td>
                            <td>{product.price} CFA</td>
                            <td>{product.quantity}</td>
                            <td>
                                <button className="btn btn-danger" onClick={() => deleteProduct(product.id)}>
                                    Supprimer
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default ProductsList;