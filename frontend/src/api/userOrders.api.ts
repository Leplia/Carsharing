import { BASE_URL } from './auth.api';
import { OrderDto } from './order.api';

export const getUserOrders = async (token: string): Promise<OrderDto[]> => {
  const res = await fetch(`${BASE_URL}/api/user/orders`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return [];
  return res.json();
};

export const getActiveOrder = async (token: string): Promise<OrderDto | null> => {
  const res = await fetch(`${BASE_URL}/api/user/orders/active`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  return res.json();
};