import random
import math
from decimal import Decimal
from django.utils import timezone
from apps.deliveries.models import Delivery, DeliveryTracking

class GPSSimulator:
    """Simulateur de GPS pour les livraisons"""
    
    # Coordonnées de Douala (exemple)
    DOUALA_BASE = {'lat': 4.0511, 'lng': 9.7679}
    
    @staticmethod
    def simulate_delivery_location(delivery_id):
        """Simule la position d'un livreur"""
        try:
            delivery = Delivery.objects.get(id=delivery_id)
            tracking, created = DeliveryTracking.objects.get_or_create(delivery=delivery)
            
            # Simuler un déplacement aléatoire autour de Douala
            if tracking.latitude == 0 and tracking.longitude == 0:
                # Position initiale
                lat = GPSSimulator.DOUALA_BASE['lat'] + random.uniform(-0.01, 0.01)
                lng = GPSSimulator.DOUALA_BASE['lng'] + random.uniform(-0.01, 0.01)
            else:
                # Déplacement progressif
                lat = tracking.latitude + Decimal(random.uniform(-0.002, 0.002))
                lng = tracking.longitude + Decimal(random.uniform(-0.002, 0.002))
            
            tracking.latitude = Decimal(str(lat))
            tracking.longitude = Decimal(str(lng))
            tracking.speed = random.uniform(10, 50)  # 10-50 km/h
            tracking.save()
            
            return tracking
        except Delivery.DoesNotExist:
            return None

    @staticmethod
    def get_tracking_info(delivery_id):
        """Récupère les informations de suivi"""
        try:
            delivery = Delivery.objects.get(id=delivery_id)
            tracking = DeliveryTracking.objects.get(delivery=delivery)
            
            return {
                'delivery_id': delivery.id,
                'status': delivery.status,
                'driver': delivery.delivery_person.username if delivery.delivery_person else None,
                'latitude': float(tracking.latitude),
                'longitude': float(tracking.longitude),
                'last_updated': tracking.last_updated.isoformat(),
                'speed': tracking.speed,
            }
        except (Delivery.DoesNotExist, DeliveryTracking.DoesNotExist):
            return None