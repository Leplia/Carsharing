const cars = [
  { name: 'Tesla Model 3', type: 'Электро', price: '7 ₽/мин' },
  { name: 'BMW X3', type: 'Премиум', price: '9 ₽/мин' },
  { name: 'Toyota Camry', type: 'Комфорт', price: '6 ₽/мин' },
  { name: 'Kia Rio', type: 'Эконом', price: '4 ₽/мин' },
];

const HomePage = () => {
  return (
    <section className="page">
      <h1>Главная</h1>
      <p className="page-subtitle">
        Быстрый доступ к аренде, тарифам и ближайшим автомобилям.
      </p>

      <div className="stats-grid">
        <article>
          <h3>520+</h3>
          <p>машин в городе</p>
        </article>
        <article>
          <h3>210</h3>
          <p>зон парковки</p>
        </article>
        <article>
          <h3>4.9/5</h3>
          <p>оценка сервиса</p>
        </article>
      </div>

      <h2>Популярные авто</h2>
      <div className="cards-grid">
        {cars.map((car) => (
          <article key={car.name} className="info-card">
            <h3>{car.name}</h3>
            <p>{car.type}</p>
            <strong>{car.price}</strong>
          </article>
        ))}
      </div>
    </section>
  );
};

export default HomePage;
