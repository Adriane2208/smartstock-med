from django.contrib import admin
from .models import ClientOrder, ClientOrderItem

class ClientOrderItemInline(admin.TabularInline):
    model = ClientOrderItem
    extra = 0
    readonly_fields = ('product', 'quantity', 'price')
    can_delete = False

class ClientOrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'customer_name', 'customer_phone', 'total', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('customer_name', 'customer_email', 'customer_phone')
    readonly_fields = ('total', 'created_at')
    inlines = [ClientOrderItemInline]
    
    fieldsets = (
        ('Informations client', {
            'fields': ('customer_name', 'customer_email', 'customer_phone', 'customer_address')
        }),
        ('Informations commande', {
            'fields': ('total', 'status', 'created_at')
        }),
    )

# ENREGISTREMENT EXPLICITE - LA LIGNE IMPORTANTE
admin.site.register(ClientOrder, ClientOrderAdmin)
admin.site.register(ClientOrderItem)