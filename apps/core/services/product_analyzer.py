# apps/core/services/product_analyzer.py
from datetime import timedelta
from django.db.models import Sum, Q
from django.utils import timezone
from apps.products.models import Product
from apps.sales.models import InvoiceItem
from apps.notifications.models import Notification, NotificationType

class ProductAnalyzer:
    """Analyseur intelligent de produits"""

    @staticmethod
    def detect_dormant_products(days_threshold=90):
        """Détecte les produits qui n'ont pas été vendus depuis longtemps"""
        cutoff_date = timezone.now() - timedelta(days=days_threshold)
        dormant_products = []
        
        products = Product.objects.filter(quantity__gt=0)
        
        for product in products:
            last_sale = InvoiceItem.objects.filter(
                product=product
            ).order_by('-invoice__created_at').first()
            
            if last_sale:
                days_since_last_sale = (timezone.now() - last_sale.invoice.created_at).days
            else:
                days_since_last_sale = days_threshold + 1
            
            if days_since_last_sale >= days_threshold:
                dormant_products.append({
                    'product': product,
                    'product_id': product.id,
                    'product_name': product.name,
                    'days_since_last_sale': days_since_last_sale,
                    'stock_value': product.price * product.quantity,
                    'quantity': product.quantity,
                    'priority': 'high' if days_since_last_sale > 180 else 'medium',
                })
        
        return sorted(dormant_products, key=lambda x: x['days_since_last_sale'], reverse=True)

    @staticmethod
    def check_and_alert():
        """Vérifie les produits dormants et génère des alertes"""
        dormant = ProductAnalyzer.detect_dormant_products()
        
        alerts_created = 0
        for item in dormant:
            # Vérifier si une alerte existe déjà pour ce produit
            # Utiliser le nom du produit pour la recherche (plus sûr)
            existing = Notification.objects.filter(
                message__icontains=item['product_name'],
                type=NotificationType.DORMANT_PRODUCT,
                is_read=False
            ).exists()
            
            if not existing:
                Notification.objects.create(
                    type=NotificationType.DORMANT_PRODUCT,
                    message=f"📦 {item['product_name']}: {item['days_since_last_sale']} jours sans vente. "
                            f"Stock: {item['quantity']} unités. "
                            f"Valeur: {item['stock_value']:,.0f} CFA. "
                            f"Action: {'🟥 Déstockage urgent' if item['priority'] == 'high' else '🟨 Promo recommandée'}"
                )
                alerts_created += 1
        
        return alerts_created