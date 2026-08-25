# apps/core/services/delivery_tracker.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.deliveries.models import Delivery
from apps.core.services.notification_service import NotificationService
from apps.shop.models import ClientOrder

class DeliveryTracker:
    """Service de suivi automatique des livraisons"""

    @staticmethod
    def update_order_status_on_delivery(delivery):
        """
        Met à jour automatiquement le statut de la commande
        lorsque le livreur met à jour la livraison
        """
        if delivery.order:
            try:
                order = delivery.order
                
                status_map = {
                    'assigned': 'shipped',
                    'in_progress': 'shipped',
                    'completed': 'delivered',
                    'failed': 'cancelled',
                }
                
                if delivery.status in status_map:
                    new_status = status_map[delivery.status]
                    order.status = new_status
                    order.save()
                    
                    if delivery.customer_name:
                        NotificationService.notify_order_status(
                            order,
                            new_status,
                            order.customer_email if order.customer_email else None
                        )
                    
                    return True
            except ClientOrder.DoesNotExist:
                pass
        
        return False

@receiver(post_save, sender=Delivery)
def delivery_status_changed(sender, instance, **kwargs):
    """Signal automatique déclenché quand une livraison change de statut"""
    DeliveryTracker.update_order_status_on_delivery(instance)