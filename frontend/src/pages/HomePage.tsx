import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/pages/HomePage.css';

const cars = [
    { name: 'Tesla Model 3', type: 'Электро', price: '7 ₽/мин', color: '#3b82f6' },
    { name: 'BMW X3', type: 'Премиум', price: '9 ₽/мин', color: '#7c3aed' },
    { name: 'Toyota Camry', type: 'Комфорт', price: '6 ₽/мин', color: '#059669' },
    { name: 'Kia Rio', type: 'Эконом', price: '4 ₽/мин', color: '#0891b2' },
];

const HomePage = () => {
    const { user, isAuthenticated } = useAuth();
    const isVerified = !!user?.credentials;

    return (
        <div className="home-page">
            {/* Welcome banner */}
            <div className="home-welcome">
                <div className="home-welcome-text">
                    {isAuthenticated ? (
                        <>
                            <h1>Добро пожаловать, {user?.credentials?.firstName || user?.login}</h1>
                            <p>
                                {isVerified
                                    ? 'Вы верифицированы и готовы к поездкам. Выберите автомобиль!'
                                    : 'Пройдите верификацию, чтобы начать аренду автомобилей.'}
                            </p>
                        </>
                    ) : (
                        <>
                            <h1>Добро пожаловать в CarShare</h1>
                            <p>Войдите или зарегистрируйтесь, чтобы начать пользоваться каршерингом.</p>
                        </>
                    )}
                </div>
                <div className="home-welcome-actions">
                    {isAuthenticated ? (
                        isVerified ? (
                            <Link to="/map" className="home-cta-btn home-cta-primary">
                                Найти авто
                            </Link>
                        ) : (
                            <Link to="/verification" className="home-cta-btn home-cta-warn">
                                Пройти верификацию
                            </Link>
                        )
                    ) : (
                        <>
                            <Link to="/register" className="home-cta-btn home-cta-primary">Зарегистрироваться</Link>
                            <Link to="/login" className="home-cta-btn home-cta-outline">Войти</Link>
                        </>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="home-stats">
                <div className="home-stat">
                    <div className="home-stat-val">520+</div>
                    <div className="home-stat-label">Машин в городе</div>
                </div>
                <div className="home-stat">
                    <div className="home-stat-val">210</div>
                    <div className="home-stat-label">Зон парковки</div>
                </div>
                <div className="home-stat">
                    <div className="home-stat-val">4.9</div>
                    <div className="home-stat-label">Оценка сервиса</div>
                </div>
                <div className="home-stat">
                    <div className="home-stat-val">50k+</div>
                    <div className="home-stat-label">Клиентов</div>
                </div>
            </div>

            {/* Cars */}
            <div className="home-section">
                <div className="home-section-header">
                    <h2>Популярные авто</h2>
                    <Link to="/cars" className="home-see-all">Все автомобили</Link>
                </div>
                <div className="home-cars-grid">
                    {cars.map((car) => (
                        <div key={car.name} className="home-car-card">
                            <div className="home-car-icon" style={{ background: car.color + '20', color: car.color }}>
                                <svg width="22" height="14" viewBox="0 0 22 14" fill="none">
                                    <rect x="1" y="4" width="20" height="8" rx="2" fill="currentColor" opacity="0.4" />
                                    <rect x="4" y="1" width="14" height="6" rx="2" fill="currentColor" opacity="0.3" />
                                    <circle cx="5" cy="12" r="2" fill="currentColor" opacity="0.6" />
                                    <circle cx="17" cy="12" r="2" fill="currentColor" opacity="0.6" />
                                </svg>
                            </div>
                            <div className="home-car-info">
                                <h3>{car.name}</h3>
                                <span className="home-car-type">{car.type}</span>
                            </div>
                            <div className="home-car-price">{car.price}</div>
                            {isVerified ? (
                                <Link to="/map" className="home-car-btn">Забронировать</Link>
                            ) : (
                                <span className="home-car-btn home-car-btn-locked" title="Требуется верификация">
                                    Заблокировано
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick access for authenticated users */}
            {isAuthenticated && (
                <div className="home-section">
                    <h2>Быстрый доступ</h2>
                    <div className="home-quick-grid">
                        <Link to="/map" className="home-quick-card">
                            <div className="home-quick-icon home-quick-icon--map"></div>
                            <div>
                                <strong>Карта</strong>
                                <p>Найти ближайший автомобиль</p>
                            </div>
                        </Link>
                        <Link to="/profile" className="home-quick-card">
                            <div className="home-quick-icon home-quick-icon--profile"></div>
                            <div>
                                <strong>Профиль</strong>
                                <p>Просмотр и редактирование</p>
                            </div>
                        </Link>
                        {!isVerified && (
                            <Link to="/verification" className="home-quick-card home-quick-warn">
                                <div className="home-quick-icon home-quick-icon--shield"></div>
                                <div>
                                    <strong>Верификация</strong>
                                    <p>Подтвердите личность</p>
                                </div>
                            </Link>
                        )}
                        <Link to="/cars" className="home-quick-card">
                            <div className="home-quick-icon home-quick-icon--car"></div>
                            <div>
                                <strong>Автопарк</strong>
                                <p>Доступные автомобили</p>
                            </div>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HomePage;
