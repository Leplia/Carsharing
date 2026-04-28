const AboutPage = () => {
  return (
    <section className="page">
      <h1>О сервисе CarShare</h1>
      <p className="page-subtitle">
        CarShare - городской каршеринг для быстрых поездок без очередей и бумажных
        договоров.
      </p>

      <div className="cards-grid">
        <article className="info-card">
          <h3>Миссия</h3>
          <p>Сделать передвижение по городу удобным, доступным и экологичным.</p>
        </article>
        <article className="info-card">
          <h3>Безопасность</h3>
          <p>Каждый автомобиль проходит регулярное техобслуживание и мойку.</p>
        </article>
        <article className="info-card">
          <h3>Поддержка 24/7</h3>
          <p>Команда поддержки всегда на связи в чате и по телефону.</p>
        </article>
      </div>
    </section>
  );
};

export default AboutPage;
