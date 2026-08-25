from django.core.management.base import BaseCommand
from apps.core.services.product_analyzer import ProductAnalyzer
from apps.core.services.forecast_history import ForecastHistoryService
from apps.core.services.client_analyzer import ClientAnalyzer
import datetime

class Command(BaseCommand):
    help = 'Exécute les tâches intelligentes quotidiennes'

    def handle(self, *args, **options):
        self.stdout.write('🧠 Démarrage des tâches intelligentes quotidiennes...')
        start_time = datetime.datetime.now()
        
        # 1. Vérifier les produits dormants
        self.stdout.write('📦 Vérification des produits dormants...')
        alerts = ProductAnalyzer.check_and_alert()
        self.stdout.write(f'✅ {alerts} alertes de produits dormants créées')
        
        # 2. Générer des promotions automatiques
        self.stdout.write('🎉 Génération des promotions clients fidèles...')
        promotions = ClientAnalyzer.generate_automatic_promotions()
        self.stdout.write(f'✅ {promotions} promotions générées')
        
        # 3. Sauvegarder une snapshot des prévisions
        self.stdout.write('📊 Sauvegarde des prévisions...')
        history = ForecastHistoryService.save_snapshot()
        self.stdout.write(f'✅ Snapshot sauvegardé (ID: {history.id})')
        
        end_time = datetime.datetime.now()
        duration = (end_time - start_time).seconds
        self.stdout.write(f'✅ Tâches terminées en {duration} secondes')