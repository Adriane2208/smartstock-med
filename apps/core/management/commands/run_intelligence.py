# apps/core/management/commands/run_intelligence.py
from django.core.management.base import BaseCommand
from apps.core.services.product_analyzer import ProductAnalyzer
from apps.core.services.notification_service import NotificationService
from apps.core.services.forecast_history import ForecastHistoryService
import datetime

class Command(BaseCommand):
    help = 'Exécute les tâches intelligentes du système'

    def handle(self, *args, **options):
        self.stdout.write('🧠 Démarrage du module intelligent...')
        
        # 1. Vérifier les produits dormants
        self.stdout.write('📦 Vérification des produits dormants...')
        alerts = ProductAnalyzer.check_and_alert()
        self.stdout.write(f'✅ {alerts} alertes de produits dormants créées')
        
        # 2. Sauvegarder une snapshot des prévisions
        self.stdout.write('📊 Sauvegarde des prévisions...')
        history = ForecastHistoryService.save_forecast_snapshot()
        self.stdout.write(f'✅ Snapshot sauvegardé (ID: {history.id})')
        
        self.stdout.write('✅ Module intelligent exécuté avec succès !')