-- Безопасный скрипт для обновления таблицы orders
-- Удаляет только лишние поля и добавляет недостающие

-- 1. Показываем текущую структуру
SELECT 'Текущая структура таблицы orders:' as info;
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'orders'
ORDER BY ordinal_position;

-- 2. Удаляем лишние поля (только если они существуют)

-- 2.1. Удаляем start_time
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'start_time'
    ) THEN
        ALTER TABLE orders DROP COLUMN start_time;
        RAISE NOTICE 'Удалено поле: start_time';
    ELSE
        RAISE NOTICE 'Поле start_time не существует, пропускаем';
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
        RAISE NOTICE 'Удалено поле: end_time';
    ELSE
        RAISE NOTICE 'Поле end_time не существует, пропускаем';
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
        RAISE NOTICE 'Удалено поле: discount';
    ELSE
        RAISE NOTICE 'Поле discount не существует, пропускаем';
    END IF;
END $$;

-- 3. Добавляем недостающие поля (только если они не существуют)

-- 3.1. Добавляем rating_edits если не существует
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'rating_edits'
    ) THEN
        ALTER TABLE orders ADD COLUMN rating_edits FLOAT;
        RAISE NOTICE 'Добавлено поле: rating_edits';
        
        -- Устанавливаем значение по умолчанию для существующих записей
        UPDATE orders SET rating_edits = 0.0 WHERE rating_edits IS NULL;
    ELSE
        RAISE NOTICE 'Поле rating_edits уже существует, пропускаем';
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
        RAISE NOTICE 'Добавлено поле: payment_id';
        
        -- ВНИМАНИЕ: Для существующих записей нужно будет создать платежи
        -- Это делается отдельно, так как требует создания записей в таблице payments
    ELSE
        RAISE NOTICE 'Поле payment_id уже существует, пропускаем';
    END IF;
END $$;

-- 4. Проверяем и устанавливаем значения по умолчанию для NULL

-- 4.1. Для distance
UPDATE orders SET distance = 0.0 WHERE distance IS NULL;
SELECT COUNT(*) as null_distance_count FROM orders WHERE distance IS NULL;

-- 4.2. Для spend_fuel
UPDATE orders SET spend_fuel = 0.0 WHERE spend_fuel IS NULL;
SELECT COUNT(*) as null_spend_fuel_count FROM orders WHERE spend_fuel IS NULL;

-- 4.3. Для price
UPDATE orders SET price = 0.0 WHERE price IS NULL;
SELECT COUNT(*) as null_price_count FROM orders WHERE price IS NULL;

-- 4.4. Для rating_edits (если было добавлено или уже существовало)
UPDATE orders SET rating_edits = 0.0 WHERE rating_edits IS NULL;
SELECT COUNT(*) as null_rating_edits_count FROM orders WHERE rating_edits IS NULL;

-- 5. Показываем обновленную структуру
SELECT 'Обновленная структура таблицы orders:' as info;
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'orders'
ORDER BY ordinal_position;

-- 6. Показываем пример данных
SELECT 'Пример данных (первые 5 записей):' as info;
SELECT 
    order_id,
    user_id,
    car_id,
    status,
    distance,
    spend_fuel,
    price,
    payment_id,
    rating_edits
FROM orders 
ORDER BY order_id 
LIMIT 5;

-- 7. Статистика по статусам
SELECT 'Статистика по статусам заказов:' as info;
SELECT 
    status,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM orders 
GROUP BY status
ORDER BY count DESC;

-- 8. Проверка проблемных записей
SELECT 'Проверка проблемных записей:' as info;

-- 8.1. Записи без payment_id (если поле существует)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'payment_id'
    ) THEN
        RAISE NOTICE 'Записи без payment_id: %', (SELECT COUNT(*) FROM orders WHERE payment_id IS NULL);
    END IF;
END $$;

-- 8.2. Записи с отрицательной ценой
SELECT COUNT(*) as negative_price_count FROM orders WHERE price < 0;

-- 8.3. Записи с отрицательным расстоянием
SELECT COUNT(*) as negative_distance_count FROM orders WHERE distance < 0;

-- 9. Рекомендации
SELECT 'Рекомендации:' as info;
SELECT '1. Для записей без payment_id нужно создать соответствующие записи в таблице payments' as recommendation
UNION ALL
SELECT '2. Записи с отрицательными значениями price/distance нужно исправить' as recommendation
UNION ALL
SELECT '3. После обновления структуры перезапустите приложение для применения изменений' as recommendation;