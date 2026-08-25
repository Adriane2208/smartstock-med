from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class NotificationType(models.TextChoices):
    STOCK_ALERT = 'stock_alert', '⚠️ Alerte stock'
    DORMANT_PRODUCT = 'dormant_product', '📦 Produit dormant'
    ORDER_STATUS = 'order_status', '📦 Statut commande'
    PROMOTION = 'promotion', '🎉 Promotion'
    EXPIRING_PRODUCT = 'expiring_product', '⏳ Produit expire'

class Notification(models.Model):
    type = models.CharField(max_length=50, choices=NotificationType.choices)
    message = models.TextField()
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        null=True,           # ← AJOUTER null=True
        blank=True,          # ← AJOUTER blank=True
        related_name='notifications'
    )
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Champs optionnels
    product_id = models.IntegerField(null=True, blank=True)
    order_id = models.IntegerField(null=True, blank=True)
    invoice_id = models.IntegerField(null=True, blank=True)
    delivery_id = models.IntegerField(null=True, blank=True)
    link = models.URLField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.get_type_display()} - {self.created_at.strftime('%d/%m/%Y %H:%M')}"