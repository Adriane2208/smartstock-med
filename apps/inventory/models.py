from django.db import models

# Create your models here.
from apps.products.models import Product
from django.conf import settings

User = settings.AUTH_USER_MODEL


class StockMovement(models.Model):
    MOVEMENT_TYPE = (
        ('IN', 'Entrée'),
        ('OUT', 'Sortie'),
    )

    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

    quantity = models.IntegerField()
    movement_type = models.CharField(max_length=3, choices=MOVEMENT_TYPE)

    reason = models.CharField(max_length=255, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.product.name} - {self.movement_type} - {self.quantity}"
    #Automatisation du stock
    def save(self, *args, **kwargs):
        if self.pk is None:  # seulement à la création
            if self.movement_type == 'IN':
                self.product.quantity += self.quantity
            elif self.movement_type == 'OUT':
                if self.product.quantity < self.quantity:
                    raise ValueError("Stock insuffisant")
                self.product.quantity -= self.quantity

            self.product.save()

        super().save(*args, **kwargs)