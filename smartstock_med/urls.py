"""
URL configuration for smartstock_med project.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenRefreshView
from apps.users.views import CustomTokenObtainPairView
from django.views.generic import TemplateView

urlpatterns = [
    #Route pour le deploiement de react
    path('', TemplateView.as_view(template_name='index.html')),
    # Interface d'administration Django
    path('admin/', admin.site.urls),
    
    # ========================================
    # ENDPOINTS JWT pour l'authentification API
    # ========================================
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # ========================================
    # VOS APPS EXISTANTES (API REST)
    # ========================================
    path('api/products/', include('apps.products.urls')),
    path('api/sales/', include('apps.sales.urls')),
    path('api/deliveries/', include('apps.deliveries.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
    path('api/core/', include('apps.core.urls')),
    path('api/shop/', include('apps.shop.urls')),  
    path('api/users/', include('apps.users.urls')),
    path('api/payments/', include('apps.payments.urls')),
    
    # ========================================
    # FRONTEND (pages HTML) - UN SEUL INCLUDE
    # ========================================
    path('', include('apps.core.urls')), 
]

# Servir les fichiers statiques en mode développement
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)