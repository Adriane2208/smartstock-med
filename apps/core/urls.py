from django.urls import path
from django.contrib.auth.views import LogoutView
from . import views

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
]