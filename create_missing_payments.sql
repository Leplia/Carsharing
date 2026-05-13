-- Скрипт для создания платежей для заказов без payment_id

-- 1. Проверяем, есть ли заказы без payment_id
SELECT 'Проверка заказов без payment_id:' as info;
SELECT COUNT(*) as orders_without_payment FROM orders WHERE payment_id IS NULL;

-- 2. Если есть заказы без payment_id, создаем для них платежи
DO $$ 
DECLARE
    order_record RECORD;
    new_payment_id BIGINT;
    orders_count INTEGER := 0;
BEGIN
    -- Считаем сколько заказов нужно обработать
    SELECT COUNT(*) INTO orders_count FROM orders WHERE payment_id IS NULL;
    
    IF orders_count > 0 THEN
        RAISE NOTICE 'Найдено % заказов без payment_id. Создаем платежи...', orders_count;
        
        -- Создаем платежи для каждого заказа
        FOR order_record IN 
            SELECT o.order_id, o.user_id, o.price 
            FROM orders o 
            WHERE o.payment_id IS NULL
            ORDER BY o.order_id
        LOOP
            -- Создаем запись в payments
            INSERT INTO payments (cheque, price)
            VALUES (
                'CHQ-AUTO-' || order_record.order_id || '-USER-' || order_record.user_id,
                COALESCE(order_record.price, 0.0)
            )
            RETURNING payment_id INTO new_payment_id;
            
            -- Обновляем заказ с новым payment_id
            UPDATE orders 
            SET payment_id = new_payment_id 
            WHERE order_id = order_record.order_id;
            
            RAISE NOTICE 'Создан платеж % для заказа % (пользователь %, цена %)', 
                new_payment_id, order_record.order_id, order_record.user_id, COALESCE(order_record.price, 0.0);
        END LOOP;
        
        RAISE NOTICE 'Готово! Создано % платежей.', orders_count;
    ELSE
        RAISE NOTICE 'Все заказы уже имеют payment_id. Действия не требуются.';
    END IF;
END $$;

-- 3. Проверяем результат
SELECT 'Результат после создания платежей:' as info;

-- 3.1. Проверяем, остались ли заказы без payment_id
SELECT COUNT(*) as remaining_orders_without_payment FROM orders WHERE payment_id IS NULL;

-- 3.2. Показываем пример созданных платежей
SELECT 'Пример созданных платежей (первые 5):' as info;
SELECT 
    p.payment_id,
    p.cheque,
    p.price,
    o.order_id,
    o.user_id,
    o.status
FROM payments p
JOIN orders o ON p.payment_id = o.payment_id
WHERE p.cheque LIKE 'CHQ-AUTO-%'
ORDER BY p.payment_id
LIMIT 5;

-- 3.3. Статистика по платежам
SELECT 'Статистика по платежам:' as info;
SELECT 
    COUNT(*) as total_payments,
    COUNT(DISTINCT o.user_id) as unique_users_with_payments,
    SUM(p.price) as total_amount,
    AVG(p.price) as average_payment
FROM payments p
JOIN orders o ON p.payment_id = o.payment_id;

-- 4. Проверяем целостность данных
SELECT 'Проверка целостности данных:' as info;

-- 4.1. Все ли заказы теперь имеют payment_id?
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM orders WHERE payment_id IS NULL) 
        THEN 'Есть заказы без payment_id' 
        ELSE 'Все заказы имеют payment_id' 
    END as payment_check;

-- 4.2. Есть ли платежи, не связанные с заказами?
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM payments p LEFT JOIN orders o ON p.payment_id = o.payment_id WHERE o.order_id IS NULL) 
        THEN 'Есть платежи без заказов' 
        ELSE 'Все платежи связаны с заказами' 
    END as orphan_payments_check;

-- 4.3. Проверяем соответствие цен
SELECT 'Проверка соответствия цен заказов и платежей:' as info;
SELECT 
    COUNT(*) as mismatched_prices_count
FROM orders o
JOIN payments p ON o.payment_id = p.payment_id
WHERE ABS(COALESCE(o.price, 0) - COALESCE(p.price, 0)) > 0.01; -- Допуск 0.01

-- 5. Рекомендации
SELECT 'Рекомендации:' as info;
SELECT '1. Если есть несоответствия цен, нужно их исправить вручную' as recommendation
UNION ALL
SELECT '2. Проверьте, что все внешние ключи настроены корректно' as recommendation
UNION ALL
SELECT '3. После создания платежей можно установить NOT NULL для payment_id' as recommendation;