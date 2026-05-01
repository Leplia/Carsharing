import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BASE_URL } from '../api/auth.api';
import authApi from '../api/auth.api';
import '../styles/pages/MapPage.css';

interface CarDto {
  carId: number;
  photoUrl: string;
  locationX: number;
  locationY: number;
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
    carManufactureDto: { name: string; country: string; badgeUrl: string };
  };
}

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: '#10b981', BOOKED: '#f59e0b', IN_USE: '#3b82f6', OUT_OF_SERVICE: '#ef4444'
};
const STATUS_LABELS: Record<string, string> = {
  AVAILABLE: 'Доступна', BOOKED: 'Забронирована', IN_USE: 'В поездке', OUT_OF_SERVICE: 'Не в строю'
};

// Map bounds (Moscow area for demo): lat 55.55–55.95, lon 37.35–37.95
const MAP_BOUNDS = { minLat: 55.55, maxLat: 55.95, minLon: 37.35, maxLon: 37.95 };

function latLonToPercent(lat: number, lon: number) {
  const x = ((lon - MAP_BOUNDS.minLon) / (MAP_BOUNDS.maxLon - MAP_BOUNDS.minLon)) * 100;
  const y = ((MAP_BOUNDS.maxLat - lat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat)) * 100;
  return { x: Math.max(2, Math.min(98, x)), y: Math.max(2, Math.min(98, y)) };
}

const MapPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [cars, setCars] = useState<CarDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState<CarDto | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingMsg, setBookingMsg] = useState('');
  const isVerified = !!user?.credentials;

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const token = authApi.getAccessToken();
        const headers: Record<string, string> = token ? { 'Authorization': `Bearer ${token}` } : {};
        const res = await fetch(`${BASE_URL}/api/cars/getAvailableCars`, { headers });
        if (res.ok) setCars(await res.json());
      } catch { /* ignore */ }
      finally { setLoading(false); }
    };
    fetchCars();
  }, []);

  const filtered = filterStatus === 'ALL' ? cars : cars.filter(c => c.carStatus === filterStatus);

  // Use locationX as lat, locationY as lon from backend
  const getCoordsForCar = (car: CarDto) => {
    // If coordinates look like real lat/lon (55.x, 37.x) use them, else scatter randomly in Moscow
    const lat = car.locationX && car.locationX > 50 ? car.locationX : 55.55 + Math.random() * 0.4;
    const lon = car.locationY && car.locationY > 30 ? car.locationY : 37.35 + Math.random() * 0.6;
    return latLonToPercent(lat, lon);
  };

  const handleCarClick = (car: CarDto) => {
    setSelectedCar(prev => prev?.carId === car.carId ? null : car);
    setBookingMsg('');
  };

  const handleBook = async () => {
    if (!selectedCar || !isVerified) return;
    setBookingLoading(true);
    // Simulated booking - real impl would call order creation endpoint
    await new Promise(r => setTimeout(r, 1200));
    setBookingMsg('Бронирование доступно только через полный функционал заказов.');
    setBookingLoading(false);
  };

  const calcPrice = (car: CarDto) => {
    const base = 4;
    const coeff = car.carModelDto?.coefficient ?? 1;
    return (base * coeff).toFixed(0);
  };

  return (
      <div className="map-page">
        {/* Sidebar */}
        <aside className="map-sidebar">
          <div className="sidebar-header">
            <h2>Автомобили</h2>
            <span className="sidebar-count">{filtered.length} доступно</span>
          </div>

          <div className="sidebar-filters">
            {['ALL', 'AVAILABLE'].map(s => (
                <button
                    key={s}
                    className={`filter-pill ${filterStatus === s ? 'active' : ''}`}
                    onClick={() => setFilterStatus(s)}
                >
                  {s === 'ALL' ? `Все (${cars.length})` : `Свободные (${cars.filter(c => c.carStatus === 'AVAILABLE').length})`}
                </button>
            ))}
          </div>

          <div className="sidebar-cars">
            {loading ? (
                <div className="sidebar-loading"><div className="loader-ring" /></div>
            ) : filtered.length === 0 ? (
                <div className="sidebar-empty">Нет доступных автомобилей</div>
            ) : filtered.map(car => (
                <div
                    key={car.carId}
                    className={`sidebar-car-item ${selectedCar?.carId === car.carId ? 'selected' : ''}`}
                    onClick={() => handleCarClick(car)}
                >
                  <div className="sidebar-car-dot" style={{ background: STATUS_COLORS[car.carStatus] }} />
                  <div className="sidebar-car-info">
                    <strong>{car.carModelDto?.carManufactureDto?.name} {car.carModelDto?.name}</strong>
                    <span>{car.color} · {car.year} · {car.carModelDto?.seats} мест</span>
                    <span className="sidebar-car-price">от {calcPrice(car)} ₽/мин</span>
                  </div>
                  <div className="sidebar-car-fuel">
                    <div className="fuel-bar">
                      <div className="fuel-fill" style={{ width: `${car.fuelLevel}%`, background: car.fuelLevel > 30 ? '#10b981' : '#ef4444' }} />
                    </div>
                    <span>{car.fuelLevel}%</span>
                  </div>
                </div>
            ))}
          </div>
        </aside>

        {/* Map area */}
        <div className="map-area">
          {/* OpenStreetMap iframe */}
          <iframe
              className="map-osm"
              src="https://www.openstreetmap.org/export/embed.html?bbox=37.35%2C55.55%2C37.95%2C55.95&layer=mapnik"
              title="Карта города"
          />

          {/* Car markers overlay */}
          <div className="map-overlay">
            {!loading && filtered.map(car => {
              const { x, y } = getCoordsForCar(car);
              return (
                  <button
                      key={car.carId}
                      className={`car-marker ${selectedCar?.carId === car.carId ? 'car-marker-selected' : ''}`}
                      style={{ left: `${x}%`, top: `${y}%`, borderColor: STATUS_COLORS[car.carStatus] }}
                      onClick={() => handleCarClick(car)}
                      title={`${car.carModelDto?.carManufactureDto?.name} ${car.carModelDto?.name}`}
                  >
                    <svg width="14" height="9" viewBox="0 0 14 9" fill="none">
                      <rect x="0.5" y="3" width="13" height="5" rx="1.5" fill={STATUS_COLORS[car.carStatus]} />
                      <rect x="3" y="1" width="8" height="4" rx="1" fill={STATUS_COLORS[car.carStatus]} opacity="0.7" />
                      <circle cx="3" cy="8.5" r="1.5" fill={STATUS_COLORS[car.carStatus]} />
                      <circle cx="11" cy="8.5" r="1.5" fill={STATUS_COLORS[car.carStatus]} />
                    </svg>
                  </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="map-legend">
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
                <div key={k} className="legend-item">
                  <div className="legend-dot" style={{ background: STATUS_COLORS[k] }} />
                  <span>{v}</span>
                </div>
            ))}
          </div>

          {/* Selected car panel */}
          {selectedCar && (
              <div className="map-car-panel">
                <button className="panel-close" onClick={() => setSelectedCar(null)}>✕</button>
                <div className="panel-header">
                  <h3>{selectedCar.carModelDto?.carManufactureDto?.name} {selectedCar.carModelDto?.name}</h3>
                  <span className="panel-status" style={{ background: STATUS_COLORS[selectedCar.carStatus] + '20', color: STATUS_COLORS[selectedCar.carStatus] }}>
                                {STATUS_LABELS[selectedCar.carStatus]}
                            </span>
                </div>
                <div className="panel-details">
                  <div className="panel-row"><span>Цвет</span><strong>{selectedCar.color}</strong></div>
                  <div className="panel-row"><span>Год</span><strong>{selectedCar.year}</strong></div>
                  <div className="panel-row"><span>Топливо</span><strong>{selectedCar.fuelLevel}%</strong></div>
                  <div className="panel-row"><span>Трансмиссия</span><strong>{selectedCar.carModelDto?.transmission}</strong></div>
                  <div className="panel-row"><span>Мест</span><strong>{selectedCar.carModelDto?.seats}</strong></div>
                  <div className="panel-row"><span>Тип кузова</span><strong>{selectedCar.carModelDto?.bodyType}</strong></div>
                  <div className="panel-row panel-price"><span>Тариф</span><strong>от {calcPrice(selectedCar)} ₽/мин</strong></div>
                </div>
                {selectedCar.description && (
                    <p className="panel-desc">{selectedCar.description}</p>
                )}
                {bookingMsg && <div className="panel-msg">{bookingMsg}</div>}
                {isAuthenticated && isVerified && selectedCar.carStatus === 'AVAILABLE' ? (
                    <button className="panel-book-btn" onClick={handleBook} disabled={bookingLoading}>
                      {bookingLoading ? 'Обработка...' : '🚗 Забронировать'}
                    </button>
                ) : isAuthenticated && !isVerified ? (
                    <div className="panel-no-verif">Пройдите верификацию для бронирования</div>
                ) : !isAuthenticated ? (
                    <div className="panel-no-verif">Войдите для бронирования</div>
                ) : null}
              </div>
          )}
        </div>
      </div>
  );
};

export default MapPage;