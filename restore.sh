#!/bin/bash

echo "[Restore] Vérification backup existant..."

sed -i "s/RCLONE_GDRIVE_TOKEN_PLACEHOLDER/$RCLONE_GDRIVE_TOKEN/" /rclone.conf

# Vérifier si y'a des fichiers sur Drive
FILE_COUNT=$(rclone ls gdrive:OriginRP-Backup/$GDRIVE_FOLDER_ID --config /rclone.conf 2>/dev/null | wc -l)

if [ "$FILE_COUNT" -gt "0" ]; then
    echo "[Restore] Backup trouvé ! Restauration..."
    rclone sync gdrive:OriginRP-Backup/$GDRIVE_FOLDER_ID /data \
      --config /rclone.conf \
      --log-level INFO
    echo "[Restore] Restauration terminée !"
else
    echo "[Restore] Pas de backup trouvé, démarrage fresh"
fi
