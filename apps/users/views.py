from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status, exceptions
from django.contrib.auth import get_user_model
from .serializers import UserSerializer
import json
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.http import JsonResponse

User = get_user_model()

def create_test_user(request):
    try:
        user = User.objects.create_user(
            username='admin',
            email='admin@test.com',
            password='admin123',
            role='admin'
        )
        return JsonResponse({'success': True, 'message': 'Utilisateur créé'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})

# SERIALIZER PERSONNALISÉ POUR LA CONNEXION


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        username_or_email = attrs.get('username')
        password = attrs.get('password')
        
        print(f"🔐 Tentative de connexion avec: {username_or_email}")
        
        # Si c'est un email, trouver l'utilisateur
        if username_or_email and '@' in username_or_email:
            try:
                user = User.objects.get(email=username_or_email)
                # Remplacer par le username pour l'authentification
                attrs['username'] = user.username
                print(f"✅ Utilisateur trouvé: {user.username}")
            except User.DoesNotExist:
                print(f"❌ Aucun utilisateur avec cet email: {username_or_email}")
                raise exceptions.AuthenticationFailed('Email ou mot de passe incorrect')
        else:
            print(f"🔍 Recherche par username: {username_or_email}")
            try:
                user = User.objects.get(username=username_or_email)
                print(f"✅ Utilisateur trouvé par username: {user.username}")
            except User.DoesNotExist:
                print(f"❌ Aucun utilisateur avec ce username: {username_or_email}")
                raise exceptions.AuthenticationFailed('Email ou mot de passe incorrect')
        
        return super().validate(attrs)


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


# ============================================
# VUES UTILISATEURS
# ============================================

class UserListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if request.user.role not in ['admin', 'manager']:
            return Response(
                {'error': 'Vous n\'avez pas la permission de voir cette liste'},
                status=status.HTTP_403_FORBIDDEN
            )
        users = User.objects.all().order_by('-date_joined')
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)


class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        if request.user.id != user_id and request.user.role not in ['admin', 'manager']:
            return Response(
                {'error': 'Vous n\'êtes pas autorisé à voir ces informations'},
                status=status.HTTP_403_FORBIDDEN
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
                'date_joined': user.date_joined,
                'last_login': user.last_login,
            })
        except User.DoesNotExist:
            return Response({'error': 'Utilisateur non trouvé'}, status=status.HTTP_404_NOT_FOUND)


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
                    status=status.HTTP_400_BAD_REQUEST
                )

            if User.objects.filter(username=username).exists():
                return Response(
                    {'error': 'Ce nom d\'utilisateur existe déjà'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if User.objects.filter(email=email).exists():
                return Response(
                    {'error': 'Cet email est déjà utilisé'}, 
                    status=status.HTTP_400_BAD_REQUEST
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
            }, status=status.HTTP_201_CREATED)

        except json.JSONDecodeError:
            return Response({'error': 'Format de données invalide'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"❌ Erreur: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)