from rest_framework import serializers
from .models import Delivery
from django.contrib.auth import get_user_model

User = get_user_model()

class DeliverySerializer(serializers.ModelSerializer):
    # Ajouter le nom du livreur pour l'affichage
    delivery_person_name = serializers.SerializerMethodField()
    invoice_number = serializers.SerializerMethodField()
    
    class Meta:
        model = Delivery
        fields = [
            'id', 
            'invoice', 
            'invoice_number',
            'address', 
            'delivery_person', 
            'delivery_person_name',
            'status', 
            'customer_name', 
            'customer_phone',
            'created_at', 
            'updated_at'
        ]
        # Rendre delivery_person optionnel pour la création
        extra_kwargs = {
            'delivery_person': {'required': False, 'allow_null': True}
        }
    
    def get_delivery_person_name(self, obj):
        if obj.delivery_person:
            return obj.delivery_person.username
        return None
    
    def get_invoice_number(self, obj):
        if obj.invoice:
            return obj.invoice.invoice_number or f"INV-{obj.invoice.id}"
        return None