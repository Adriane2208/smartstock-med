# apps/shop/urls.py
# URLS COMPLÈTES POUR LES COMMANDES CLIENT

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'client-orders', views.ClientOrderViewSet, basename='client-order')

urlpatterns = [
    path('', include(router.urls)),
    
    # URL personnalisée pour les commandes d'un client
    path('my-orders/', views.ClientOrderViewSet.as_view({'get': 'my_orders'}), name='my-orders'),
    
    # URL pour créer une commande (POST)
    path('create-order/', views.ClientOrderViewSet.as_view({'post': 'create'}), name='create-order'),
]