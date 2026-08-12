# apps/shop/views.py
# VERSION CORRIGÉE - my_orders

from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db import transaction
from .models import ClientOrder, ClientOrderItem
from .serializers import ClientOrderSerializer
from apps.products.models import Product
from apps.notifications.models import Notification
from django.contrib.auth import get_user_model

User = get_user_model()

class ClientOrderViewSet(viewsets.ModelViewSet):
    queryset = ClientOrder.objects.all()
    serializer_class = ClientOrderSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'my_orders', 'create_order']:
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        user = self.request.user
        queryset = ClientOrder.objects.all().order_by('-created_at')
        
        if not user.is_authenticated:
            return queryset.none()
        
        if user.role in ['admin', 'manager']:
            return queryset
        
        return queryset.filter(user=user)
    
    @action(detail=False, methods=['post'])
    def create_order(self, request):
        return self.create(request)
    
    @action(detail=False, methods=['get'])
    def my_orders(self, request):
        """
        Récupérer les commandes de l'utilisateur connecté
        URL: /api/shop/my-orders/
        """
        # Vérifier que l'utilisateur est authentifié
        if not request.user.is_authenticated:
            return Response(
                {'error': 'Vous devez être connecté'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Récupérer les commandes de l'utilisateur
        orders = ClientOrder.objects.filter(user=request.user).order_by('-created_at')
        
        # Utiliser le sérializer avec les items
        serializer = self.get_serializer(orders, many=True)
        
        return Response(serializer.data)
    
    @transaction.atomic
    def create(self, request, *args, **kwargs):
        """
        Créer une commande client avec diminution automatique du stock
        """
        data = request.data
        items_data = data.get('items', [])
        
        if not items_data:
            return Response(
                {'success': False, 'error': 'Aucun article dans la commande'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Vérifier les stocks
        stock_errors = []
        for item_data in items_data:
            product_id = item_data.get('product_id')
            quantity = item_data.get('quantity', 1)
            
            try:
                product = Product.objects.get(id=product_id)
                if product.quantity < quantity:
                    stock_errors.append(f"{product.name} (stock: {product.quantity}, demandé: {quantity})")
            except Product.DoesNotExist:
                stock_errors.append(f"Produit ID {product_id} non trouvé")
        
        if stock_errors:
            return Response(
                {'success': False, 'error': f'Stock insuffisant pour: {", ".join(stock_errors)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Créer la commande avec l'utilisateur connecté
        order = ClientOrder.objects.create(
            customer_name=data.get('customer_name', request.user.username if request.user.is_authenticated else ''),
            customer_email=data.get('customer_email', request.user.email if request.user.is_authenticated else ''),
            customer_phone=data.get('customer_phone', ''),
            customer_address=data.get('customer_address', ''),
            user=request.user if request.user.is_authenticated else None,
            status='pending',
            total=0
        )
        
        total = 0
        for item_data in items_data:
            product_id = item_data.get('product_id')
            quantity = item_data.get('quantity', 1)
            
            product = Product.objects.get(id=product_id)
            
            # Créer l'article de commande
            ClientOrderItem.objects.create(
                order=order,
                product=product,
                quantity=quantity,
                price=product.price
            )
            total += product.price * quantity
            
            # Diminuer le stock
            product.quantity -= quantity
            product.save()
            
            # Vérifier si le stock est bas
            if product.quantity <= product.threshold:
                admins = User.objects.filter(role='admin')
                for admin in admins:
                    Notification.objects.create(
                        user=admin,
                        message=f"⚠️ Stock bas: {product.name} ({product.quantity} unités restantes)",
                        type='stock',
                        link='/products'
                    )
        
        order.total = total
        order.save()
        
        # Notifier l'admin
        admins = User.objects.filter(role='admin')
        for admin in admins:
            Notification.objects.create(
                user=admin,
                message=f"🛒 Nouvelle commande #{order.id} de {order.customer_name}",
                type='order',
                link='/client-orders',
                order_id=order.id
            )
        
        # Notifier le client
        if order.user:
            Notification.objects.create(
                user=order.user,
                message=f"✅ Votre commande #{order.id} a été enregistrée",
                type='order',
                link='/my-orders',
                order_id=order.id
            )
        
        return Response({
            'success': True,
            'order_id': order.id,
            'message': 'Commande créée avec succès'
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """
        Mettre à jour le statut d'une commande
        """
        order = self.get_object()
        new_status = request.data.get('status')
        
        if not new_status:
            return Response(
                {'error': 'Le statut est requis'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        valid_statuses = ['pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled']
        if new_status not in valid_statuses:
            return Response(
                {'error': f'Statut invalide. Choisir parmi: {valid_statuses}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        old_status = order.status
        order.status = new_status
        order.save()
        
        # Si annulée, remettre les produits en stock
        if new_status == 'cancelled' and old_status != 'cancelled':
            with transaction.atomic():
                for item in order.items.all():
                    product = item.product
                    product.quantity += item.quantity
                    product.save()
        
        # Notifier le client
        if order.user:
            status_messages = {
                'confirmed': '✅ Votre commande a été confirmée',
                'preparing': '🔄 Votre commande est en préparation',
                'shipped': '🚚 Votre commande a été expédiée',
                'delivered': '📦 Votre commande a été livrée',
                'cancelled': '❌ Votre commande a été annulée'
            }
            Notification.objects.create(
                user=order.user,
                message=status_messages.get(new_status, f"Statut de la commande #{order.id}: {new_status}"),
                type='status',
                link='/my-orders',
                order_id=order.id
            )
        
        serializer = self.get_serializer(order)
        return Response(serializer.data)