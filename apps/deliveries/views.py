# apps/deliveries/views.py
# VUES AVEC CRÉATION DEPUIS COMMANDE - VERSION CORRIGÉE

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Delivery
from .serializers import DeliverySerializer
from apps.shop.models import ClientOrder
from apps.sales.models import Invoice
from apps.notifications.models import Notification
from django.contrib.auth import get_user_model
from django.db import transaction

User = get_user_model()

class DeliveryViewSet(viewsets.ModelViewSet):
    queryset = Delivery.objects.all()
    serializer_class = DeliverySerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        user = self.request.user
        queryset = Delivery.objects.all().order_by('-created_at')
        
        if not user.is_authenticated:
            return queryset.none()
        
        if user.role in ['admin', 'manager']:
            return queryset
        
        if user.role == 'delivery':
            return queryset.filter(delivery_person=user)
        
        if user.role == 'client':
            return queryset.filter(customer_email=user.email)
        
        return queryset.none()
    
    @action(detail=False, methods=['post'])
    def create_from_order(self, request):
        """
        Créer une livraison à partir d'une commande
        URL: /api/deliveries/deliveries/create_from_order/
        """
        order_id = request.data.get('order_id')
        delivery_person_id = request.data.get('delivery_person_id')
        address = request.data.get('address')
        
        if not order_id:
            return Response(
                {'error': 'ID de commande requis'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            order = ClientOrder.objects.get(id=order_id)
        except ClientOrder.DoesNotExist:
            return Response(
                {'error': 'Commande non trouvée'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Vérifier si une livraison existe déjà
        if hasattr(order, 'delivery') and order.delivery:
            return Response(
                {'error': 'Une livraison existe déjà pour cette commande'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Vérifier que la commande a une facture
        if not hasattr(order, 'invoice') or not order.invoice:
            return Response(
                {'error': 'La commande doit d\'abord être facturée'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # ===== VÉRIFICATION DU STOCK AVANT LIVRAISON =====
        stock_errors = []
        for item in order.items.all():
            if item.product.quantity < item.quantity:
                stock_errors.append(f"{item.product.name} (stock: {item.product.quantity}, demandé: {item.quantity})")
        
        if stock_errors:
            return Response(
                {'error': f'Stock insuffisant pour: {", ".join(stock_errors)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # ===== DIMINUER LE STOCK LORS DE LA LIVRAISON =====
        with transaction.atomic():
            for item in order.items.all():
                product = item.product
                product.quantity -= item.quantity
                product.save()
        
        # Créer la livraison
        delivery = Delivery.objects.create(
            invoice=order.invoice,
            order=order,
            address=address or order.customer_address,
            customer_name=order.customer_name,
            customer_phone=order.customer_phone,
            status='pending'
        )
        
        # Assigner un livreur si spécifié
        if delivery_person_id:
            try:
                delivery_person = User.objects.get(id=delivery_person_id, role='delivery')
                delivery.delivery_person = delivery_person
                delivery.status = 'assigned'
                delivery.save()
                
                # Notifier le livreur
                Notification.objects.create(
                    user=delivery_person,
                    message=f"🚚 Nouvelle livraison #{delivery.id} assignée",
                    type='delivery',
                    link='/delivery-dashboard',
                    delivery_id=delivery.id
                )
            except User.DoesNotExist:
                return Response(
                    {'error': 'Livreur non trouvé'},
                    status=status.HTTP_404_NOT_FOUND
                )
        
        # Notifier le client
        if order.user:
            Notification.objects.create(
                user=order.user,
                message=f"🚚 Votre commande #{order.id} est en cours de livraison",
                type='delivery',
                link='/order-tracking',
                delivery_id=delivery.id
            )
        
        # Notifier l'admin
        admins = User.objects.filter(role='admin')
        for admin in admins:
            Notification.objects.create(
                user=admin,
                message=f"🚚 Livraison #{delivery.id} créée pour la commande #{order.id}",
                type='delivery',
                link='/deliveries',
                delivery_id=delivery.id
            )
        
        serializer = self.get_serializer(delivery)
        return Response({
            'success': True,
            'message': 'Livraison créée avec succès',
            'delivery': serializer.data
        }, status=status.HTTP_201_CREATED)
    
    @transaction.atomic
    def create(self, request, *args, **kwargs):
        """
        Créer une livraison manuelle
        """
        data = request.data
        
        invoice_id = data.get('invoice')
        address = data.get('address')
        customer_name = data.get('customer_name')
        customer_phone = data.get('customer_phone')
        delivery_person_id = data.get('delivery_person')
        
        if not invoice_id:
            return Response(
                {'error': 'La facture est requise'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not address:
            return Response(
                {'error': 'L\'adresse est requise'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        delivery = Delivery.objects.create(
            invoice_id=invoice_id,
            address=address,
            customer_name=customer_name or '',
            customer_phone=customer_phone or '',
            status='pending'
        )
        
        if delivery_person_id:
            try:
                delivery_person = User.objects.get(id=delivery_person_id, role='delivery')
                delivery.delivery_person = delivery_person
                delivery.status = 'assigned'
                delivery.save()
            except User.DoesNotExist:
                return Response(
                    {'error': 'Livreur non trouvé'},
                    status=status.HTTP_404_NOT_FOUND
                )
        
        serializer = self.get_serializer(delivery)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def assign_delivery(self, request, pk=None):
        """
        Assigner une livraison à un livreur
        """
        delivery = self.get_object()
        delivery_person_id = request.data.get('delivery_person_id')
        
        if not delivery_person_id:
            return Response(
                {'error': 'ID du livreur requis'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            delivery_person = User.objects.get(id=delivery_person_id, role='delivery')
            delivery.delivery_person = delivery_person
            delivery.status = 'assigned'
            delivery.save()
            
            # Notifier le livreur
            Notification.objects.create(
                user=delivery_person,
                message=f"🚚 Livraison #{delivery.id} assignée",
                type='delivery',
                link='/delivery-dashboard',
                delivery_id=delivery.id
            )
            
            return Response({
                'success': True,
                'message': f'Livraison assignée à {delivery_person.username}',
                'delivery': DeliverySerializer(delivery).data
            })
        except User.DoesNotExist:
            return Response(
                {'error': 'Livreur non trouvé'}, 
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """
        Mettre à jour le statut d'une livraison
        """
        delivery = self.get_object()
        new_status = request.data.get('status')
        
        if not new_status:
            return Response(
                {'error': 'Le statut est requis'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        valid_statuses = ['pending', 'assigned', 'in_progress', 'completed', 'failed']
        if new_status not in valid_statuses:
            return Response(
                {'error': f'Statut invalide. Choisir parmi: {valid_statuses}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if request.user.role == 'delivery' and delivery.delivery_person != request.user:
            return Response(
                {'error': 'Vous ne pouvez pas modifier cette livraison'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        delivery.status = new_status
        delivery.save()
        
        # Notifier le client
        if delivery.order and delivery.order.user:
            status_messages = {
                'assigned': '🚚 Un livreur a été assigné à votre commande',
                'in_progress': '🚚 Votre commande est en cours de livraison',
                'completed': '✅ Votre commande a été livrée avec succès !',
                'failed': '❌ La livraison de votre commande a échoué'
            }
            Notification.objects.create(
                user=delivery.order.user,
                message=status_messages.get(new_status, f"Statut de livraison mis à jour: {new_status}"),
                type='delivery',
                link='/order-tracking',
                delivery_id=delivery.id
            )
        
        serializer = self.get_serializer(delivery)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='delivery-persons')
    def delivery_persons(self, request):
        """
        Récupérer la liste des livreurs disponibles
        """
        delivery_persons = User.objects.filter(role='delivery')
        data = [
            {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'phone': user.phone,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'full_name': f"{user.first_name} {user.last_name}".strip() or user.username
            }
            for user in delivery_persons
        ]  
        return Response(data)
    
    @action(detail=False, methods=['get'])
    def my_deliveries(self, request):
        """
        Récupérer les livraisons du livreur connecté
        """
        if request.user.role != 'delivery':
            return Response(
                {'error': 'Accès réservé aux livreurs'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        deliveries = Delivery.objects.filter(delivery_person=request.user)
        serializer = self.get_serializer(deliveries, many=True)
        return Response(serializer.data)