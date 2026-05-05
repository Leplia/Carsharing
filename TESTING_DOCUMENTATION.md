# Документация по тестированию с JaCoCo

## Обзор

В проект добавлены модульные и интеграционные тесты с использованием JaCoCo для измерения покрытия кода. Система тестирования включает:

1. **Модульные тесты** для сервисов и контроллеров
2. **Интеграционные тесты** для проверки работы API
3. **Проверка покрытия кода** с минимальными требованиями
4. **Автоматическая генерация отчетов**

## Структура тестов

### Модульные тесты (`src/test/java/org/sharing/carsharing/`)

#### Сервисы (`service/`)
- `OrderServiceTest.java` - тесты для OrderService
- `CarsServiceTest.java` - тесты для CarsService
- `RideCostServiceTest.java` - существующие тесты

#### Контроллеры (`controller/`)
- `OrderControllerTest.java` - тесты для OrderController
- `CarsControllerTest.java` - тесты для CarsController
- `RideCostControllerTest.java` - существующие тесты

#### Интеграционные тесты (`integration/`)
- `OrderIntegrationTest.java` - интеграционные тесты для заказов
- `CarsIntegrationTest.java` - интеграционные тесты для автомобилей

### Тестовые данные

В тестах используются mock-объекты для изоляции тестируемых компонентов:
- Mock репозиториев (OrderRepository, CarsRepository и т.д.)
- Mock мапперов (OrderMapper, CarMapper и т.д.)
- Mock сервисов (AdminAccessService)

## Требования к покрытию кода

### Минимальные требования (настроены в pom.xml)

| Метрика | Минимум | Описание |
|---------|---------|----------|
| Инструкции | 60% | Процент покрытых инструкций байт-кода |
| Ветви | 50% | Процент покрытых ветвей (if/else, switch) |
| Строки | 70% | Процент покрытых строк кода |
| Методы | 70% | Процент покрытых методов |
| Классы | 60% | Процент покрытых классов |

### Специальные требования

1. **Контроллеры** (`*Controller`): минимум 80% покрытия строк и методов
2. **Сервисы** (`*Service`): минимум 85% покрытия строк и методов
3. **Репозитории**: минимум 50% покрытия строк
4. **DTO/Модели**: минимум 30% покрытия строк

## Запуск тестов

### Быстрый запуск всех тестов
```bash
./mvnw test
```

### Запуск с генерацией отчета JaCoCo
```bash
./mvnw clean test jacoco:report jacoco:check
```

Или используйте готовые скрипты:
- Windows: `run-tests-with-coverage.bat`
- Linux/Mac: `./run-tests-with-coverage.sh`

### Запуск отдельных тестов

#### Модульные тесты
```bash
# Тесты OrderService
./mvnw test -Dtest=OrderServiceTest

# Тесты CarsService
./mvnw test -Dtest=CarsServiceTest

# Тесты контроллеров
./mvnw test -Dtest=OrderControllerTest
./mvnw test -Dtest=CarsControllerTest
```

#### Интеграционные тесты
```bash
# Все интеграционные тесты
./mvnw test -Dtest="*IntegrationTest"

# Конкретный интеграционный тест
./mvnw test -Dtest=OrderIntegrationTest
```

## Просмотр отчетов JaCoCo

После запуска тестов отчеты генерируются в директории `target/site/jacoco/`:

1. **HTML отчет**: `target/site/jacoco/index.html` - интерактивный отчет
2. **XML отчет**: `target/site/jacoco/jacoco.xml` - для CI/CD систем
3. **CSV отчет**: `target/site/jacoco/jacoco.csv` - для анализа в таблицах

### Структура HTML отчета

1. **Обзор проекта** - общее покрытие по всем пакетам
2. **Покрытие по пакетам** - детализация по каждому пакету
3. **Покрытие по классам** - детализация по каждому классу
4. **Исходный код** - подсветка покрытых и непокрытых строк

## Написание новых тестов

### Шаблон модульного теста для сервиса

```java
@ExtendWith(MockitoExtension.class)
class MyServiceTest {

    @Mock
    private MyRepository myRepository;
    
    @Mock
    private MyMapper myMapper;
    
    @InjectMocks
    private MyServiceImpl myService;
    
    @BeforeEach
    void setUp() {
        // Инициализация тестовых данных
    }
    
    @Test
    void methodName_Success() {
        // Arrange
        when(myRepository.findById(anyLong())).thenReturn(Optional.of(testData));
        
        // Act
        Result result = myService.methodName(params);
        
        // Assert
        assertNotNull(result);
        assertEquals(expectedValue, result.getValue());
        
        // Verify
        verify(myRepository, times(1)).findById(anyLong());
    }
    
    @Test
    void methodName_NotFound_ThrowsException() {
        // Arrange
        when(myRepository.findById(anyLong())).thenReturn(Optional.empty());
        
        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class,
            () -> myService.methodName(params));
        assertEquals("Expected message", exception.getMessage());
    }
}
```

### Шаблон теста для контроллера

```java
@WebMvcTest(MyController.class)
class MyControllerTest {

    @Autowired
    private MockMvc mockMvc;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    @MockBean
    private MyService myService;
    
    @Test
    void endpointName_Success() throws Exception {
        // Arrange
        when(myService.methodName(any())).thenReturn(expectedResult);
        
        // Act & Assert
        mockMvc.perform(post("/api/endpoint")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.field").value(expectedValue));
    }
}
```

## Интеграционные тесты

### Особенности интеграционных тестов

1. **Используют реальный контекст Spring**
2. **Тестируют несколько компонентов вместе**
3. **Проверяют работу API эндпоинтов**
4. **Могут использовать тестовую базу данных**

### Пример интеграционного теста

```java
@SpringBootTest
@AutoConfigureMockMvc
class MyIntegrationTest {

    @Autowired
    private MockMvc mockMvc;
    
    @Test
    void testApiFlow() throws Exception {
        // Проверка публичных эндпоинтов
        mockMvc.perform(get("/api/public-endpoint"))
                .andExpect(status().isOk());
        
        // Проверка защищенных эндпоинтов без авторизации
        mockMvc.perform(get("/api/protected-endpoint"))
                .andExpect(status().isUnauthorized());
    }
}
```

## CI/CD интеграция

### GitHub Actions (пример)

```yaml
name: Java CI with Maven and JaCoCo

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up JDK 21
      uses: actions/setup-java@v3
      with:
        java-version: '21'
        distribution: 'temurin'
        
    - name: Run tests with coverage
      run: ./mvnw clean test jacoco:report
      
    - name: Upload JaCoCo report
      uses: actions/upload-artifact@v3
      with:
        name: jacoco-report
        path: target/site/jacoco/
        
    - name: Check coverage
      run: ./mvnw jacoco:check
```

## Устранение неполадок

### Проблема: Тесты не компилируются
**Решение**: Проверьте зависимости и версии Java
```bash
./mvnw clean compile
```

### Проблема: Низкое покрытие кода
**Решение**:
1. Добавьте тесты для непокрытых методов
2. Проверьте исключения и граничные случаи
3. Убедитесь, что mock-объекты правильно настроены

### Проблема: Интеграционные тесты падают
**Решение**:
1. Проверьте конфигурацию тестовой базы данных
2. Убедитесь, что все зависимости доступны
3. Проверьте логи Spring Boot при запуске тестов

### Проблема: JaCoCo не генерирует отчет
**Решение**:
1. Убедитесь, что тесты прошли успешно
2. Проверьте права на запись в директорию `target/`
3. Запустите `./mvnw clean` перед повторным запуском

## Дополнительные ресурсы

- [Документация JaCoCo](https://www.jacoco.org/jacoco/trunk/doc/)
- [Spring Boot Testing](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.testing)
- [Mockito Documentation](https://site.mockito.org/)
- [JUnit 5 Documentation](https://junit.org/junit5/docs/current/user-guide/)