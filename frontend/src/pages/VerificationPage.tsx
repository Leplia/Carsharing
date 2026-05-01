import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BASE_URL } from '../api/auth.api';
import authApi from '../api/auth.api';
import '../styles/pages/VerificationPage.css';

const VerificationPage: React.FC = () => {
    const { user, refreshUser } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        passportNumber: '',
        driverLicence: '',
        birthDate: '',
        verificationDate: new Date().toISOString().slice(0, 16),
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!form.firstName.trim()) newErrors.firstName = 'Обязательное поле';
        if (!form.lastName.trim()) newErrors.lastName = 'Обязательное поле';
        if (!form.passportNumber.trim()) newErrors.passportNumber = 'Обязательное поле';
        if (!form.driverLicence.trim()) newErrors.driverLicence = 'Обязательное поле';
        if (!form.birthDate) newErrors.birthDate = 'Обязательное поле';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setIsLoading(true);
        setError('');

        try {
            const token = authApi.getAccessToken();
            const userId = user?.userId;

            const res = await fetch(`${BASE_URL}/api/user/addCredentials/${userId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    firstName: form.firstName.trim(),
                    lastName: form.lastName.trim(),
                    passportNumber: form.passportNumber.trim(),
                    driverLicence: form.driverLicence.trim(),
                    birthDate: form.birthDate || null,
                    verificationDate: form.verificationDate,
                }),
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || 'Ошибка при отправке');
            }

            await refreshUser();
            setSuccess(true);
            setTimeout(() => navigate('/profile'), 2500);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Не удалось отправить данные');
        } finally {
            setIsLoading(false);
        }
    };

    if (user?.verified) {
        return (
            <div className="verif-page">
                <div className="verif-already">
                    <div className="verif-already-icon">✓</div>
                    <h2>Вы уже верифицированы</h2>
                    <p>Ваши документы были подтверждены ранее.</p>
                    <button className="verif-btn-primary" onClick={() => navigate('/profile')}>
                        Перейти в профиль
                    </button>
                </div>
            </div>
        );
    }

    if (user?.credentials && !user?.verified) {
        return (
            <div className="verif-page">
                <div className="verif-already">
                    <div className="verif-already-icon">⏳</div>
                    <h2>Документы уже отправлены</h2>
                    <p>Данные получены и ожидают подтверждения администратором.</p>
                    <button className="verif-btn-primary" onClick={() => navigate('/profile')}>
                        Перейти в профиль
                    </button>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="verif-page">
                <div className="verif-success-card">
                    <div className="verif-success-icon">✓</div>
                    <h2>Данные отправлены!</h2>
                    <p>Ваши документы приняты. Вы будете перенаправлены в профиль...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="verif-page">
            <div className="verif-container">
                <div className="verif-info-panel">
                    <div className="verif-info-icon">🛡️</div>
                    <h2>Верификация личности</h2>
                    <p>Для доступа к аренде автомобилей необходимо подтвердить вашу личность. Все данные хранятся в зашифрованном виде.</p>
                    <div className="verif-steps">
                        <div className="verif-step">
                            <div className="verif-step-num">1</div>
                            <div>
                                <strong>Личные данные</strong>
                                <p>Имя, фамилия, дата рождения</p>
                            </div>
                        </div>
                        <div className="verif-step">
                            <div className="verif-step-num">2</div>
                            <div>
                                <strong>Паспорт</strong>
                                <p>Серия и номер документа</p>
                            </div>
                        </div>
                        <div className="verif-step">
                            <div className="verif-step-num">3</div>
                            <div>
                                <strong>Водительское удостоверение</strong>
                                <p>Номер ВУ категории B и выше</p>
                            </div>
                        </div>
                    </div>
                    <div className="verif-note">
                        <span>🔒</span> Данные не передаются третьим лицам
                    </div>
                </div>

                <div className="verif-form-card">
                    <h3>Заполните данные документов</h3>
                    {error && <div className="verif-error">{error}</div>}

                    <form onSubmit={handleSubmit} className="verif-form">
                        <div className="verif-form-row">
                            <div className="verif-field">
                                <label>Имя *</label>
                                <input name="firstName" value={form.firstName} onChange={handleChange} className={`verif-input ${errors.firstName ? 'err' : ''}`} placeholder="Иван" />
                                {errors.firstName && <span className="verif-field-err">{errors.firstName}</span>}
                            </div>
                            <div className="verif-field">
                                <label>Фамилия *</label>
                                <input name="lastName" value={form.lastName} onChange={handleChange} className={`verif-input ${errors.lastName ? 'err' : ''}`} placeholder="Иванов" />
                                {errors.lastName && <span className="verif-field-err">{errors.lastName}</span>}
                            </div>
                        </div>

                        <div className="verif-field">
                            <label>Дата рождения *</label>
                            <input type="datetime-local" name="birthDate" value={form.birthDate} onChange={handleChange} className={`verif-input ${errors.birthDate ? 'err' : ''}`} />
                            {errors.birthDate && <span className="verif-field-err">{errors.birthDate}</span>}
                        </div>

                        <div className="verif-field">
                            <label>Серия и номер паспорта *</label>
                            <input name="passportNumber" value={form.passportNumber} onChange={handleChange} className={`verif-input ${errors.passportNumber ? 'err' : ''}`} placeholder="1234 567890" maxLength={20} />
                            {errors.passportNumber && <span className="verif-field-err">{errors.passportNumber}</span>}
                        </div>

                        <div className="verif-field">
                            <label>Номер водительского удостоверения *</label>
                            <input name="driverLicence" value={form.driverLicence} onChange={handleChange} className={`verif-input ${errors.driverLicence ? 'err' : ''}`} placeholder="77 АА 123456" maxLength={20} />
                            {errors.driverLicence && <span className="verif-field-err">{errors.driverLicence}</span>}
                        </div>

                        <button type="submit" className="verif-btn-primary" disabled={isLoading}>
                            {isLoading ? 'Отправка...' : 'Отправить на верификацию'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default VerificationPage;