import React, { useEffect, useState } from 'react';
import { getUserOrders } from '../../api/userOrders.api';
import { OrderDto } from '../../api/order.api';
import authApi from '../../api/auth.api';

interface Props {
  userId: number;
}

const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('ru-RU', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

const STATUS_LABELS: Record<string, string> = {
  STARTED: 'В процессе',
  COMPLETED: 'Завершена',
  CANCELLED: 'Отменена',
  PAID: 'Оплачена',
  UNPAID: 'Не оплачена',
  IN_PROCESS: 'В обработке',
};

const UserTrips: React.FC<Props> = ({ userId }) => {
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = authApi.getAccessToken();
    if (!token) { setLoading(false); return; }
    getUserOrders(token)
        .then(setOrders)
        .catch(() => setError('Не удалось загрузить поездки'))
        .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <div className="profile-trips-loading">Загрузка поездок...</div>;
  if (error) return <div className="profile-trips-error">{error}</div>;
  if (orders.length === 0)
    return (
        <div className="profile-empty-trips">
          <div className="profile-empty-icon">🚗</div>
          <p>Поездок пока нет</p>
        </div>
    );

  return (
      <div className="profile-trips-list">
        <div className="profile-trips-header">
          <span>Время</span>
          <span>Статус</span>
          <span>Расстояние</span>
          <span>Стоимость</span>
        </div>
        {orders.map((order) => (
            <div key={order.orderId} className="profile-trip-item">
              <div className="profile-trip-date">
                <span className="profile-trip-date-start">{formatDate(order.startTime)}</span>
                {order.endTime && (
                    <span className="profile-trip-date-end">— {formatDate(order.endTime)}</span>
                )}
              </div>
              <div className="profile-trip-status">
            <span className={`profile-trip-status-badge ${order.status === 'STARTED' ? 'started' : 'completed'}`}>
              {STATUS_LABELS[order.status] ?? order.status}
            </span>
              </div>
              <div className="profile-trip-distance">
                {order.distance != null ? `${order.distance.toFixed(1)} км` : '—'}
              </div>
              <div className="profile-trip-price">
                {order.price != null ? `${order.price.toFixed(2)} BYN` : '—'}
              </div>
            </div>
        ))}
      </div>
  );
};

export default UserTrips;