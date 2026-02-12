import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../components/common/Input';
import Button from '../components/common/Button.tsx';
import '../styles/auth/Auth.css';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors = {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    };
    
    let isValid = true;
    
    // Валидация имени
    if (!formData.name.trim()) {
      newErrors.name = 'Имя обязательно';
      isValid = false;
    }
    
    // Валидация email
    if (!formData.email.trim()) {
      newErrors.email = 'Email обязателен';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Некорректный email';
      isValid = false;
    }
    
    // Валидация телефона (опционально)
    if (formData.phone && !/^\+7\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Некорректный телефон (формат: +7XXXXXXXXXX)';
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
    
    // Подтверждение пароля
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Здесь будет запрос к API регистрации
      console.log('Register data:', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });
      
      await new Promise(resolve => setTimeout(resolve, 1500));

      // После успешной регистрации перенаправляем на страницу логина
      navigate('/login');
    } catch (error) {
      console.error('Register error:', error);
      alert('Ошибка при регистрации');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Регистрация в каршеринге</h1>
          <p className="auth-subtitle">
            Создайте аккаунт, чтобы начать арендовать автомобили
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <Input
            label="ФИО"
            name="name"
            placeholder="Иванов Иван Иванович"
            value={formData.name}
            onChange={handleInputChange}
            error={errors.name}
            required
          />
          
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
            label="Телефон (опционально)"
            name="phone"
            placeholder="+7XXXXXXXXXX"
            value={formData.phone}
            onChange={handleInputChange}
            error={errors.phone}
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
          
          <Input
            label="Подтвердите пароль"
            name="confirmPassword"
            type="password"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            error={errors.confirmPassword}
            required
          />
          
          <div className="auth-terms">
            <label className="checkbox-label">
              <input type="checkbox" required />
              <span>
                Я согласен с{' '}
                <Link to="/terms" className="auth-link">
                  условиями использования
                </Link>{' '}
                и{' '}
                <Link to="/privacy" className="auth-link">
                  политикой конфиденциальности
                </Link>
              </span>
            </label>
          </div>
          
          <Button
            type="submit"
            variant="primary"
            size="large"
            isLoading={isLoading}
            fullWidth
          >
            Зарегистрироваться
          </Button>
        </form>
        
        <div className="auth-footer">
          <p className="auth-footer-text">
            Уже есть аккаунт?{' '}
            <Link to="/login" className="auth-link auth-link--primary">
              Войти
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;