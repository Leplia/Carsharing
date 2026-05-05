import { BASE_URL } from './auth.api';

export interface CarDto {
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
    carManufactureDto: {
      name: string;
      country: string;
      badgeUrl: string;
    };
  };
}

const authHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

export const bookCar = async (carId: number, token: string): Promise<CarDto> => {
  const res = await fetch(`${BASE_URL}/api/cars/${carId}/book`, {
    method: 'PUT',
    headers: authHeaders(token),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Ошибка бронирования');
  }
  return res.json();
};

export const startRide = async (carId: number, token: string): Promise<CarDto> => {
  const res = await fetch(`${BASE_URL}/api/cars/${carId}/start`, {
    method: 'PUT',
    headers: authHeaders(token),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Ошибка начала поездки');
  }
  return res.json();
};

export const endRide = async (carId: number, token: string): Promise<CarDto> => {
  const res = await fetch(`${BASE_URL}/api/cars/${carId}/end`, {
    method: 'PUT',
    headers: authHeaders(token),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Ошибка завершения поездки');
  }
  return res.json();
};


export const getAllCars = async (): Promise<CarDto[]> => {
  const res = await fetch(`${BASE_URL}/api/cars/getAllCars`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Ошибка получения автомобилей');
  }
  return res.json();
};

export const getAvailableCars = async (token: string): Promise<CarDto[]> => {
  const res = await fetch(`${BASE_URL}/api/cars/getAvailableCars`, {
    method: 'GET',
    headers: authHeaders(token),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Ошибка получения доступных автомобилей');
  }
  return res.json();
};