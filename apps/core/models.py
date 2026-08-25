from django.db import models

class ForecastHistory(models.Model):
    """Historique des prévisions"""
    date = models.DateTimeField(auto_now_add=True)
    data = models.JSONField()
    period_days = models.IntegerField(default=30)
    created_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True)
    
    class Meta:
        ordering = ['-date']
        verbose_name = 'Historique de prévision'
        verbose_name_plural = 'Historiques de prévision'
    
    def __str__(self):
        return f"Prévision du {self.date.strftime('%d/%m/%Y')}"