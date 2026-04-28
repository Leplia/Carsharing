import React, { useState } from 'react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import BenefitsPanel from '../components/auth/BenefitsPanel';
import authApi from '../api/auth.api';
import { ServiceType } from '../types/auth';
import '../styles/auth/Auth.css';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');
    if (error) {
      setServerError(error);
      return;
    }
    if (!token) return;

    authApi.setAccessTokenFromOAuth(token);
    authApi
      .getCurrentUser()
      .then((user) => {
        if (user) navigate('/profile');
      })
      .catch(() => setServerError('Не удалось выполнить вход через GitHub'));
  }, [navigate, searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors = { email: '', password: '' };
    let isValid = true;

    if (!formData.email.trim()) {
      newErrors.email = 'Email или логин обязательны';
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = 'Пароль обязателен';
      isValid = false;
    } else if ((formData.password as String).length < 6) {
      newErrors.password = 'Пароль должен быть минимум 6 символов';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setServerError('');
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await authApi.login({
        logmail: formData.email.trim(),
        password: formData.password,
        serviceType: ServiceType.LOCAL,
      });
      navigate('/profile');
    } catch (error) {
      console.error('Login error:', error);
      setServerError('Неверные учетные данные или пользователь не найден');
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="auth-container">
        {/* Левая панель с преимуществами */}
        <BenefitsPanel />

        {/* Правая панель с формой */}
        <div className="auth-right">
          <div className="auth-card">
            <div className="auth-header">
              <h1>С возвращением! 👋</h1>
              <p>Войдите в свой аккаунт, чтобы продолжить</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <Input
                  label="Email или логин"
                  name="email"
                  type="text"
                  placeholder="your@email.com или login"
                  value={formData.email}
                  onChange={handleInputChange}
                  error={errors.email}
                  required
              />

              <Input
                  label="Пароль"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  error={errors.password}
                  required
              />

              <div className="auth-options">
                <label className="checkbox-label">
                  <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Запомнить меня</span>
                </label>

                <Link to="/forgot-password" className="auth-link">
                  Забыли пароль?
                </Link>
              </div>

              <Button
                  type="submit"
                  variant="primary"
                  size="large"
                  isLoading={isLoading}
                  fullWidth
              >
                Войти
              </Button>

              <Button
                type="button"
                variant="outline"
                size="large"
                fullWidth
                onClick={() => {
                  window.location.href = 'http://localhost:8080/oauth2/authorization/github';
                }}
              >
                Войти через GitHub
              </Button>

              {serverError && <p className="input-error">{serverError}</p>}
            </form>

            <div className="auth-footer">
              <p>
                Еще нет аккаунта?{' '}
                <Link to="/register" className="auth-link auth-link--primary">
                  Зарегистрироваться
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
  );
};

export default LoginPage;