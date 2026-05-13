import React, { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';
import { useAuth } from '../contexts/AuthContext';
import { BASE_URL } from '../api/auth.api';
import authApi from '../api/auth.api';
import { calculateRideCost, RideCostRequest } from '../api/ride.api';
import { createOrder, endOrder, endOrderWithLocation, OrderDto } from '../api/order.api';
import { bookCar, startRide, endRide } from '../api/car.api';
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
        console.log('Токен при загрузке страницы:', token ? 'есть' : 'нет');
        const headers: Record<string, string> = token
            ? { Authorization: `Bearer ${token}` }
            : {};
        
        console.log('Заголовки запроса:', headers);
        
        // Загружаем все автомобили (включая забронированные)
        const carsRes = await fetch(`${BASE_URL}/api/cars/getAllCars`, {
          headers,
        });
        console.log('Статус загрузки автомобилей:', carsRes.status, carsRes.ok);
        if (carsRes.ok) {
          const carsData = await carsRes.json();
          console.log('Автомобили загружены:', carsData.length);
          setCars(carsData);
        }

        // Если пользователь авторизован, проверяем активный заказ
        if (token && user) {
          try {
            console.log('Проверка активного заказа для пользователя:', user.userId);
            const ordersRes = await fetch(`${BASE_URL}/api/user/orders/active`, {
              headers,
            });
            console.log('Статус загрузки активного заказа:', ordersRes.status);
            if (ordersRes.ok) {
              const activeOrderData = await ordersRes.json();
              // Бэкенд возвращает null в теле, если активного заказа нет
              if (activeOrderData) {
                console.log('Активный заказ загружен:', activeOrderData);
                setActiveOrder(activeOrderData);
              } else {
                console.log('Активный заказ не найден (null в ответе)');
                setActiveOrder(null);
              }
            } else {
              // Если статус не 200-299, значит заказа нет
              console.log('Активный заказ не найден (статус не ok):', ordersRes.status, ordersRes.statusText);
              setActiveOrder(null);
            }
          } catch (orderError) {
            // Активного заказа может не быть - это нормально
            console.log('Активный заказ не найден (исключение):', orderError);
            setActiveOrder(null);
          }
        }
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
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
        try {
          // Проверяем, существует ли маршрут на карте перед удалением
          if (map.hasLayer(routingControlRef.current as any)) {
            map.removeControl(routingControlRef.current);
          }
        } catch (error) {
          console.error('Ошибка при удалении маршрута при размонтировании:', error);
        }
        routingControlRef.current = null;
      }
      if (destMarkerRef.current) {
        try {
          // Проверяем, существует ли маркер на карте перед удалением
          if (map.hasLayer(destMarkerRef.current)) {
            map.removeLayer(destMarkerRef.current);
          }
        } catch (error) {
          console.error('Ошибка при удалении маркера назначения:', error);
        }
        destMarkerRef.current = null;
      }
      try {
        map.remove();
      } catch (error) {
        console.error('Ошибка при удалении карты:', error);
      }
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
  const calculateRideCostHandler = useCallback(async (carId: number, distanceKm: number) => {
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
  }, [isAuthenticated, user]);

  // Построение маршрута
  const buildRoute = useCallback((fromLat: number, fromLng: number, toLat: number, toLng: number, carId?: number) => {
    const map = mapRef.current;
    if (!map) return;

    // Удаляем предыдущий маршрут
    if (routingControlRef.current) {
      try {
        map.removeControl(routingControlRef.current);
      } catch (error) {
        console.error('Ошибка при удалении предыдущего маршрута:', error);
      }
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
        
        // Если передан carId, рассчитываем стоимость
        if (carId && roundedDistance > 0) {
          calculateRideCostHandler(carId, roundedDistance);
        }
      }
    });

    routingControlRef.current = routingControl;
  }, [calculateRideCostHandler]);

  // Создание заказа
  const handleCreateOrder = async () => {
    if (!selectedCar || !isAuthenticated || !user) {
      setOrderError('Недостаточно данных для создания заказа');
      return;
    }
    
    // Проверяем, что есть маршрут или хотя бы выбран автомобиль
    if (!selectedCar) {
      setOrderError('Выберите автомобиль для создания заказа');
      return;
    }

    setOrderLoading(true);
    setOrderError(null);

    try {
      const token = authApi.getAccessToken();
      console.log('Токен при создании заказа:', token ? 'есть' : 'нет');
      if (!token) {
        throw new Error('Требуется авторизация');
      }

      console.log('Создание заказа для автомобиля:', selectedCar.carId, 'предварительная стоимость:', rideCost);
      
      // Логирование всех данных для создания Order в БД
      console.log('====== ДАННЫЕ ДЛЯ СОЗДАНИЯ ORDER В БД ПРИ СОЗДАНИИ ЗАКАЗА ======');
      console.log('Время:', new Date().toISOString());
      console.log('Пользователь нажал кнопку "Создать заказ"');
      
      console.log('1. Общая информация:');
      console.log('   - carId:', selectedCar.carId);
      console.log('   - rideCost:', rideCost);
      console.log('   - distanceKm:', distanceKm || 'не установлено');
      console.log('   - destLocation:', destLat && destLng ? { destLat, destLng } : 'не установлено');
      
      console.log('2. Данные пользователя:');
      console.log('   - userId:', user?.userId);
      console.log('   - email:', user?.email);
      console.log('   - verified:', user?.verified);
      
      console.log('3. Данные автомобиля:');
      console.log('   - carId:', selectedCar.carId);
      console.log('   - carStatus:', selectedCar.carStatus);
      console.log('   - carModel:', selectedCar.carModelDto?.name);
      console.log('   - carManufacture:', selectedCar.carModelDto?.carManufactureDto?.name);
      console.log('   - coefficient:', selectedCar.carModelDto?.coefficient);
      console.log('   - fuelLevel:', selectedCar.fuelLevel, '%');
      console.log('   - location:', { 
        lat: selectedCar.locationX, 
        lng: selectedCar.locationY 
      });
      
      console.log('4. Данные поездки:');
      console.log('   - distanceKm:', distanceKm || 'не установлено');
      console.log('   - rideCost:', rideCost);
      console.log('   - destLocation:', destLat && destLng ? { destLat, destLng } : 'не установлено');
      
      console.log('5. Данные для запроса к бэкенду:');
      console.log('   - endpoint:', '/api/orders/create');
      console.log('   - method:', 'POST');
      console.log('   - payload:', { 
        carId: selectedCar.carId
      });
      console.log('====== КОНЕЦ ДАННЫХ ======');
      
      // 1. Создаем заказ (в бэкенде автомобиль автоматически переводится в статус IN_USE)
      // Цена теперь не передается при создании, она будет рассчитана при завершении заказа
      const order = await createOrder(
        { carId: selectedCar.carId },
        token
      );
      
      console.log('Заказ создан:', order);
      
      setActiveOrder(order);
      setOrderError(null);
      
      // 2. Обновляем список автомобилей на фронтенде
      const updatedCars = cars.map(car => 
        car.carId === selectedCar.carId 
          ? { ...car, carStatus: 'IN_USE' as const }
          : car
      );
      setCars(updatedCars);
      
      // 3. Снимаем выделение с автомобиля
      setSelectedCar(null);
      
      console.log('Заказ успешно создан, автомобиль переведен в статус IN_USE');
    } catch (error: any) {
      console.error('Ошибка создания заказа:', error);
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

      // Логирование всех данных для создания Order в БД при завершении поездки
      console.log('====== ДАННЫЕ ДЛЯ СОЗДАНИЯ ORDER В БД ПРИ ЗАВЕРШЕНИИ ПОЕЗДКИ ======');
      console.log('Время:', new Date().toISOString());
      console.log('Пользователь нажал кнопку "Закончить поездку"');
      
      console.log('1. Общая информация:');
      console.log('   - Есть активный заказ:', !!activeOrder);
      console.log('   - ID активного заказа:', activeOrder?.orderId);
      console.log('   - Статус активного заказа:', activeOrder?.status);
      console.log('   - ID выбранного автомобиля:', selectedCar.carId);
      console.log('   - Статус автомобиля:', selectedCar.carStatus);
      console.log('   - Есть точка назначения:', !!(destLat && destLng));
      console.log('   - Расстояние установлено:', !!distanceKm);
      
      console.log('2. Данные пользователя:');
      console.log('   - userId:', user?.userId);
      console.log('   - email:', user?.email);
      console.log('   - verified:', user?.verified);
      
      console.log('3. Данные автомобиля:');
      console.log('   - carId:', selectedCar.carId);
      console.log('   - carStatus:', selectedCar.carStatus);
      console.log('   - carModel:', selectedCar.carModelDto?.name);
      console.log('   - carManufacture:', selectedCar.carModelDto?.carManufactureDto?.name);
      console.log('   - coefficient:', selectedCar.carModelDto?.coefficient);
      console.log('   - fuelLevel:', selectedCar.fuelLevel, '%');
      console.log('   - currentLocation:', { 
        lat: selectedCar.locationX, 
        lng: selectedCar.locationY 
      });
      
      console.log('4. Данные маршрута:');
      console.log('   - destLat:', destLat);
      console.log('   - destLng:', destLng);
      console.log('   - distanceKm:', distanceKm);
      console.log('   - rideCost:', rideCost);
      
      console.log('====== КОНЕЦ ОБЩИХ ДАННЫХ ======');

      // Если есть активный заказ, используем его для завершения
      if (activeOrder && activeOrder.carId === selectedCar.carId && activeOrder.status === 'STARTED') {
        console.log('Найден активный заказ для автомобиля, завершаем через заказ');
        
        // Логирование всех данных для завершения Order в БД
        console.log('====== ДАННЫЕ ДЛЯ ЗАВЕРШЕНИЯ ORDER В БД ======');
        console.log('1. Данные пользователя:');
        console.log('   - userId:', user?.userId);
        console.log('   - email:', user?.email);
        
        console.log('2. Данные автомобиля:');
        console.log('   - carId:', selectedCar.carId);
        console.log('   - carStatus:', selectedCar.carStatus);
        console.log('   - fuelLevel:', selectedCar.fuelLevel, '%');
        console.log('   - currentLocation:', { 
          lat: selectedCar.locationX, 
          lng: selectedCar.locationY 
        });
        
        console.log('3. Данные поездки:');
        console.log('   - orderId:', activeOrder.orderId);
        console.log('   - orderStatus:', activeOrder.status);
        console.log('   - orderPrice:', activeOrder.price);
        
        if (destLat && destLng && distanceKm) {
          // Рассчитываем расход топлива (20% за 100 км пропорционально)
          const fuelConsumptionPer100Km = 20.0;
          const fuelConsumed = (distanceKm / 100.0) * fuelConsumptionPer100Km;
          
          console.log('4. Данные маршрута:');
          console.log('   - distanceKm:', distanceKm);
          console.log('   - fuelConsumed:', fuelConsumed.toFixed(2), '%');
          console.log('   - startLocation:', { 
            lat: selectedCar.locationX, 
            lng: selectedCar.locationY 
          });
          console.log('   - endLocation:', { destLat, destLng });
          console.log('   - newFuelLevel:', Math.max(0, selectedCar.fuelLevel - fuelConsumed).toFixed(1), '%');
          
          console.log('5. Данные для запроса к бэкенду:');
          console.log('   - endpoint:', `/api/orders/${activeOrder.orderId}/end`);
          console.log('   - method:', 'PUT');
          console.log('   - payload:', { 
            distanceKm, 
            spendFuel: fuelConsumed,
            newLocationX: destLat,
            newLocationY: destLng
          });
          
          await endOrderWithLocation(
            activeOrder.orderId,
            { 
              distanceKm, 
              newLocationX: destLat,
              newLocationY: destLng
            },
            token
          );
        } else {
          console.log('4. Данные маршрута: НЕТ ДАННЫХ О МАРШРУТЕ');
          console.log('   - distanceKm: 0');
          console.log('   - fuelConsumed: 0');
          
          console.log('5. Данные для запроса к бэкенду:');
          console.log('   - endpoint:', `/api/orders/${activeOrder.orderId}/end`);
          console.log('   - method:', 'PUT');
          console.log('   - payload:', { distanceKm: 0 });
          
          await endOrder(activeOrder.orderId, { distanceKm: 0 }, token);
        }
        
        console.log('====== КОНЕЦ ДАННЫХ ======');
        setActiveOrder(null);
      } else {
        // Если нет активного заказа, просто завершаем поездку через CarsController
        console.log('Активного заказа нет, завершаем поездку через CarsController');
        
        // Логирование данных для завершения поездки без заказа
        console.log('====== ДАННЫЕ ДЛЯ ЗАВЕРШЕНИЯ ПОЕЗДКИ БЕЗ ORDER ======');
        console.log('1. Данные пользователя:');
        console.log('   - userId:', user?.userId);
        console.log('   - email:', user?.email);
        
        console.log('2. Данные автомобиля:');
        console.log('   - carId:', selectedCar.carId);
        console.log('   - carStatus:', selectedCar.carStatus);
        console.log('   - fuelLevel:', selectedCar.fuelLevel, '%');
        console.log('   - currentLocation:', { 
          lat: selectedCar.locationX, 
          lng: selectedCar.locationY 
        });
        
        // Если есть точка назначения, обновляем локацию автомобиля
        if (destLat && destLng && distanceKm) {
          // Рассчитываем расход топлива (20% за 100 км пропорционально)
          const fuelConsumptionPer100Km = 20.0;
          const fuelConsumed = (distanceKm / 100.0) * fuelConsumptionPer100Km;
          const newFuelLevel = Math.max(0, selectedCar.fuelLevel - fuelConsumed);
          
          console.log('3. Данные маршрута:');
          console.log('   - distanceKm:', distanceKm);
          console.log('   - fuelConsumed:', fuelConsumed.toFixed(2), '%');
          console.log('   - startLocation:', { 
            lat: selectedCar.locationX, 
            lng: selectedCar.locationY 
          });
          console.log('   - endLocation:', { destLat, destLng });
          console.log('   - newFuelLevel:', newFuelLevel.toFixed(1), '%');
          
          console.log('4. Данные для запроса к бэкенду:');
          console.log('   - endpoint:', `/api/cars/${selectedCar.carId}/end`);
          console.log('   - method:', 'PUT');
          console.log('   - payload: {} (без тела запроса)');
          console.log('   - обновление на фронтенде:');
          console.log('     - новый статус: AVAILABLE');
          console.log('     - новая локация:', { destLat, destLng });
          console.log('     - новый уровень топлива:', newFuelLevel.toFixed(1), '%');
          console.log('====== КОНЕЦ ДАННЫХ ======');
          
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
            try {
              map.removeLayer(destMarkerRef.current);
            } catch (error) {
              console.error('Ошибка при удалении маркера назначения:', error);
            }
            destMarkerRef.current = null;
          }
          if (routingControlRef.current && map) {
            try {
              map.removeControl(routingControlRef.current);
            } catch (error) {
              console.error('Ошибка при удалении маршрута:', error);
            }
            routingControlRef.current = null;
          }
          setDestLat(null);
          setDestLng(null);
          setDistanceKm(null);
          setRideCost(null);
        } else {
          console.log('3. Данные маршрута: НЕТ ДАННЫХ О МАРШРУТЕ');
          console.log('   - distanceKm: неизвестно');
          console.log('   - fuelConsumed: 0');
          console.log('   - endLocation: не изменяется');
          
          console.log('4. Данные для запроса к бэкенду:');
          console.log('   - endpoint:', `/api/cars/${selectedCar.carId}/end`);
          console.log('   - method:', 'PUT');
          console.log('   - payload: {} (без тела запроса)');
          console.log('   - обновление на фронтенде:');
          console.log('     - новый статус: AVAILABLE');
          console.log('     - локация: не изменяется');
          console.log('     - уровень топлива: не изменяется');
          console.log('====== КОНЕЦ ДАННЫХ ======');
          
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
      }
      
      setBookingMsg('Поездка завершена!');
      
    } catch (error: any) {
      console.error('Ошибка завершения поездки:', error);
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
      
      // Логирование всех данных для создания Order в БД
      console.log('====== ДАННЫЕ ДЛЯ СОЗДАНИЯ ORDER В БД ПРИ ЗАВЕРШЕНИИ ЗАКАЗА ======');
      console.log('Время:', new Date().toISOString());
      console.log('Пользователь нажал кнопку "Завершить поездку" из панели активного заказа');
      
      console.log('1. Общая информация:');
      console.log('   - orderId:', activeOrder.orderId);
      console.log('   - orderStatus:', activeOrder.status);
      console.log('   - carId:', activeOrder.carId);
      console.log('   - price:', activeOrder.price);
      console.log('   - distanceKm:', distanceKm);
      console.log('   - destLat:', destLat);
      console.log('   - destLng:', destLng);
      console.log('   - fuelConsumed:', fuelConsumed.toFixed(2), '%');
      
      console.log('2. Данные пользователя:');
      console.log('   - userId:', user?.userId);
      console.log('   - email:', user?.email);
      console.log('   - verified:', user?.verified);
      
      console.log('3. Данные автомобиля:');
      console.log('   - carId:', activeOrder.carId);
      console.log('   - carStatus:', selectedCar?.carStatus || 'не выбран');
      console.log('   - fuelLevel:', selectedCar?.fuelLevel || 'неизвестно');
      
      console.log('3. Данные поездки:');
      console.log('   - orderId:', activeOrder.orderId);
      console.log('   - distanceKm:', distanceKm);
      console.log('   - fuelConsumed:', fuelConsumed.toFixed(2), '%');
      console.log('   - startLocation:', { 
        lat: selectedCar?.locationX || 'неизвестно', 
        lng: selectedCar?.locationY || 'неизвестно' 
      });
      console.log('   - endLocation:', { destLat, destLng });
      console.log('   - price:', activeOrder.price);
      console.log('   - status:', activeOrder.status);
      
      console.log('4. Данные для запроса к бэкенду:');
      console.log('   - endpoint:', `/api/orders/${activeOrder.orderId}/end`);
      console.log('   - method:', 'PUT');
      console.log('   - payload:', { 
        distanceKm, 
        spendFuel: fuelConsumed,
        newLocationX: destLat,
        newLocationY: destLng
      });
      console.log('====== КОНЕЦ ДАННЫХ ======');
      
      // Завершаем заказ с обновлением локации и топлива
      const updatedOrder = await endOrderWithLocation(
        activeOrder.orderId,
        { 
          distanceKm, 
          newLocationX: destLat,
          newLocationY: destLng
        },
        token
      );
      
      console.log('Заказ завершен:', updatedOrder);
      
      setActiveOrder(updatedOrder);
      setOrderError(null);
      
      // Обновляем список автомобилей с новой локацией и топливом
      // Бэкенд уже обновил автомобиль, но мы обновляем локально для мгновенного отображения
      const updatedCars = cars.map(car => {
        if (car.carId === activeOrder.carId) {
          // Рассчитываем новый уровень топлива
          const newFuelLevel = Math.max(0, car.fuelLevel - fuelConsumed);
          console.log('Автомобиль обновлен локально:', {
            carId: car.carId,
            oldFuelLevel: car.fuelLevel,
            newFuelLevel,
            newLocation: { destLat, destLng }
          });
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
        try {
          map.removeLayer(destMarkerRef.current);
        } catch (error) {
          console.error('Ошибка при удалении маркера назначения:', error);
        }
        destMarkerRef.current = null;
      }
      if (routingControlRef.current && map) {
        try {
          map.removeControl(routingControlRef.current);
        } catch (error) {
          console.error('Ошибка при удалении маршрута:', error);
        }
        routingControlRef.current = null;
      }
      setDestLat(null);
      setDestLng(null);
      setDistanceKm(null);
      setRideCost(null);
      
      console.log('Заказ успешно завершен и маршрут очищен');
    } catch (error: any) {
      console.error('Ошибка завершения заказа:', error);
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
      try {
        // Проверяем, существует ли маркер на карте перед удалением
        if (map.hasLayer(destMarkerRef.current)) {
          map.removeLayer(destMarkerRef.current);
        }
      } catch (error) {
        console.error('Ошибка при удалении маркера назначения:', error);
      }
      destMarkerRef.current = null;
    }

    // Удаляем предыдущий маршрут
    if (routingControlRef.current) {
      try {
        // Проверяем, существует ли маршрут на карте перед удалением
        if (map.hasLayer(routingControlRef.current as any)) {
          map.removeControl(routingControlRef.current);
        }
      } catch (error) {
        console.error('Ошибка при удалении предыдущего маршрута:', error);
      }
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
    // Используем current selectedCar из состояния
    if (selectedCar) {
      buildRoute(selectedCar.locationX, selectedCar.locationY, lat, lng, selectedCar.carId);
    }
  }, [selectedCar, buildRoute]);

  // При изменении выбранного автомобиля перестраиваем маршрут
  useEffect(() => {
    if (selectedCar && destLat !== null && destLng !== null) {
      buildRoute(selectedCar.locationX, selectedCar.locationY, destLat, destLng, selectedCar.carId);
    }
  }, [selectedCar, destLat, destLng, buildRoute]);

  // При изменении расстояния пересчитываем стоимость
  useEffect(() => {
    if (selectedCar && distanceKm !== null && distanceKm > 0) {
      calculateRideCostHandler(selectedCar.carId, distanceKm);
    }
  }, [distanceKm, selectedCar, calculateRideCostHandler]);

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
                        try {
                          // Проверяем, существует ли маркер на карте перед удалением
                          if (map.hasLayer(destMarkerRef.current)) {
                            map.removeLayer(destMarkerRef.current);
                          }
                        } catch (error) {
                          console.error('Ошибка при удалении маркера назначения:', error);
                        }
                        destMarkerRef.current = null;
                      }
                      if (routingControlRef.current && map) {
                        try {
                          // Проверяем, существует ли маршрут на карте перед удалением
                          if (map.hasLayer(routingControlRef.current as any)) {
                            map.removeControl(routingControlRef.current);
                          }
                        } catch (error) {
                          console.error('Ошибка при удалении маршрута:', error);
                        }
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