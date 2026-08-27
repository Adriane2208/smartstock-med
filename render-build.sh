#!/bin/bash

echo " Début du build Render..."

# Installer les dépendances
pip install -r requirements.txt

# Exécuter les migrations AUTOMATIQUEMENT
echo " Exécution des migrations..."
python manage.py migrate --noinput

# Collecter les fichiers statiques
echo "Collecte des fichiers statiques..."
python manage.py collectstatic --noinput

echo " Build terminé avec succès !"