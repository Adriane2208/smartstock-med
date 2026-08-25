from django.urls import path
from django.contrib.auth.views import LogoutView
from . import views
from .views import (
    ProductAnalyzerView, 
    ClientAnalyzerView, 
    ForecastHistoryView
)

app_name = 'core'

urlpatterns = [
    # Page d'accueil publique (à la racine)
    path('', views.home_view, name='home'),
    
    # Page de connexion
    path('login/', views.login_view, name='login'),
    
    # Pages protégées (nécessitent connexion)
    path('dashboard/', views.dashboard_view, name='dashboard'),
    path('produits/', views.products_view, name='products'),
    path('factures/', views.invoices_view, name='invoices'),
    path('livraisons/', views.deliveries_view, name='deliveries'),
    
    # Déconnexion
    path('logout/', LogoutView.as_view(next_page='/'), name='logout'),

    #visualisation des commandespar l'admin
    path('commandes-client/', views.client_orders_view, name='client_orders'),
    path('commandes-client/update/<int:order_id>/', views.update_order_status, name='update_order_status'),

    #Module intelligent
    path('forecast-dashboard/', views.ForecastDashboardView.as_view(), name='forecast-dashboard'),
    path('api/analyze-products/', ProductAnalyzerView.as_view(), name='analyze-products'),
    path('api/analyze-clients/', ClientAnalyzerView.as_view(), name='analyze-clients'),
    path('api/forecast-history/', ForecastHistoryView.as_view(), name='forecast-history'),
    path('dormant-products/', views.dormant_products, name='dormant_products'),
    path('notifications/', views.notifications, name='notifications'),
    path('notifications/mark-read/<int:pk>/', views.mark_notification_read, name='mark_notification_read'),
    path('run-intelligence/', views.run_intelligence, name='run_intelligence'),

]