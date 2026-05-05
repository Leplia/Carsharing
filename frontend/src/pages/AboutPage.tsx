import React from 'react';
import '../styles/pages/AboutPage.css';

const AboutPage: React.FC = () => {
  return (
    <div className="about-page">
      <div className="about-header">
        <h1>О сервисе CarShare</h1>
        <p className="about-subtitle">
          Современный каршеринг для быстрых, удобных и экологичных поездок по городу.
          Без очередей, без бумажных договоров, только свобода передвижения.
        </p>
      </div>

      <div className="about-hero">
        <div className="hero-content">
          <h2>Ваша свобода передвижения — наш приоритет</h2>
          <p>
            CarShare — это инновационный сервис каршеринга, который меняет представление 
            о городской мобильности. Мы предлагаем современные автомобили, простую 
            систему бронирования и круглосуточную поддержку.
          </p>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">500+</span>
              <span className="stat-label">Автомобилей</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">24/7</span>
              <span className="stat-label">Поддержка</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">50k+</span>
              <span className="stat-label">Довольных клиентов</span>
            </div>
          </div>
        </div>
        <div className="hero-image">
          🚗
        </div>
      </div>

      <div className="about-features">
        <h2 className="section-title">Наши преимущества</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Быстро и удобно</h3>
            <p>
              Бронируйте автомобиль за 2 минуты через приложение. 
              Никаких очередей и бумажной волокиты.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🌱</div>
            <h3>Экологично</h3>
            <p>
              Современные автомобили с низким уровнем выбросов. 
              Вносите вклад в чистоту города.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🛡️</div>
            <h3>Безопасно</h3>
            <p>
              Все автомобили застрахованы и проходят регулярное 
              техническое обслуживание.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💰</div>
            <h3>Доступно</h3>
            <p>
              Прозрачные тарифы без скрытых платежей. 
              Оплачивайте только за время использования.
            </p>
          </div>
        </div>
      </div>

      <div className="about-how-it-works">
        <h2 className="section-title">Как это работает</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Найдите автомобиль</h3>
            <p>
              Откройте карту в приложении и выберите ближайший доступный автомобиль. 
              Посмотрите фото, характеристики и текущее местоположение.
            </p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Забронируйте</h3>
            <p>
              Нажмите кнопку "Забронировать" и подтвердите бронирование. 
              Автомобиль будет зарезервирован для вас на 15 минут.
            </p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Начните поездку</h3>
            <p>
              Подойдите к автомобилю, откройте его через приложение 
              и начните поездку. Топливо и страховка уже включены.
            </p>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <h3>Завершите поездку</h3>
            <p>
              Оставьте автомобиль в разрешенной зоне парковки, 
              завершите поездку в приложении и оплатите автоматически.
            </p>
          </div>
        </div>
      </div>

      <div className="about-policies">
        <h2 className="section-title">Политики и правила</h2>
        <div className="policies-grid">
          <div className="policy-card">
            <h3><span className="policy-icon">📋</span> Условия использования</h3>
            <ul className="policy-list">
              <li>Минимальный возраст водителя — 21 год</li>
              <li>Стаж вождения — от 2 лет</li>
              <li>Действующие водительские права категории B</li>
              <li>Отсутствие серьезных нарушений ПДД</li>
              <li>Подтвержденная личность через верификацию</li>
            </ul>
          </div>
          <div className="policy-card">
            <h3><span className="policy-icon">💳</span> Тарифы и оплата</h3>
            <ul className="policy-list">
              <li>Минута вождения — от 4 ₽</li>
              <li>Минимальная поездка — 10 минут</li>
              <li>Бесплатная отмена за 5 минут до начала</li>
              <li>Оплата картой или электронными кошельками</li>
              <li>Прозрачная система скидок для постоянных клиентов</li>
            </ul>
          </div>
          <div className="policy-card">
            <h3><span className="policy-icon">🚗</span> Правила парковки</h3>
            <ul className="policy-list">
              <li>Парковка только в разрешенных зонах</li>
              <li>Запрещена парковка на частных территориях</li>
              <li>Обязательная фотофиксация при завершении поездки</li>
              <li>Штраф за неп��авильную парковку — 1000 ₽</li>
              <li>Возможность завершить поездку в любой точке города</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="about-contact">
        <h2 className="contact-title">Остались вопросы?</h2>
        <p className="contact-description">
          Наша команда поддержки всегда готова помочь вам. 
          Свяжитесь с нами любым удобным способом.
        </p>
        <div className="contact-info">
          <div className="contact-item">
            <span className="contact-icon">📞</span>
            <span>8 (800) 555-35-35</span>
          </div>
          <div className="contact-item">
            <span className="contact-icon">✉️</span>
            <span>support@carshare.ru</span>
          </div>
          <div className="contact-item">
            <span className="contact-icon">🕒</span>
            <span>Круглосуточно, 7 дней в неделю</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;