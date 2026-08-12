// COMPOSANT RÉUTILISABLE POUR AFFICHER LES IMAGES PRODUITS

import React from 'react';
import { getProductImageUrl, handleImageError } from '../utils/imageUtils';

const ProductImage = ({ 
    image, 
    name, 
    className = '', 
    style = {}, 
    fallbackIcon = '📦',
    width = '50px',
    height = '50px'
}) => {
    const imageUrl = getProductImageUrl(image);
    
    if (!imageUrl) {
        return (
            <span style={{ 
                fontSize: '24px', 
                color: '#1a2a4f',
                width,
                height,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                {fallbackIcon}
            </span>
        );
    }
    
    return (
        <img
            src={imageUrl}
            alt={name || 'Produit'}
            className={`product-image ${className}`}
            style={{
                width,
                height,
                objectFit: 'cover',
                borderRadius: '8px',
                ...style
            }}
            onError={(e) => handleImageError(e, fallbackIcon)}
        />
    );
};

export default ProductImage;