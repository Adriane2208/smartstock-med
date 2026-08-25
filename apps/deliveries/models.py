from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.sales.models import Invoice
from apps.users.models import User
from apps.shop.models import ClientOrder

class Delivery(models.Model):
    STATUS_CHOICES = [
        ('pending', 'En attente'),
        ('assigned', 'Assignée'),
        ('in_progress', 'En cours'),
        ('delivered', 'Livrée'),
        ('failed', 'Échouée'),
    ]
    
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='deliveries')
    address = models.TextField()
    delivery_person = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        limit_choices_to={'role': 'delivery'},
        related_name='assigned_deliveries'
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    customer_name = models.CharField(max_length=200, blank=True, null=True)
    customer_email = models.EmailField(blank=True, null=True)
    customer_phone = models.CharField(max_length=20, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Livraison #{self.id} - {self.customer_name}"

# SIGNAL POUR MISE À JOUR AUTOMATIQUE
@receiver(post_save, sender=Delivery)
def update_order_on_delivery_status_change(sender, instance, **kwargs):
    """Met automatiquement à jour le statut de la commande quand la livraison change"""
    if instance.invoice:
        try:
            order = ClientOrder.objects.get(invoice=instance.invoice)
            
            status_map = {
                'pending': 'pending',
                'assigned': 'shipped',
                'in_progress': 'shipped',
                'delivered': 'delivered',
                'failed': 'cancelled',
            }
            
            if instance.status in status_map:
                new_status = status_map[instance.status]
                if order.status != new_status:
                    order.status = new_status
                    order.save()
                    
                    # Notification automatique
                    from apps.core.services.notification_service import NotificationService
                    NotificationService.notify_order_update(
                        order,
                        new_status,
                        instance.customer_email
                    )
        except ClientOrder.DoesNotExist:
            pass

class DeliveryTracking(models.Model):
    """Suivi en temps réel des livraisons"""
    delivery = models.OneToOneField(Delivery, on_delete=models.CASCADE, related_name='tracking')
    latitude = models.DecimalField(max_digits=9, decimal_places=6, default=0)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, default=0)
    last_updated = models.DateTimeField(auto_now=True)
    speed = models.FloatField(default=0)  # km/h
    accuracy = models.FloatField(default=0)  # mètres
    
    def __str__(self):
        return f"Suivi livraison #{self.delivery.id}"        

