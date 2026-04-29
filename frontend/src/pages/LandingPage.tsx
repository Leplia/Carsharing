import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import '../styles/LandingPage.css';

const LandingPage: React.FC = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const featuresRef = useRef<HTMLElement>(null);
    const howItWorksRef = useRef<HTMLElement>(null);
    const carsRef = useRef<HTMLElement>(null);
    const reviewsRef = useRef<HTMLElement>(null);
    const faqRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (ref: React.RefObject<HTMLElement | null>) => {
        if (ref.current) {
            const offset = 80;
            const elementPosition = ref.current.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }
    };

    return (
        <div className="landing">
            {/* Навигация */}
            <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
                <div className="nav-container">
                    <div className="nav-logo">
                        <span className="logo-text">CarShare</span>
                    </div>
                    <div className="nav-links">
                        <button onClick={() => scrollToSection(featuresRef)} className="nav-link-btn">Возможности</button>
                        <button onClick={() => scrollToSection(howItWorksRef)} className="nav-link-btn">Как это работает</button>
                        <button onClick={() => scrollToSection(carsRef)} className="nav-link-btn">Автомобили</button>
                        <button onClick={() => scrollToSection(reviewsRef)} className="nav-link-btn">Отзывы</button>
                        <button onClick={() => scrollToSection(faqRef)} className="nav-link-btn">FAQ</button>
                    </div>
                    <div className="nav-buttons">
                        <Link to="/login" className="nav-btn nav-btn-outline">Войти</Link>
                        <Link to="/register" className="nav-btn nav-btn-primary">Регистрация</Link>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className="hero">
                <div className="hero-background">
                    <div className="hero-shape hero-shape-1"></div>
                    <div className="hero-shape hero-shape-2"></div>
                    <div className="hero-shape hero-shape-3"></div>
                </div>
                <div className="hero-content">
                    <div className="hero-text">
                        <h1 className="hero-title">
                            <span className="title-line">Арендуй авто мечты</span>
                            <span className="title-line gradient-text">за 5 ₽/минута</span>
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
                                <span className="cta-arrow">&#8594;</span>
                            </Link>
                            <button onClick={() => scrollToSection(carsRef)} className="cta-button cta-secondary">
                                Посмотреть авто
                            </button>
                        </div>
                        <div className="hero-badges">
                            <div className="badge"><span>Без документов</span></div>
                            <div className="badge"><span>Без залога</span></div>
                            <div className="badge"><span>КАСКО включено</span></div>
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
                                <div className="car-placeholder-block">
                                    <svg width="120" height="60" viewBox="0 0 120 60" fill="none">
                                        <rect x="10" y="20" width="100" height="28" rx="8" fill="rgba(255,255,255,0.15)" />
                                        <rect x="25" y="10" width="70" height="22" rx="6" fill="rgba(255,255,255,0.1)" />
                                        <circle cx="28" cy="50" r="8" fill="rgba(255,255,255,0.2)" />
                                        <circle cx="92" cy="50" r="8" fill="rgba(255,255,255,0.2)" />
                                    </svg>
                                    <span>Tesla Model 3</span>
                                </div>
                            </div>
                            <div className="car-features">
                                <div className="feature-tag">Электро</div>
                                <div className="feature-tag">Автомат</div>
                                <div className="feature-tag">Люкс</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="hero-scroll">
                    <div className="scroll-mouse"><div className="scroll-wheel"></div></div>
                    <span>Листайте вниз</span>
                </div>
            </section>

            {/* Преимущества */}
            <section className="slider-section" ref={featuresRef} id="features">
                <div className="container">
                    <div className="section-header">
                        <h2>Почему выбирают нас</h2>
                        <p>Мы создали сервис, которым приятно пользоваться</p>
                    </div>
                    <div className="features-grid">
                        {[
                            { num: '01', title: 'Мгновенная аренда', desc: 'Арендуйте автомобиль за 2 минуты без очередей и бумажной волокиты.', stat: 'Среднее время аренды: 2.3 мин' },
                            { num: '02', title: 'Полная безопасность', desc: 'Все автомобили застрахованы по КАСКО и проходят ежедневное ТО.', stat: '0 аварий с начала года' },
                            { num: '03', title: 'Доступные цены', desc: 'От 5 ₽ за минуту. Специальные тарифы на длительную аренду.', stat: 'Экономия до 30%' },
                            { num: '04', title: 'Удобное расположение', desc: 'Более 200 парковок по всему городу. Всегда есть автомобиль рядом.', stat: 'Среднее расстояние: 300 м' },
                            { num: '05', title: 'Круглосуточная поддержка', desc: 'Работаем 24/7. Помогаем с любыми вопросами.', stat: 'Время ответа: до 30 сек' },
                            { num: '06', title: 'Новые автомобили', desc: 'Обновляем автопарк каждый год. Все автомобили не старше 2 лет.', stat: 'Средний возраст авто: 1.5 года' },
                        ].map(f => (
                            <div key={f.num} className="feature-item">
                                <div className="feature-number">{f.num}</div>
                                <div className="feature-content">
                                    <h3>{f.title}</h3>
                                    <p>{f.desc}</p>
                                    <div className="feature-stats"><span>{f.stat}</span></div>
                                </div>
                            </div>
                        ))}
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
                        {[
                            { n: '1', title: 'Скачайте приложение', desc: 'Доступно в App Store и Google Play' },
                            { n: '2', title: 'Зарегистрируйтесь', desc: 'Заполните анкету за 2 минуты' },
                            { n: '3', title: 'Найдите авто', desc: 'Выберите ближайший автомобиль' },
                            { n: '4', title: 'Поехали', desc: 'Открывайте и управляйте через приложение' },
                        ].map(s => (
                            <div key={s.n} className="step-card">
                                <div className="step-number">{s.n}</div>
                                <h3>{s.title}</h3>
                                <p>{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Автопарк */}
            <section className="cars-preview" id="cars" ref={carsRef}>
                <div className="container">
                    <div className="section-header">
                        <h2>Наш автопарк</h2>
                        <p>Более 500 автомобилей на любой вкус</p>
                    </div>
                    <div className="cars-grid">
                        {[
                            { name: 'Tesla Model 3', type: 'Электро', price: '7 ₽/мин' },
                            { name: 'BMW X5', type: 'Премиум', price: '9 ₽/мин' },
                            { name: 'Toyota Camry', type: 'Комфорт', price: '5 ₽/мин' },
                            { name: 'Kia Rio', type: 'Эконом', price: '4 ₽/мин' },
                        ].map((car, index) => (
                            <div key={index} className="car-preview-card">
                                <div className="car-preview-icon-svg">
                                    <svg width="48" height="28" viewBox="0 0 48 28" fill="none">
                                        <rect x="2" y="10" width="44" height="14" rx="4" fill="currentColor" opacity="0.3" />
                                        <rect x="10" y="4" width="28" height="12" rx="3" fill="currentColor" opacity="0.2" />
                                        <circle cx="11" cy="24" r="4" fill="currentColor" opacity="0.5" />
                                        <circle cx="37" cy="24" r="4" fill="currentColor" opacity="0.5" />
                                    </svg>
                                </div>
                                <h3>{car.name}</h3>
                                <p className="car-preview-type">{car.type}</p>
                                <div className="car-preview-price">{car.price}</div>
                                <Link to="/register" className="car-preview-link">
                                    Арендовать
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
                            { name: 'Алексей Иванов', rating: 5, text: 'Отличный сервис! Машины всегда чистые, приложение работает отлично.' },
                            { name: 'Мария Петрова', rating: 5, text: 'Очень удобно, когда нужно быстро куда-то доехать. Цены приятные.' },
                            { name: 'Дмитрий Сидоров', rating: 4, text: 'Большой выбор авто, всегда есть свободные машины рядом.' },
                        ].map((review, index) => (
                            <div key={index} className="review-card">
                                <div className="review-avatar-text">{review.name[0]}</div>
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

            {/* FAQ */}
            <section className="faq" id="faq" ref={faqRef}>
                <div className="container">
                    <div className="section-header">
                        <h2>Часто задаваемые вопросы</h2>
                        <p>Всё, что нужно знать о нашем сервисе</p>
                    </div>
                    <div className="faq-grid">
                        <div className="faq-item">
                            <h3>Как начать пользоваться?</h3>
                            <p>Скачайте приложение, зарегистрируйтесь, загрузите права и привяжите карту. Всё займёт не больше 5 минут.</p>
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

            {/* CTA */}
            <section className="cta-section">
                <div className="container">
                    <div className="cta-card">
                        <h2>Готовы начать?</h2>
                        <p>Присоединяйтесь к тысячам довольных клиентов прямо сейчас</p>
                        <div className="cta-buttons">
                            <Link to="/register" className="cta-button cta-primary cta-large">Создать аккаунт</Link>
                            <Link to="/login" className="cta-button cta-outline cta-large">Войти</Link>
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
                            <p>Городской каршеринг</p>
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
                        <p>&copy; 2024 CarShare. Все права защищены.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
