@echo off
echo ============================================
echo Запуск тестов с покрытием JaCoCo
echo ============================================

echo.
echo 1. Очистка предыдущих сборок...
call mvnw clean

echo.
echo 2. Запуск модульных тестов...
call mvnw test

echo.
echo 3. Генерация отчета JaCoCo...
call mvnw jacoco:report

echo.
echo 4. Проверка покрытия кода...
call mvnw jacoco:check

echo.
echo ============================================
echo Отчеты JaCoCo:
echo - HTML отчет: target/site/jacoco/index.html
echo - XML отчет: target/site/jacoco/jacoco.xml
echo - CSV отчет: target/site/jacoco/jacoco.csv
echo ============================================

echo.
echo Для просмотра отчета откройте файл:
echo target/site/jacoco/index.html
echo.
pause