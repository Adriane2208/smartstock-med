# apps/core/services/client_analyzer.py
from datetime import timedelta
from django.db.models import Sum, Count, Avg
from django.utils import timezone
from apps.sales.models import Invoice
from apps.shop.models import ClientOrder
from apps.users.models import User

class ClientAnalyzer:
    """
    Analyse des comportements clients pour la fidélisation
    """

    @staticmethod
    def detect_frequent_buyers(threshold=3, period_days=30):
        """
        Détecte les clients qui achètent fréquemment
        """
        start_date = timezone.now() - timedelta(days=period_days)
        
        orders = ClientOrder.objects.filter(
            created_at__gte=start_date,
            status='delivered'
        ).values('customer_email').annotate(
            total_orders=Count('id'),
            total_amount=Sum('total')
        ).filter(total_orders__gte=threshold)
        
        frequent_buyers = []
        for order in orders:
            try:
                user = User.objects.get(email=order['customer_email'])
                frequent_buyers.append({
                    'user': user,
                    'total_orders': order['total_orders'],
                    'total_amount': float(order['total_amount']),
                })
            except User.DoesNotExist:
                pass
        
        return frequent_buyers

    @staticmethod
    def generate_promotions():
        """Génère automatiquement des promotions personnalisées"""
        frequent_buyers = ClientAnalyzer.detect_frequent_buyers(threshold=3, period_days=30)
        
        promotions = []
        for buyer in frequent_buyers:
            if buyer['total_amount'] > 1000000:
                discount = 15
            elif buyer['total_amount'] > 500000:
                discount = 10
            else:
                discount = 5
            
            promotions.append({
                'client': buyer['user'],
                'discount': discount,
                'total_orders': buyer['total_orders'],
                'total_amount': buyer['total_amount'],
            })
        
        return promotions

@staticmethod
def generate_automatic_promotions():
    """Génère automatiquement des promotions personnalisées"""
    # 1. Détecter les clients fidèles
    frequent_buyers = ClientAnalyzer.detect_frequent_buyers(threshold=3, period_days=30)
    
    promotions_created = 0
    for buyer in frequent_buyers:
        # Calculer la remise selon le montant total
        if buyer['total_amount'] > 1000000:
            discount = 15
        elif buyer['total_amount'] > 500000:
            discount = 10
        else:
            discount = 5
        
        # Vérifier si une promotion existe déjà
        existing = Notification.objects.filter(
            user=buyer['user'],
            type=NotificationType.PROMOTION,
            created_at__gte=timezone.now() - timedelta(days=7)
        ).exists()
        
        if not existing:
            # Créer la promotion
            Notification.objects.create(
                type=NotificationType.PROMOTION,
                user=buyer['user'],
                message=f"🎉 Félicitations ! En tant que client fidèle, "
                        f"vous bénéficiez de {discount}% de remise sur votre prochaine commande."
                        f" (Valable 7 jours)"
            )
            promotions_created += 1
            
            # Envoyer l'email
            if buyer['user'].email:
                NotificationService.send_email_async(
                    subject="🎉 Offre spéciale pour vous chez SmartStock Med",
                    message=f"Bonjour {buyer['user'].username},\n\n"
                            f"En tant que client fidèle, nous vous offrons {discount}% "
                            f"de remise sur votre prochaine commande.\n\n"
                            f"Cette offre est valable 7 jours.\n\n"
                            f"SmartStock Med",
                    recipient_list=[buyer['user'].email]
                )
    
    return promotions_created    