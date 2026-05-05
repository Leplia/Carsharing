import { BASE_URL } from './auth.api';

export interface OrderDto {
  orderId: number;
  carId: number;
  userId: number;
  startTime: string;
  endTime: string | null;
  status: 'STARTED' | 'COMPLETED' | 'CANCELLED' | 'PAID' | 'UNPAID' | 'IN_PROCESS';
  price: number;
  distance: number | null;
  spendFuel: number | null;
  discount: number | null;
}

interface CreateOrderPayload {
  carId: number;
  price: number;
}

interface EndOrderPayload {
  distanceKm: number;
  spendFuel: number;
}

interface EndOrderWithLocationPayload {
  distanceKm: number;
  spendFuel: number;
  newLocationX: number;
  newLocationY: number;
}

const authHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

export const createOrder = async (
    payload: CreateOrderPayload,
    token: string
): Promise<OrderDto> => {
  const res = await fetch(`${BASE_URL}/api/orders/create`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Ошибка создания заказа');
  }
  return res.json();
};

export const endOrder = async (
    orderId: number,
    payload: EndOrderPayload,
    token: string
): Promise<OrderDto> => {
  const res = await fetch(`${BASE_URL}/api/orders/${orderId}/end`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Ошибка завершения заказа');
  }
  return res.json();
};

export const endOrderWithLocation = async (
    orderId: number,
    payload: EndOrderWithLocationPayload,
    token: string
): Promise<OrderDto> => {
  const res = await fetch(`${BASE_URL}/api/orders/${orderId}/end`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Ошибка завершения заказа');
  }
  return res.json();
};