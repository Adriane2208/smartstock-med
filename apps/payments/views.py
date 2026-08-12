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
            
            if not order_id:
                return Response(
                    {'error': 'ID de commande requis'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Vérifier que la commande existe
            try:
                order = ClientOrder.objects.get(id=order_id)
            except ClientOrder.DoesNotExist:
                return Response(
                    {'error': 'Commande non trouvée'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Créer le payment intent
            intent = stripe.PaymentIntent.create(
                amount=int(amount * 100),  # Stripe utilise les centimes
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
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )