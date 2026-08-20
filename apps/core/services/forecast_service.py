from datetime import datetime, timedelta
from django.db.models import Sum, Count, Avg
from django.utils import timezone
from apps.sales.models import Invoice, InvoiceItem
from apps.products.models import Product
from apps.shop.models import ClientOrder
import statistics
from collections import defaultdict

@staticmethod
def get_sales_trend(days=30):
    """Retourne des données factices si pas de données réelles"""
    # Vérifier s'il y a des données
    if Invoice.objects.count() == 0:
        # Données factices
        import random
        dates = [(datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d') for i in range(days, 0, -1)]
        amounts = [random.randint(50000, 200000) for _ in range(days)]
        return {
            'dates': dates[-14:],
            'amounts': amounts[-14:],
            'trend': [],
            'forecast': [],
            'avg_daily': sum(amounts) / len(amounts) if amounts else 0,
            'total_period': sum(amounts)
        }
    # Code original...

class ForecastService:
    """
    Service de prévision intelligent pour SmartStock Med
    """
    
    @staticmethod
    def get_sales_trend(days=30):
        """
        Analyser la tendance des ventes sur une période donnée
        """
        end_date = timezone.now()
        start_date = end_date - timedelta(days=days)
        
        # Récupérer les ventes par jour
        sales_by_day = Invoice.objects.filter(
            created_at__gte=start_date,
            created_at__lte=end_date
        ).values('created_at__date').annotate(
            total=Sum('total')
        ).order_by('created_at__date')
        
        # Préparer les données
        dates = []
        amounts = []
        for sale in sales_by_day:
            dates.append(sale['created_at__date'].strftime('%Y-%m-%d'))
            amounts.append(float(sale['total']))
        
        # Calculer la tendance (moyenne mobile)
        trend = []
        if len(amounts) >= 7:
            for i in range(len(amounts) - 6):
                avg = sum(amounts[i:i+7]) / 7
                trend.append(avg)
        
        # Prévision des 7 prochains jours
        forecast = []
        if len(amounts) >= 14:
            avg_daily = sum(amounts) / len(amounts)
            # Ajouter une variation saisonnière
            for i in range(7):
                day = datetime.now() + timedelta(days=i+1)
                weekday = day.weekday()
                # Weekend = plus de ventes
                multiplier = 1.3 if weekday >= 5 else 1.0
                forecast.append({
                    'date': day.strftime('%Y-%m-%d'),
                    'predicted': round(avg_daily * multiplier, 2)
                })
        
        return {
            'dates': dates[-14:],  # Derniers 14 jours
            'amounts': amounts[-14:],
            'trend': trend,
            'forecast': forecast,
            'avg_daily': round(sum(amounts) / len(amounts), 2) if amounts else 0,
            'total_period': sum(amounts)
        }
    
    @staticmethod
    def get_top_products(limit=10, days=30):
        """
        Récupérer les produits les plus vendus
        """
        start_date = timezone.now() - timedelta(days=days)
        
        top_products = InvoiceItem.objects.filter(
            invoice__created_at__gte=start_date
        ).values(
            'product_id', 'product__name', 'product__category__name'
        ).annotate(
            total_quantity=Sum('quantity'),
            total_revenue=Sum('price')
        ).order_by('-total_quantity')[:limit]
        
        return list(top_products)
    
    @staticmethod
    def get_low_stock_products(threshold=10):
        """
        Récupérer les produits avec un stock bas
        """
        return Product.objects.filter(
            quantity__lte=threshold
        ).select_related('category').order_by('quantity')
    
    @staticmethod
    def get_products_to_sell(limit=10):
        """
        Détecter les produits à écouler (stock élevé, ventes faibles)
        """
        products = Product.objects.all()
        products_to_sell = []
        
        for product in products:
            # Récupérer les ventes des 30 derniers jours
            sales_30d = InvoiceItem.objects.filter(
                product=product,
                invoice__created_at__gte=timezone.now() - timedelta(days=30)
            ).aggregate(
                total_sold=Sum('quantity')
            )['total_sold'] or 0
            
            # Calcul du ratio stock / ventes
            if sales_30d > 0:
                ratio = product.quantity / sales_30d
            else:
                ratio = product.quantity
            
            # Si stock > 100 et ventes faibles
            if product.quantity > 100 and sales_30d < 10:
                days_to_sell = product.quantity / (sales_30d / 30) if sales_30d > 0 else 999
                products_to_sell.append({
                    'product': product,
                    'stock': product.quantity,
                    'sales_30d': sales_30d,
                    'days_to_sell': round(days_to_sell, 1),
                    'ratio': round(ratio, 2)
                })
        
        # Trier par ratio (stock/ventes) le plus élevé
        products_to_sell.sort(key=lambda x: x['ratio'], reverse=True)
        
        return products_to_sell[:limit]
    
    @staticmethod
    def get_replenishment_suggestions():
        """
        Suggérer les produits à réapprovisionner
        """
        suggestions = []
        low_stock = ForecastService.get_low_stock_products()
        
        for product in low_stock:
            # Calculer la vitesse de vente
            sales_30d = InvoiceItem.objects.filter(
                product=product,
                invoice__created_at__gte=timezone.now() - timedelta(days=30)
            ).aggregate(
                total_sold=Sum('quantity')
            )['total_sold'] or 0
            
            daily_sales = sales_30d / 30 if sales_30d > 0 else 0
            
            # Suggérer une quantité à commander
            if daily_sales > 0:
                days_until_out = product.quantity / daily_sales if daily_sales > 0 else 0
                suggested_order = round(daily_sales * 30)  # 30 jours de stock
            else:
                days_until_out = 0
                suggested_order = 50  # Quantité par défaut
            
            suggestions.append({
                'product': product,
                'current_stock': product.quantity,
                'daily_sales': round(daily_sales, 2),
                'days_until_out': round(days_until_out, 1),
                'suggested_order': suggested_order,
                'priority': 'high' if days_until_out < 7 else 'medium' if days_until_out < 15 else 'low'
            })
        
        # Trier par priorité
        priority_order = {'high': 0, 'medium': 1, 'low': 2}
        suggestions.sort(key=lambda x: priority_order[x['priority']])
        
        return suggestions
    
    @staticmethod
    def get_category_distribution():
        """
        Distribution des ventes par catégorie
        """
        categories = Product.objects.values(
            'category__name'
        ).annotate(
            total_quantity=Sum('quantity')
        ).order_by('-total_quantity')
        
        return list(categories)
    
    @staticmethod
    def get_dashboard_stats():
        """
        Statistiques globales pour le dashboard intelligent
        """
        today = timezone.now().date()
        start_of_month = today.replace(day=1)
        
        # Ventes du mois
        monthly_sales = Invoice.objects.filter(
            created_at__month=today.month,
            created_at__year=today.year
        ).aggregate(total=Sum('total'))['total'] or 0
        
        # Ventes du jour
        daily_sales = Invoice.objects.filter(
            created_at__date=today
        ).aggregate(total=Sum('total'))['total'] or 0
        
        # Nombre de commandes en cours
        pending_orders = ClientOrder.objects.filter(
            status__in=['pending', 'confirmed', 'preparing']
        ).count()
        
        # Produits en stock bas
        low_stock_count = Product.objects.filter(
            quantity__lte=10
        ).count()
        
        # Produits les plus vendus
        top_product = InvoiceItem.objects.values(
            'product__name'
        ).annotate(
            total=Sum('quantity')
        ).order_by('-total').first()
        
        return {
            'monthly_sales': monthly_sales,
            'daily_sales': daily_sales,
            'pending_orders': pending_orders,
            'low_stock_count': low_stock_count,
            'top_product': top_product['product__name'] if top_product else 'Aucun',
            'total_products': Product.objects.count(),
            'total_customers': 0,  # À implémenter
        }