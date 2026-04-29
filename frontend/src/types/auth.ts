export enum Role {
    USER = 'USER',
    ADMIN = 'ADMIN',
    SISADMIN = 'SISADMIN',
}

export enum ServiceType {
    LOCAL = 'LOCAL',
    GITHUB = 'GITHUB',
}

export interface UserCredentialsDto {
    firstName?: string;
    lastName?: string;
    passportNumber?: string;
    driverLicense?: string;
}

export interface UserDto {
    userId: number;
    login: string;
    email: string;
    phone: string;
    blocked: boolean;
    verified: boolean;
    rating: number;
    role: Role;
    serviceType: ServiceType;
    credentials: UserCredentialsDto | null;
}

export interface RegistrationRequest {
    login: string;
    password: string;
    email: string;
    phoneNumber: string;
    serviceType: ServiceType;
}

export interface LoginRequest {
    logmail: string;
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
