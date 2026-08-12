from rest_framework import serializers
from .models import ClientOrder, ClientOrderItem
from apps.products.models import Product

class ClientOrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_price = serializers.DecimalField(source='product.price', read_only=True, max_digits=10, decimal_places=2)
    
    class Meta:
        model = ClientOrderItem
        fields = ['id', 'product', 'product_name', 'product_price', 'quantity', 'price']

class ClientOrderSerializer(serializers.ModelSerializer):
    items = ClientOrderItemSerializer(many=True, read_only=True)
    customer_name_display = serializers.SerializerMethodField()
    
    class Meta:
        model = ClientOrder
        fields = [
            'id', 'user', 'customer_name', 'customer_name_display',
            'customer_email', 'customer_phone', 'customer_address',
            'status', 'total', 'items', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'total']
    
    def get_customer_name_display(self, obj):
        if obj.user and obj.user.is_authenticated:
            return f"{obj.user.username} ({obj.customer_name})"
        return obj.customer_name