import React from 'react';

const BenefitsPanel: React.FC = () => {
    return (
        <div className="auth-benefits">
            <div className="benefits-logo">
                <h1>🚗 CarShare</h1>
                <p>Каршеринг твоей мечты</p>
            </div>

            <div className="benefits-title">
                <h2>Почему выбирают нас?</h2>
                <p>Присоединяйтесь к тысячам довольных клиентов</p>
            </div>

            <div className="benefits-list">
                <div className="benefit-item">
                    <div className="benefit-icon">⚡</div>
                    <div className="benefit-content">
                        <h3>Мгновенная аренда</h3>
                        <p>Арендуйте авто за 2 минуты без очередей и бумажной волокиты</p>
                    </div>
                </div>

                <div className="benefit-item">
                    <div className="benefit-icon">🔒</div>
                    <div className="benefit-content">
                        <h3>Полная безопасность</h3>
                        <p>Все автомобили застрахованы и проходят регулярное ТО</p>
                    </div>
                </div>

                <div className="benefit-item">
                    <div className="benefit-icon">💰</div>
                    <div className="benefit-content">
                        <h3>Доступные цены</h3>
                        <p>От 5₽/минута. Специальные тарифы на длительную аренду</p>
                    </div>
                </div>

                <div className="benefit-item">
                    <div className="benefit-icon">📍</div>
                    <div className="benefit-content">
                        <h3>Удобное расположение</h3>
                        <p>Более 200 парковок по всему городу. Всегда есть авто рядом</p>
                    </div>
                </div>

                <div className="benefit-item">
                    <div className="benefit-icon">🔄</div>
                    <div className="benefit-content">
                        <h3>Круглосуточная поддержка</h3>
                        <p>24/7 помогаем с любыми вопросами. Всегда на связи</p>
                    </div>
                </div>
            </div>

            <div className="benefits-stats">
                <div className="stat-item">
                    <div className="stat-number">50 000+</div>
                    <div className="stat-label">Клиентов</div>
                </div>
                <div className="stat-item">
                    <div className="stat-number">500+</div>
                    <div className="stat-label">Автомобилей</div>
                </div>
                <div className="stat-item">
                    <div className="stat-number">4.9 ★</div>
                    <div className="stat-label">Рейтинг</div>
                </div>
            </div>
        </div>
    );
};

export default BenefitsPanel;