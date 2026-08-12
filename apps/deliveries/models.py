from django.db import models
from apps.sales.models import Invoice
from apps.shop.models import ClientOrder
from django.conf import settings

class Delivery(models.Model):
    STATUS_CHOICES = [
        ('pending', 'En attente'),
        ('assigned', 'Assignée'),
        ('in_progress', 'En cours'),
        ('completed', 'Livrée'),
        ('failed', 'Échouée'),
    ]
    
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='deliveries', null=True, blank=True)
    order = models.OneToOneField(
        ClientOrder,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='delivery'
    )
    address = models.TextField()
    delivery_person = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        limit_choices_to={'role': 'delivery'},
        related_name='assigned_deliveries'
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    customer_name = models.CharField(max_length=200, blank=True, null=True)
    customer_phone = models.CharField(max_length=20, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Livraison #{self.id} - {self.customer_name}"