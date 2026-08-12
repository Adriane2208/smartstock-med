from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import ensure_csrf_cookie
from django.contrib.auth import authenticate, login as auth_login
from django.contrib import messages
from apps.shop.models import ClientOrder

def home_view(request):
    """Page d'accueil publique"""
    # Si déjà connecté, rediriger vers dashboard
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
    """Gestion des commandes client (Backoffice personnalisé)"""
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