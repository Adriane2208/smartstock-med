# apps/payments/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
import stripe
from django.conf import settings
from apps.shop.models import ClientOrder

stripe.api_key = settings.STRIPE_SECRET_KEY

class CreatePaymentIntentView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            data = request.data
            order_id = data.get('order_id')
            amount = data.get('amount')
            currency = data.get('currency', 'XAF')
            
            print(f"📝 Montant reçu: {amount} {currency}")
            
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
            
            # 🔑 IMPORTANT: Stripe utilise les centimes
            # Pour XAF, Stripe n'utilise pas de sous-unités, donc on multiplie par 100
            # Pour les devises comme XAF, le montant doit être en centimes
            amount_in_cents = int(amount * 100)
            
            print(f"💰 Montant en centimes: {amount_in_cents}")
            
            # Créer le PaymentIntent
            intent = stripe.PaymentIntent.create(
                amount=amount_in_cents,
                currency=currency.lower(),
                metadata={
                    'order_id': str(order_id),
                    'user_id': str(request.user.id)
                }
            )
            
            return Response({
                'clientSecret': intent.client_secret,
                'payment_intent_id': intent.id
            })
            
        except stripe.error.StripeError as e:
            print(f"❌ Erreur Stripe: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            print(f"❌ Erreur: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )