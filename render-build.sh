# render-build.sh
#!/bin/bash

echo " Début du build Render..."

# Mettre à jour pip
python -m pip install --upgrade pip

# Installer les dépendances
pip install -r requirements.txt

# Vérifier que gunicorn est installé
pip show gunicorn || pip install gunicorn==21.2.0

# Exécuter les migrations
python manage.py migrate --noinput

# Collecter les fichiers statiques
python manage.py collectstatic --noinput

echo " Build terminé avec succès !"