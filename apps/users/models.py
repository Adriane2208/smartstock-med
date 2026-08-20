from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    # Le champ email existe déjà dans AbstractUser
    # Il faut juste s'assurer qu'il est unique
    # Dans AbstractUser, email n'est pas unique par défaut
    # On va le redéfinir pour le rendre unique

    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('manager', 'Manager'),
        ('delivery', 'Delivery'),
        ('client', 'Client'),
    )

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='client')
    phone = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)

    # Rendre l'email unique
    email = models.EmailField(unique=True, blank=False, null=False)

    # Utiliser l'email comme identifiant de connexion
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def is_admin(self):
        return self.role == 'admin'

    def is_manager(self):
        return self.role == 'manager'

    def is_delivery(self):
        return self.role == 'delivery'

    def __str__(self):
        return self.email