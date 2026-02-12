// Типы для форм авторизации
export interface LoginFormData {
  logmail: string;
  password: string;
}

export interface RegisterFormData {
  login: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
}

// Типы пользователя
export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
}

// Ответы API
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
}