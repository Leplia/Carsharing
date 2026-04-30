import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import BenefitsPanel from '../components/auth/BenefitsPanel';
import authApi from '../api/auth.api';
import { ServiceType } from '../types/auth';
import { useAuth } from '../contexts/AuthContext';
import '../styles/auth/Auth.css';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '',
  });
  const [errors, setErrors] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors = { name: '', email: '', phone: '', password: '', confirmPassword: '' };
    let isValid = true;

    if (!formData.name.trim()) { newErrors.name = 'Логин обязателен'; isValid = false; }
    if (!formData.email.trim()) { newErrors.email = 'Email обязателен'; isValid = false; }
    else if (!/\S+@\S+\.\S+/.test(formData.email)) { newErrors.email = 'Некорректный email'; isValid = false; }
    if (formData.phone && !/^\+7\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Формат: +7XXXXXXXXXX'; isValid = false;
    }
    if (!formData.password) { newErrors.password = 'Пароль обязателен'; isValid = false; }
    else if ((formData.password as String).length < 6) { newErrors.password = 'Минимум 6 символов'; isValid = false; }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают'; isValid = false;
    }
    if (!agreeTerms) { alert('Необходимо согласиться с условиями'); isValid = false; }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const response = await authApi.register({
        login: formData.name.trim(),
        password: formData.password,
        email: formData.email.trim(),
        phoneNumber: formData.phone.trim() || '+70000000000',
        serviceType: ServiceType.LOCAL,
      });
      login(response.user);
      navigate('/map');
    } catch {
      setServerError('Ошибка при регистрации. Проверьте email, логин и телефон');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <BenefitsPanel />
      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Создать аккаунт</h1>
            <p>Заполните форму для регистрации</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <Input label="Логин" name="name" placeholder="ivan_petrov" value={formData.name} onChange={handleInputChange} error={errors.name} required />
            <Input label="Email" name="email" type="email" placeholder="your@email.com" value={formData.email} onChange={handleInputChange} error={errors.email} required />
            <Input label="Телефон" name="phone" placeholder="+7XXXXXXXXXX" value={formData.phone} onChange={handleInputChange} error={errors.phone} />
            <Input label="Пароль" name="password" type="password" placeholder="••••••••" value={formData.password} onChange={handleInputChange} error={errors.password} required />
            <Input label="Подтвердите пароль" name="confirmPassword" type="password" placeholder="••••••••" value={formData.confirmPassword} onChange={handleInputChange} error={errors.confirmPassword} required />

            <div className="auth-terms">
              <label className="checkbox-label">
                <input type="checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} required />
                <span>
                  Я согласен с{' '}
                  <Link to="/terms" className="auth-link">условиями</Link>{' '}и{' '}
                  <Link to="/privacy" className="auth-link">политикой конфиденциальности</Link>
                </span>
              </label>
            </div>

            <Button type="submit" variant="primary" size="large" isLoading={isLoading} fullWidth>
              Зарегистрироваться
            </Button>

            <div className="auth-divider"><span>или</span></div>

            <Button
              type="button"
              variant="outline"
              size="large"
              fullWidth
              onClick={() => { window.location.href = 'http://localhost:8080/oauth2/authorization/github'; }}
            >
              <span className="github-icon" />
              Зарегистрироваться через GitHub
            </Button>

            {serverError && <p className="input-error" style={{ textAlign: 'center' }}>{serverError}</p>}
          </form>

          <div className="auth-footer">
            <p>
              Уже есть аккаунт?{' '}
              <Link to="/login" className="auth-link auth-link--primary">Войти</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
