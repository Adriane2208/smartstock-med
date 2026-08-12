from django.contrib import admin

# Register your models here.
from .models import Invoice

admin.site.register(Invoice)
def save(self, *args, **kwargs):
    total = 0
    for item in self.order.items.all():
        total += item.quantity * item.price

    self.total_amount = total
    super().save(*args, **kwargs)