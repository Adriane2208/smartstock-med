from django.db import models
from apps.products.models import Product
from apps.shop.models import ClientOrder
from django.conf import settings

class Invoice(models.Model):
    invoice_number = models.CharField(max_length=50, unique=True, blank=True, null=True)
    customer_name = models.CharField(max_length=200)
    customer_email = models.EmailField(blank=True, null=True)
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Lien vers la commande client
    order = models.OneToOneField(
        ClientOrder,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='invoice'
    )
    
    # Lien vers l'utilisateur (pour faciliter le filtrage)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='invoices'
    )
    
    def save(self, *args, **kwargs):
        if not self.invoice_number or self.invoice_number == '':
            last_invoice = Invoice.objects.exclude(invoice_number__isnull=True).exclude(invoice_number='').order_by('-id').first()
            if last_invoice and last_invoice.invoice_number:
                try:
                    last_num = int(last_invoice.invoice_number.split('-')[-1])
                    self.invoice_number = f"INV-{last_num + 1:05d}"
                except (ValueError, IndexError):
                    self.invoice_number = "INV-00001"
            else:
                self.invoice_number = "INV-00001"
        
        # Si la facture est liée à une commande avec un utilisateur
        if self.order and self.order.user and not self.user:
            self.user = self.order.user
        
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.invoice_number} - {self.customer_name}"

class InvoiceItem(models.Model):
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    
    def __str__(self):
        return f"{self.product.name} x {self.quantity}"