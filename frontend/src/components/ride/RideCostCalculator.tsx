import React, { useState } from 'react';
import { calculateRideCost, RideCostResponse } from '../../api/ride.api';
import { useAuth } from '../../contexts/AuthContext';
import authApi from '../../api/auth.api';
import '../../styles/ride/RideCostCalculator.css';

interface RideCostCalculatorProps {
  carId: number;
  carName: string;
  coefficient: number;
}

const RideCostCalculator: React.FC<RideCostCalculatorProps> = ({
  carId,
  carName,
  coefficient,
}) => {
  const { user } = useAuth();
  const [distance, setDistance] = useState<string>('10');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RideCostResponse | null>(null);
  const [error, setError] = useState<string>('');

  const handleCalculate = async () => {
    if (!user) {
      setError('Требуется авторизация');
      return;
    }

    if (!distance || parseFloat(distance) <= 0) {
      setError('Введите корректное расстояние');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const token = authApi.getAccessToken();
      if (!token) {
        throw new Error('Требуется авторизация');
      }

      const request = {
        carId,
        distanceKm: parseFloat(distance),
      };

      const response = await calculateRideCost(request, token);
      setResult(response);
    } catch (err: any) {
      setError(err.message || 'Ошибка расчета стоимости');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'BYN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="ride-cost-calculator">
      <h3>Калькулятор стоимости поездки</h3>
      <p>Автомобиль: {carName} (коэффициент: {coefficient})</p>
      
      <div className="calculator-form">
        <div className="form-group">
          <label htmlFor="distance">Расстояние (км):</label>
          <input
            id="distance"
            type="number"
            min="0.1"
            step="0.1"
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            placeholder="Введите расстояние"
            disabled={loading}
          />
        </div>
        
        <button
          onClick={handleCalculate}
          disabled={loading || !user}
          className="calculate-btn"
        >
          {loading ? 'Расчет...' : 'Рассчитать стоимость'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {result && (
        <div className="result-card">
          <h4>Результат расчета</h4>
          <div className="result-details">
            <div className="result-row">
              <span>Итоговая стоимость:</span>
              <strong>{formatCurrency(result.totalCost)}</strong>
            </div>
            <div className="result-row">
              <span>Базовая ставка:</span>
              <span>{formatCurrency(result.baseRate || 0)}/км</span>
            </div>
            <div className="result-row">
              <span>Коэффициент автомобиля:</span>
              <span>{result.coefficient || 0}</span>
            </div>
            <div className="result-row">
              <span>Скидка:</span>
              <span>{result.discountPercent || 0}%</span>
            </div>
            <div className="result-row">
              <span>Расстояние:</span>
              <span>{result.distanceKm || 0} км</span>
            </div>
          </div>
          
          <div className="formula">
            <small>
              Формула: {result.distanceKm || 0} км × {result.baseRate || 0} × {result.coefficient || 0} × 
              (1 - {(result.discountPercent || 0)/100}) = {formatCurrency(result.totalCost)}
            </small>
          </div>
        </div>
      )}

      {!user && (
        <div className="auth-warning">
          <p>Для расчета стоимости необходимо авторизоваться.</p>
        </div>
      )}

      {user && user.blocked && (
        <div className="blocked-warning">
          <p>Ваша учетная запись заблокирована. Расчет стоимости недоступен.</p>
        </div>
      )}

      {user && !user.verified && (
        <div className="verification-warning">
          <p>Требуется верификация учетной записи для расчета стоимости.</p>
        </div>
      )}
    </div>
  );
};

export default RideCostCalculator;