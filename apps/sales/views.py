from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db import transaction
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from .models import Invoice, InvoiceItem
from .serializers import InvoiceSerializer
from .utils import generate_invoice_pdf
from apps.shop.models import ClientOrder, ClientOrderItem
from apps.notifications.models import Notification
from django.contrib.auth import get_user_model
from django.db.models import Q
User = get_user_model()

class InvoiceViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour les factures
    """
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """
        Filtrer les factures selon le rôle de l'utilisateur
        """
        user = self.request.user
        queryset = Invoice.objects.all().order_by('-created_at')
        
        # Admin et Manager voient toutes les factures
        if user.role in ['admin', 'manager']:
            return queryset
        
        # Client voit uniquement ses factures
        if user.role == 'client':
            # Filtrer par email client ou par commande liée
            return queryset.filter(
                # Soit par email direct
                Q(customer_email=user.email) |
                # Soit par commande liée à l'utilisateur
                Q(order__user=user)
            ).distinct()
        
        # Livreur voit les factures liées à ses livraisons
        if user.role == 'delivery':
            return queryset.filter(
                deliveries__delivery_person=user
            ).distinct()
        
        return queryset.none()
    
    @transaction.atomic
    def create(self, request, *args, **kwargs):
        """
        Création d'une facture manuelle
        """
        data = request.data
        items_data = data.pop('items', [])
        
        invoice = Invoice.objects.create(
            customer_name=data.get('customer_name', ''),
            customer_email=data.get('customer_email', ''),
            total=0
        )
        
        total = 0
        for item_data in items_data:
            product_id = item_data.get('product')
            quantity = item_data.get('quantity')
            price = item_data.get('price')
            
            InvoiceItem.objects.create(
                invoice=invoice,
                product_id=product_id,
                quantity=quantity,
                price=price
            )
            total += price * quantity
        
        invoice.total = total
        invoice.save()
        
        serializer = self.get_serializer(invoice)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['post'])
    def create_from_order(self, request):
       
        order_id = request.data.get('order_id')
        
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
        
        # Vérifier si une facture existe déjà pour cette commande
        if hasattr(order, 'invoice') and order.invoice:
            return Response(
                {'error': 'Une facture existe déjà pour cette commande'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Créer la facture
        invoice = Invoice.objects.create(
            customer_name=order.customer_name,
            customer_email=order.customer_email,
            total=order.total,
            order=order  # Lier la facture à la commande
        )
        
        # Copier les articles de la commande vers la facture
        for item in order.items.all():
            InvoiceItem.objects.create(
                invoice=invoice,
                product=item.product,
                quantity=item.quantity,
                price=item.price
            )
        
        # Notifier le client
        if order.user:
            Notification.objects.create(
                user=order.user,
                message=f"📄 Votre facture #{invoice.invoice_number or invoice.id} est disponible",
                type='invoice',
                link='/my-invoices',
                invoice_id=invoice.id
            )
        
        # Notifier l'admin
        admins = User.objects.filter(role='admin')
        for admin in admins:
            Notification.objects.create(
                user=admin,
                message=f"📄 Facture #{invoice.invoice_number or invoice.id} créée pour la commande #{order.id}",
                type='invoice',
                link='/invoices',
                invoice_id=invoice.id
            )
        
        serializer = self.get_serializer(invoice)
        return Response({
            'success': True,
            'message': 'Facture créée avec succès',
            'invoice': serializer.data
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['get'], url_path='pdf')
    def download_pdf(self, request, pk=None):
        """
        Télécharger la facture au format PDF
        """
        if not request.user.is_authenticated:
            return Response(
                {'detail': 'Authentication credentials were not provided.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        invoice = self.get_object()
        
        # Vérifier que l'utilisateur a le droit de voir cette facture
        user = request.user
        if user.role not in ['admin', 'manager']:
            if user.role == 'client':
                if invoice.customer_email != user.email and invoice.order.user != user:
                    return Response(
                        {'error': 'Vous n\'avez pas accès à cette facture'},
                        status=status.HTTP_403_FORBIDDEN
                    )
            elif user.role == 'delivery':
                if not invoice.deliveries.filter(delivery_person=user).exists():
                    return Response(
                        {'error': 'Vous n\'avez pas accès à cette facture'},
                        status=status.HTTP_403_FORBIDDEN
                    )
        
        items = invoice.items.all()
        pdf_buffer = generate_invoice_pdf(invoice, items)
        
        response = HttpResponse(pdf_buffer, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="facture_{invoice.invoice_number or invoice.id}.pdf"'
        
        return response