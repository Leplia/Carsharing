import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../components/common/Input';
import Button from '../components/common/Button.tsx';
import '../styles/auth/Auth.css'; // Общий CSS для страниц авторизации

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  // useState с типизацией состояния
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });
  
  const [isLoading, setIsLoading] = useState(false);

  // Обработчик изменения полей формы
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Обновляем состояние формы
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Очищаем ошибку при изменении поля
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Валидация формы
  const validateForm = (): boolean => {
    const newErrors = {
      email: '',
      password: '',
    };
    
    let isValid = true;
    
    // Валидация email
    if (!formData.email.trim()) {
      newErrors.email = 'Email обязателен';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Некорректный email';
      isValid = false;
    }
    
    // Валидация пароля
    if (!formData.password) {
      newErrors.password = 'Пароль обязателен';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Пароль должен быть минимум 6 символов';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  // Отправка формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Здесь будет запрос к API
      console.log('Login data:', formData);
      
      // Имитация запроса
      await new Promise(resolve => setTimeout(resolve, 1500));

      // После успешного логина:
      // 1. Сохраняем токен в localStorage (пока заглушка)
      // 2. Перенаправляем пользователя, например, на страницу автомобилей
      localStorage.setItem('authToken', 'dummy-token');

      navigate('/cars');
    } catch (error) {
      console.error('Login error:', error);
      alert('Ошибка при входе. Проверьте данные.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Вход в каршеринг</h1>
          <p className="auth-subtitle">
            Добро пожаловать! Войдите в свой аккаунт.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="your@email.com"
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
              <input type="checkbox" />
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
        </form>
        
        <div className="auth-footer">
          <p className="auth-footer-text">
            Еще нет аккаунта?{' '}
            <Link to="/register" className="auth-link auth-link--primary">
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;