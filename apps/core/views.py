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
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .services.product_analyzer import ProductAnalyzer
from .services.client_analyzer import ClientAnalyzer
from .services.forecast_history import ForecastHistoryService
User = get_user_model()





class ProductAnalyzerView(APIView):
    """API pour l'analyse des produits"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            dormant = ProductAnalyzer.detect_dormant_products()
            low_performers = ProductAnalyzer.detect_low_performers()
            
            return Response({
                'dormant_products': [{
                    'id': p['product'].id,
                    'name': p['product'].name,
                    'days_since_last_sale': p['days_since_last_sale'],
                    'stock_value': p['stock_value'],
                    'quantity': p['quantity'],
                    'priority': p['priority']
                } for p in dormant[:10]],
                'low_performers': [{
                    'id': p['product'].id,
                    'name': p['product'].name,
                    'sales_30d': p['sales_30d'],
                    'stock': p['stock'],
                    'stock_rotation_days': p['stock_rotation_days']
                } for p in low_performers[:10]]
            })
        except Exception as e:
            return Response({'error': str(e)}, status=500)

class ClientAnalyzerView(APIView):
    """API pour l'analyse des clients"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            frequent_buyers = ClientAnalyzer.detect_frequent_buyers()
            promotions = ClientAnalyzer.generate_promotions()
            
            return Response({
                'frequent_buyers': [{
                    'username': b['user'].username,
                    'email': b['user'].email,
                    'total_orders': b['total_orders'],
                    'total_amount': b['total_amount']
                } for b in frequent_buyers[:10]],
                'promotions': [{
                    'client': p['client'].username,
                    'discount': p['discount'],
                    'total_orders': p['total_orders'],
                    'total_amount': p['total_amount']
                } for p in promotions[:10]]
            })
        except Exception as e:
            return Response({'error': str(e)}, status=500)

class ForecastHistoryView(APIView):
    """API pour l'historique des prévisions"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            history = ForecastHistoryService.get_forecast_history()
            
            return Response([{
                'id': h.id,
                'date': h.date,
                'period_days': h.period_days,
                'data': h.data
            } for h in history])
        except Exception as e:
            return Response({'error': str(e)}, status=500)

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

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from apps.core.services.product_analyzer import ProductAnalyzer
from apps.core.services.forecast_service import ForecastService
from apps.notifications.models import Notification

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dormant_products(request):
    """API pour les produits dormants"""
    days = request.GET.get('days', 90)
    try:
        days = int(days)
    except:
        days = 90
    
    dormant = ProductAnalyzer.detect_dormant_products(days_threshold=days)
    
    return Response({
        'count': len(dormant),
        'products': [
            {
                'id': p['product'].id,
                'name': p['product'].name,
                'days_since_last_sale': p['days_since_last_sale'],
                'stock_value': p['stock_value'],
                'quantity': p['quantity'],
                'priority': p['priority'],
            }
            for p in dormant
        ]
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notifications(request):
    """API pour les notifications"""
    unread_only = request.GET.get('unread', 'true') == 'true'
    
    if unread_only:
        notifications = Notification.objects.filter(is_read=False)[:20]
    else:
        notifications = Notification.objects.all()[:50]
    
    return Response([
        {
            'id': n.id,
            'type': n.type,
            'type_label': n.get_type_display(),
            'message': n.message,
            'is_read': n.is_read,
            'created_at': n.created_at.isoformat(),
            'product_id': n.product_id,
            'order_id': n.order_id,
        }
        for n in notifications
    ])

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_notification_read(request, pk):
    """Marquer une notification comme lue"""
    try:
        notification = Notification.objects.get(id=pk)
        notification.is_read = True
        notification.save()
        return Response({'success': True})
    except Notification.DoesNotExist:
        return Response({'error': 'Notification non trouvée'}, status=404)

from apps.core.models import ForecastHistory
from apps.core.services.forecast_history import ForecastHistoryService
from django.http import HttpResponse

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def forecast_history(request):
    """Récupère l'historique des prévisions"""
    limit = request.GET.get('limit', 30)
    try:
        limit = int(limit)
    except:
        limit = 30
    
    history = ForecastHistoryService.get_history(limit)
    return Response([
        {
            'id': h.id,
            'date': h.date.isoformat(),
            'period_days': h.period_days,
            'data': h.data,
        }
        for h in history
    ])

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_forecast_pdf(request, history_id=None):
    """Exporte le rapport de prévision en PDF"""
    try:
        pdf_buffer = ForecastHistoryService.generate_pdf(history_id)
        response = HttpResponse(pdf_buffer, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="prevision_{timezone.now().strftime("%Y%m%d")}.pdf"'
        return response
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def run_intelligence(request):
    """Lance l'analyse intelligente manuellement"""
    from apps.core.services.product_analyzer import ProductAnalyzer
    
    alerts = ProductAnalyzer.check_and_alert()
    
    return Response({
        'success': True,
        'alerts': alerts,
        'message': f'{alerts} alertes créées'
    })
    