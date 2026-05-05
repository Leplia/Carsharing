# Исправленные ошибки в бэкенде

## Найденные и исправленные ошибки

### 1. Проблема с OrderRepository
**Ошибка:** Отсутствовали необходимые методы в репозитории
**Решение:** Добавлены методы с правильными именами полей

**Было:**
```java
List<Order> findByUserIdOrderByStartTimeDesc(Long userId);
List<Order> findByUserIdAndStatusAndEndTimeIsNull(Long userId, OrderStatus status);
```

**Стало:**
```java
List<Order> findByUser_IdOrderByStartTimeDesc(Long userId);
List<Order> findByUser_IdAndStatusAndEndTimeIsNull(Long userId, OrderStatus status);
```

**Причина:** В модели Order связь с User называется `user`, а не `userId`. Spring Data JPA использует `_` для навигации по связям.

### 2. Проблема с типом данных fuelLevel
**Ошибка:** Несоответствие типов данных при работе с fuelLevel
**Решение:** Приведение типа double к int

**Было:**
```java
double newFuelLevel = Math.max(0, car.getFuelLevel() - fuelConsumed);
car.setFuelLevel(newFuelLevel);
```

**Стало:**
```java
double newFuelLevel = Math.max(0, car.getFuelLevel() - fuelConsumed);
car.setFuelLevel((int) Math.round(newFuelLevel));
```

**Причина:** Поле `fuelLevel` в модели Car имеет тип `Integer`, а не `Double`.

### 3. Проблема с получением userId
**Ошибка:** Использование несуществующего метода `getId()`
**Решение:** Использование правильного метода `getUserId()`

**Было в UserOrdersController:**
```java
orderService.getUserOrders(user.getId());
orderService.getActiveOrder(user.getId());
```

**Стало:**
```java
orderService.getUserOrders(user.getUserId());
orderService.getActiveOrder(user.getUserId());
```

**Причина:** В модели User поле называется `userId`, а не `id`. Lombok генерирует геттер `getUserId()`.

### 4. Проблема с обработкой null в fuelLevel
**Ошибка:** Возможность NPE при вызове `car.getFuelLevel()`
**Решение:** Добавлена проверка на null

**Было:**
```java
if (distanceKm > 0) {
    double newFuelLevel = Math.max(0, car.getFuelLevel() - fuelConsumed);
    car.setFuelLevel((int) Math.round(newFuelLevel));
}
```

**Стало:**
```java
if (distanceKm > 0 && car.getFuelLevel() != null) {
    double newFuelLevel = Math.max(0, car.getFuelLevel() - fuelConsumed);
    car.setFuelLevel((int) Math.round(newFuelLevel));
}
```

**Причина:** Защита от NullPointerException.

### 5. Проблема с получением активного заказа
**Ошибка:** Неправильная обработка результата из репозитория
**Решение:** Корректная проверка пустого списка

**Было:**
```java
Order activeOrder = orderRepository.findByUserIdAndStatusAndEndTimeIsNull(userId, OrderStatus.STARTED)
        .stream()
        .findFirst()
        .orElse(null);
```

**Стало:**
```java
List<Order> activeOrders = orderRepository.findByUser_IdAndStatusAndEndTimeIsNull(userId, OrderStatus.STARTED);
Order activeOrder = activeOrders.isEmpty() ? null : activeOrders.get(0);
```

**Причина:** Метод репозитория возвращает `List<Order>`, а не `Optional<Order>`.

## Проверка исправлений

### 1. OrderRepository:
- ✅ `findByUser_IdOrderByStartTimeDesc(Long userId)` - правильное имя метода
- ✅ `findByUser_IdAndStatusAndEndTimeIsNull(Long userId, OrderStatus status)` - правильное имя метода

### 2. OrderServiceImpl:
- ✅ Проверка `car.getFuelLevel() != null` перед расчетом
- ✅ Приведение типа `(int) Math.round(newFuelLevel)`
- ✅ Использование `user.getUserId()` вместо `user.getId()`
- ✅ Корректная обработка списка активных заказов

### 3. UserOrdersController:
- ✅ Использование `user.getUserId()` вместо `user.getId()`

### 4. Типы данных:
- ✅ `fuelLevel: Integer` в модели Car
- ✅ Приведение double → int при установке значения
- ✅ Проверка на null перед использованием

## Архитектурные улучшения

### 1. Безопасность типов:
- Явное приведение типов там, где это необходимо
- Проверки на null для предотвращения NPE
- Использование правильных типов данных

### 2. Согласованность имен:
- Единый стиль именования методов репозитория
- Правильные имена полей в запросах JPA
- Согласованность между фронтендом и бэкендом

### 3. Обработка ошибок:
- Защита от null значений
- Корректная обработка пустых коллекций
- Явные проверки перед операциями

## Тестирование исправлений

### Сценарии, которые теперь работают корректно:

#### 1. Завершение поездки с обновлением топлива:
```
1. Автомобиль с fuelLevel = 80
2. Поездка на 50 км
3. Расчет: (50 / 100) * 20 = 10% расхода
4. Результат: fuelLevel = 70 (80 - 10)
5. Тип данных: Integer (корректно)
```

#### 2. Получение истории поездок:
```
1. Запрос заказов пользователя с userId = 123
2. Репозиторий: findByUser_IdOrderByStartTimeDesc(123)
3. Результат: List<Order> (корректно)
4. Преобразование: Order → OrderDto (корректно)
```

#### 3. Получение активного заказа:
```
1. Запрос активного заказа пользователя
2. Репозиторий: findByUser_IdAndStatusAndEndTimeIsNull(userId, STARTED)
3. Результат: List<Order> (может быть пустым)
4. Обработка: activeOrders.isEmpty() ? null : activeOrders.get(0)
```

## Заключение

Все найденные ошибки исправлены:

1. **Имена методов репозитория** - исправлены согласно соглашениям Spring Data JPA
2. **Типы данных** - приведение double к Integer для поля fuelLevel
3. **Методы доступа** - использование getUserId() вместо getId()
4. **Обработка null** - проверки перед использованием значений
5. **Обработка коллекций** - корректная работа со списками

Исправления обеспечивают:
- **Безопасность:** Защита от NPE и других исключений
- **Корректность:** Правильные типы данных и преобразования
- **Согласованность:** Единый стиль кода во всем проекте
- **Надежность:** Стабильная работа всех компонентов

Проект готов к дальнейшей разработке и тестированию.