# apps/sales/utils.py
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from io import BytesIO
from datetime import datetime
import os
from django.conf import settings

def generate_invoice_pdf(invoice, items):
    """
    Génère un PDF de facture avec logo
    """
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=20*mm, bottomMargin=20*mm)
    styles = getSampleStyleSheet()
    elements = []
    
    # Style pour le texte normal
    normal_style = ParagraphStyle(
        'NormalStyle',
        parent=styles['Normal'],
        fontSize=10,
        leading=14
    )
    
    # Style pour le texte en gras
    bold_style = ParagraphStyle(
        'BoldStyle',
        parent=styles['Normal'],
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#1a2a4f')
    )
    
    # Style pour le titre
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#1a2a4f'),
        alignment=1,
        spaceAfter=10
    )
    
    subtitle_style = ParagraphStyle(
        'Subtitle',
        parent=styles['Normal'],
        fontSize=12,
        textColor=colors.HexColor('#dc3545'),
        alignment=1,
        spaceAfter=20
    )
    
    # ========== AJOUT DU LOGO ==========
    logo_path = os.path.join(settings.BASE_DIR, 'static', 'images', 'logo.png')
    
    if os.path.exists(logo_path):
        try:
            logo = Image(logo_path, width=40*mm, height=40*mm)
            logo_table = Table([[logo]], colWidths=[180*mm])
            logo_table.setStyle(TableStyle([
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ]))
            elements.append(logo_table)
            elements.append(Spacer(1, 10))
        except Exception as e:
            print(f"Erreur logo: {e}")
    
    # Titre
    elements.append(Paragraph("SmartStock Med", title_style))
    elements.append(Paragraph("Système intelligent de gestion médicale", subtitle_style))
    elements.append(Spacer(1, 15))
    
    # ========== INFORMATIONS FACTURE (sans balises HTML) ==========
    info_data = [
        [Paragraph("N° Facture:", bold_style), Paragraph(invoice.invoice_number or f"INV-{invoice.id:05d}", normal_style)],
        [Paragraph("Date:", bold_style), Paragraph(invoice.created_at.strftime("%d/%m/%Y %H:%M"), normal_style)],
        [Paragraph("Client:", bold_style), Paragraph(invoice.customer_name, normal_style)],
        [Paragraph("Email:", bold_style), Paragraph(invoice.customer_email or "-", normal_style)],
    ]
    
    info_table = Table(info_data, colWidths=[50*mm, 110*mm])
    info_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
    ]))
    elements.append(info_table)
    elements.append(Spacer(1, 20))
    
    # ========== TABLEAU DES ARTICLES ==========
    table_data = [[Paragraph("Produit", bold_style), 
                   Paragraph("Qté", bold_style), 
                   Paragraph("Prix unitaire", bold_style), 
                   Paragraph("Total", bold_style)]]
    total_ht = 0
    
    for item in items:
        product_name = item.product.name
        quantity = item.quantity
        price = float(item.price)
        total_line = quantity * price
        total_ht += total_line
        
        table_data.append([
            Paragraph(product_name, normal_style),
            Paragraph(str(quantity), normal_style),
            Paragraph(f"{price:,.0f} CFA", normal_style),
            Paragraph(f"{total_line:,.0f} CFA", normal_style)
        ])
    
    # Lignes des totaux
    table_data.append(["", "", Paragraph("Total HT:", bold_style), Paragraph(f"{total_ht:,.0f} CFA", bold_style)])
    tva = total_ht * 0.18
    table_data.append(["", "", Paragraph("TVA (18%):", bold_style), Paragraph(f"{tva:,.0f} CFA", bold_style)])
    table_data.append(["", "", Paragraph("Total TTC:", bold_style), Paragraph(f"{(total_ht + tva):,.0f} CFA", bold_style)])
    
    article_table = Table(table_data, colWidths=[80*mm, 25*mm, 45*mm, 45*mm])
    article_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1a2a4f')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('ALIGN', (0, 1), (0, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -4), 0.5, colors.lightgrey),
        ('BACKGROUND', (2, -3), (-1, -1), colors.HexColor('#f8f9fa')),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    elements.append(article_table)
    elements.append(Spacer(1, 30))
    
    # ========== PIED DE PAGE ==========
    footer_style = ParagraphStyle(
        'Footer',
        parent=styles['Normal'],
        fontSize=8,
        textColor=colors.grey,
        alignment=1
    )
    
    elements.append(Paragraph("Merci de votre confiance !", footer_style))
    elements.append(Paragraph(f"Généré le {datetime.now().strftime('%d/%m/%Y à %H:%M')}", footer_style))
    elements.append(Spacer(1, 5))
    elements.append(Paragraph("SmartStock Med - Votre partenaire santé", footer_style))
    
    # Construction du PDF
    doc.build(elements)
    buffer.seek(0)
    return buffer