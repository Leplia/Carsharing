import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../api/auth.api';
import authApi from '../api/auth.api';
import { useAuth } from '../contexts/AuthContext';
import { Role, UserDto } from '../types/auth';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/pages/AdminManagementPage.css';

interface CarModelOption {
  carModelId: number;
  name: string;
  carManufactureName: string;
}

interface CarDto {
  carId: number;
  photoUrl: string;
  locationX: number;
  locationY: number;
  fuelLevel: number;
  vinNumber: string;
  color: string;
  year: number;
  description: string;
  carStatus: 'AVAILABLE' | 'BOOKED' | 'IN_USE' | 'OUT_OF_SERVICE';
  carModelDto: {
    name: string;
    transmission: string;
    seats: number;
    bodyType: string;
    carManufactureDto: { name: string; country: string };
  };
}

interface ReviewDto {
  reviewId: number;
  reviewText: string;
  rating: number;
  reviewDate: string;
  adminReply?: string;
  replyDate?: string;
  userName?: string;
  carName?: string;
}

interface AdminStatsDto {
  totalUsers: number;
  verifiedUsers: number;
  blockedUsers: number;
  totalCars: number;
  availableCars: number;
  outOfServiceCars: number;
  totalReviews: number;
  unansweredReviews: number;
}

const STATUS_OPTIONS = ['AVAILABLE', 'BOOKED', 'IN_USE', 'OUT_OF_SERVICE'] as const;
const STATUS_LABELS: Record<string, string> = {
  AVAILABLE: 'Доступна', BOOKED: 'Забронирована', IN_USE: 'В поездке', OUT_OF_SERVICE: 'Не в строю'
};
const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: '#d1fae5', BOOKED: '#fef3c7', IN_USE: '#dbeafe', OUT_OF_SERVICE: '#fee2e2'
};
const STATUS_TEXT_COLORS: Record<string, string> = {
  AVAILABLE: '#065f46', BOOKED: '#92400e', IN_USE: '#1d4ed8', OUT_OF_SERVICE: '#991b1b'
};

// ---------- Границы Минска ----------
const MINSK_BOUNDS: L.LatLngBoundsExpression = [
  [53.82, 27.42], // юго-запад
  [53.95, 27.72]  // северо-восток
];
const MIN_LAT = 53.82;
const MAX_LAT = 53.95;
const MIN_LNG = 27.42;
const MAX_LNG = 27.72;

const AdminManagementPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cars, setCars] = useState<CarDto[]>([]);
  const [models, setModels] = useState<CarModelOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'cars' | 'reviews' | 'stats' | 'verification'>('cars');
  const [reviews, setReviews] = useState<ReviewDto[]>([]);
  const [replyDrafts, setReplyDrafts] = useState<Record<number, string>>({});
  const [stats, setStats] = useState<AdminStatsDto | null>(null);
  const [users, setUsers] = useState<UserDto[]>([]);

  // Refs для карты выбора координат
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (user?.role !== Role.ADMIN && user?.role !== Role.SISADMIN) {
      navigate('/map');
      return;
    }
    fetchCars();
    fetchModels();
    fetchReviews();
    fetchStats();
    fetchUsers();
  }, [user, navigate]);

  const [newCar, setNewCar] = useState({
    vinNumber: '', color: '', year: new Date().getFullYear().toString(),
    locationX: '53.9000',   // Минск центр по умолчанию
    locationY: '27.5667',
    description: '', photoUrl: '', carModelId: ''
  });

  const token = authApi.getAccessToken();
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
  const canAddCars = user?.role === Role.ADMIN;
  const canVerify = user?.role === Role.ADMIN;

  const parseError = async (res: Response, fallback: string) => {
    try {
      const text = await res.text();
      if (!text) return fallback;
      const parsed = JSON.parse(text) as { message?: string };
      return parsed.message || fallback;
    } catch {
      return fallback;
    }
  };

  const showSuccess = (msg: string) => { setSuccess(msg); setTimeout(() => setSuccess(''), 3000); };

  // ---------- Инициализация мини‑карты при открытии формы ----------
  useEffect(() => {
    if (showAddForm && mapContainerRef.current && !mapRef.current) {
      const container = mapContainerRef.current;

      const map = L.map(container, {
        center: [53.9000, 27.5667],
        zoom: 12,
        maxBounds: MINSK_BOUNDS,
        maxBoundsViscosity: 1.0, // полностью запрещает выход за границы
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      const initialLat = parseFloat(newCar.locationX) || 53.9;
      const initialLng = parseFloat(newCar.locationY) || 27.5667;

      const marker = L.marker([initialLat, initialLng], { draggable: true }).addTo(map);

      // Возвращаем маркер в границы при перетаскивании
      marker.on('drag', (e: L.LeafletEvent) => {
        const m = e.target as L.Marker;
        const pos = m.getLatLng();
        const clamped = {
          lat: Math.min(MAX_LAT, Math.max(MIN_LAT, pos.lat)),
          lng: Math.min(MAX_LNG, Math.max(MIN_LNG, pos.lng))
        };
        if (clamped.lat !== pos.lat || clamped.lng !== pos.lng) {
          m.setLatLng(clamped);
        }
      });

      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        setNewCar(prev => ({
          ...prev,
          locationX: pos.lat.toFixed(6),
          locationY: pos.lng.toFixed(6),
        }));
      });

      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        if (lat < MIN_LAT || lat > MAX_LAT || lng < MIN_LNG || lng > MAX_LNG) return;
        marker.setLatLng([lat, lng]);
        setNewCar(prev => ({
          ...prev,
          locationX: lat.toFixed(6),
          locationY: lng.toFixed(6),
        }));
      });

      mapRef.current = map;
      markerRef.current = marker;
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      if (markerRef.current) {
        markerRef.current = null;
      }
    };
  }, [showAddForm]); // пересоздаём карту при каждом открытии формы

  // ---------- Заправка автомобиля ----------
  const handleRefuel = async (carId: number) => {
    setActionLoading(carId);
    try {
      const res = await fetch(`${BASE_URL}/api/cars/${carId}/refuel`, {
        method: 'PUT',
        headers,
      });
      if (!res.ok) throw new Error('Не удалось заправить автомобиль');
      setCars(prev =>
          prev.map(c => (c.carId === carId ? { ...c, fuelLevel: 100 } : c))
      );
      showSuccess('Автомобиль заправлен до 100%');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка заправки');
    } finally {
      setActionLoading(null);
    }
  };

  const fetchCars = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/cars/getAllCars`, { headers });
      if (!res.ok) throw new Error(await parseError(res, 'Не удалось загрузить автомобили'));
      setCars(await res.json());
    } catch (err) { setError(err instanceof Error ? err.message : 'Не удалось загрузить автомобили'); }
    finally { setLoading(false); }
  };

  const fetchModels = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/cars/models`, { headers });
      if (!res.ok) throw new Error(await parseError(res, 'Не удалось загрузить модели'));
      setModels(await res.json());
    } catch (err) { console.error('fetchModels failed', err); }
  };

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/reviews/all`, { headers });
      if (!res.ok) throw new Error(await parseError(res, 'Не удалось загрузить отзывы'));
      setReviews(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить отзывы');
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/admin/stats`, { headers });
      if (!res.ok) throw new Error(await parseError(res, 'Не удалось загрузить статистику'));
      setStats(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить статистику');
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/user/getAllUsers`, { headers });
      if (!res.ok) throw new Error(await parseError(res, 'Не удалось загрузить пользователей'));
      setUsers(await res.json());
    } catch (err) {
      console.error('fetchUsers failed', err);
    }
  };

  const handleVerify = async (userId: number, verified: boolean) => {
    setActionLoading(userId);
    setError('');
    try {
      const res = await fetch(`${BASE_URL}/api/user/verifyUser/${userId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ userId, verified })
      });
      if (!res.ok) throw new Error(await parseError(res, 'Ошибка верификации'));
      const updated: UserDto = await res.json();
      setUsers(prev => prev.map(u => u.userId === userId ? updated : u));
      showSuccess(`Верификация ${verified ? 'подтверждена' : 'отклонена'}`);
      fetchStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка верификации');
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddCar = async (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(newCar.locationX);
    const lng = parseFloat(newCar.locationY);
    if (lat < MIN_LAT || lat > MAX_LAT || lng < MIN_LNG || lng > MAX_LNG) {
      setError('Координаты должны находиться в пределах Минска.');
      return;
    }
    setAddLoading(true);
    setError('');
    try {
      const res = await fetch(`${BASE_URL}/api/cars/addCar`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ...newCar,
          year: parseInt(newCar.year),
          locationX: lat,
          locationY: lng,
          carModelId: parseInt(newCar.carModelId)
        })
      });
      if (!res.ok) throw new Error(await parseError(res, 'Не удалось добавить автомобиль'));
      const added: CarDto = await res.json();
      setCars(prev => [added, ...prev]);
      setShowAddForm(false);
      setNewCar({
        vinNumber: '', color: '', year: new Date().getFullYear().toString(),
        locationX: '53.9000', locationY: '27.5667',
        description: '', photoUrl: '', carModelId: ''
      });
      showSuccess('Автомобиль успешно добавлен!');
    } catch (err) { setError(err instanceof Error ? err.message : 'Не удалось добавить автомобиль'); }
    finally { setAddLoading(false); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Удалить автомобиль? Это действие необратимо.')) return;
    setActionLoading(id);
    try {
      const res = await fetch(`${BASE_URL}/api/cars/deleteCar/${id}`, { method: 'DELETE', headers });
      if (!res.ok) throw new Error(await parseError(res, 'Ошибка удаления'));
      setCars(prev => prev.filter(c => c.carId !== id));
      showSuccess('Автомобиль удалён');
    } catch (err) { setError(err instanceof Error ? err.message : 'Ошибка удаления'); }
    finally { setActionLoading(null); }
  };

  const handleStatusChange = async (id: number, status: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`${BASE_URL}/api/cars/${id}/status?status=${status}`, {
        method: 'PUT', headers
      });
      if (!res.ok) throw new Error(await parseError(res, 'Ошибка обновления статуса'));
      const updated: CarDto = await res.json();
      setCars(prev => prev.map(c => c.carId === id ? updated : c));
      showSuccess('Статус обновлён');
    } catch (err) { setError(err instanceof Error ? err.message : 'Ошибка обновления статуса'); }
    finally { setActionLoading(null); }
  };

  const handleReply = async (reviewId: number) => {
    const adminReply = (replyDrafts[reviewId] || '').trim();
    if (!adminReply) {
      setError('Введите текст ответа');
      return;
    }
    setActionLoading(reviewId);
    setError('');
    try {
      const res = await fetch(`${BASE_URL}/api/reviews/${reviewId}/reply`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ adminReply })
      });
      if (!res.ok) throw new Error(await parseError(res, 'Не удалось сохранить ответ'));
      const updated: ReviewDto = await res.json();
      setReviews(prev => prev.map(r => r.reviewId === reviewId ? updated : r));
      setReplyDrafts(prev => ({ ...prev, [reviewId]: '' }));
      showSuccess('Ответ на отзыв сохранён');
      fetchStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сохранить ответ');
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = filterStatus === 'ALL' ? cars : cars.filter(c => c.carStatus === filterStatus);
  const verificationRequests = users.filter(u =>
      !!u.credentials &&
      !(u.credentials?.verified ?? u.verified)
  );

  return (
      <div className="mgmt-page">
        <div className="mgmt-header">
          <div>
            <h1>Управление автопарком</h1>
            <p>Всего машин: {cars.length} | Доступно: {cars.filter(c => c.carStatus === 'AVAILABLE').length}</p>
          </div>
          <div className="mgmt-header-actions">
            <button className="mgmt-refresh-btn" onClick={() => { fetchCars(); fetchReviews(); fetchStats(); }}>↻ Обновить</button>
            {canAddCars && (
                <button className="mgmt-add-btn" onClick={() => setShowAddForm(!showAddForm)}>
                  {showAddForm ? '✕ Отмена' : '+ Добавить авто'}
                </button>
            )}
          </div>
        </div>

        <div className="mgmt-filter-bar">
          <span className="mgmt-filter-label">Раздел:</span>
          <button className={`mgmt-filter-btn ${activeTab === 'cars' ? 'active' : ''}`} onClick={() => setActiveTab('cars')}>Автопарк</button>
          <button className={`mgmt-filter-btn ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>Отзывы</button>
          {canVerify && (
              <button className={`mgmt-filter-btn ${activeTab === 'verification' ? 'active' : ''}`} onClick={() => setActiveTab('verification')}>Верификация</button>
          )}
          <button className={`mgmt-filter-btn ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')}>Статистика</button>
        </div>

        {success && <div className="mgmt-success">{success}</div>}
        {error && <div className="mgmt-error">{error}</div>}

        {/* Add car form */}
        {activeTab === 'cars' && canAddCars && showAddForm && (
            <div className="mgmt-add-form-card">
              <h2>Добавить новый автомобиль</h2>
              <form onSubmit={handleAddCar} className="mgmt-form">
                <div className="mgmt-form-grid">
                  <div className="mgmt-field">
                    <label>Модель *</label>
                    <select value={newCar.carModelId} onChange={e => setNewCar(p => ({ ...p, carModelId: e.target.value }))} required className="mgmt-select">
                      <option value="">Выберите модель...</option>
                      {models.map(m => (
                          <option key={m.carModelId} value={m.carModelId}>
                            {m.carManufactureName} {m.name}
                          </option>
                      ))}
                    </select>
                  </div>
                  <div className="mgmt-field">
                    <label>VIN номер *</label>
                    <input type="text" value={newCar.vinNumber} onChange={e => setNewCar(p => ({ ...p, vinNumber: e.target.value }))} required className="mgmt-input" placeholder="1HGBH41JXMN109186" />
                  </div>
                  <div className="mgmt-field">
                    <label>Цвет *</label>
                    <input type="text" value={newCar.color} onChange={e => setNewCar(p => ({ ...p, color: e.target.value }))} required className="mgmt-input" placeholder="Белый" />
                  </div>
                  <div className="mgmt-field">
                    <label>Год *</label>
                    <input type="number" value={newCar.year} onChange={e => setNewCar(p => ({ ...p, year: e.target.value }))} required className="mgmt-input" min="2000" max={new Date().getFullYear() + 1} />
                  </div>

                  {/* Вместо полей широты/долготы — карта */}
                  <div className="mgmt-field mgmt-field-full">
                    <label>Местоположение (кликните по карте)</label>
                    <div ref={mapContainerRef} style={{ height: '300px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid #d1d5db' }} />
                    <div style={{ display: 'flex', gap: '10px', marginTop: '8px', fontSize: '0.85rem', color: '#6b7280' }}>
                      <span>Широта: {parseFloat(newCar.locationX).toFixed(5)}</span>
                      <span>Долгота: {parseFloat(newCar.locationY).toFixed(5)}</span>
                    </div>
                  </div>

                  <div className="mgmt-field mgmt-field-full">
                    <label>URL фото</label>
                    <input type="text" value={newCar.photoUrl} onChange={e => setNewCar(p => ({ ...p, photoUrl: e.target.value }))} className="mgmt-input" placeholder="https://..." />
                  </div>
                  <div className="mgmt-field mgmt-field-full">
                    <label>Описание</label>
                    <textarea value={newCar.description} onChange={e => setNewCar(p => ({ ...p, description: e.target.value }))} className="mgmt-textarea" rows={2} placeholder="Доп. информация об автомобиле..." />
                  </div>
                </div>
                <div className="mgmt-form-actions">
                  <button type="submit" className="mgmt-submit-btn" disabled={addLoading}>
                    {addLoading ? 'Добавление...' : 'Добавить автомобиль'}
                  </button>
                </div>
              </form>
            </div>
        )}

        {/* Cars filter */}
        {activeTab === 'cars' && (
            <div className="mgmt-filter-bar">
              <span className="mgmt-filter-label">Фильтр:</span>
              {['ALL', ...STATUS_OPTIONS].map(s => (
                  <button
                      key={s}
                      className={`mgmt-filter-btn ${filterStatus === s ? 'active' : ''}`}
                      onClick={() => setFilterStatus(s)}
                  >
                    {s === 'ALL' ? `Все (${cars.length})` : `${STATUS_LABELS[s]} (${cars.filter(c => c.carStatus === s).length})`}
                  </button>
              ))}
            </div>
        )}

        {activeTab === 'cars' && (loading ? (
            <div className="mgmt-loading"><div className="loader-ring" /></div>
        ) : (
            <div className="mgmt-cars-grid">
              {filtered.map(car => (
                  <div key={car.carId} className="mgmt-car-card">
                    <div className="mgmt-car-photo">
                      {car.photoUrl ? (
                          <img src={car.photoUrl} alt="car" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      ) : (
                          <div className="mgmt-car-no-photo">
                            <svg width="40" height="24" viewBox="0 0 40 24" fill="none">
                              <rect x="1" y="7" width="38" height="13" rx="3" fill="#d1d5db" />
                              <rect x="7" y="2" width="26" height="10" rx="2" fill="#e5e7eb" />
                              <circle cx="10" cy="21" r="3" fill="#9ca3af" />
                              <circle cx="30" cy="21" r="3" fill="#9ca3af" />
                            </svg>
                          </div>
                      )}
                      <div className="mgmt-car-id">#{car.carId}</div>
                    </div>

                    <div className="mgmt-car-info">
                      <div className="mgmt-car-title">
                        <h3>{car.carModelDto?.carManufactureDto?.name} {car.carModelDto?.name}</h3>
                        <span className="mgmt-car-year">{car.year}</span>
                      </div>
                      <div className="mgmt-car-details">
                        <span>🎨 {car.color}</span>
                        <span>⛽ {car.fuelLevel}%</span>
                        <span>📍 {car.locationX?.toFixed(4)}, {car.locationY?.toFixed(4)}</span>
                      </div>
                      {car.vinNumber && <div className="mgmt-car-vin">VIN: {car.vinNumber}</div>}
                    </div>

                    <div className="mgmt-car-footer">
                      <select
                          value={car.carStatus}
                          onChange={e => handleStatusChange(car.carId, e.target.value)}
                          disabled={actionLoading === car.carId}
                          className="mgmt-status-select"
                          style={{
                            background: STATUS_COLORS[car.carStatus],
                            color: STATUS_TEXT_COLORS[car.carStatus]
                          }}
                      >
                        {STATUS_OPTIONS.map(s => (
                            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                        ))}
                      </select>
                      <button
                          className="mgmt-delete-btn"
                          onClick={() => handleDelete(car.carId)}
                          disabled={actionLoading === car.carId}
                      >
                        {actionLoading === car.carId ? '...' : '🗑'}
                      </button>
                      {/* Кнопка заправки */}
                      <button
                          className="mgmt-refuel-btn"
                          onClick={() => handleRefuel(car.carId)}
                          disabled={actionLoading === car.carId}
                          title="Заправить до 100%"
                      >
                        {actionLoading === car.carId ? '⏳' : '⛽'}
                      </button>
                    </div>
                  </div>
              ))}
              {filtered.length === 0 && (
                  <div className="mgmt-empty">Автомобили не найдены</div>
              )}
            </div>
        ))}

        {activeTab === 'reviews' && (
            <div className="mgmt-cars-grid">
              {reviews.map(review => (
                  <div key={review.reviewId} className="mgmt-car-card">
                    <div className="mgmt-car-info">
                      <div className="mgmt-car-title">
                        <h3>Отзыв #{review.reviewId}</h3>
                        <span className="mgmt-car-year">⭐ {review.rating}</span>
                      </div>
                      <div className="mgmt-car-vin">{review.reviewText}</div>
                      {review.adminReply && <div className="mgmt-car-details"><span>Ответ: {review.adminReply}</span></div>}
                    </div>
                    <div className="mgmt-car-footer" style={{ flexDirection: 'column', gap: 8, alignItems: 'stretch' }}>
                      <textarea
                          value={replyDrafts[review.reviewId] ?? ''}
                          onChange={e => setReplyDrafts(prev => ({ ...prev, [review.reviewId]: e.target.value }))}
                          className="mgmt-textarea"
                          rows={2}
                          placeholder="Ответ администратора..."
                      />
                      <button
                          className="mgmt-submit-btn"
                          onClick={() => handleReply(review.reviewId)}
                          disabled={actionLoading === review.reviewId}
                      >
                        {actionLoading === review.reviewId ? 'Сохранение...' : 'Сохранить ответ'}
                      </button>
                    </div>
                  </div>
              ))}
              {reviews.length === 0 && (
                  <div className="mgmt-empty">Отзывов пока нет</div>
              )}
            </div>
        )}

        {activeTab === 'stats' && (
            <div className="mgmt-stats-container">
              {/* Summary Cards */}
              <div className="mgmt-stats-summary">
                <div className="mgmt-stat-card mgmt-stat-blue">
                  <div className="mgmt-stat-icon">👥</div>
                  <div className="mgmt-stat-content">
                    <div className="mgmt-stat-value">{stats?.totalUsers ?? 0}</div>
                    <div className="mgmt-stat-label">Пользователей</div>
                  </div>
                </div>
                <div className="mgmt-stat-card mgmt-stat-green">
                  <div className="mgmt-stat-icon">🚗</div>
                  <div className="mgmt-stat-content">
                    <div className="mgmt-stat-value">{stats?.totalCars ?? 0}</div>
                    <div className="mgmt-stat-label">Автомобилей</div>
                  </div>
                </div>
                <div className="mgmt-stat-card mgmt-stat-purple">
                  <div className="mgmt-stat-icon">⭐</div>
                  <div className="mgmt-stat-content">
                    <div className="mgmt-stat-value">{stats?.totalReviews ?? 0}</div>
                    <div className="mgmt-stat-label">Отзывов</div>
                  </div>
                </div>
                <div className="mgmt-stat-card mgmt-stat-orange">
                  <div className="mgmt-stat-icon">✓</div>
                  <div className="mgmt-stat-content">
                    <div className="mgmt-stat-value">{stats?.verifiedUsers ?? 0}</div>
                    <div className="mgmt-stat-label">Верифицировано</div>
                  </div>
                </div>
              </div>

              {/* Charts Row 1 */}
              <div className="mgmt-charts-row">
                {/* Users Chart */}
                <div className="mgmt-chart-card">
                  <h3 className="mgmt-chart-title">Статистика пользователей</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={[
                      { name: 'Всего', value: stats?.totalUsers ?? 0, fill: '#3b82f6' },
                      { name: 'Верифиц.', value: stats?.verifiedUsers ?? 0, fill: '#10b981' },
                      { name: 'Заблок.', value: stats?.blockedUsers ?? 0, fill: '#ef4444' },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} />
                      <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                      <Tooltip
                          contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8 }}
                          labelStyle={{ color: '#111827' }}
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        <Cell fill="#3b82f6" />
                        <Cell fill="#10b981" />
                        <Cell fill="#ef4444" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Cars Status Pie Chart */}
                <div className="mgmt-chart-card">
                  <h3 className="mgmt-chart-title">Статус автомобилей</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                          data={[
                            { name: 'Доступна', value: cars.filter(c => c.carStatus === 'AVAILABLE').length, color: '#10b981' },
                            { name: 'Забронирована', value: cars.filter(c => c.carStatus === 'BOOKED').length, color: '#f59e0b' },
                            { name: 'В поездке', value: cars.filter(c => c.carStatus === 'IN_USE').length, color: '#3b82f6' },
                            { name: 'Не в строю', value: cars.filter(c => c.carStatus === 'OUT_OF_SERVICE').length, color: '#ef4444' },
                          ].filter(d => d.value > 0)}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                          labelLine={false}
                      >
                        {[
                          { color: '#10b981' },
                          { color: '#f59e0b' },
                          { color: '#3b82f6' },
                          { color: '#ef4444' },
                        ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                          contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8 }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Charts Row 2 */}
              <div className="mgmt-charts-row">
                {/* Reviews Chart */}
                <div className="mgmt-chart-card">
                  <h3 className="mgmt-chart-title">Отзывы</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={[
                      { name: 'Всего', value: stats?.totalReviews ?? 0 },
                      { name: 'С ответом', value: (stats?.totalReviews ?? 0) - (stats?.unansweredReviews ?? 0) },
                      { name: 'Без ответа', value: stats?.unansweredReviews ?? 0 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} />
                      <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                      <Tooltip
                          contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8 }}
                      />
                      <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Rating Distribution */}
                <div className="mgmt-chart-card">
                  <h3 className="mgmt-chart-title">Распределение оценок</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={[
                      { name: '5 ⭐', value: reviews.filter(r => r.rating === 5).length, fill: '#10b981' },
                      { name: '4 ⭐', value: reviews.filter(r => r.rating === 4).length, fill: '#34d399' },
                      { name: '3 ⭐', value: reviews.filter(r => r.rating === 3).length, fill: '#fbbf24' },
                      { name: '2 ⭐', value: reviews.filter(r => r.rating === 2).length, fill: '#f59e0b' },
                      { name: '1 ⭐', value: reviews.filter(r => r.rating === 1).length, fill: '#ef4444' },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} />
                      <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                      <Tooltip
                          contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8 }}
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        <Cell fill="#10b981" />
                        <Cell fill="#34d399" />
                        <Cell fill="#fbbf24" />
                        <Cell fill="#f59e0b" />
                        <Cell fill="#ef4444" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Charts Row 3 */}
              <div className="mgmt-charts-row">
                {/* Fuel Level Distribution */}
                <div className="mgmt-chart-card">
                  <h3 className="mgmt-chart-title">Уровень топлива</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={[
                      { name: '0-25%', value: cars.filter(c => (c.fuelLevel ?? 0) <= 25).length, fill: '#ef4444' },
                      { name: '26-50%', value: cars.filter(c => (c.fuelLevel ?? 0) > 25 && (c.fuelLevel ?? 0) <= 50).length, fill: '#f59e0b' },
                      { name: '51-75%', value: cars.filter(c => (c.fuelLevel ?? 0) > 50 && (c.fuelLevel ?? 0) <= 75).length, fill: '#fbbf24' },
                      { name: '76-100%', value: cars.filter(c => (c.fuelLevel ?? 0) > 75).length, fill: '#10b981' },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} />
                      <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                      <Tooltip
                          contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8 }}
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        <Cell fill="#ef4444" />
                        <Cell fill="#f59e0b" />
                        <Cell fill="#fbbf24" />
                        <Cell fill="#10b981" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Car Manufacturers */}
                <div className="mgmt-chart-card">
                  <h3 className="mgmt-chart-title">Марки автомобилей</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart
                        data={Object.entries(
                            cars.reduce((acc, car) => {
                              const brand = car.carModelDto?.carManufactureDto?.name || 'Неизвестно';
                              acc[brand] = (acc[brand] || 0) + 1;
                              return acc;
                            }, {} as Record<string, number>)
                        ).slice(0, 6).map(([name, value]) => ({ name, value }))}
                        layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 12 }} />
                      <YAxis type="category" dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} width={80} />
                      <Tooltip
                          contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8 }}
                      />
                      <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
        )}

        {activeTab === 'verification' && canVerify && (
            <div className="mgmt-verify-section">
              <div className="mgmt-verify-header">
                <h2>Запросы на верификацию</h2>
                <span className="mgmt-verify-count">{verificationRequests.length}</span>
              </div>
              {verificationRequests.length === 0 ? (
                  <div className="mgmt-empty">Нет запросов на верификацию</div>
              ) : (
                  <div className="mgmt-cars-grid">
                    {verificationRequests.map(u => (
                        <div key={`verify-${u.userId}`} className="mgmt-car-card">
                          <div className="mgmt-car-info">
                            <div className="mgmt-car-title">
                              <h3>{u.login}</h3>
                              <span className="mgmt-car-year">ID: {u.userId}</span>
                            </div>
                            <div className="mgmt-car-details">
                              <span>📧 {u.email}</span>
                            </div>
                            <div className="mgmt-car-vin">
                              {u.credentials?.firstName} {u.credentials?.lastName}
                            </div>
                            <div className="mgmt-car-details">
                              <span>📄 Паспорт: {u.credentials?.passportNumber ? `****${u.credentials.passportNumber.slice(-4)}` : '—'}</span>
                              <span>🪪 ВУ: {u.credentials?.driverLicense ? `**${u.credentials.driverLicense.slice(-6)}` : '—'}</span>
                            </div>
                          </div>
                          <div className="mgmt-car-footer" style={{ flexDirection: 'row', gap: 8 }}>
                            <button
                                className="mgmt-submit-btn"
                                onClick={() => handleVerify(u.userId, true)}
                                disabled={actionLoading === u.userId}
                                style={{ flex: 1, background: '#10b981' }}
                            >
                              {actionLoading === u.userId ? '...' : '✓ Подтвердить'}
                            </button>
                            <button
                                className="mgmt-delete-btn"
                                onClick={() => handleVerify(u.userId, false)}
                                disabled={actionLoading === u.userId}
                                style={{ flex: 1 }}
                            >
                              {actionLoading === u.userId ? '...' : '✕ Отклонить'}
                            </button>
                          </div>
                        </div>
                    ))}
                  </div>
              )}
            </div>
        )}
      </div>
  );
};

export default AdminManagementPage;