from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


class CustomUserAdmin(UserAdmin):
    model = User

    # Champs affichés dans la liste
    list_display = ('username', 'email', 'role', 'phone', 'is_staff', 'is_active')

    # Filtres à droite
    list_filter = ('role', 'is_staff', 'is_active')

    # Organisation du formulaire (édition)
    fieldsets = UserAdmin.fieldsets + (
        ('Informations supplémentaires', {'fields': ('role', 'phone')}),
    )

    # Organisation lors de la création
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Informations supplémentaires', {'fields': ('role', 'phone')}),
    )

admin.site.register(User, CustomUserAdmin)