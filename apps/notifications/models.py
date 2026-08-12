from django.db import models
from django.conf import settings

class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('order', 'Nouvelle commande'),
        ('invoice', 'Nouvelle facture'),
        ('delivery', 'Mise à jour livraison'),
        ('status', 'Changement de statut'),
        ('stock', 'Alerte stock'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    message = models.TextField()
    type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES, default='order')
    is_read = models.BooleanField(default=False)
    link = models.CharField(max_length=200, blank=True, null=True)
    order_id = models.IntegerField(null=True, blank=True)
    invoice_id = models.IntegerField(null=True, blank=True)
    delivery_id = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.get_type_display()} - {self.user.username} - {self.created_at}"