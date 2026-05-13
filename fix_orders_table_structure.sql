-- Полный скрипт для приведения таблицы orders к правильной структуре
-- Согласно модели Order.java

-- 1. Сначала создадим временную таблицу с текущими данными (если нужно сохранить)
CREATE TABLE IF NOT EXISTS orders_backup AS SELECT * FROM orders;

-- 2. Проверим текущую структуру таблицы
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'orders'
ORDER BY ordinal_position;

-- 3. Удалим лишние колонки, которые больше не используются

-- 3.1. Удаляем start_time если существует
ALTER TABLE orders DROP COLUMN IF EXISTS start_time;

-- 3.2. Удаляем end_time если существует (должно быть уже удалено, но на всякий случай)
ALTER TABLE orders DROP COLUMN IF EXISTS end_time;

-- 3.3. Удаляем discount если существует
ALTER TABLE orders DROP COLUMN IF EXISTS discount;

-- 4. Проверим существование необходимых колонок и добавим недостающие

-- 4.1. Проверяем rating_edits
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'orders' AND column_name = 'rating_edits';

-- Если rating_edits не существует, добавляем
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'rating_edits'
    ) THEN
        ALTER TABLE orders ADD COLUMN rating_edits FLOAT;
    END IF;
END $$;

-- 4.2. Проверяем payment_id
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'orders' AND column_name = 'payment_id';

-- Если payment_id не существует, добавляем
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'payment_id'
    ) THEN
        ALTER TABLE orders ADD COLUMN payment_id BIGINT;
    END IF;
END $$;

-- 5. Устанавливаем значения по умолчанию для NULL полей

-- 5.1. Для distance (если NULL, устанавливаем 0.0)
UPDATE orders SET distance = 0.0 WHERE distance IS NULL;

-- 5.2. Для spend_fuel (если NULL, устанавливаем 0.0)
UPDATE orders SET spend_fuel = 0.0 WHERE spend_fuel IS NULL;

-- 5.3. Для price (если NULL, устанавливаем 0.0)
UPDATE orders SET price = 0.0 WHERE price IS NULL;

-- 5.4. Для rating_edits (если NULL, устанавливаем 0.0)
UPDATE orders SET rating_edits = 0.0 WHERE rating_edits IS NULL;

-- 6. Проверяем и добавляем ограничения NOT NULL для обязательных полей

-- 6.1. user_id должен быть NOT NULL
ALTER TABLE orders ALTER COLUMN user_id SET NOT NULL;

-- 6.2. car_id должен быть NOT NULL
ALTER TABLE orders ALTER COLUMN car_id SET NOT NULL;

-- 6.3. status должен быть NOT NULL
ALTER TABLE orders ALTER COLUMN status SET NOT NULL;

-- 6.4. payment_id должен быть NOT NULL (после того как все записи будут иметь значение)
-- Сначала убедимся, что нет NULL значений в payment_id
SELECT COUNT(*) FROM orders WHERE payment_id IS NULL;

-- Если есть записи без payment_id, нужно создать для них платежи
-- Это сложная операция, поэтому пока просто предупреждение
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM orders WHERE payment_id IS NULL) THEN
        RAISE NOTICE 'ВНИМАНИЕ: Есть записи в orders без payment_id. Нужно создать платежи для этих записей.';
    END IF;
END $$;

-- 7. Проверяем внешние ключи

-- 7.1. Проверяем foreign key для user_id
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'orders'
    AND kcu.column_name = 'user_id';

-- 7.2. Проверяем foreign key для car_id
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'orders'
    AND kcu.column_name = 'car_id';

-- 7.3. Проверяем foreign key для payment_id
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'orders'
    AND kcu.column_name = 'payment_id';

-- 8. Если внешние ключи отсутствуют, можно их добавить (опционально)
-- ВНИМАНИЕ: Добавление foreign key может fail если есть данные, нарушающие ограничения

-- 8.1. Добавляем foreign key для user_id если отсутствует
-- ALTER TABLE orders ADD CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(user_id);

-- 8.2. Добавляем foreign key для car_id если отсутствует
-- ALTER TABLE orders ADD CONSTRAINT fk_orders_car FOREIGN KEY (car_id) REFERENCES cars(car_id);

-- 8.3. Добавляем foreign key для payment_id если отсутствует
-- ALTER TABLE orders ADD CONSTRAINT fk_orders_payment FOREIGN KEY (payment_id) REFERENCES payments(payment_id);

-- 9. Проверяем ограничение CHECK для статуса
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'orders' AND constraint_type = 'CHECK';

-- 10. Создаем или обновляем ограничение CHECK для статуса если нужно
-- Hibernate обычно создает это автоматически, но проверим
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'orders' AND constraint_name = 'orders_status_check'
    ) THEN
        ALTER TABLE orders ADD CONSTRAINT orders_status_check 
        CHECK (status IN ('STARTED', 'COMPLETED', 'CANCELLED', 'PAID', 'UNPAID', 'IN_PROCESS'));
    END IF;
END $$;

-- 11. Проверяем обновленную структуру
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'orders'
ORDER BY ordinal_position;

-- 12. Проверяем несколько записей для подтверждения
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
LIMIT 10;

-- 13. Проверяем статистику
SELECT 
    COUNT(*) as total_orders,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT car_id) as unique_cars,
    status,
    COUNT(*) as count_by_status
FROM orders 
GROUP BY status
ORDER BY count_by_status DESC;

-- 14. Очистка (опционально) - удаляем временную таблицу если все в порядке
-- DROP TABLE IF EXISTS orders_backup;

-- 15. Информационное сообщение
DO $$ 
BEGIN
    RAISE NOTICE 'Таблица orders успешно обновлена.';
    RAISE NOTICE 'Удалены лишние поля: start_time, end_time, discount.';
    RAISE NOTICE 'Добавлены/проверены необходимые поля: rating_edits, payment_id.';
    RAISE NOTICE 'Установлены значения по умолчанию для NULL полей.';
END $$;