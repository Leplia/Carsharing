import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import authApi, { BASE_URL } from '../api/auth.api';
import { Role } from '../types/auth';
import '../styles/pages/ProfilePage.css';

const ProfilePage: React.FC = () => {
    const { user, logout, refreshUser } = useAuth();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [saveSuccess, setSaveSuccess] = useState(false);

    const [editData, setEditData] = useState({
        login: user?.login || '',
        email: user?.email || '',
        phone: user?.phone || '',
    });

    useEffect(() => {
        setEditData({
            login: user?.login || '',
            email: user?.email || '',
            phone: user?.phone || '',
        });
    }, [user]);

    const isVerified = !!user?.verified;

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        setSaveError('');
        setSaveSuccess(false);
        try {
            const token = authApi.getAccessToken();
            const currentUser = authApi.getUserData();
            if (!currentUser) throw new Error('no user');

            const response = await fetch(`${BASE_URL}/api/user/updateUser/${currentUser.userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    login: editData.login,
                    email: editData.email,
                    phone: editData.phone,
                    password: '',
                    userCredentialUpdateRequest: {
                        firstName: user?.credentials?.firstName || '',
                        lastName: user?.credentials?.lastName || '',
                    }
                }),
            });
            if (!response.ok) throw new Error('save failed');
            await refreshUser();
            setSaveSuccess(true);
            setIsEditing(false);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch {
            setSaveError('Не удалось сохранить изменения');
        } finally {
            setIsSaving(false);
        }
    };

    const getServiceLabel = () => {
        if (user?.serviceType === 'GITHUB') return 'GitHub';
        return 'Локальный';
    };

    const getRoleBadge = () => {
        if (user?.role === Role.SISADMIN) return { label: 'Сис. администратор', color: '#4f46e5' };
        if (user?.role === Role.ADMIN) return { label: 'Администратор', color: '#7c3aed' };
        return { label: 'Пользователь', color: '#059669' };
    };

    const role = getRoleBadge();

    return (
        <div className="profile-page">
            {/* Header card */}
            <div className="profile-hero">
                <div className="profile-avatar">
                    {user?.credentials?.firstName
                        ? `${user.credentials.firstName[0]}${user.credentials.lastName?.[0] || ''}`.toUpperCase()
                        : user?.login?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="profile-hero-info">
                    <h1>
                        {user?.credentials
                            ? `${user.credentials.firstName} ${user.credentials.lastName}`
                            : user?.login}
                        {isVerified && (
                            <span className="profile-verified-badge" title="Верифицирован">&#10003; Верифицирован</span>
                        )}
                    </h1>
                    <p className="profile-subline">@{user?.login} &middot; {user?.email}</p>
                    <div className="profile-badges-row">
                        <span className="profile-badge" style={{ background: role.color }}>
                            {role.label}
                        </span>
                        <span className="profile-badge profile-badge-service">
                            {getServiceLabel()}
                        </span>
                        <span className="profile-badge profile-badge-rating">
                            {user?.rating?.toFixed(1)} / 5.0
                        </span>
                        {user?.blocked && (
                            <span className="profile-badge profile-badge-blocked">Заблокирован</span>
                        )}
                    </div>
                </div>
                <div className="profile-hero-actions">
                    <button className="profile-action-btn profile-action-logout" onClick={handleLogout}>
                        Выйти
                    </button>
                </div>
            </div>

            {/* Verification banner */}
            {!isVerified && (
                <div className="profile-verif-banner">
                    <div className="profile-verif-banner-text">
                        <strong>Требуется верификация</strong>
                        <p>Пройдите подтверждение личности, чтобы получить доступ к аренде автомобилей.</p>
                    </div>
                    <Link to="/verification" className="profile-verif-banner-btn">
                        Пройти верификацию
                    </Link>
                </div>
            )}

            {saveSuccess && (
                <div className="profile-success-toast">Данные успешно сохранены</div>
            )}

            <div className="profile-grid">
                {/* Personal info */}
                <div className="profile-card">
                    <div className="profile-card-header">
                        <h2>Личная информация</h2>
                        {!isEditing ? (
                            <button className="profile-edit-btn" onClick={() => setIsEditing(true)}>
                                Редактировать
                            </button>
                        ) : (
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button className="profile-edit-btn" onClick={() => setIsEditing(false)}>
                                    Отмена
                                </button>
                                <button className="profile-save-btn" onClick={handleSave} disabled={isSaving}>
                                    {isSaving ? 'Сохранение...' : 'Сохранить'}
                                </button>
                            </div>
                        )}
                    </div>

                    {saveError && <div className="profile-err">{saveError}</div>}

                    <div className="profile-info-grid">
                        <div className="profile-info-item">
                            <label>Логин</label>
                            {isEditing ? (
                                <input name="login" value={editData.login} onChange={handleEditChange} className="profile-input" />
                            ) : (
                                <span>{user?.login}</span>
                            )}
                        </div>
                        <div className="profile-info-item">
                            <label>Email</label>
                            {isEditing ? (
                                <input name="email" type="email" value={editData.email} onChange={handleEditChange} className="profile-input" />
                            ) : (
                                <span>{user?.email}</span>
                            )}
                        </div>
                        <div className="profile-info-item">
                            <label>Телефон</label>
                            {isEditing ? (
                                <input name="phone" value={editData.phone} onChange={handleEditChange} className="profile-input" />
                            ) : (
                                <span>{user?.phone || '—'}</span>
                            )}
                        </div>
                        <div className="profile-info-item">
                            <label>Тип аккаунта</label>
                            <span>{getServiceLabel()}</span>
                        </div>
                    </div>
                </div>

                {/* Verification info */}
                <div className="profile-card">
                    <div className="profile-card-header">
                        <h2>Верификация</h2>
                    </div>
                    {isVerified && user?.credentials ? (
                        <div className="profile-info-grid">
                            <div className="profile-info-item">
                                <label>Имя</label>
                                <span>{user.credentials.firstName}</span>
                            </div>
                            <div className="profile-info-item">
                                <label>Фамилия</label>
                                <span>{user.credentials.lastName}</span>
                            </div>
                            <div className="profile-info-item">
                                <label>Паспорт</label>
                                <span>{'**** ' + (user.credentials.passportNumber?.slice(-4) || '****')}</span>
                            </div>
                            <div className="profile-info-item">
                                <label>Водительское удостоверение</label>
                                <span>{'** ' + ((user.credentials.driverLicense || (user.credentials as { driverLicence?: string }).driverLicence)?.slice(-6) || '******')}</span>
                            </div>
                            <div className="profile-info-item">
                                <label>Статус</label>
                                <span className="profile-status-verified">Подтверждён</span>
                            </div>
                        </div>
                    ) : (
                        <div className="profile-no-verif">
                            <p>Документы не загружены</p>
                            <Link to="/verification" className="profile-verif-link-btn">
                                Пройти верификацию
                            </Link>
                        </div>
                    )}
                </div>

                {/* Statistics */}
                <div className="profile-card profile-card-full">
                    <div className="profile-card-header">
                        <h2>Статистика</h2>
                    </div>
                    <div className="profile-stats-grid">
                        <div className="profile-stat">
                            <div className="profile-stat-val">{user?.rating?.toFixed(1) || '—'}</div>
                            <div className="profile-stat-label">Рейтинг</div>
                        </div>
                        <div className="profile-stat">
                            <div className="profile-stat-val">0</div>
                            <div className="profile-stat-label">Поездок</div>
                        </div>
                        <div className="profile-stat">
                            <div className="profile-stat-val">0 км</div>
                            <div className="profile-stat-label">Пройдено</div>
                        </div>
                        <div className="profile-stat">
                            <div className="profile-stat-val">0 ₽</div>
                            <div className="profile-stat-label">Потрачено</div>
                        </div>
                    </div>
                </div>

                {/* Recent trips placeholder */}
                <div className="profile-card profile-card-full">
                    <div className="profile-card-header">
                        <h2>Последние поездки</h2>
                    </div>
                    {isVerified ? (
                        <div className="profile-empty-trips">
                            <p>Поездок пока нет</p>
                            <Link to="/map" className="profile-verif-link-btn">
                                Найти автомобиль
                            </Link>
                        </div>
                    ) : (
                        <div className="profile-empty-trips">
                            <p>Требуется верификация для доступа к аренде</p>
                            <Link to="/verification" className="profile-verif-link-btn">
                                Пройти верификацию
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
