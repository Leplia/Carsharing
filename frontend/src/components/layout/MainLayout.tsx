import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Role } from '../../types/auth';
import '../../styles/pages/SitePages.css';

const MainLayout = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isVerified = user?.credentials != null;
  const isSisAdmin = user?.role === Role.SISADMIN;
  const isAdminOrAbove = user?.role === Role.ADMIN || user?.role === Role.SISADMIN;

  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="site-container">
          <Link to={isAuthenticated ? '/map' : '/'} className="brand">
            <strong>CarShare</strong>
          </Link>
          <nav className="site-nav">
            <NavLink to="/map">Карта</NavLink>
            <NavLink to="/cars">Автопарк</NavLink>
            <NavLink to="/about">О сервисе</NavLink>
            {isAuthenticated && <NavLink to="/profile">Профиль</NavLink>}
            {isAdminOrAbove && (
              <NavLink to="/admin-management" className="site-nav-admin">Управление</NavLink>
            )}
            {isSisAdmin && (
              <NavLink to="/admin" className="site-nav-sisadmin">Пользователи</NavLink>
            )}
          </nav>
          <div className="site-auth-links">
            {isAuthenticated ? (
              <>
                {!isVerified && (
                  <Link to="/verification" className="site-verify-badge">
                    Верифицировать
                  </Link>
                )}
                <span className="site-user-greeting">
                  {user?.login}
                  {isVerified && <span className="site-verified-mark" title="Верифицирован">&#10003;</span>}
                </span>
                <button onClick={handleLogout} className="site-logout-btn">
                  Выйти
                </button>
              </>
            ) : (
              <>
                <Link to="/login">Вход</Link>
                <Link to="/register" className="site-auth-primary">
                  Регистрация
                </Link>
              </>
            )}
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
