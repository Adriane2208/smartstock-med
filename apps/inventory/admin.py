from django.contrib import admin

# Register your models here.

from .models import StockMovement

admin.site.register(StockMovement)