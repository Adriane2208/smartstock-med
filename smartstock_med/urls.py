"""
URL configuration for smartstock_med project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

# smartstock_med/urls.py
# Configuration principale des URLs du projet

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import (
    TokenObtainPairView,      # Vue pour obtenir le token JWT
    TokenRefreshView,         # Vue pour rafraîchir le token JWT

)
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # Interface d'administration Django
    path('admin/', admin.site.urls),
    
    # ========================================
    # ENDPOINTS JWT pour l'authentification API
    # ========================================
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # ========================================
    # VOS APPS EXISTANTES (API REST)
    # ========================================
    path('api/products/', include('apps.products.urls')),
    path('api/sales/', include('apps.sales.urls')),
    path('api/deliveries/', include('apps.deliveries.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
    
    # VUES FRONTEND (pages HTML)
    
    path('', include('apps.core.urls')),

    #Espace client

    path('api/shop/', include('apps.shop.urls')),  
    path('api/users/', include('apps.users.urls')),


    #Paiement avec stripe

    path('api/payments/', include('apps.payments.urls')),
] 

# Servir les fichiers statiques (CSS, JS) en mode développement
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)