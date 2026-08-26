"""
WSGI config for smartstock_med project.
"""
import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'smartstock_med.settings')

application = get_wsgi_application()