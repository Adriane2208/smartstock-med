
// UTILITAIRE UNIFORME POUR LES IMAGES

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

/**
 * Obtient l'URL complète d'une image produit
 * @param {string} imagePath - Chemin de l'image (ex: /media/products/photo.jpg)
 * @returns {string|null} URL complète ou null
 */
export const getProductImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // Si déjà une URL complète, la retourner
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }
    
    // Si le chemin commence par /media/ ou media/
    if (imagePath.startsWith('/media/')) {
        return `${API_URL}${imagePath}`;
    }
    if (imagePath.startsWith('media/')) {
        return `${API_URL}/${imagePath}`;
    }
    
    // Sinon, supposer que c'est un chemin relatif
    return `${API_URL}/media/${imagePath}`;
};

/**
 * Gère l'erreur de chargement d'image
 * @param {Event} event - Événement onError
 * @param {string} fallbackText - Texte de remplacement
 */
export const handleImageError = (event, fallbackText = '📦') => {
    const img = event.target;
    img.style.display = 'none';
    // Ajouter un fallback text à côté
    const parent = img.parentElement;
    if (parent && !parent.querySelector('.image-fallback')) {
        const fallback = document.createElement('span');
        fallback.className = 'image-fallback';
        fallback.textContent = fallbackText;
        fallback.style.cssText = 'font-size: 32px; color: #1a2a4f;';
        parent.appendChild(fallback);
    }
};