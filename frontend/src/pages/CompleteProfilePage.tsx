import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import authApi from '../api/auth.api';
import { BASE_URL } from '../api/auth.api';
import '../styles/auth/Auth.css';

interface ProfileData {
  phone: string;
  password: string;
  confirmPassword: string;
}

const CompleteProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState<ProfileData>({
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Partial<ProfileData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    // Проверяем, есть ли токен в URL
    const token = searchParams.get('token');
    if (token) {
      authApi.setAccessTokenFromOAuth(token);
    }

    // Если нет токена, перенаправляем на логин
    if (!authApi.getAccessToken()) {
      navigate('/login');
    }
  }, [navigate, searchParams]);

  const validateForm = (): boolean => {
    const newErrors: Partial<ProfileData> = {};

    if (!formData.phone) {
      newErrors.phone = 'Введите номер телефона';
    } else if (!/^\+?[0-9]{10,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Некорректный номер телефона';
    }

    if (!formData.password) {
      newErrors.password = 'Введите пароль';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Пароль должен быть не менее 6 символов';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setServerError('');

    try {
      const token = authApi.getAccessToken();
      const user = authApi.getUserData();

      if (!user || !token) {
        navigate('/login');
        return;
      }

      // Обновляем данные пользователя
      const response = await fetch(`${BASE_URL}/api/user/updateUser/${user.userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          login: user.login,
          email: user.email,
          phone: formData.phone,
          password: formData.password,
          userCredentialUpdateRequest: {
            firstName: '',
            lastName: ''
          }
        })
      });

      if (!response.ok) {
        throw new Error('Ошибка обновления профиля');
      }

      // Получаем обновленного пользователя
      const updatedUser = await authApi.getCurrentUser();
      if (updatedUser) {
        navigate('/map');
      }
    } catch (error) {
      setServerError('Не удалось сохранить данные. Попробуйте еще раз.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof ProfileData]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-left">
        <div className="auth-form-wrapper">
          <div className="auth-header">
            <h1>Завершите регистрацию</h1>
            <p>Введите дополнительные данные для завершения регистрации через GitHub</p>
          </div>

          {serverError && <div className="auth-error">{serverError}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="phone">Номер телефона</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+7 (999) 123-45-67"
                className={errors.phone ? 'input-error' : ''}
              />
              {errors.phone && <span className="error-text">{errors.phone}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Пароль</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Минимум 6 символов"
                className={errors.password ? 'input-error' : ''}
              />
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Подтвердите пароль</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Повторите пароль"
                className={errors.confirmPassword ? 'input-error' : ''}
              />
              {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
            </div>

            <button type="submit" className="auth-submit-btn" disabled={isLoading}>
              {isLoading ? 'Сохранение...' : 'Завершить регистрацию'}
            </button>
          </form>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-benefits">
          <h2>Добро пожаловать!</h2>
          <p>Завершите регистрацию, чтобы получить доступ ко всем возможностям каршеринга</p>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfilePage;