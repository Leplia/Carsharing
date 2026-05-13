-- Полный скрипт для обновления таблицы orders
-- Объединяет все необходимые действия в правильном порядке

-- ============================================
-- ЧАСТЬ 1: ПОДГОТОВКА И ПРОВЕРКА
-- ============================================

SELECT '=== НАЧАЛО ОБНОВЛЕНИЯ ТАБЛИЦЫ orders ===' as info;
SELECT 'Время начала: ' || CURRENT_TIMESTAMP as start_time;

-- 1.1. Создаем резервную копию (рекомендуется для production)
SELECT 'Создание резервной копии...' as step;
CREATE TABLE IF NOT EXISTS orders_backup AS SELECT * FROM orders;
SELECT 'Резервная копия создана: orders_backup' as status;

-- 1.2. Показываем текущую структуру
SELECT 'Текущая структура таблицы:' as step;
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'orders'
ORDER BY ordinal_position;

-- ============================================
-- ЧАСТЬ 2: УДАЛЕНИЕ ЛИШНИХ ПОЛЕЙ
-- ============================================

SELECT '=== УДАЛЕНИЕ ЛИШНИХ ПОЛЕЙ ===' as info;

-- 2.1. Удаляем start_time
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'start_time'
    ) THEN
        ALTER TABLE orders DROP COLUMN start_time;
        RAISE NOTICE '✅ Удалено поле: start_time';
    ELSE
        RAISE NOTICE 'ℹ️  Поле start_time не существует';
    END IF;
END $$;

-- 2.2. Удаляем end_time
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'end_time'
    ) THEN
        ALTER TABLE orders DROP COLUMN end_time;
        RAISE NOTICE '✅ Удалено поле: end_time';
    ELSE
        RAISE NOTICE 'ℹ️  Поле end_time не существует';
    END IF;
END $$;

-- 2.3. Удаляем discount
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'discount'
    ) THEN
        ALTER TABLE orders DROP COLUMN discount;
        RAISE NOTICE '✅ Удалено поле: discount';
    ELSE
        RAISE NOTICE 'ℹ️  Поле discount не существует';
    END IF;
END $$;

-- ============================================
-- ЧАСТЬ 3: ДОБАВЛЕНИЕ НЕОБХОДИМЫХ ПОЛЕЙ
-- ============================================

SELECT '=== ДОБАВЛЕНИЕ НЕОБХОДИМЫХ ПОЛЕЙ ===' as info;

-- 3.1. Добавляем rating_edits если не существует
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'rating_edits'
    ) THEN
        ALTER TABLE orders ADD COLUMN rating_edits FLOAT;
        RAISE NOTICE '✅ Добавлено поле: rating_edits';
    ELSE
        RAISE NOTICE 'ℹ️  Поле rating_edits уже существует';
    END IF;
END $$;

-- 3.2. Добавляем payment_id если не существует
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'payment_id'
    ) THEN
        ALTER TABLE orders ADD COLUMN payment_id BIGINT;
        RAISE NOTICE '✅ Добавлено поле: payment_id';
    ELSE
        RAISE NOTICE 'ℹ️  Поле payment_id уже существует';
    END IF;
END $$;

-- ============================================
-- ЧАСТЬ 4: ОБНОВЛЕНИЕ ДАННЫХ
-- ============================================

SELECT '=== ОБНОВЛЕНИЕ ДАННЫХ ===' as info;

-- 4.1. Устанавливаем значения по умолчанию для NULL
SELECT 'Установка значений по умолчанию...' as step;

-- distance
UPDATE orders SET distance = 0.0 WHERE distance IS NULL;
SELECT '   distance: ' || COUNT(*) || ' записей обновлено' 
FROM orders WHERE distance = 0.0 AND distance IS NOT NULL;

-- spend_fuel
UPDATE orders SET spend_fuel = 0.0 WHERE spend_fuel IS NULL;
SELECT '   spend_fuel: ' || COUNT(*) || ' записей обновлено' 
FROM orders WHERE spend_fuel = 0.0 AND spend_fuel IS NOT NULL;

-- price
UPDATE orders SET price = 0.0 WHERE price IS NULL;
SELECT '   price: ' || COUNT(*) || ' записей обновлено' 
FROM orders WHERE price = 0.0 AND price IS NOT NULL;

-- rating_edits
UPDATE orders SET rating_edits = 0.0 WHERE rating_edits IS NULL;
SELECT '   rating_edits: ' || COUNT(*) || ' записей обновлено' 
FROM orders WHERE rating_edits = 0.0 AND rating_edits IS NOT NULL;

-- ============================================
-- ЧАСТЬ 5: СОЗДАНИЕ ПЛАТЕЖЕЙ ДЛЯ ЗАКАЗОВ БЕЗ payment_id
-- ============================================

SELECT '=== СОЗДАНИЕ ПЛАТЕЖЕЙ ===' as info;

-- 5.1. Проверяем, есть ли заказы без payment_id
DO $$ 
DECLARE
    orders_without_payment INTEGER;
BEGIN
    SELECT COUNT(*) INTO orders_without_payment 
    FROM orders WHERE payment_id IS NULL;
    
    IF orders_without_payment > 0 THEN
        RAISE NOTICE 'Найдено % заказов без payment_id', orders_without_payment;
        RAISE NOTICE 'Создаем платежи...';
        
        -- Создаем платежи для каждого заказа
        FOR order_record IN 
            SELECT o.order_id, o.user_id, o.price 
            FROM orders o 
            WHERE o.payment_id IS NULL
            ORDER BY o.order_id
        LOOP
            INSERT INTO payments (cheque, price)
            VALUES (
                'CHQ-AUTO-' || order_record.order_id || '-USER-' || order_record.user_id,
                COALESCE(order_record.price, 0.0)
            )
            RETURNING payment_id INTO NEW;
            
            UPDATE orders 
            SET payment_id = NEW.payment_id 
            WHERE order_id = order_record.order_id;
        END LOOP;
        
        RAISE NOTICE '✅ Создано % платежей', orders_without_payment;
    ELSE
        RAISE NOTICE 'ℹ️  Все заказы уже имеют payment_id';
    END IF;
END $$;

-- ============================================
-- ЧАСТЬ 6: УСТАНОВКА ОГРАНИЧЕНИЙ
-- ============================================

SELECT '=== УСТАНОВКА ОГРАНИЧЕНИЙ ===' as info;

-- 6.1. Устанавливаем NOT NULL для обязательных полей
SELECT 'Установка NOT NULL ограничений...' as step;

-- user_id
ALTER TABLE orders ALTER COLUMN user_id SET NOT NULL;
RAISE NOTICE '✅ user_id: NOT NULL установлено';

-- car_id
ALTER TABLE orders ALTER COLUMN car_id SET NOT NULL;
RAISE NOTICE '✅ car_id: NOT NULL установлено';

-- status
ALTER TABLE orders ALTER COLUMN status SET NOT NULL;
RAISE NOTICE '✅ status: NOT NULL установлено';

-- payment_id (только если нет NULL значений)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM orders WHERE payment_id IS NULL) THEN
        ALTER TABLE orders ALTER COLUMN payment_id SET NOT NULL;
        RAISE NOTICE '✅ payment_id: NOT NULL установлено';
    ELSE
        RAISE NOTICE '⚠️  payment_id: е��ть NULL значения, NOT NULL не установлено';
    END IF;
END $$;

-- 6.2. Проверяем/создаем CHECK ограничение для статуса
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'orders' AND constraint_name = 'orders_status_check'
    ) THEN
        ALTER TABLE orders ADD CONSTRAINT orders_status_check 
        CHECK (status IN ('STARTED', 'COMPLETED', 'CANCELLED', 'PAID', 'UNPAID', 'IN_PROCESS'));
        RAISE NOTICE '✅ CHECK ограничение для status создано';
    ELSE
        RAISE NOTICE 'ℹ️  CHECK ограничение для status уже существует';
    END IF;
END $$;

-- ============================================
-- ЧАСТЬ 7: ПРОВЕРКА РЕЗУЛЬТАТА
-- ============================================

SELECT '=== ПРОВЕРКА РЕЗУЛЬТАТА ===' as info;

-- 7.1. Показываем обновленную структуру
SELECT 'Обновленная структура таблицы:' as step;
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'orders'
ORDER BY ordinal_position;

-- 7.2. Проверяем лишние поля
SELECT 'Проверка лишних полей:' as step;
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ Лишние поля отсутствуют'
        ELSE '❌ Есть лишние поля: ' || string_agg(column_name, ', ')
    END as result
FROM information_schema.columns 
WHERE table_name = 'orders'
AND column_name IN ('start_time', 'end_time', 'discount');

-- 7.3. Проверяем необходимые поля
SELECT 'Проверка необходимых полей:' as step;
WITH required_fields AS (
    SELECT 'order_id' as field UNION ALL SELECT 'user_id' UNION ALL
    SELECT 'car_id' UNION ALL SELECT 'status' UNION ALL
    SELECT 'distance' UNION ALL SELECT 'spend_fuel' UNION ALL
    SELECT 'price' UNION ALL SELECT 'payment_id' UNION ALL
    SELECT 'rating_edits'
)
SELECT 
    CASE 
        WHEN COUNT(*) = 9 THEN '✅ Все необходимые поля присутствуют'
        ELSE '❌ Отсутствуют поля: ' || string_agg(rf.field, ', ')
    END as result
FROM required_fields rf
WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = rf.field
);

-- 7.4. Проверяем NOT NULL
SELECT 'Проверка NOT NULL ограничений:' as step;
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ Все обязательные поля имеют NOT NULL'
        ELSE '❌ Поля без NOT NULL: ' || string_agg(column_name, ', ')
    END as result
FROM information_schema.columns 
WHERE table_name = 'orders'
AND column_name IN ('user_id', 'car_id', 'status', 'payment_id')
AND is_nullable = 'YES';

-- 7.5. Статистика данных
SELECT 'Статистика данных:' as step;
SELECT 
    'Всего заказов: ' || COUNT(*) as total_orders,
    'Уникальных пользователей: ' || COUNT(DISTINCT user_id) as unique_users,
    'Уникальных автомобилей: ' || COUNT(DISTINCT car_id) as unique_cars,
    'Заказов без payment_id: ' || COUNT(CASE WHEN payment_id IS NULL THEN 1 END) as orders_without_payment,
    'Сумма всех платежей: ' || COALESCE(SUM(price), 0) || ' BYN' as total_amount
FROM orders;

-- 7.6. Пример данных
SELECT 'Пример данных (первые 3 записи):' as step;
SELECT 
    order_id,
    user_id,
    car_id,
    status,
    ROUND(distance, 2) as distance,
    ROUND(spend_fuel, 2) as spend_fuel,
    ROUND(price, 2) as price,
    payment_id,
    ROUND(rating_edits, 3) as rating_edits
FROM orders 
ORDER BY order_id 
LIMIT 3;

-- ============================================
-- ЧАСТЬ 8: ЗАВЕРШЕНИЕ
-- ============================================

SELECT '=== ЗАВЕРШЕНИЕ ОБНОВЛЕНИЯ ===' as info;
SELECT 'Время завершения: ' || CURRENT_TIMESTAMP as end_time;

DO $$ 
BEGIN
    RAISE NOTICE '=========================================';
    RAISE NOTICE 'ОБНОВЛЕНИЕ ТАБЛИЦЫ orders ЗАВЕРШЕНО';
    RAISE NOTICE '=========================================';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Лишние поля удалены';
    RAISE NOTICE '✅ Необходимые поля добавлены';
    RAISE NOTICE '✅ Данные обновлены';
    RAISE NOTICE '✅ Платежи созданы (если требовалось)';
    RAISE NOTICE '✅ Ограничения установлены';
    RAISE NOTICE '';
    RAISE NOTICE 'Следующие шаги:';
    RAISE NOTICE '1. Перезапустите приложение';
    RAISE NOTICE '2. Протестируйте создание новых заказов';
    RAISE NOTICE '3. Проверьте завершение существующих заказов';
    RAISE NOTICE '4. Убедитесь, что цена рассчитывается как distance × 4.0';
    RAISE NOTICE '';
    RAISE NOTICE 'Резервная копия: orders_backup';
    RAISE NOTICE '=========================================';
END $$;