import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import '../styles/LandingPage.css';

const LandingPage: React.FC = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    // Рефы для секций (для плавного скролла)
    const featuresRef = useRef<HTMLElement>(null);
    const howItWorksRef = useRef<HTMLElement>(null);
    const carsRef = useRef<HTMLElement>(null);
    const reviewsRef = useRef<HTMLElement>(null);
    const faqRef = useRef<HTMLElement>(null);

    // Отслеживаем скролл для изменения навбара
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Функция для плавного скролла
    const scrollToSection = (ref: React.RefObject<HTMLElement | null>) => {
        if (ref.current) {
            const offset = 80; // Высота навбара
            const elementPosition = ref.current.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="landing">
            {/* Навигация */}
            <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
                <div className="nav-container">
                    <div className="nav-logo">
                        <span className="logo-icon">🚗</span>
                        <span className="logo-text">CarShare</span>
                    </div>

                    <div className="nav-links">
                        <button
                            onClick={() => scrollToSection(featuresRef)}
                            className="nav-link-btn"
                        >
                            Возможности
                        </button>
                        <button
                            onClick={() => scrollToSection(howItWorksRef)}
                            className="nav-link-btn"
                        >
                            Как это работает
                        </button>
                        <button
                            onClick={() => scrollToSection(carsRef)}
                            className="nav-link-btn"
                        >
                            Автомобили
                        </button>
                        <button
                            onClick={() => scrollToSection(reviewsRef)}
                            className="nav-link-btn"
                        >
                            Отзывы
                        </button>
                        <button
                            onClick={() => scrollToSection(faqRef)}
                            className="nav-link-btn"
                        >
                            FAQ
                        </button>
                    </div>

                    <div className="nav-buttons">
                        <Link to="/login" className="nav-btn nav-btn-outline">Войти</Link>
                        <Link to="/register" className="nav-btn nav-btn-primary">Регистрация</Link>
                    </div>
                </div>
            </nav>

            {/* Hero секция */}
            <section className="hero">
                {/* ... (оставляем без изменений) ... */}
                <div className="hero-background">
                    <div className="hero-shape hero-shape-1"></div>
                    <div className="hero-shape hero-shape-2"></div>
                    <div className="hero-shape hero-shape-3"></div>
                </div>

                <div className="hero-content">
                    <div className="hero-text">
                        <h1 className="hero-title">
                            <span className="title-line">Арендуй авто мечты</span>
                            <span className="title-line gradient-text">за 5₽/минута</span>
                        </h1>
                        <p className="hero-description">
                            Более 500 автомобилей по всему городу. Без залогов, без ограничений.
                            Каршеринг, который действительно удобен.
                        </p>

                        <div className="hero-stats">
                            <div className="stat-card">
                                <div className="stat-value">50 000+</div>
                                <div className="stat-label">Довольных клиентов</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-value">500+</div>
                                <div className="stat-label">Автомобилей</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-value">200+</div>
                                <div className="stat-label">Парковок</div>
                            </div>
                        </div>

                        <div className="hero-cta">
                            <Link to="/register" className="cta-button cta-primary">
                                Начать пользоваться
                                <span className="cta-arrow">→</span>
                            </Link>
                            <button
                                onClick={() => scrollToSection(carsRef)}
                                className="cta-button cta-secondary"
                            >
                                Посмотреть авто
                            </button>
                        </div>

                        <div className="hero-badges">
                            <div className="badge">
                                <span>✅ Без документов</span>
                            </div>
                            <div className="badge">
                                <span>✅ Без залога</span>
                            </div>
                            <div className="badge">
                                <span>✅ КАСКО включено</span>
                            </div>
                        </div>
                    </div>

                    <div className="hero-image">
                        <div className="car-showcase">
                            <div className="car-circles">
                                <div className="circle circle-1"></div>
                                <div className="circle circle-2"></div>
                                <div className="circle circle-3"></div>
                            </div>
                            <div className="car-model">
                                <img
                                    src="https://via.placeholder.com/600x400/3b82f6/ffffff?text=Tesla+Model+3"
                                    alt="Tesla Model 3"
                                    className="car-image"
                                />
                            </div>
                            <div className="car-features">
                                <div className="feature-tag">⚡ Электро</div>
                                <div className="feature-tag">🔄 Автомат</div>
                                <div className="feature-tag">🌟 Люкс</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="hero-scroll">
                    <div className="scroll-mouse">
                        <div className="scroll-wheel"></div>
                    </div>
                    <span>Листайте вниз</span>
                </div>
            </section>

            {/* Слайдер преимуществ */}
            <section className="slider-section" ref={featuresRef} id="features">
                <div className="container">
                    <div className="section-header">
                        <h2>Почему выбирают нас</h2>
                        <p>Мы создали сервис, которым приятно пользоваться</p>
                    </div>

                    <div className="features-grid">
                        {/* Пункт 1 */}
                        <div className="feature-item">
                            <div className="feature-number">01</div>
                            <div className="feature-content">
                                <div className="feature-icon-wrapper">
                                    <span className="feature-icon">⚡</span>
                                </div>
                                <h3>Мгновенная аренда</h3>
                                <p>Арендуйте автомобиль за 2 минуты без очередей и бумажной волокиты. Просто скачайте приложение и поезжайте.</p>
                                <div className="feature-stats">
                                    <span>Среднее время аренды: 2.3 мин</span>
                                </div>
                            </div>
                        </div>

                        {/* Пункт 2 */}
                        <div className="feature-item">
                            <div className="feature-number">02</div>
                            <div className="feature-content">
                                <div className="feature-icon-wrapper">
                                    <span className="feature-icon">🛡️</span>
                                </div>
                                <h3>Полная безопасность</h3>
                                <p>Все автомобили застрахованы по КАСКО и проходят ежедневное техническое обслуживание. Ваша безопасность - наш приоритет.</p>
                                <div className="feature-stats">
                                    <span>0 аварий с начала года</span>
                                </div>
                            </div>
                        </div>

                        {/* Пункт 3 */}
                        <div className="feature-item">
                            <div className="feature-number">03</div>
                            <div className="feature-content">
                                <div className="feature-icon-wrapper">
                                    <span className="feature-icon">💰</span>
                                </div>
                                <h3>Доступные цены</h3>
                                <p>От 5₽ за минуту. Специальные тарифы на длительную аренду и ночные поездки. Экономьте с нами.</p>
                                <div className="feature-stats">
                                    <span>Экономия до 30%</span>
                                </div>
                            </div>
                        </div>

                        {/* Пункт 4 */}
                        <div className="feature-item">
                            <div className="feature-number">04</div>
                            <div className="feature-content">
                                <div className="feature-icon-wrapper">
                                    <span className="feature-icon">📍</span>
                                </div>
                                <h3>Удобное расположение</h3>
                                <p>Более 200 парковок по всему городу. Всегда есть автомобиль рядом с вами. Находите ближайшее авто в приложении.</p>
                                <div className="feature-stats">
                                    <span>Среднее расстояние: 300м</span>
                                </div>
                            </div>
                        </div>

                        {/* Пункт 5 */}
                        <div className="feature-item">
                            <div className="feature-number">05</div>
                            <div className="feature-content">
                                <div className="feature-icon-wrapper">
                                    <span className="feature-icon">🔄</span>
                                </div>
                                <h3>Круглосуточная поддержка</h3>
                                <p>Мы работаем 24/7. Помогаем с любыми вопросами: от аренды до экстренных ситуаций на дороге.</p>
                                <div className="feature-stats">
                                    <span>Время ответа: до 30 сек</span>
                                </div>
                            </div>
                        </div>

                        {/* Пункт 6 */}
                        <div className="feature-item">
                            <div className="feature-number">06</div>
                            <div className="feature-content">
                                <div className="feature-icon-wrapper">
                                    <span className="feature-icon">✨</span>
                                </div>
                                <h3>Новые автомобили</h3>
                                <p>Обновляем автопарк каждый год. Все автомобили не старше 2 лет. Чистые, ухоженные, технически исправные.</p>
                                <div className="feature-stats">
                                    <span>Средний возраст авто: 1.5 года</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Как это работает */}
            <section className="how-it-works" id="how-it-works" ref={howItWorksRef}>
                <div className="container">
                    <div className="section-header">
                        <h2>Как это работает</h2>
                        <p>Всего 4 простых шага до поездки</p>
                    </div>

                    <div className="steps-grid">
                        <div className="step-card">
                            <div className="step-number">1</div>
                            <div className="step-icon">📱</div>
                            <h3>Скачайте приложение</h3>
                            <p>Доступно в App Store и Google Play</p>
                        </div>

                        <div className="step-card">
                            <div className="step-number">2</div>
                            <div className="step-icon">📝</div>
                            <h3>Зарегистрируйтесь</h3>
                            <p>Заполните анкету за 2 минуты</p>
                        </div>

                        <div className="step-card">
                            <div className="step-number">3</div>
                            <div className="step-icon">🔑</div>
                            <h3>Найдите авто</h3>
                            <p>Выберите ближайший автомобиль</p>
                        </div>

                        <div className="step-card">
                            <div className="step-number">4</div>
                            <div className="step-icon">🚗</div>
                            <h3>Поехали!</h3>
                            <p>Открывайте и управляйте через приложение</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Парк автомобилей */}
            <section className="cars-preview" id="cars" ref={carsRef}>
                <div className="container">
                    <div className="section-header">
                        <h2>Наш автопарк</h2>
                        <p>Более 500 автомобилей на любой вкус</p>
                    </div>

                    <div className="cars-grid">
                        {[
                            { name: 'Tesla Model 3', type: 'Электро', price: '7₽/мин', image: '🚗' },
                            { name: 'BMW X5', type: 'Премиум', price: '9₽/мин', image: '🚙' },
                            { name: 'Toyota Camry', type: 'Комфорт', price: '5₽/мин', image: '🚘' },
                            { name: 'Kia Rio', type: 'Эконом', price: '4₽/мин', image: '🚖' },
                        ].map((car, index) => (
                            <div key={index} className="car-preview-card">
                                <div className="car-preview-icon">{car.image}</div>
                                <h3>{car.name}</h3>
                                <p className="car-preview-type">{car.type}</p>
                                <div className="car-preview-price">{car.price}</div>
                                <Link to={`/car/${index}`} className="car-preview-link">
                                    Подробнее →
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Отзывы */}
            <section className="reviews" id="reviews" ref={reviewsRef}>
                <div className="container">
                    <div className="section-header">
                        <h2>Что говорят клиенты</h2>
                        <p>Более 50 000 человек уже с нами</p>
                    </div>

                    <div className="reviews-grid">
                        {[
                            { name: 'Алексей Иванов', rating: 5, text: 'Отличный сервис! Машины всегда чистые, приложение работает отлично.', avatar: '👨' },
                            { name: 'Мария Петрова', rating: 5, text: 'Очень удобно, когда нужно быстро куда-то доехать. Цены приятные.', avatar: '👩' },
                            { name: 'Дмитрий Сидоров', rating: 4, text: 'Большой выбор авто, всегда есть свободные машины рядом.', avatar: '👨' },
                        ].map((review, index) => (
                            <div key={index} className="review-card">
                                <div className="review-avatar">{review.avatar}</div>
                                <div className="review-info">
                                    <h4>{review.name}</h4>
                                    <div className="review-rating">
                                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                    </div>
                                </div>
                                <p className="review-text">{review.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ секция */}
            <section className="faq" id="faq" ref={faqRef}>
                <div className="container">
                    <div className="section-header">
                        <h2>Часто задаваемые вопросы</h2>
                        <p>Всё, что нужно знать о нашем сервисе</p>
                    </div>

                    <div className="faq-grid">
                        <div className="faq-item">
                            <h3>Как начать пользоваться?</h3>
                            <p>Скачайте приложение, зарегистрируйтесь, загрузите права и привяжите карту. Всё займет не больше 5 минут.</p>
                        </div>
                        <div className="faq-item">
                            <h3>Сколько стоит аренда?</h3>
                            <p>От 5 рублей за минуту. Цена зависит от класса автомобиля и времени суток.</p>
                        </div>
                        <div className="faq-item">
                            <h3>Где можно парковаться?</h3>
                            <p>В любом месте, где разрешена парковка. Также есть специальные парковки для каршеринга.</p>
                        </div>
                        <div className="faq-item">
                            <h3>Что со страховкой?</h3>
                            <p>Все поездки застрахованы. КАСКО и ОСАГО включены в стоимость.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA секция */}
            <section className="cta-section">
                <div className="container">
                    <div className="cta-card">
                        <h2>Готовы начать?</h2>
                        <p>Присоединяйтесь к тысячам довольных клиентов прямо сейчас</p>
                        <div className="cta-buttons">
                            <Link to="/register" className="cta-button cta-primary cta-large">
                                Создать аккаунт
                            </Link>
                            <Link to="/login" className="cta-button cta-outline cta-large">
                                Войти
                            </Link>
                        </div>
                        <div className="cta-apps">
                            <span>Доступно на:</span>
                            <div className="app-badges">
                                <div className="app-badge">
                                    <span className="app-icon">🍎</span>
                                    <div className="app-text">
                                        <small>Загрузите в</small>
                                        <strong>App Store</strong>
                                    </div>
                                </div>
                                <div className="app-badge">
                                    <span className="app-icon">📱</span>
                                    <div className="app-text">
                                        <small>Доступно в</small>
                                        <strong>Google Play</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-section">
                            <h3>CarShare</h3>
                            <p>Самый удобный каршеринг в городе</p>
                            <div className="social-links">
                                <a href="#" className="social-link">📘</a>
                                <a href="#" className="social-link">📷</a>
                                <a href="#" className="social-link">🐦</a>
                                <a href="#" className="social-link">📺</a>
                            </div>
                        </div>

                        <div className="footer-section">
                            <h4>О нас</h4>
                            <a href="#">О компании</a>
                            <a href="#">Вакансии</a>
                            <a href="#">Блог</a>
                            <a href="#">Контакты</a>
                        </div>

                        <div className="footer-section">
                            <h4>Пользователям</h4>
                            <a href="#">Как это работает</a>
                            <a href="#">Тарифы</a>
                            <a href="#">Парковки</a>
                            <a href="#">Помощь</a>
                        </div>

                        <div className="footer-section">
                            <h4>Правовая информация</h4>
                            <a href="#">Условия использования</a>
                            <a href="#">Политика конфиденциальности</a>
                            <a href="#">Правила аренды</a>
                        </div>
                    </div>

                    <div className="footer-bottom">
                        <p>© 2024 CarShare. Все права защищены.</p>
                        <p>Сделано с ❤️ для удобной аренды автомобилей</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;