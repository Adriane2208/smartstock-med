# apps/core/services/notification_service.py
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import get_user_model
from apps.notifications.models import Notification, NotificationType
import threading

User = get_user_model()

class NotificationService:
    """Service de notifications intelligent"""

    @staticmethod
    def send_email_async(subject, message, recipient_list, html_message=None):
        def send():
            try:
                send_mail(
                    subject=subject,
                    message=message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=recipient_list,
                    html_message=html_message,
                    fail_silently=False,
                )
            except Exception as e:
                print(f"Erreur envoi email: {e}")
        
        thread = threading.Thread(target=send)
        thread.start()

    @staticmethod
    def notify_dormant_product(product, days, priority):
        """Notification de produit dormant"""
        users = User.objects.filter(role__in=['admin', 'manager'])
        recipients = [u.email for u in users if u.email]
        
        subject = f"📦 ALERTE PRODUIT DORMANT - {product.name}"
        message = f"""
🏥 SmartStock Med - Alerte Produit Dormant

Produit: {product.name}
Dernière vente: il y a {days} jours
Quantité en stock: {product.quantity}
Valeur du stock: {product.price * product.quantity:,.0f} CFA
Priorité: {'🔴 Élevée' if priority == 'high' else '🟡 Moyenne'}

Action recommandée:
- Mettre en promotion immédiatement
- Contacter les clients habituels de ce produit
"""
        
        Notification.objects.create(
            type=NotificationType.DORMANT_PRODUCT,
            product_id=product.id,
            message=message,
        )
        
        if recipients:
            NotificationService.send_email_async(subject, message, recipients)

    @staticmethod
    def notify_order_update(order, status, client_email):
        """Notification de mise à jour de commande"""
        subject = f"📦 Mise à jour de votre commande #{order.id}"
        message = f"""
Bonjour {order.customer_name},

Votre commande #{order.id} a été mise à jour.

Nouveau statut: {status}

Vous pouvez suivre votre commande ici:
http://localhost:3000/tracking/{order.id}

Cordialement,
SmartStock Med
"""
        
        Notification.objects.create(
            type=NotificationType.ORDER_STATUS,
            order_id=order.id,
            message=message,
        )
        
        if client_email:
            NotificationService.send_email_async(subject, message, [client_email])