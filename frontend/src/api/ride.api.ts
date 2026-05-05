import { BASE_URL } from './auth.api';

export interface RideCostRequest {
  carId: number;
  distanceKm: number;
}

export interface RideCostResponse {
  totalCost: number;
  baseRate?: number;
  coefficient?: number;
  discountPercent?: number;
  distanceKm?: number;
}

export const calculateRideCost = async (
    request: RideCostRequest,
    token: string
): Promise<RideCostResponse> => {
  const res = await fetch(`${BASE_URL}/api/ride/calculate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(request),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Ошибка расчёта стоимости');
  }
  return res.json();
};