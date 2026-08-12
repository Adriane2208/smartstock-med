from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'deliveries', views.DeliveryViewSet, basename='delivery')

urlpatterns = [
    path('', include(router.urls)),
    # URL pour la liste des livreurs
    path('delivery-persons/', views.DeliveryViewSet.as_view({'get': 'delivery_persons'}), name='delivery-persons'),
    # URL pour les livraisons du livreur connecté
    path('my-deliveries/', views.DeliveryViewSet.as_view({'get': 'my_deliveries'}), name='my-deliveries'),
]