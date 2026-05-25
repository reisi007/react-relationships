@echo off
echo ===================================================
echo 🔄 Starte reinen Rclone Sync zum Server...
echo ===================================================

:: 2. Web Bereich (Frontend Dist)
echo 🎨 Sync: Frontend (dist)...
rclone sync ./dist reisinger.pictures:/contacts.reisinger.pictures/dist --transfers=128 --track-renames --progress

:: 3. Web Bereich (Frontend Config)
echo ⚙️ Sync: Nginx Config...
rclone copy ./nginx.conf reisinger.pictures:/contacts.reisinger.pictures/config/

echo.
echo ✅ Sync abgeschlossen!
