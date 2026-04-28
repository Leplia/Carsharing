import { Link, NavLink, Outlet } from 'react-router-dom';
import '../../styles/pages/SitePages.css';

const MainLayout = () => {
  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="site-container">
          <Link to="/" className="brand">
            <span>🚗</span>
            <strong>CarShare</strong>
          </Link>
          <nav className="site-nav">
            <NavLink to="/home">Главная</NavLink>
            <NavLink to="/about">О сервисе</NavLink>
            <NavLink to="/profile">Профиль</NavLink>
            <NavLink to="/cars">Автопарк</NavLink>
          </nav>
          <div className="site-auth-links">
            <Link to="/login">Вход</Link>
            <Link to="/register" className="site-auth-primary">
              Регистрация
            </Link>
          </div>
        </div>
      </header>
      <main className="site-main">
        <div className="site-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
