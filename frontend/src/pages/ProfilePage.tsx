const ProfilePage = () => {
  return (
    <section className="page">
      <h1>Профиль</h1>
      <p className="page-subtitle">Основная информация о пользователе и поездках.</p>

      <div className="profile-box">
        <h2>Иван Иванов</h2>
        <p>Email: ivan@example.com</p>
        <p>Телефон: +7 999 123-45-67</p>
        <p>Статус: Активный пользователь</p>
      </div>

      <h2>Последние поездки</h2>
      <ul className="simple-list">
        <li>Tesla Model 3 - 42 мин - 294 ₽</li>
        <li>Kia Rio - 18 мин - 72 ₽</li>
        <li>Toyota Camry - 55 мин - 330 ₽</li>
      </ul>
    </section>
  );
};

export default ProfilePage;
