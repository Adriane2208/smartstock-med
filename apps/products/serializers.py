from rest_framework import serializers
from .models import Product, Category

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'quantity', 'price', 'threshold', 
                  'created_at', 'category', 'category_name', 'supplier', 'image', 'image_url']
    
    def get_image_url(self, obj):
        if obj.image:
            return obj.image.url
        return None