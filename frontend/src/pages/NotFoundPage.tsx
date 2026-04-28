import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <section className="page page-center">
      <h1>404</h1>
      <p className="page-subtitle">Страница не найдена</p>
      <Link to="/home" className="back-link">
        Вернуться на главную
      </Link>
    </section>
  );
};

export default NotFoundPage;
