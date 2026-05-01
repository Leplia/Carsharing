import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserDto, Role } from '../types/auth';
import { BASE_URL } from '../api/auth.api';
import authApi from '../api/auth.api';
import '../styles/pages/AdminPage.css';

const AdminPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [success, setSuccess] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const token = authApi.getAccessToken();
      const res = await fetch(`${BASE_URL}/api/user/getAllUsers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Ошибка загрузки');
      const data: UserDto[] = await res.json();
      setUsers(data);
    } catch {
      setError('Не удалось загрузить список пользователей');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const showSuccess = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleBlock = async (userId: number) => {
    setActionLoading(userId);
    try {
      const token = authApi.getAccessToken();
      const res = await fetch(`${BASE_URL}/api/user/blockUser/${userId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      const updated: UserDto = await res.json();
      setUsers(prev => prev.map(u => u.userId === userId ? updated : u));
      showSuccess(`Пользователь ${updated.blocked ? 'заблокирован' : 'разблокирован'}`);
    } catch {
      setError('Ошибка блокировки');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRoleChange = async (userId: number, role: Role) => {
    if (currentUser?.role !== Role.SISADMIN) {
      setError('Изменение роли доступно только системному администратору');
      return;
    }
    setActionLoading(userId);
    setError('');
    try {
      const token = authApi.getAccessToken();
      const res = await fetch(`${BASE_URL}/api/user/setUserRole/${userId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });
      if (!res.ok) {
        const message = await res.text();
        console.error('Role change failed', { userId, role, status: res.status, message });
        throw new Error('Ошибка изменения роли');
      }
      const updated: UserDto = await res.json();
      setUsers(prev => prev.map(u => u.userId === userId ? updated : u));
      showSuccess(`Роль изменена на ${role}`);
    } catch (err) {
      console.error('Role change request error', err);
      setError('Ошибка изменения роли');
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = users.filter(u =>
      u.login.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const getRoleBadgeClass = (role: Role) => {
    if (role === Role.SISADMIN) return 'role-sisadmin';
    if (role === Role.ADMIN) return 'role-admin';
    return 'role-user';
  };

  return (
      <div className="admin-page">
        <div className="admin-header">
          <div>
            <h1>Управление пользователями</h1>
            <p>Всего пользователей: {users.length}</p>
          </div>
          <button className="admin-refresh-btn" onClick={fetchUsers}>↻ Обновить</button>
        </div>

        {success && <div className="admin-success">{success}</div>}
        {error && <div className="admin-error">{error}</div>}

        <div className="admin-search-bar">
          <input
              type="text"
              placeholder="Поиск по логину или email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="admin-search-input"
          />
          <span className="admin-search-count">{filtered.length} из {users.length}</span>
        </div>

        {loading ? (
            <div className="admin-loading"><div className="loader-ring" /></div>
        ) : (
            <>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                  <tr>
                    <th>ID</th>
                    <th>Логин</th>
                    <th>Email</th>
                    <th>Роль</th>
                    <th>Верифицирован</th>
                    <th>Рейтинг</th>
                    <th>Тип</th>
                    <th>Статус</th>
                    <th>Действия</th>
                  </tr>
                  </thead>
                  <tbody>
                  {filtered.map(u => (
                      <tr key={u.userId} className={u.blocked ? 'row-blocked' : ''}>
                        <td className="td-id">#{u.userId}</td>
                        <td className="td-login">
                          <strong>{u.login}</strong>
                          {u.credentials && (
                              <span className="td-name">{u.credentials.firstName} {u.credentials.lastName}</span>
                          )}
                        </td>
                        <td className="td-email">{u.email}</td>
                        <td>
                          <select
                              value={u.role}
                              onChange={e => handleRoleChange(Number(u.userId), e.target.value as Role)}
                              className={`role-select ${getRoleBadgeClass(u.role)}`}
                              disabled={
                                  actionLoading === u.userId ||
                                  String(u.userId) === String(currentUser?.userId) ||
                                  currentUser?.role !== Role.SISADMIN
                              }
                          >
                            <option value={Role.USER}>USER</option>
                            <option value={Role.ADMIN}>ADMIN</option>
                            <option value={Role.SISADMIN}>SISADMIN</option>
                          </select>
                        </td>
                        <td className="td-center">
                          <span className={`verify-badge ${u.verified ? 'verified' : 'not-verified'}`}>
                            {u.verified ? '✓ Да' : '✗ Нет'}
                          </span>
                        </td>
                        <td className="td-center">⭐ {u.rating?.toFixed(1)}</td>
                        <td className="td-center">
                                          <span className={`service-badge service-${u.serviceType?.toLowerCase()}`}>
                                              {u.serviceType}
                                          </span>
                        </td>
                        <td className="td-center">
                                          <span className={`status-badge ${u.blocked ? 'status-blocked' : 'status-active'}`}>
                                              {u.blocked ? 'Заблокирован' : 'Активен'}
                                          </span>
                        </td>
                        <td className="td-actions">
                          {String(u.userId) !== String(currentUser?.userId) && (
                              <button
                                  className={`action-btn ${u.blocked ? 'btn-unblock' : 'btn-block'}`}
                                  onClick={() => handleBlock(Number(u.userId))}
                                  disabled={actionLoading === u.userId}
                              >
                                {actionLoading === u.userId ? '...' : u.blocked ? 'Разблок.' : 'Блок.'}
                              </button>
                          )}
                        </td>
                      </tr>
                  ))}
                  </tbody>
                </table>
                {filtered.length === 0 && (
                    <div className="admin-empty">Пользователи не найдены</div>
                )}
              </div>

            </>
        )}
      </div>
  );
};

export default AdminPage;