-- SQL скрипт для обновления таблицы orders в соответствии с новой моделью
-- Удаляем колонку end_time и добавляем start_time если ее нет

-- 1. Проверяем существование колонки end_time
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'orders' AND column_name = 'end_time';

-- 2. Если колонка end_time существует, удаляем ее
ALTER TABLE orders DROP COLUMN IF EXISTS end_time;

-- 3. Проверяем существование колонки start_time
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'orders' AND column_name = 'start_time';

-- 4. Если колонка start_time существует, удаляем ее
ALTER TABLE orders DROP COLUMN IF EXISTS start_time;

-- 5. Проверяем существование колонки discount
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'orders' AND column_name = 'discount';

-- 6. Если колонка discount существует, удаляем ее
ALTER TABLE orders DROP COLUMN IF EXISTS discount;

-- 7. Проверяем существование колонки rating_edits
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'orders' AND column_name = 'rating_edits';

-- 8. Если колонки rating_edits нет, добавляем ее
ALTER TABLE orders ADD COLUMN IF NOT EXISTS rating_edits FLOAT;

-- 9. Проверяем существование колонки payment_id
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'orders' AND column_name = 'payment_id';

-- 10. Если колонки payment_id нет, добавляем ее
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_id BIGINT;

-- 11. Добавляем ограничение NOT NULL для payment_id (если нужно)
-- ALTER TABLE orders ALTER COLUMN payment_id SET NOT NULL;

-- 12. Добавляем внешний ключ для payment_id (если нужно)
-- ALTER TABLE orders ADD CONSTRAINT fk_orders_payment FOREIGN KEY (payment_id) REFERENCES payments(payment_id);

-- 13. Проверяем обновленную структуру таблицы
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'orders'
ORDER BY ordinal_position;

-- 14. start_time больше не используется, поэтому этот шаг пропускаем

-- 15. Обновляем существующие записи, устанавливая rating_edits = 0 если NULL
UPDATE orders 
SET rating_edits = 0.0 
WHERE rating_edits IS NULL;

-- 16. Проверяем несколько записей для подтверждения изменений
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