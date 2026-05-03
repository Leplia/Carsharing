// frontend/src/pages/MapPage.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '../contexts/AuthContext';
import { BASE_URL } from '../api/auth.api';
import authApi from '../api/auth.api';
import '../styles/pages/MapPage.css';

// ---------- Интерфейсы ----------
interface CarDto {
  carId: number;
  photoUrl: string;
  locationX: number; // Широта
  locationY: number; // Долгота
  fuelLevel: number;
  color: string;
  year: number;
  description: string;
  carStatus: 'AVAILABLE' | 'BOOKED' | 'IN_USE' | 'OUT_OF_SERVICE';
  carModelDto: {
    name: string;
    transmission: string;
    seats: number;
    bodyType: string;
    coefficient: number;
    carManufactureDto: {
      name: string;
      country: string;
      badgeUrl: string;
    };
  };
}

// ---------- Константы ----------
const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: '#10b981',
  BOOKED: '#f59e0b',
  IN_USE: '#3b82f6',
  OUT_OF_SERVICE: '#ef4444',
};

const STATUS_LABELS: Record<string, string> = {
  AVAILABLE: 'Доступна',
  BOOKED: 'Забронирована',
  IN_USE: 'В поездке',
  OUT_OF_SERVICE: 'Не в строю',
};

// Кастомный круглый маркер
const createCarMarker = (car: CarDto, onClick: () => void) => {
  const color = STATUS_COLORS[car.carStatus] || '#999';
  const markerHtml = `
    <div style="
      width: 20px; height: 20px;
      background: ${color};
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0,0,0,0.4);
      cursor: pointer;
      transition: transform 0.2s;
    "></div>
  `;

  const marker = L.marker([car.locationX, car.locationY], {
    icon: L.divIcon({
      html: markerHtml,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
      className: '', // убираем стандартный класс leaflet-div-icon
    }),
  });

  marker.on('click', onClick);
  return marker;
};

// ---------- Компонент ----------
const MapPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [cars, setCars] = useState<CarDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState<CarDto | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingMsg, setBookingMsg] = useState('');

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  const isVerified = !!user?.credentials;

  // ---------- Загрузка автомобилей ----------
  useEffect(() => {
    const fetchCars = async () => {
      try {
        const token = authApi.getAccessToken();
        const headers: Record<string, string> = token
            ? { Authorization: `Bearer ${token}` }
            : {};
        const res = await fetch(`${BASE_URL}/api/cars/getAvailableCars`, {
          headers,
        });
        if (res.ok) setCars(await res.json());
      } catch {
        // Обработка ошибок
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, []);

  // ---------- Инициализация карты ----------
  useEffect(() => {
    if (loading || !mapContainerRef.current || mapRef.current) return;

    // Создаём карту только один раз
    const map = L.map(mapContainerRef.current, {
      center: [53.9045, 27.5615], // Минск [широта, долгота]
      zoom: 12,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    // Очистка при размонтировании
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [loading]);

  // ---------- Обновление маркеров при изменении списка машин ----------
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !cars.length) return;

    // Удаляем старые маркеры
    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];

    // Добавляем новые маркеры
    cars.forEach((car) => {
      if (car.locationX == null || car.locationY == null) return;
      const marker = createCarMarker(car, () => handleCarClick(car));
      marker.addTo(map);
      markersRef.current.push(marker);
    });
  }, [cars]);

  // ---------- Обработчики ----------
  const handleCarClick = useCallback((car: CarDto) => {
    setSelectedCar((prev) => (prev?.carId === car.carId ? null : car));
    setBookingMsg('');
  }, []);

  const handleBook = async () => {
    if (!selectedCar || !isVerified) return;
    setBookingLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setBookingMsg('Бронирование временно не доступно в демо-режиме.');
    setBookingLoading(false);
  };

  const calcPrice = (car: CarDto) => {
    const base = 4;
    const coeff = car.carModelDto?.coefficient ?? 1;
    return (base * coeff).toFixed(0);
  };

  // Фильтрация списка
  const filteredCars =
      filterStatus === 'ALL'
          ? cars
          : cars.filter((c) => c.carStatus === filterStatus);

  // ---------- Рендер ----------
  return (
      <div className="map-page">
        {/* Верхняя панель */}
        <div className="map-topbar">
          <div className="map-topbar-left">
            <h2 className="map-title">Автомобили</h2>
            <span className="map-available-badge">{filteredCars.length} доступно</span>
          </div>
          <div className="map-topbar-right">
            {['ALL', 'AVAILABLE'].map((status) => (
                <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`map-filter-btn ${filterStatus === status ? 'active' : ''}`}
                >
                  {status === 'ALL'
                      ? `Все (${cars.length})`
                      : `Свободные (${cars.filter((c) => c.carStatus === 'AVAILABLE').length})`}
                </button>
            ))}
            {!isVerified && (
                <a href="/profile" className="map-verify-btn">
                  Пройти верификацию
                </a>
            )}
            <a href="/profile" className="map-profile-btn">
              Профиль
            </a>
          </div>
        </div>

        {/* Основной макет */}
        <div className="map-layout">
          {/* Боковая панель со списком машин */}
          <div className="map-sidebar">
            {loading ? (
                <div className="map-loading">Загрузка...</div>
            ) : filteredCars.length === 0 ? (
                <div className="map-empty">Нет доступных автомобилей</div>
            ) : (
                filteredCars.map((car) => (
                    <div
                        key={car.carId}
                        className={`map-car-item ${selectedCar?.carId === car.carId ? 'selected' : ''}`}
                        onClick={() => handleCarClick(car)}
                    >
                      <div className="map-car-item-header">
                  <span className="map-car-model">
                    {car.carModelDto?.carManufactureDto?.name} {car.carModelDto?.name}
                  </span>
                        <span
                            className="map-car-status"
                            style={{ color: STATUS_COLORS[car.carStatus] }}
                        >
                    {STATUS_LABELS[car.carStatus]}
                  </span>
                      </div>
                      <div className="map-car-item-details">
                  <span>
                    {car.color} · {car.year} · {car.carModelDto?.seats} мест
                  </span>
                        <span className="map-car-price">от {calcPrice(car)} ₽/мин</span>
                      </div>
                      <div className="map-car-item-fuel">
                        <div
                            className="fuel-bar"
                            style={{
                              width: `${car.fuelLevel}%`,
                              backgroundColor: car.fuelLevel > 30 ? '#10b981' : '#ef4444',
                            }}
                        />
                        <span>{car.fuelLevel}%</span>
                      </div>
                    </div>
                ))
            )}
          </div>

          {/* Контейнер карты */}
          <div className="map-canvas">
            {loading && <div className="map-loading-overlay">Загрузка карты...</div>}
            <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
            {/* Легенда */}
            <div className="map-legend">
              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                  <div key={key} className="map-legend-item">
                <span
                    className="map-legend-color"
                    style={{ background: STATUS_COLORS[key] }}
                />
                    <span>{label}</span>
                  </div>
              ))}
            </div>
          </div>
        </div>

        {/* Панель выбранного автомобиля */}
        {selectedCar && (
            <div className="map-car-panel">
              <button
                  className="map-car-panel-close"
                  onClick={() => setSelectedCar(null)}
              >
                ✕
              </button>
              <h3>
                {selectedCar.carModelDto?.carManufactureDto?.name}{' '}
                {selectedCar.carModelDto?.name}
              </h3>
              <div className="map-car-panel-grid">
                <div><span>Статус</span> {STATUS_LABELS[selectedCar.carStatus]}</div>
                <div><span>Цвет</span> {selectedCar.color}</div>
                <div><span>Год</span> {selectedCar.year}</div>
                <div><span>Топливо</span> {selectedCar.fuelLevel}%</div>
                <div><span>Трансмиссия</span> {selectedCar.carModelDto?.transmission}</div>
                <div><span>Мест</span> {selectedCar.carModelDto?.seats}</div>
                <div><span>Тип кузова</span> {selectedCar.carModelDto?.bodyType}</div>
                <div><span>Тариф</span> от {calcPrice(selectedCar)} ₽/мин</div>
              </div>
              {selectedCar.description && (
                  <p className="map-car-description">{selectedCar.description}</p>
              )}
              {bookingMsg && <div className="map-booking-msg">{bookingMsg}</div>}
              {isAuthenticated && isVerified && selectedCar.carStatus === 'AVAILABLE' ? (
                  <button className="map-book-btn" onClick={handleBook} disabled={bookingLoading}>
                    {bookingLoading ? 'Обработка...' : 'Забронировать'}
                  </button>
              ) : isAuthenticated && !isVerified ? (
                  <p className="map-auth-msg">Пройдите верификацию для бронирования</p>
              ) : !isAuthenticated ? (
                  <p className="map-auth-msg">Войдите для бронирования</p>
              ) : null}
            </div>
        )}

        {/* Задел для маршрутов (расширяется позже) */}
        {/* <div className="map-route-panel">
        <button>Построить маршрут</button>
        <span>Расстояние: ---</span>
      </div> */}
      </div>
  );
};

export default MapPage;