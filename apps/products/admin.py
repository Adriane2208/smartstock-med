from django.contrib import admin
from .models import Product, Category, Supplier

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'quantity', 'price', 'threshold', 'is_low_stock']
    list_filter = ['category', 'supplier']
    search_fields = ['name', 'description']
    
    def is_low_stock(self, obj):
        return obj.quantity <= obj.threshold
    is_low_stock.boolean = True
    is_low_stock.short_description = 'Stock bas'