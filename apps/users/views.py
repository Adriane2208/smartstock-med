# apps/users/views.py
# AJOUTER LES PERMISSIONS CORRECTES

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import viewsets, permissions
from django.contrib.auth import get_user_model
import json

User = get_user_model()

class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        # Vérifier que l'utilisateur demande ses propres infos ou est admin
        if request.user.id != user_id and request.user.role not in ['admin', 'manager']:
            return Response(
                {'error': 'Vous n\'êtes pas autorisé à voir ces informations'},
                status=403
            )
        
        try:
            user = User.objects.get(id=user_id)
            return Response({
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': user.role,
                'phone': user.phone,
                'address': user.address,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser,
            })
        except User.DoesNotExist:
            return Response({'error': 'Utilisateur non trouvé'}, status=404)

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            data = json.loads(request.body)
            username = data.get('username')
            email = data.get('email')
            password = data.get('password')
            phone = data.get('phone', '')
            address = data.get('address', '')
            role = data.get('role', 'client')

            if not username or not email or not password:
                return Response(
                    {'error': 'Tous les champs obligatoires doivent être remplis'}, 
                    status=400
                )

            if User.objects.filter(username=username).exists():
                return Response(
                    {'username': 'Ce nom d\'utilisateur existe déjà'}, 
                    status=400
                )
            
            if User.objects.filter(email=email).exists():
                return Response(
                    {'email': 'Cet email est déjà utilisé'}, 
                    status=400
                )

            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                role=role
            )
            
            if phone:
                user.phone = phone
            if address:
                user.address = address
            user.save()

            return Response({
                'success': True,
                'message': 'Compte créé avec succès !',
                'user_id': user.id
            })

        except json.JSONDecodeError:
            return Response({'error': 'Format de données invalide'}, status=400)
        except Exception as e:
            print(f"Erreur: {e}")
            return Response({'error': str(e)}, status=500)