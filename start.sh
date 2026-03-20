#!/bin/bash

# Installer rclone
curl https://rclone.org/install.sh | bash

# Restaurer depuis Google Drive
bash /restore.sh

# Lancer les backups toutes les 30min en arrière-plan
while true; do
    sleep 1800
    bash /backup.sh
done &

# Démarrer le serveur Minecraft
exec /start
