// frontend/src/pages/MapPage.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';
import { useAuth } from '../contexts/AuthContext';
import { BASE_URL } from '../api/auth.api';
import authApi from '../api/auth.api';
import { calculateRideCost, RideCostRequest, RideCostResponse } from '../api/ride.api';
import { createOrder, endOrder, endOrderWithLocation, OrderDto } from '../api/order.api';
import { bookCar, startRide, endRide, CarDto as ApiCarDto } from '../api/car.api';
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
  const [destLat, setDestLat] = useState<number | null>(null);
  const [destLng, setDestLng] = useState<number | null>(null);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const destMarkerRef = useRef<L.Marker | null>(null);
  const routingControlRef = useRef<L.Routing.Control | null>(null);
  const [rideCost, setRideCost] = useState<number | null>(null);
  const [rideCostLoading, setRideCostLoading] = useState(false);
  const [rideCostError, setRideCostError] = useState<string | null>(null);
  const [activeOrder, setActiveOrder] = useState<OrderDto | null>(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [showInstruction, setShowInstruction] = useState<boolean>(true);

  const isVerified = !!user?.credentials;

  // ---------- Проверка куки для инструкции ----------
  useEffect(() => {
    const instructionHidden = document.cookie.includes('map_instruction_hidden=true');
    setShowInstruction(!instructionHidden);
  }, []);

  // Функция для скрытия инструкции
  const hideInstruction = (permanently: boolean = false) => {
    setShowInstruction(false);
    if (permanently) {
      // Устанавливаем куки на 30 дней
      const date = new Date();
      date.setTime(date.getTime() + (30 * 24 * 60 * 60 * 1000));
      document.cookie = `map_instruction_hidden=true; expires=${date.toUTCString()}; path=/`;
    }
  };

  // ---------- Загрузка автомобилей и активного заказа ----------
  useEffect(() => {
    const fetchCarsAndActiveOrder = async () => {
      try {
        const token = authApi.getAccessToken();
        const headers: Record<string, string> = token
            ? { Authorization: `Bearer ${token}` }
            : {};
        
        // Загружаем все автомобили (включая забронированные)
        const carsRes = await fetch(`${BASE_URL}/api/cars/getAllCars`, {
          headers,
        });
        if (carsRes.ok) {
          const carsData = await carsRes.json();
          setCars(carsData);
        }

        // Если пользователь авторизован, проверяем активный заказ
        if (token && user) {
          try {
            const ordersRes = await fetch(`${BASE_URL}/api/user/orders/active`, {
              headers,
            });
            if (ordersRes.ok) {
              const activeOrderData = await ordersRes.json();
              setActiveOrder(activeOrderData);
            }
          } catch (orderError) {
            // Активного заказа может не быть - это нормально
            console.log('Активный заказ не найден');
          }
        }
      } catch {
        // Обработка ошибок
      } finally {
        setLoading(false);
      }
    };
    fetchCarsAndActiveOrder();
  }, [user]);

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

    // Обработчик клика по карте для установки точки назначения
    map.on('click', (e: L.LeafletMouseEvent) => {
      handleMapClick(e.latlng.lat, e.latlng.lng);
    });

    mapRef.current = map;

    // Очистка при размонтировании
    return () => {
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
        routingControlRef.current = null;
      }
      if (destMarkerRef.current) {
        map.removeLayer(destMarkerRef.current);
        destMarkerRef.current = null;
      }
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
    if (!selectedCar || !isVerified || !isAuthenticated || !user) {
      setBookingMsg('Требуется авторизация и верификация для бронирования');
      return;
    }

    if (selectedCar.carStatus !== 'AVAILABLE') {
      setBookingMsg('Автомобиль недоступен для бронирования');
      return;
    }

    setBookingLoading(true);
    setBookingMsg('');

    try {
      const token = authApi.getAccessToken();
      if (!token) {
        throw new Error('Требуется авторизация');
      }

      // Бронируем автомобиль
      const updatedCar = await bookCar(selectedCar.carId, token);
      
      // Обновляем список автомобилей
      const updatedCars = cars.map(car => 
        car.carId === selectedCar.carId 
          ? { ...car, carStatus: 'BOOKED' as const }
          : car
      );
      setCars(updatedCars);
      
      // Обновляем выбранный автомобиль
      setSelectedCar({ ...selectedCar, carStatus: 'BOOKED' as const });
      
      setBookingMsg('Автомобиль успешно забронирован!');
    } catch (error: any) {
      setBookingMsg(error.message || 'Ошибка бронирования автомобиля');
    } finally {
      setBookingLoading(false);
    }
  };

  const calcPrice = (car: CarDto) => {
    const base = 4;
    const coeff = car.carModelDto?.coefficient ?? 1;
    return (base * coeff).toFixed(0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'BYN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Расчет стоимости поездки
  const calculateRideCostHandler = async (carId: number, distanceKm: number) => {
    if (!isAuthenticated || !user) {
      setRideCostError('Требуется авторизация для расчета стоимости');
      return;
    }

    setRideCostLoading(true);
    setRideCostError(null);

    try {
      const token = authApi.getAccessToken();
      if (!token) {
        throw new Error('Требуется авторизация');
      }

      const request: RideCostRequest = { carId, distanceKm };
      const response = await calculateRideCost(request, token);
      setRideCost(response.totalCost);
    } catch (error: any) {
      setRideCostError(error.message || 'Ошибка расчета стоимости');
      setRideCost(null);
    } finally {
      setRideCostLoading(false);
    }
  };

  // Создание заказа
  const handleCreateOrder = async () => {
    if (!selectedCar || !rideCost || !isAuthenticated || !user) {
      setOrderError('Недостаточно данных для создания заказа');
      return;
    }

    setOrderLoading(true);
    setOrderError(null);

    try {
      const token = authApi.getAccessToken();
      if (!token) {
        throw new Error('Требуется авторизация');
      }

      const order = await createOrder(
        { carId: selectedCar.carId, price: rideCost },
        token
      );
      
      setActiveOrder(order);
      setOrderError(null);
      
      // Обновляем список автомобилей (автомобиль должен перейти в статус IN_USE)
      const updatedCars = cars.map(car => 
        car.carId === selectedCar.carId 
          ? { ...car, carStatus: 'IN_USE' as const }
          : car
      );
      setCars(updatedCars);
      
      // Снимаем выделение с автомобиля
      setSelectedCar(null);
    } catch (error: any) {
      setOrderError(error.message || 'Ошибка создания заказа');
    } finally {
      setOrderLoading(false);
    }
  };

  // Начало поездки (В путь)
  const handleStartRide = async () => {
    if (!selectedCar || !isVerified || !isAuthenticated || !user) {
      setBookingMsg('Требуется авторизация и верификация для начала поездки');
      return;
    }

    if (selectedCar.carStatus !== 'BOOKED') {
      setBookingMsg('Автомобиль должен быть забронирован для начала поездки');
      return;
    }

    setBookingLoading(true);
    setBookingMsg('');

    try {
      const token = authApi.getAccessToken();
      if (!token) {
        throw new Error('Требуется авторизация');
      }

      // Начинаем поездку (меняем статус на IN_USE)
      const updatedCar = await startRide(selectedCar.carId, token);
      
      // Обновляем список автомобилей
      const updatedCars = cars.map(car => 
        car.carId === selectedCar.carId 
          ? { ...car, carStatus: 'IN_USE' as const }
          : car
      );
      setCars(updatedCars);
      
      // Обновляем выбранный автомобиль
      setSelectedCar({ ...selectedCar, carStatus: 'IN_USE' as const });
      
      setBookingMsg('Поездка начата!');
    } catch (error: any) {
      setBookingMsg(error.message || 'Ошибка начала поездки');
    } finally {
      setBookingLoading(false);
    }
  };

  // Завершение поездки с карты (без заказа) с обновлением локации и топлива
  const handleEndRideFromMap = async () => {
    if (!selectedCar || !isAuthenticated || !user) {
      setBookingMsg('Требуется авторизация для завершения поездки');
      return;
    }

    if (selectedCar.carStatus !== 'IN_USE') {
      setBookingMsg('Автомобиль не в поездке');
      return;
    }

    setBookingLoading(true);
    setBookingMsg('');

    try {
      const token = authApi.getAccessToken();
      if (!token) {
        throw new Error('Требуется авторизация');
      }

      // Если есть точка назначения, обновляем локацию автомобиля
      if (destLat && destLng && distanceKm) {
        // Рассчитываем расход топлива (20% за 100 км пропорционально)
        const fuelConsumptionPer100Km = 20.0;
        const fuelConsumed = (distanceKm / 100.0) * fuelConsumptionPer100Km;
        const newFuelLevel = Math.max(0, selectedCar.fuelLevel - fuelConsumed);
        
        // Обновляем автомобиль с новой локацией и топливом
        const updatedCars = cars.map(car => {
          if (car.carId === selectedCar.carId) {
            return { 
              ...car, 
              carStatus: 'AVAILABLE' as const,
              locationX: destLat,
              locationY: destLng,
              fuelLevel: parseFloat(newFuelLevel.toFixed(1))
            };
          }
          return car;
        });
        setCars(updatedCars);
        
        // Обновляем выбранный автомобиль
        setSelectedCar({ 
          ...selectedCar, 
          carStatus: 'AVAILABLE' as const,
          locationX: destLat,
          locationY: destLng,
          fuelLevel: Math.round(newFuelLevel)
        });
        
        // Очищаем маршрут
        const map = mapRef.current;
        if (destMarkerRef.current && map) {
          map.removeLayer(destMarkerRef.current);
          destMarkerRef.current = null;
        }
        if (routingControlRef.current && map) {
          map.removeControl(routingControlRef.current);
          routingControlRef.current = null;
        }
        setDestLat(null);
        setDestLng(null);
        setDistanceKm(null);
        setRideCost(null);
      } else {
        // Просто завершаем поездку без обновления локации
        const updatedCar = await endRide(selectedCar.carId, token);
        
        // Обновляем список автомобилей
        const updatedCars = cars.map(car => 
          car.carId === selectedCar.carId 
            ? { ...car, carStatus: 'AVAILABLE' as const }
            : car
        );
        setCars(updatedCars);
        
        // Обновляем выбранный автомобиль
        setSelectedCar({ ...selectedCar, carStatus: 'AVAILABLE' as const });
      }
      
      setBookingMsg('Поездка завершена!');
      
      // Очищаем активный заказ если он есть
      setActiveOrder(null);
    } catch (error: any) {
      setBookingMsg(error.message || 'Ошибка завершения поездки');
    } finally {
      setBookingLoading(false);
    }
  };

  // Завершение заказа с обновлением локации и топлива
  const handleEndOrder = async () => {
    if (!activeOrder || !distanceKm || !destLat || !destLng) {
      setOrderError('Недостаточно данных для завершения заказа');
      return;
    }

    setOrderLoading(true);
    setOrderError(null);

    try {
      const token = authApi.getAccessToken();
      if (!token) {
        throw new Error('Требуется авторизация');
      }

      // Рассчитываем расход топлива (20% за 100 км пропорционально)
      const fuelConsumptionPer100Km = 20.0;
      const fuelConsumed = (distanceKm / 100.0) * fuelConsumptionPer100Km;
      
      // Завершаем заказ с обновлением локации и топлива
      const updatedOrder = await endOrderWithLocation(
        activeOrder.orderId,
        { 
          distanceKm, 
          spendFuel: fuelConsumed,
          newLocationX: destLat,
          newLocationY: destLng
        },
        token
      );
      
      setActiveOrder(updatedOrder);
      setOrderError(null);
      
      // Обновляем список автомобилей с новой локацией и топливом
      const updatedCars = cars.map(car => {
        if (car.carId === activeOrder.carId) {
          // Рассчитываем новый уровень топлива
          const newFuelLevel = Math.max(0, car.fuelLevel - fuelConsumed);
          return { 
            ...car, 
            carStatus: 'AVAILABLE' as const,
            locationX: destLat,
            locationY: destLng,
            fuelLevel: Math.round(newFuelLevel)
          };
        }
        return car;
      });
      setCars(updatedCars);
      
      // Очищаем маршрут
      const map = mapRef.current;
      if (destMarkerRef.current && map) {
        map.removeLayer(destMarkerRef.current);
        destMarkerRef.current = null;
      }
      if (routingControlRef.current && map) {
        map.removeControl(routingControlRef.current);
        routingControlRef.current = null;
      }
      setDestLat(null);
      setDestLng(null);
      setDistanceKm(null);
      setRideCost(null);
    } catch (error: any) {
      setOrderError(error.message || 'Ошибка завершения заказа');
    } finally {
      setOrderLoading(false);
    }
  };

  // Обработка клика по карте для установки точки назначения
  const handleMapClick = useCallback((lat: number, lng: number) => {
    const map = mapRef.current;
    if (!map) return;

    // Удаляем предыдущий маркер назначения
    if (destMarkerRef.current) {
      map.removeLayer(destMarkerRef.current);
      destMarkerRef.current = null;
    }

    // Удаляем предыдущий маршрут
    if (routingControlRef.current) {
      map.removeControl(routingControlRef.current);
      routingControlRef.current = null;
    }

    // Создаем новый маркер назначения (красный)
    const destMarker = L.marker([lat, lng], {
      icon: L.divIcon({
        html: '<div style="background: #ef4444; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.4);"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      }),
    }).addTo(map);

    destMarkerRef.current = destMarker;
    setDestLat(lat);
    setDestLng(lng);
    setDistanceKm(null);
    setRideCost(null);
    setRideCostError(null);

    // Если выбран автомобиль, строим маршрут
    if (selectedCar) {
      buildRoute(selectedCar.locationX, selectedCar.locationY, lat, lng);
    }
  }, [selectedCar]);

  // Построение маршрута
  const buildRoute = useCallback((fromLat: number, fromLng: number, toLat: number, toLng: number) => {
    const map = mapRef.current;
    if (!map) return;

    // Удаляем предыдущий маршрут
    if (routingControlRef.current) {
      map.removeControl(routingControlRef.current);
      routingControlRef.current = null;
    }

    // Создаем новый маршрут
    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(fromLat, fromLng),
        L.latLng(toLat, toLng)
      ],
      routeWhileDragging: false,
      showAlternatives: false,
      lineOptions: {
        styles: [{ color: '#2563eb', weight: 4, opacity: 0.7 }],
        extendToWaypoints: true,
        missingRouteTolerance: 10
      }
    }).addTo(map);

    // Обработка завершения построения маршрута
    routingControl.on('routesfound', (e: any) => {
      const routes = e.routes;
      if (routes && routes.length > 0) {
        const distanceMeters = routes[0].summary.totalDistance;
        const distanceKmValue = distanceMeters / 1000;
        const roundedDistance = parseFloat(distanceKmValue.toFixed(2));
        setDistanceKm(roundedDistance);
        
        // Если выбран автомобиль, рассчитываем стоимость
        if (selectedCar && roundedDistance > 0) {
          calculateRideCostHandler(selectedCar.carId, roundedDistance);
        }
      }
    });

    routingControlRef.current = routingControl;
  }, [selectedCar]);

  // При изменении выбранного автомобиля перестраиваем маршрут
  useEffect(() => {
    if (selectedCar && destLat !== null && destLng !== null) {
      buildRoute(selectedCar.locationX, selectedCar.locationY, destLat, destLng);
    }
  }, [selectedCar, destLat, destLng, buildRoute]);

  // При изменении расстояния пересчитываем стоимость
  useEffect(() => {
    if (selectedCar && distanceKm !== null && distanceKm > 0) {
      calculateRideCostHandler(selectedCar.carId, distanceKm);
    }
  }, [distanceKm, selectedCar]);

  // Фильтрация списка с учетом активного заказа
  const filteredCars = (() => {
    // Если у пользователя есть активный заказ в статусе STARTED, показываем только его автомобиль
    if (activeOrder && activeOrder.status === 'STARTED') {
      return cars.filter((c) => c.carId === activeOrder.carId);
    }
    
    // Иначе применяем обычную фильтрацию
    if (filterStatus === 'ALL') {
      return cars;
    } else if (filterStatus === 'AVAILABLE') {
      return cars.filter((c) => c.carStatus === 'AVAILABLE');
    }
    return cars.filter((c) => c.carStatus === filterStatus);
  })();

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
            {/* Панель информации о маршруте */}
            {(destLat !== null && destLng !== null) && (
                <div className="map-route-info">
                  <h4>Маршрут</h4>
                  <p>Точка назначения установлена</p>
                  <p>Координаты: {destLat.toFixed(5)}, {destLng.toFixed(5)}</p>
                  {distanceKm !== null && (
                      <p className="map-distance">Расстояние: <strong>{distanceKm} км</strong></p>
                  )}
                  
                  {/* Расчет стоимости */}
                  {rideCostLoading && (
                    <p className="map-cost-loading">Расчет стоимости...</p>
                  )}
                  {rideCostError && (
                    <p className="map-cost-error">{rideCostError}</p>
                  )}
                  {rideCost !== null && !rideCostLoading && (
                    <div className="map-cost-result">
                      <p className="map-cost-total">Стоимость: <strong>{formatCurrency(rideCost)}</strong></p>
                      {selectedCar && !activeOrder && isAuthenticated && isVerified && (
                        <button 
                          className="map-create-order-btn"
                          onClick={handleCreateOrder}
                          disabled={orderLoading}
                        >
                          {orderLoading ? 'Создание заказа...' : 'Создать заказ'}
                        </button>
                      )}
                    </div>
                  )}
                  
                  {/* Активный заказ */}
                  {activeOrder && (
                    <div className="map-active-order">
                      <h5>Активный заказ</h5>
                      <p>ID: {activeOrder.orderId}</p>
                      <p>Статус: {activeOrder.status === 'STARTED' ? 'В процессе' : 'Завершен'}</p>
                      <p>Стоимость: {formatCurrency(activeOrder.price)}</p>
                      {activeOrder.status === 'STARTED' && (
                        <button 
                          className="map-end-order-btn"
                          onClick={handleEndOrder}
                          disabled={orderLoading}
                        >
                          {orderLoading ? 'Завершение...' : 'Завершить поездку'}
                        </button>
                      )}
                    </div>
                  )}
                  
                  {/* Ошибки заказа */}
                  {orderError && (
                    <p className="map-order-error">{orderError}</p>
                  )}
                  
                  <button 
                    className="map-clear-route-btn"
                    onClick={() => {
                      const map = mapRef.current;
                      if (destMarkerRef.current && map) {
                        map.removeLayer(destMarkerRef.current);
                        destMarkerRef.current = null;
                      }
                      if (routingControlRef.current && map) {
                        map.removeControl(routingControlRef.current);
                        routingControlRef.current = null;
                      }
                      setDestLat(null);
                      setDestLng(null);
                      setDistanceKm(null);
                      setRideCost(null);
                      setRideCostError(null);
                    }}
                  >
                    Очистить маршрут
                  </button>
                </div>
            )}
            
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
                        <span className="map-car-price">от {calcPrice(car)} BYN/мин</span>
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
            
            {/* Инструкция для пользователя */}
            {showInstruction && (
              <div className="map-instruction">
                <button 
                  className="map-instruction-close"
                  onClick={() => hideInstruction(false)}
                  title="Закрыть"
                >
                  ✕
                </button>
                <h5>Как построить маршрут:</h5>
                <ul>
                  <li>1. Выберите автомобиль из списка слева</li>
                  <li>2. Кликните на карте для установки точки назначения</li>
                  <li>3. Маршрут будет построен автоматически</li>
                  <li>4. Расстояние отобразится в боковой панели</li>
                </ul>
                <div className="map-instruction-actions">
                  <button 
                    className="map-instruction-understood"
                    onClick={() => hideInstruction(false)}
                  >
                    Все понятно
                  </button>
                  <button 
                    className="map-instruction-never-show"
                    onClick={() => hideInstruction(true)}
                  >
                    Больше не показывать
                  </button>
                </div>
              </div>
            )}
            
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

            {/* Кнопка "Закончить поездку" для автомобиля в статусе IN_USE */}
            {selectedCar && selectedCar.carStatus === 'IN_USE' && (
              <div className="map-end-ride-overlay">
                <div className="map-end-ride-content">
                  <h5>Автомобиль в поездке</h5>
                  <p>Вы можете завершить поездку в любой момент</p>
                  <button 
                    className="map-end-ride-btn"
                    onClick={handleEndRideFromMap}
                    disabled={bookingLoading}
                  >
                    {bookingLoading ? 'Завершение...' : 'Закончить поездку'}
                  </button>
                </div>
              </div>
            )}
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
                <div><span>Тариф</span> от {calcPrice(selectedCar)} BYN/мин</div>
              </div>
              {selectedCar.description && (
                  <p className="map-car-description">{selectedCar.description}</p>
              )}
              {bookingMsg && <div className="map-booking-msg">{bookingMsg}</div>}
              
              {/* Кнопки действий в зависимости от статуса автомобиля */}
              {isAuthenticated && isVerified ? (
                <div className="map-car-actions">
                  {selectedCar.carStatus === 'AVAILABLE' && (
                    <button className="map-book-btn" onClick={handleBook} disabled={bookingLoading}>
                      {bookingLoading ? 'Обработка...' : 'Забронировать'}
                    </button>
                  )}
                  
                  {selectedCar.carStatus === 'BOOKED' && (
                    <div className="map-ride-actions">
                      <button className="map-start-ride-btn" onClick={handleStartRide} disabled={bookingLoading}>
                        {bookingLoading ? 'Обработка...' : 'В путь'}
                      </button>
                      <p className="map-action-hint">Начните поездку с забронированного автомобиля</p>
                    </div>
                  )}
                  
                  {selectedCar.carStatus === 'IN_USE' && (
                    <p className="map-in-use-msg">Автомобиль в поездке</p>
                  )}
                  
                  {selectedCar.carStatus === 'OUT_OF_SERVICE' && (
                    <p className="map-out-of-service-msg">Автомобиль не в строю</p>
                  )}
                </div>
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