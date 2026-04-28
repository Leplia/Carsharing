const CarsPage = () => {
  return (
    <section className="page">
      <h1>Автопарк</h1>
      <p className="page-subtitle">Выберите класс авто и бронируйте ближайшую машину.</p>
      <div className="cards-grid">
        <article className="info-card">
          <h3>Эконом</h3>
          <p>От 4 ₽/мин</p>
        </article>
        <article className="info-card">
          <h3>Комфорт</h3>
          <p>От 6 ₽/мин</p>
        </article>
        <article className="info-card">
          <h3>Премиум</h3>
          <p>От 9 ₽/мин</p>
        </article>
      </div>
    </section>
  );
};

export default CarsPage;
