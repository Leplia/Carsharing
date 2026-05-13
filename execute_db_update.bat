@echo off
echo ===========================================
echo ВЫПОЛНЕНИЕ ОБНОВЛЕНИЯ БАЗЫ ДАННЫХ
echo ===========================================
echo.
echo Этот скрипт выполняет обновление таблицы orders
echo Удаляет лишние поля и добавляет необходимые
echo.
echo Убедитесь, что:
echo 1. PostgreSQL запущен
echo 2. База данных carsharing существует
echo 3. У вас есть права на выполнение SQL
echo.
echo Для выполнения скрипта используйте команду:
echo psql -U ваш_пользователь -d carsharing -f complete_orders_update.sql
echo.
echo Или откройте файл complete_orders_update.sql в pgAdmin
echo и выполните его там.
echo.
echo ===========================================
pause