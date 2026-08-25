from django.utils import timezone
from apps.core.models import ForecastHistory
from apps.core.services.forecast_service import ForecastService
import json
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from io import BytesIO

class ForecastHistoryService:
    """Service de gestion de l'historique des prévisions"""

    @staticmethod
    def save_snapshot(period_days=30, user=None):
        """Sauvegarde une snapshot des prévisions"""
        data = {
            'dashboard_stats': ForecastService.get_dashboard_stats(),
            'sales_trend': ForecastService.get_sales_trend(period_days),
            'replenishment': ForecastService.get_replenishment_suggestions(),
            'products_to_sell': ForecastService.get_products_to_sell(),
            'low_stock': [
                {'id': p.id, 'name': p.name, 'quantity': p.quantity, 'category': str(p.category)}
                for p in ForecastService.get_low_stock()
            ],
        }
        
        history = ForecastHistory.objects.create(
            data=data,
            period_days=period_days,
            created_by=user
        )
        return history

    @staticmethod
    def get_history(limit=30):
        """Récupère l'historique des prévisions"""
        return ForecastHistory.objects.all()[:limit]

    @staticmethod
    def get_by_id(history_id):
        """Récupère une prévision par son ID"""
        return ForecastHistory.objects.get(id=history_id)

    @staticmethod
    def generate_pdf(history_id=None):
        """Génère un PDF de l'historique des prévisions"""
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=landscape(A4), topMargin=20*mm, bottomMargin=20*mm)
        styles = getSampleStyleSheet()
        elements = []
        
        # Style personnalisé
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#1a2a4f'),
            alignment=1,
            spaceAfter=30
        )
        
        subtitle_style = ParagraphStyle(
            'Subtitle',
            parent=styles['Heading2'],
            fontSize=14,
            textColor=colors.HexColor('#dc3545'),
            alignment=1,
            spaceAfter=20
        )
        
        if history_id:
            history = ForecastHistory.objects.get(id=history_id)
            data = history.data
            date_str = history.date.strftime('%d/%m/%Y')
        else:
            data = {
                'dashboard_stats': ForecastService.get_dashboard_stats(),
                'sales_trend': ForecastService.get_sales_trend(30),
                'replenishment': ForecastService.get_replenishment_suggestions(),
                'products_to_sell': ForecastService.get_products_to_sell(),
            }
            date_str = timezone.now().strftime('%d/%m/%Y')
        
        # En-tête
        elements.append(Paragraph("📊 SmartStock Med - Rapport de Prévision", title_style))
        elements.append(Paragraph(f"Généré le {date_str}", subtitle_style))
        elements.append(Spacer(1, 20))
        
        # 1. Statistiques générales
        stats = data['dashboard_stats']
        stats_data = [
            ['📈 Indicateur', 'Valeur'],
            ['Ventes du mois', f"{stats['monthly_sales']:,.0f} CFA"],
            ['Ventes du jour', f"{stats['daily_sales']:,.0f} CFA"],
            ['Commandes en cours', str(stats['pending_orders'])],
            ['Total produits', str(stats['total_products'])],
            ['Stock bas', str(stats['low_stock_count'])],
        ]
        
        stats_table = Table(stats_data, colWidths=[100*mm, 100*mm])
        stats_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1a2a4f')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 1, colors.grey),
            ('BACKGROUND', (0, 1), (-1, -1), colors.whitesmoke),
        ]))
        elements.append(Paragraph("📊 Synthèse des indicateurs", styles['Heading2']))
        elements.append(stats_table)
        elements.append(Spacer(1, 20))
        
        # 2. Suggestions de réapprovisionnement
        replenishment = data.get('replenishment', [])
        if replenishment:
            replen_data = [
                ['🔄 Produit', 'Stock', 'Ventes/jour', 'Jours restants', 'À commander', 'Priorité']
            ]
            for item in replenishment[:20]:
                replen_data.append([
                    item['product_name'],
                    str(item['current_stock']),
                    str(item['daily_sales']),
                    str(item['days_until_out']),
                    str(item['suggested_order']),
                    f"🔴 Urgent" if item['priority'] == 'high' else f"🟡 Moyen" if item['priority'] == 'medium' else "🟢 Normal"
                ])
            
            replen_table = Table(replen_data, colWidths=[70*mm, 30*mm, 40*mm, 40*mm, 40*mm, 40*mm])
            replen_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#dc3545')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, -1), 8),
                ('GRID', (0, 0), (-1, -1), 1, colors.grey),
                ('BACKGROUND', (0, 1), (-1, -1), colors.whitesmoke),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.whitesmoke, colors.white]),
            ]))
            elements.append(Paragraph("📦 Suggestions de réapprovisionnement", styles['Heading2']))
            elements.append(replen_table)
            elements.append(Spacer(1, 20))
        
        # 3. Produits à écouler
        products_to_sell = data.get('products_to_sell', [])
        if products_to_sell:
            sell_data = [
                ['🏷️ Produit', 'Stock', 'Ventes 30j', 'Jours à écouler']
            ]
            for item in products_to_sell[:20]:
                sell_data.append([
                    item['product_name'],
                    str(item['stock']),
                    str(item['sales_30d']),
                    str(item['days_to_sell'])
                ])
            
            sell_table = Table(sell_data, colWidths=[100*mm, 40*mm, 50*mm, 50*mm])
            sell_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1a2a4f')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, -1), 8),
                ('GRID', (0, 0), (-1, -1), 1, colors.grey),
            ]))
            elements.append(Paragraph("🏷️ Produits à écouler", styles['Heading2']))
            elements.append(sell_table)
        
        # Pied de page
        elements.append(Spacer(1, 30))
        footer_style = ParagraphStyle(
            'Footer',
            parent=styles['Normal'],
            fontSize=8,
            textColor=colors.grey,
            alignment=1
        )
        elements.append(Paragraph("SmartStock Med - Rapport généré automatiquement", footer_style))
        elements.append(Paragraph(f"© {timezone.now().year} SmartStock Med - Tous droits réservés", footer_style))
        
        doc.build(elements)
        buffer.seek(0)
        return buffer