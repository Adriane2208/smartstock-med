# apps/core/views.py
# VERSION COMPLÈTE AVEC TOUTES LES FONCTIONS

from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import ensure_csrf_cookie
from django.contrib.auth import authenticate, login as auth_login
from django.contrib import messages
from django.contrib.auth import logout
from apps.shop.models import ClientOrder
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .services.forecast_service import ForecastService
from django.contrib.auth import get_user_model

User = get_user_model()

# ============================================
# VUE POUR LE DASHBOARD DE PRÉVISION (API)
# ============================================

class ForecastDashboardView(APIView):
    """
    API pour le dashboard de prévision
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            days = int(request.GET.get('days', 30))
            
            data = {
                'sales_trend': ForecastService.get_sales_trend(days),
                'top_products': ForecastService.get_top_products(),
                'low_stock': ForecastService.get_low_stock_products(10),
                'replenishment': ForecastService.get_replenishment_suggestions(),
                'dashboard_stats': ForecastService.get_dashboard_stats(),
                'products_to_sell': ForecastService.get_products_to_sell(),
            }
            
            response_data = {
                'sales_trend': data['sales_trend'],
                'top_products': data['top_products'],
                'low_stock': [{
                    'id': p.id,
                    'name': p.name,
                    'quantity': p.quantity,
                    'category': p.category.name if p.category else 'Non catégorisé',
                    'image': p.image.url if p.image else None
                } for p in data['low_stock']],
                'replenishment': [{
                    'product_name': s['product'].name,
                    'current_stock': s['current_stock'],
                    'daily_sales': s['daily_sales'],
                    'days_until_out': s['days_until_out'],
                    'suggested_order': s['suggested_order'],
                    'priority': s['priority']
                } for s in data['replenishment']],
                'dashboard_stats': data['dashboard_stats'],
                'products_to_sell': [{
                    'product_name': p['product'].name,
                    'stock': p['stock'],
                    'sales_30d': p['sales_30d'],
                    'days_to_sell': p['days_to_sell']
                } for p in data['products_to_sell']]
            }
            
            return Response(response_data)
            
        except Exception as e:
            print(f"❌ Erreur: {str(e)}")
            return Response(
                {'error': str(e)},
                status=500
            )


# ============================================
# VUES POUR LES PAGES HTML (FRONTEND DJANGO)
# ============================================

def home_view(request):
    """Page d'accueil publique"""
    if request.user.is_authenticated:
        return redirect('/dashboard/')
    return render(request, 'home.html')


def login_view(request):
    """Page de connexion"""
    if request.user.is_authenticated:
        return redirect('/dashboard/')
    
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            auth_login(request, user)
            return redirect('/dashboard/')
        else:
            messages.error(request, 'Nom d\'utilisateur ou mot de passe incorrect')
    
    return render(request, 'login.html')


def logout_view(request):
    """Déconnexion"""
    logout(request)
    return redirect('/')


@login_required
@ensure_csrf_cookie
def dashboard_view(request):
    """Tableau de bord principal"""
    return render(request, 'dashboard.html')


@login_required
def products_view(request):
    """Gestion des produits"""
    return render(request, 'products/list.html')


@login_required
def invoices_view(request):
    """Gestion des factures"""
    return render(request, 'sales/invoice_list.html')


@login_required
def deliveries_view(request):
    """Gestion des livraisons"""
    return render(request, 'deliveries/list.html')


@login_required
def client_orders_view(request):
    """Gestion des commandes client"""
    orders = ClientOrder.objects.all().order_by('-created_at')
    return render(request, 'client_orders.html', {'orders': orders})


@login_required
def update_order_status(request, order_id):
    """Mettre à jour le statut d'une commande"""
    if request.method == 'POST':
        order = ClientOrder.objects.get(id=order_id)
        new_status = request.POST.get('status')
        order.status = new_status
        order.save()
        messages.success(request, f"Statut de la commande #{order_id} mis à jour avec succès !")
    return redirect('core:client_orders')