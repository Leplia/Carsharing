import React, { useState, useEffect, useCallback } from 'react';
import { getAllCars, CarDto } from '../api/car.api';
import '../styles/pages/CarsPage.css';

const CarsPage: React.FC = () => {
  const [cars, setCars] = useState<CarDto[]>([]);
  const [filteredCars, setFilteredCars] = useState<CarDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Состояния для фильтров
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [manufacturerFilter, setManufacturerFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Уникальные производители для фильтра
  const [manufacturers, setManufacturers] = useState<string[]>([]);

  // Загрузка автомобилей
  const loadCars = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getAllCars();
      setCars(data);
      setFilteredCars(data);
      
      // Извлекаем уникальных производителей
      const uniqueManufacturers = Array.from(
        new Set(data.map(car => car.carModelDto.carManufactureDto.name))
      ).sort();
      setManufacturers(uniqueManufacturers);
      
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки автомобилей');
      console.error('Ошибка загрузки автомобилей:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCars();
  }, [loadCars]);

  // Применение фильтров и сортировки
  useEffect(() => {
    let result = [...cars];

    // Поиск по названию, модели или производителю
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(car => 
        car.carModelDto.name.toLowerCase().includes(query) ||
        car.carModelDto.carManufactureDto.name.toLowerCase().includes(query) ||
        car.description.toLowerCase().includes(query)
      );
    }

    // Фильтр по статусу
    if (statusFilter !== 'all') {
      result = result.filter(car => car.carStatus === statusFilter);
    }

    // Фильтр по производителю
    if (manufacturerFilter !== 'all') {
      result = result.filter(car => 
        car.carModelDto.carManufactureDto.name === manufacturerFilter
      );
    }

    // Сортировка
    result.sort((a, b) => {
      let valueA, valueB;
      
      switch (sortBy) {
        case 'name':
          valueA = a.carModelDto.name;
          valueB = b.carModelDto.name;
          break;
        case 'manufacturer':
          valueA = a.carModelDto.carManufactureDto.name;
          valueB = b.carModelDto.carManufactureDto.name;
          break;
        case 'year':
          valueA = a.year;
          valueB = b.year;
          break;
        case 'price':
          valueA = a.carModelDto.coefficient * 4; // Примерная цена за минуту
          valueB = b.carModelDto.coefficient * 4;
          break;
        default:
          valueA = a.carModelDto.name;
          valueB = b.carModelDto.name;
      }

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortOrder === 'asc' 
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      } else {
        return sortOrder === 'asc' 
          ? (valueA as number) - (valueB as number)
          : (valueB as number) - (valueA as number);
      }
    });

    setFilteredCars(result);
  }, [cars, searchQuery, statusFilter, manufacturerFilter, sortBy, sortOrder]);

  // Обработчики
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };

  const handleManufacturerFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setManufacturerFilter(e.target.value);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
  };

  const handleSortOrderToggle = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const handleBookCar = (carId: number) => {
    // Проверяем авторизацию
    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert('Для бронирования автомобиля необходимо авторизоваться.');
      return;
    }
    // Здесь будет логика бронирования автомобиля
    alert(`Бронирование автомобиля #${carId}. Функционал в разработке.`);
  };

  const handleViewDetails = (carId: number) => {
    // Здесь будет переход к детальной информации об автомобиле
    alert(`Детальная информация об автомобиле #${carId}. Функционал в разработке.`);
  };

  // Функция для получения текста статуса
  const getStatusText = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'Доступен';
      case 'BOOKED': return 'Забронирован';
      case 'IN_USE': return 'В поездке';
      case 'OUT_OF_SERVICE': return 'Неисправен';
      default: return status;
    }
  };

  // Функция для расчета примерной цены за минуту
  const calculatePricePerMinute = (coefficient: number) => {
    const baseRate = 4.0; // Базовая ставка
    return (baseRate * coefficient).toFixed(1);
  };

  // Функция для получения цвета статуса
  const getStatusClass = (status: string) => {
    return `status-${status.toLowerCase()}`;
  };

  if (loading) {
    return (
      <div className="cars-page">
        <div className="cars-loading">
          <div className="loader-ring"></div>
          <p>Загрузка автопарка...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cars-page">
        <div className="cars-error">
          <h2>Ошибка</h2>
          <p>{error}</p>
          <button onClick={loadCars} className="btn-primary">
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cars-page">
      <div className="cars-header">
        <h1>Наш автопарк</h1>
        <p className="cars-subtitle">
          Выберите автомобиль для вашей следующей поездки. Все автомобили проходят 
          регулярное техническое обслуживание и полностью застрахованы.
        </p>
      </div>

      <div className="cars-filters">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Поиск по названию, модели или производителю..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>

        <div className="filter-group">
          <label className="filter-label">Статус</label>
          <select 
            className="filter-select" 
            value={statusFilter}
            onChange={handleStatusFilterChange}
          >
            <option value="all">Все статусы</option>
            <option value="AVAILABLE">Доступен</option>
            <option value="BOOKED">Забронирован</option>
            <option value="IN_USE">В поездке</option>
            <option value="OUT_OF_SERVICE">Неисправен</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Производитель</label>
          <select 
            className="filter-select" 
            value={manufacturerFilter}
            onChange={handleManufacturerFilterChange}
          >
            <option value="all">Все производители</option>
            {manufacturers.map(manufacturer => (
              <option key={manufacturer} value={manufacturer}>
                {manufacturer}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Сортировка</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <select 
              className="filter-select" 
              value={sortBy}
              onChange={handleSortChange}
              style={{ flex: 1 }}
            >
              <option value="name">По названию</option>
              <option value="manufacturer">По производителю</option>
              <option value="year">По году выпуска</option>
              <option value="price">По цене</option>
            </select>
            <button 
              className="btn-secondary"
              onClick={handleSortOrderToggle}
              style={{ padding: '10px', minWidth: '40px' }}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {filteredCars.length === 0 ? (
        <div className="cars-empty">
          <h2>Автомобили не найдены</h2>
          <p>Попробуйте изменить параметры поиска или фильтры.</p>
        </div>
      ) : (
        <>
          <div className="cars-grid">
            {filteredCars.map(car => (
              <div key={car.carId} className="car-card">
                <div className="car-image-container">
                  {car.photoUrl ? (
                    <img 
                      src={car.photoUrl} 
                      alt={car.carModelDto.name}
                      className="car-image"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200/3b82f6/ffffff?text=Car+Image';
                      }}
                    />
                  ) : (
                    <div className="car-image" style={{ 
                      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '24px'
                    }}>
                      {car.carModelDto.name}
                    </div>
                  )}
                  <div className={`car-status-badge ${getStatusClass(car.carStatus)}`}>
                    {getStatusText(car.carStatus)}
                  </div>
                </div>

                <div className="car-content">
                  <div className="car-header">
                    <h3 className="car-title">{car.carModelDto.name}</h3>
                    <div className="car-price">
                      <span className="price-value">
                        {calculatePricePerMinute(car.carModelDto.coefficient)}
                      </span>
                      <span className="price-unit">₽/мин</span>
                    </div>
                  </div>

                  <div className="car-manufacturer">
                    {car.carModelDto.carManufactureDto.badgeUrl && (
                      <img 
                        src={car.carModelDto.carManufactureDto.badgeUrl}
                        alt={car.carModelDto.carManufactureDto.name}
                        className="manufacturer-badge"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                    <span className="manufacturer-name">
                      {car.carModelDto.carManufactureDto.name}
                    </span>
                  </div>

                  <p className="car-model">
                    {car.year} • {car.color}
                  </p>

                  <div className="car-details">
                    <div className="car-detail">
                      <span className="detail-icon icon-transmission"></span>
                      <span>{car.carModelDto.transmission}</span>
                    </div>
                    <div className="car-detail">
                      <span className="detail-icon icon-seats"></span>
                      <span>{car.carModelDto.seats} мест</span>
                    </div>
                    <div className="car-detail">
                      <span className="detail-icon icon-body"></span>
                      <span>{car.carModelDto.bodyType}</span>
                    </div>
                    <div className="car-detail">
                      <span className="detail-icon icon-fuel"></span>
                      <span>{car.fuelLevel}% топлива</span>
                    </div>
                  </div>

                  {car.description && (
                    <p style={{ 
                      fontSize: '14px', 
                      color: '#6b7280', 
                      marginTop: '12px',
                      lineHeight: '1.5'
                    }}>
                      {car.description.length > 100 
                        ? `${car.description.substring(0, 100)}...` 
                        : car.description}
                    </p>
                  )}
                </div>

                <div className="car-footer">
                  <div className="car-actions">
                    <button 
                      className="btn-primary"
                      onClick={() => handleBookCar(car.carId)}
                      disabled={car.carStatus !== 'AVAILABLE'}
                    >
                      {car.carStatus === 'AVAILABLE' ? 'Забронировать' : 'Недоступно'}
                    </button>
                    <button 
                      className="btn-secondary"
                      onClick={() => handleViewDetails(car.carId)}
                    >
                      Подробнее
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ 
            textAlign: 'center', 
            marginTop: '32px',
            color: '#6b7280',
            fontSize: '14px'
          }}>
            Показано {filteredCars.length} из {cars.length} автомобилей
          </div>
        </>
      )}
    </div>
  );
};

export default CarsPage;