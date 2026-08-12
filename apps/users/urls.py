from django.urls import path
from .views import RegisterView, UserDetailView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('<int:user_id>/', UserDetailView.as_view(), name='user_detail'),
]