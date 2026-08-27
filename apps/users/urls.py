from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('<int:user_id>/', views.UserDetailView.as_view(), name='user_detail'),
    path('', views.UserListView.as_view(), name='user_list'),
    path('login/', views.CustomTokenObtainPairView.as_view(), name='login'),
]