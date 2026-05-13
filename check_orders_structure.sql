-- Скрипт для проверки структуры таблицы orders

-- 1. Основная информация о таблице
SELECT '=== ИНФОРМАЦИЯ О ТАБЛИЦЕ orders ===' as info;

SELECT 
    table_name,
    table_type,
    is_insertable_into
FROM information_schema.tables
WHERE table_name = 'orders';

-- 2. Структура таблицы
SELECT '=== СТРУКТУРА ТАБЛИЦЫ ===' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'orders'
ORDER BY ordinal_position;

-- 3. Проверка лишних полей
SELECT '=== ПРОВЕРКА ЛИШНИХ ПОЛЕЙ ===' as info;

SELECT 
    column_name,
    CASE 
        WHEN column_name IN ('start_time', 'end_time', 'discount') 
        THEN 'ЛИШНЕЕ ПОЛЕ - НУЖНО УДАЛИТЬ'
        ELSE 'OK'
    END as status
FROM information_schema.columns 
WHERE table_name = 'orders'
AND column_name IN ('start_time', 'end_time', 'discount');

-- 4. Проверка необходимых полей
SELECT '=== ПРОВЕРКА НЕОБХОДИМЫХ ПОЛЕЙ ===' as info;

WITH required_fields AS (
    SELECT 'order_id' as field_name, 'PRIMARY KEY' as required_type UNION ALL
    SELECT 'user_id', 'NOT NULL, FOREIGN KEY' UNION ALL
    SELECT 'car_id', 'NOT NULL, FOREIGN KEY' UNION ALL
    SELECT 'status', 'NOT NULL' UNION ALL
    SELECT 'distance', '' UNION ALL
    SELECT 'spend_fuel', '' UNION ALL
    SELECT 'price', '' UNION ALL
    SELECT 'payment_id', 'NOT NULL, FOREIGN KEY' UNION ALL
    SELECT 'rating_edits', ''
)
SELECT 
    rf.field_name,
    rf.required_type,
    CASE 
        WHEN c.column_name IS NOT NULL THEN 'ПРИСУТСТВУЕТ'
        ELSE 'ОТСУТСТВУЕТ - НУЖНО ДОБАВИТЬ'
    END as status
FROM required_fields rf
LEFT JOIN information_schema.columns c ON c.table_name = 'orders' AND c.column_name = rf.field_name
ORDER BY 
    CASE rf.field_name
        WHEN 'order_id' THEN 1
        WHEN 'user_id' THEN 2
        WHEN 'car_id' THEN 3
        WHEN 'status' THEN 4
        WHEN 'distance' THEN 5
        WHEN 'spend_fuel' THEN 6
        WHEN 'price' THEN 7
        WHEN 'payment_id' THEN 8
        WHEN 'rating_edits' THEN 9
        ELSE 10
    END;

-- 5. Проверка ограничений NOT NULL
SELECT '=== ПРОВЕРКА NOT NULL ОГРАНИЧЕНИЙ ===' as info;

SELECT 
    column_name,
    is_nullable,
    CASE 
        WHEN column_name IN ('user_id', 'car_id', 'status', 'payment_id') AND is_nullable = 'YES'
        THEN 'ОШИБКА: должно быть NOT NULL'
        WHEN column_name IN ('user_id', 'car_id', 'status', 'payment_id') AND is_nullable = 'NO'
        THEN 'OK'
        ELSE 'N/A'
    END as check_result
FROM information_schema.columns 
WHERE table_name = 'orders'
AND column_name IN ('user_id', 'car_id', 'status', 'payment_id');

-- 6. Проверка внешних ключей
SELECT '=== ПРОВЕРКА ВНЕШНИХ КЛЮЧЕЙ ===' as info;

SELECT 
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'orders'
ORDER BY kcu.column_name;

-- 7. Проверка CHECK ограничений
SELECT '=== ПРОВЕРКА CHECK ОГРАНИЧЕНИЙ ===' as info;

SELECT 
    constraint_name,
    constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'orders' 
AND constraint_type = 'CHECK';

-- 8. Статистика данных
SELECT '=== СТАТИСТИКА ДАННЫХ ===' as info;

SELECT 
    COUNT(*) as total_orders,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT car_id) as unique_cars,
    COUNT(DISTINCT payment_id) as unique_payments,
    COUNT(CASE WHEN payment_id IS NULL THEN 1 END) as orders_without_payment,
    COUNT(CASE WHEN distance IS NULL THEN 1 END) as orders_without_distance,
    COUNT(CASE WHEN price IS NULL THEN 1 END) as orders_without_price,
    COUNT(CASE WHEN rating_edits IS NULL THEN 1 END) as orders_without_rating
FROM orders;

-- 9. Пример данных
SELECT '=== ПРИМЕР ДАННЫХ (первые 3 записи) ===' as info;

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
LIMIT 3;

-- 10. Итоговая оценка
SELECT '=== ИТОГОВАЯ ОЦЕНКА ===' as info;

DO $$ 
DECLARE
    total_fields INTEGER;
    correct_fields INTEGER := 0;
    has_extra_fields BOOLEAN := FALSE;
    has_missing_fields BOOLEAN := FALSE;
    has_null_issues BOOLEAN := FALSE;
BEGIN
    -- Проверка лишних полей
    SELECT COUNT(*) INTO has_extra_fields
    FROM information_schema.columns 
    WHERE table_name = 'orders'
    AND column_name IN ('start_time', 'end_time', 'discount');
    
    -- Проверка отсутствующих полей
    SELECT COUNT(*) INTO has_missing_fields
    FROM (
        SELECT 'order_id' as field UNION ALL SELECT 'user_id' UNION ALL
        SELECT 'car_id' UNION ALL SELECT 'status' UNION ALL
        SELECT 'distance' UNION ALL SELECT 'spend_fuel' UNION ALL
        SELECT 'price' UNION ALL SELECT 'payment_id' UNION ALL
        SELECT 'rating_edits'
    ) required
    WHERE NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = required.field
    );
    
    -- Проверка NOT NULL
    SELECT COUNT(*) INTO has_null_issues
    FROM information_schema.columns 
    WHERE table_name = 'orders'
    AND column_name IN ('user_id', 'car_id', 'status', 'payment_id')
    AND is_nullable = 'YES';
    
    -- Итоговая оценка
    IF has_extra_fields > 0 THEN
        RAISE NOTICE '❌ Есть лишние поля: start_time, end_time или discount';
    ELSE
        RAISE NOTICE '✅ Лишние поля отсутствуют';
        correct_fields := correct_fields + 1;
    END IF;
    
    IF has_missing_fields > 0 THEN
        RAISE NOTICE '❌ Отсутствуют необходимые поля';
    ELSE
        RAISE NOTICE '✅ Все необходимые поля присутствуют';
        correct_fields := correct_fields + 1;
    END IF;
    
    IF has_null_issues > 0 THEN
        RAISE NOTICE '❌ Есть проблемы с NOT NULL ограничениями';
    ELSE
        RAISE NOTICE '✅ NOT NULL ограничения в порядке';
        correct_fields := correct_fields + 1;
    END IF;
    
    -- Общая оценка
    CASE 
        WHEN correct_fields = 3 THEN
            RAISE NOTICE '🎉 Отлично! Структура таблицы полностью соответствует требованиям.';
        WHEN correct_fields = 2 THEN
            RAISE NOTICE '⚠️  Хорошо, но есть незначительные проблемы.';
        WHEN correct_fields = 1 THEN
            RAISE NOTICE '⚠️  Есть серьезные проблемы со структурой.';
        ELSE
            RAISE NOTICE '❌ Критические проблемы ��о структурой таблицы.';
    END CASE;
    
    RAISE NOTICE 'Оценка: % из 3', correct_fields;
END $$;