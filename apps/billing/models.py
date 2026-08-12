from django.db import models

# Create your models here.
from apps.orders.models import Order


class Invoice(models.Model):
    order = models.OneToOneField(Order, on_delete=models.CASCADE)

    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    is_paid = models.BooleanField(default=False)

    def __str__(self):
        return f"Facture #{self.id} - Commande #{self.order.id}"