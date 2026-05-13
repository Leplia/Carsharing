-- Скрипт для восстановления базы данных каршеринга
-- Создает все таблицы с правильной структурой

-- 1. Удаляем существующие таблицы (если нужно)
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS cars CASCADE;
DROP TABLE IF EXISTS car_models CASCADE;
DROP TABLE IF EXISTS car_manufactures CASCADE;
DROP TABLE IF EXISTS user_credentials CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 2. Создаем таблицу пользователей
CREATE TABLE users (
    user_id BIGSERIAL PRIMARY KEY,
    login VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255),
    phone VARCHAR(20),
    rating FLOAT DEFAULT 0.0,
    blocked BOOLEAN DEFAULT FALSE,
    verified BOOLEAN DEFAULT FALSE,
    service_type VARCHAR(50) DEFAULT 'LOCAL',
    role VARCHAR(50) DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Создаем таблицу данных пользователя (верификация)
CREATE TABLE user_credentials (
    credentials_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    passport_number VARCHAR(50),
    driver_licence VARCHAR(50),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 4. Создаем таблицу производителей автомобилей
CREATE TABLE car_manufactures (
    manufacture_id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    country VARCHAR(100),
    badge_url VARCHAR(500)
);

-- 5. Создаем таблицу моделей автомобилей
CREATE TABLE car_models (
    model_id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    transmission VARCHAR(50),
    seats INTEGER,
    body_type VARCHAR(50),
    coefficient FLOAT DEFAULT 1.0,
    manufacture_id BIGINT NOT NULL,
    FOREIGN KEY (manufacture_id) REFERENCES car_manufactures(manufacture_id) ON DELETE CASCADE
);

-- 6. Создаем таблицу автомобилей
CREATE TABLE cars (
    car_id BIGSERIAL PRIMARY KEY,
    photo_url VARCHAR(500),
    location_x DOUBLE PRECISION NOT NULL,
    location_y DOUBLE PRECISION NOT NULL,
    fuel_level INTEGER DEFAULT 100,
    color VARCHAR(50),
    year INTEGER,
    description TEXT,
    car_status VARCHAR(50) DEFAULT 'AVAILABLE',
    model_id BIGINT NOT NULL,
    FOREIGN KEY (model_id) REFERENCES car_models(model_id) ON DELETE CASCADE
);

-- 7. Создаем таблицу платежей
CREATE TABLE payments (
    payment_id BIGSERIAL PRIMARY KEY,
    cheque VARCHAR(100) NOT NULL UNIQUE,
    price DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Создаем таблицу заказов (обновленная структура без времени)
CREATE TABLE orders (
    order_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    car_id BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'STARTED',
    distance DOUBLE PRECISION DEFAULT 0.0,
    spend_fuel DOUBLE PRECISION DEFAULT 0.0,
    price DOUBLE PRECISION DEFAULT 0.0,
    payment_id BIGINT NOT NULL,
    rating_edits FLOAT DEFAULT 0.0,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (car_id) REFERENCES cars(car_id) ON DELETE CASCADE,
    FOREIGN KEY (payment_id) REFERENCES payments(payment_id) ON DELETE CASCADE,
    CONSTRAINT orders_status_check CHECK (status IN ('STARTED', 'COMPLETED', 'CANCELLED', 'PAID', 'UNPAID', 'IN_PROCESS'))
);

-- 9. Создаем таблицу отзывов
CREATE TABLE reviews (
    review_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    car_id BIGINT NOT NULL,
    review_text TEXT,
    review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    admin_reply TEXT,
    reply_date TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (car_id) REFERENCES cars(car_id) ON DELETE CASCADE
);

-- 10. Создаем индексы для улучшения производительности
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_car_id ON orders(car_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_cars_location ON cars(location_x, location_y);
CREATE INDEX idx_cars_status ON cars(car_status);
CREATE INDEX idx_reviews_user_car ON reviews(user_id, car_id);

-- 11. Вставляем тестовые данные

-- 11.1. Производители автомобилей
INSERT INTO car_manufactures (name, country, badge_url) VALUES
('Toyota', 'Япония', 'https://example.com/toyota.png'),
('BMW', 'Германия', 'https://example.com/bmw.png'),
('Mercedes-Benz', 'Германия', 'https://example.com/mercedes.png'),
('Ford', 'США', 'https://example.com/ford.png'),
('Hyundai', 'Южная Корея', 'https://example.com/hyundai.png');

-- 11.2. Модели автомобилей
INSERT INTO car_models (name, transmission, seats, body_type, coefficient, manufacture_id) VALUES
('Camry', 'AUTOMATIC', 5, 'SEDAN', 1.2, 1),
('Corolla', 'AUTOMATIC', 5, 'SEDAN', 1.0, 1),
('X5', 'AUTOMATIC', 5, 'SUV', 1.5, 2),
('3 Series', 'AUTOMATIC', 5, 'SEDAN', 1.3, 2),
('E-Class', 'AUTOMATIC', 5, 'SEDAN', 1.4, 3),
('C-Class', 'AUTOMATIC', 5, 'SEDAN', 1.3, 3),
('Focus', 'MANUAL', 5, 'HATCHBACK', 1.0, 4),
('Mustang', 'AUTOMATIC', 4, 'COUPE', 1.6, 4),
('Tucson', 'AUTOMATIC', 5, 'SUV', 1.2, 5),
('Sonata', 'AUTOMATIC', 5, 'SEDAN', 1.1, 5);

-- 11.3. Автомобили
INSERT INTO cars (photo_url, location_x, location_y, fuel_level, color, year, description, car_status, model_id) VALUES
('https://example.com/car1.jpg', 53.9045, 27.5615, 100, 'Белый', 2022, 'Toyota Camry в отличном состоянии', 'AVAILABLE', 1),
('https://example.com/car2.jpg', 53.9050, 27.5620, 85, 'Черный', 2023, 'BMW X5 с полным приводом', 'AVAILABLE', 3),
('https://example.com/car3.jpg', 53.9030, 27.5600, 75, 'Серый', 2021, 'Mercedes E-Class премиум класса', 'AVAILABLE', 5),
('https://example.com/car4.jpg', 53.9060, 27.5630, 90, 'Синий', 2022, 'Ford Focus экономичный', 'AVAILABLE', 7),
('https://example.com/car5.jpg', 53.9020, 27.5590, 95, 'Красный', 2023, 'Hyundai Tucson кроссовер', 'AVAILABLE', 9),
('https://example.com/car6.jpg', 53.9070, 27.5640, 80, 'Белый', 2021, 'Toyota Corolla надежный', 'BOOKED', 2),
('https://example.com/car7.jpg', 53.9010, 27.5580, 70, 'Черный', 2022, 'BMW 3 Series спортивный', 'IN_USE', 4),
('https://example.com/car8.jpg', 53.9080, 27.5650, 100, 'Серебристый', 2023, 'Mercedes C-Class комфортный', 'AVAILABLE', 6),
('https://example.com/car9.jpg', 53.9000, 27.5570, 65, 'Желтый', 2021, 'Ford Mustang мускул кар', 'OUT_OF_SERVICE', 8),
('https://example.com/car10.jpg', 53.9090, 27.5660, 95, 'Зеленый', 2022, 'Hyundai Sonata бизнес класс', 'AVAILABLE', 10);

-- 11.4. Пользователи
INSERT INTO users (login, email, password, phone, rating, blocked, verified, service_type, role) VALUES
('admin', 'admin@carsharing.by', '$2a$10$YourHashedPasswordHere', '+375291234567', 5.0, FALSE, TRUE, 'LOCAL', 'ADMIN'),
('user1', 'user1@example.com', '$2a$10$YourHashedPasswordHere', '+375292345678', 4.5, FALSE, TRUE, 'LOCAL', 'USER'),
('user2', 'user2@example.com', '$2a$10$YourHashedPasswordHere', '+375293456789', 4.2, FALSE, TRUE, 'LOCAL', 'USER'),
('user3', 'user3@example.com', '$2a$10$YourHashedPasswordHere', '+375294567890', 3.8, FALSE, FALSE, 'LOCAL', 'USER'),
('driver', 'driver@example.com', '$2a$10$YourHashedPasswordHere', '+375295678901', 4.7, FALSE, TRUE, 'LOCAL', 'USER');

-- 11.5. Данные пользователей (верификация)
INSERT INTO user_credentials (user_id, first_name, last_name, passport_number, driver_licence) VALUES
(1, 'Александр', 'Петров', 'MP1234567', 'AB123456'),
(2, 'Иван', 'Иванов', 'MP2345678', 'AB234567'),
(3, 'Мария', 'Сидорова', 'MP3456789', 'AB345678'),
(5, 'Дмитрий', 'Козлов', 'MP5678901', 'AB567890');

-- 11.6. Платежи
INSERT INTO payments (cheque, price) VALUES
('CHQ-001', 45.50),
('CHQ-002', 67.80),
('CHQ-003', 89.20),
('CHQ-004', 102.50),
('CHQ-005', 55.30);

-- 11.7. Заказы (обновленная структура без времени)
INSERT INTO orders (user_id, car_id, status, distance, spend_fuel, price, payment_id, rating_edits) VALUES
(2, 1, 'COMPLETED', 25.5, 3.825, 102.0, 1, 0.05),
(2, 3, 'COMPLETED', 18.2, 2.730, 72.8, 2, -0.12),
(3, 5, 'COMPLETED', 42.0, 6.300, 168.0, 3, 0.08),
(3, 7, 'STARTED', 0.0, 0.0, 0.0, 4, 0.0),
(5, 9, 'COMPLETED', 13.4, 2.010, 53.6, 5, -0.05);

-- 11.8. Отзывы
INSERT INTO reviews (user_id, car_id, review_text, review_date, rating, admin_reply, reply_date) VALUES
(2, 1, 'Отличный автомобиль, все чисто и работает исправно. Очень понравился комфорт салона.', '2026-05-01 12:00:00', 5, 'Благодарим за отзыв! Рады, что вам понравилось. Ждем вас снова!', '2026-05-01 14:30:00'),
(2, 3, 'Нормальная машина, но кондиционер слабоват. В целом доволен поездкой.', '2026-05-02 16:00:00', 4, 'Спасибо за обратную связь. Проверим работу кондиционера и при необходимости обслужим.', '2026-05-02 17:45:00'),
(3, 5, 'Премиум автомобиль оправдал ожидания. Тихий, мощный, все системы работают отлично.', '2026-05-03 12:30:00', 5, NULL, NULL),
(5, 9, 'Машина в хорошем состоянии, но немного шумновата на высоких скоростях.', '2026-05-04 18:00:00', 3, NULL, NULL);

-- 12. Проверяем созданные таблицы
SELECT '=== ПРОВЕРКА СОЗДАННЫХ ТАБЛИЦ ===' as info;

SELECT table_name, 
       (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as columns_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 13. Проверяем данные
SELECT '=== ПРОВЕРКА ДАННЫХ ===' as info;

SELECT 'Пользователи:' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Автомобили:', COUNT(*) FROM cars
UNION ALL
SELECT 'Заказы:', COUNT(*) FROM orders
UNION ALL
SELECT 'Отзывы:', COUNT(*) FROM reviews
UNION ALL
SELECT 'Платежи:', COUNT(*) FROM payments
ORDER BY table_name;

-- 14. Пример данных заказов
SELECT '=== ПРИМЕР ДАННЫХ ЗАКАЗОВ ===' as info;
SELECT 
    o.order_id,
    u.login as user_login,
    c.car_id,
    o.status,
    o.distance,
    o.spend_fuel,
    o.price,
    o.rating_edits
FROM orders o
JOIN users u ON o.user_id = u.user_id
JOIN cars c ON o.car_id = c.car_id
ORDER BY o.order_id;

-- 15. Информационное сообщение
DO $$ 
BEGIN
    RAISE NOTICE '=========================================';
    RAISE NOTICE 'БАЗА ДАННЫХ КАРШЕРИНГА УСПЕШНО ВОССТАНОВЛЕНА';
    RAISE NOTICE '=========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Созданы таблицы:';
    RAISE NOTICE '  - users (пользователи)';
    RAISE NOTICE '  - user_credentials (данные пользователей)';
    RAISE NOTICE '  - car_manufactures (производители)';
    RAISE NOTICE '  - car_models (модели автомобилей)';
    RAISE NOTICE '  - cars (автомобили)';
    RAISE NOTICE '  - payments (платежи)';
    RAISE NOTICE '  - orders (заказы) - обновленная структура без времени';
    RAISE NOTICE '  - reviews (отзывы)';
    RAISE NOTICE '';
    RAISE NOTICE 'Добавлены тестовые данные:';
    RAISE NOTICE '  - 5 пользователей';
    RAISE NOTICE '  - 5 производителей автомобилей';
    RAISE NOTICE '  - 10 моделей автомобилей';
    RAISE NOTICE '  - 10 автомобилей';
    RAISE NOTICE '  - 5 платежей';
    RAISE NOTICE '  - 5 заказов';
    RAISE NOTICE '  - 4 отзыва';
    RAISE NOTICE '';
    RAISE NOTICE 'Структура таблицы orders обновлена:';
    RAISE NOTICE '  - Удалены поля: start_time, end_time, discount';
    RAISE NOTICE '  - Добавлены поля: rating_edits';
    RAISE NOTICE '  - Цена рассчитывается как distance × 4.0';
    RAISE NOTICE '';
    RAISE NOTICE 'Для запуска приложения:';
    RAISE NOTICE '  1. Убедитесь, что база данных создана';
    RAISE NOTICE '  2. Запустите бэкенд: ./mvnw spring-boot:run';
    RAISE NOTICE '  3. Запустите фронтенд: cd frontend && npm run dev';
    RAISE NOTICE '=========================================';
END $$;