@echo off
echo ========================================
echo   YGT Tech - Android APK Build
echo ========================================
echo.
echo 1. Expo hesabiniza giris yapiliyor...
echo    (Hesabiniz yoksa https://expo.dev/signup adresinden kayit olun)
echo.
eas login
echo.
echo 2. Proje EAS ile eslestiriliyor...
eas init --id ile ilgili proje
echo.
echo 3. APK build baslatiliyor (bulut)...
echo    Bu islem 10-15 dakika surebilir.
echo.
eas build --platform android --profile preview --non-interactive
echo.
echo Build tamamlandi! APK indirme linkini yukardaki ciktida gorabilirsiniz.
echo Veya https://expo.dev/accounts adresinden indirin.
pause
