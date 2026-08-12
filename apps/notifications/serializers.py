from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'message', 'type', 'is_read', 'link', 'order_id', 'invoice_id', 'delivery_id', 'created_at']