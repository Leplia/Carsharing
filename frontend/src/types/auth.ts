export enum Role {
    USER = 'USER',
    ADMIN = 'ADMIN',
    MANAGER = 'MANAGER'
}

export enum ServiceType {
    LOCAL = 'LOCAL',
    GITHUB = 'GITHUB',
}

export interface UserCredentialsDto {
    login?: string;
    email?: string;
    // добавьте другие поля, если есть
}

export interface UserDto {
    login: string;
    email: string;
    phone: string;
    blocked: boolean;
    rating: number;
    role: Role;
    serviceType: ServiceType;
    credentials: UserCredentialsDto;
}

export interface RegistrationRequest {
    login: string;
    password: string;
    email: string;
    phoneNumber: string;
    serviceType: ServiceType;
}

export interface LoginRequest {
    logmail: string;  // может быть email или login
    password: string;
    serviceType: ServiceType;
}

export interface AuthResponse {
    user: UserDto;
    accessToken: string;
}

export interface ApiError {
    message: string;
    status: number;
    errors?: Record<string, string[]>;
}