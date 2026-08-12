# apps/sales/serializers.py
from rest_framework import serializers
from .models import Invoice, InvoiceItem

class InvoiceItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    
    class Meta:
        model = InvoiceItem
        fields = ['id', 'product', 'product_name', 'quantity', 'price']

class InvoiceSerializer(serializers.ModelSerializer):
    items = InvoiceItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Invoice
        fields = ['id', 'invoice_number', 'customer_name', 'customer_email', 
                  'total', 'created_at', 'items']