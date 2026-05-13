-- Добавление тестовых данных для пользователя с id 2

-- 1. Сначала проверим, существует ли пользователь с id 2
SELECT user_id, login, email FROM users WHERE user_id = 2;

-- 2. Получим несколько автомобилей для создания заказов
SELECT car_id, car_status FROM cars LIMIT 5;

-- 3. Создадим платежи для заказов
INSERT INTO payments (cheque, price) VALUES
('CHQ-ORDER-001-USER-2', 125.50),
('CHQ-ORDER-002-USER-2', 89.75),
('CHQ-ORDER-003-USER-2', 210.00),
('CHQ-ORDER-004-USER-2', 67.30),
('CHQ-ORDER-005-USER-2', 155.90)
RETURNING payment_id;

-- 4. Создадим заказы для пользователя с id 2
-- Предположим, что у нас есть автомобили с id 1, 2, 3, 4, 5
-- Цена теперь рассчитывается как distance * 4.0
INSERT INTO orders (user_id, car_id, status, distance, spend_fuel, price, payment_id, rating_edits) VALUES
(2, 1, 'COMPLETED', 25.5, 3.825, 102.0, (SELECT payment_id FROM payments WHERE cheque = 'CHQ-ORDER-001-USER-2'), 0.05), -- 25.5 * 4.0 = 102.0
(2, 2, 'COMPLETED', 18.2, 2.730, 72.8, (SELECT payment_id FROM payments WHERE cheque = 'CHQ-ORDER-002-USER-2'), -0.12), -- 18.2 * 4.0 = 72.8
(2, 3, 'COMPLETED', 42.0, 6.300, 168.0, (SELECT payment_id FROM payments WHERE cheque = 'CHQ-ORDER-003-USER-2'), 0.08), -- 42.0 * 4.0 = 168.0
(2, 4, 'COMPLETED', 13.4, 2.010, 53.6, (SELECT payment_id FROM payments WHERE cheque = 'CHQ-ORDER-004-USER-2'), -0.05), -- 13.4 * 4.0 = 53.6
(2, 5, 'STARTED', 0.0, 0.0, 0.0, (SELECT payment_id FROM payments WHERE cheque = 'CHQ-ORDER-005-USER-2'), 0.0) -- Цена будет 0.0 для начатого заказа
RETURNING order_id;

-- 5. Создадим отзывы для некоторых заказов
-- Получим ID созданных заказов
SELECT order_id, car_id FROM orders WHERE user_id = 2 ORDER BY start_time DESC;

-- Создадим отзывы (предположим, что order_id будут 1, 2, 3, 4, 5 для простоты)
INSERT INTO reviews (user_id, car_id, review_text, review_date, rating) VALUES
(2, 1, 'Отличный автомобиль, все чисто и работает исправно. Очень понравился комфорт салона.', '2026-05-01 12:00:00', 5),
(2, 2, 'Нормальная машина, но кондиционер слабоват. В целом доволен поездкой.', '2026-05-02 16:00:00', 4),
(2, 3, 'Премиум автомобиль оправдал ожидания. Тихий, мощный, все системы работают отлично.', '2026-05-03 12:30:00', 5),
(2, 4, 'Машина в хорошем состоянии, но немного шумновата на высоких скоростях.', '2026-05-04 18:00:00', 3),
(2, 5, 'Еще не завершил поездку, но пока все нравится. Удобное управление.', '2026-05-05 09:00:00', 4);

-- 6. Добавим ответы администратора на некоторые отзывы
UPDATE reviews SET 
admin_reply = 'Благодарим за отзыв! Рады, что вам понравилось. Ждем вас снова!',
reply_date = '2026-05-01 14:30:00'
WHERE user_id = 2 AND car_id = 1;

UPDATE reviews SET 
admin_reply = 'Спасибо за обратную связь. Проверим работу кондиционера и при необходимости обслужим.',
reply_date = '2026-05-02 17:45:00'
WHERE user_id = 2 AND car_id = 2;

-- 7. Проверим созданные данные
SELECT 
    o.order_id,
    o.status,
    o.distance,
    o.spend_fuel,
    o.price,
    o.rating_edits,
    p.cheque as payment_cheque,
    r.review_text,
    r.rating,
    r.admin_reply
FROM orders o
LEFT JOIN payments p ON o.payment_id = p.payment_id
LEFT JOIN reviews r ON o.user_id = r.user_id AND o.car_id = r.car_id
WHERE o.user_id = 2
ORDER BY o.order_id DESC;

-- 8. Обновим статусы автомобилей в соответствии с заказами
UPDATE cars SET car_status = 'AVAILABLE' WHERE car_id IN (1, 2, 3, 4);
UPDATE cars SET car_status = 'IN_USE' WHERE car_id = 5;

-- 9. Обновим уровень топлива в автомобилях (уменьшим на потраченное топливо)
UPDATE cars c SET fuel_level = fuel_level - o.spend_fuel
FROM orders o 
WHERE c.car_id = o.car_id AND o.user_id = 2;

-- 10. Проверим обновленные автомобили
SELECT car_id, car_status, fuel_level FROM cars WHERE car_id IN (1, 2, 3, 4, 5);