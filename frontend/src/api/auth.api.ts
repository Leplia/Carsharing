import axios, { AxiosError, AxiosResponse } from 'axios';
import {
    UserDto,
    RegistrationRequest,
    LoginRequest,
    ApiError,
    AuthResponse
} from '../types/auth';

const STORAGE_KEYS = {
    ACCESS_TOKEN: 'accessToken',
    USER_DATA: 'userData'
} as const;

const BASE_URL = 'http://localhost:8080';

class AuthApi {
    /**
     * Вспомогательный метод для получения хедеров.
     * Вызываем его в каждом запросе.
     */
    private getHeaders() {
        const token = this.getAccessToken();
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return headers;
    }

    // --- Методы работы с LocalStorage ---

    private setAccessToken(token: string): void {
        if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
    }

    getAccessToken(): string | null {
        return typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) : null;
    }

    private setUserData(user: UserDto): void {
        if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    }

    getUserData(): UserDto | null {
        if (typeof window !== 'undefined') {
            const data = localStorage.getItem(STORAGE_KEYS.USER_DATA);
            try { return data ? JSON.parse(data) : null; } catch { return null; }
        }
        return null;
    }

    private clearStorage(): void {
        if (typeof window !== 'undefined') {
            Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
        }
    }

    // --- API Методы ---

    private saveSession(response: AuthResponse): void {
        this.setAccessToken(response.accessToken);
        this.setUserData(response.user);
    }

    setAccessTokenFromOAuth(token: string): void {
        this.setAccessToken(token);
    }

    async register(data: RegistrationRequest): Promise<AuthResponse> {
        try {
            const response: AxiosResponse<AuthResponse> = await axios.post(
                `${BASE_URL}/api/auth/register`,
                data,
                { headers: this.getHeaders() }
            );
            this.saveSession(response.data);
            return response.data;
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    async login(data: LoginRequest): Promise<AuthResponse> {
        try {
            const response: AxiosResponse<AuthResponse> = await axios.post(
                `${BASE_URL}/api/auth/login`,
                data,
                { headers: this.getHeaders() }
            );
            this.saveSession(response.data);
            return response.data;
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    async logout(): Promise<void> {
        this.clearStorage();
    }

    async getCurrentUser(): Promise<UserDto | null> {
        const cachedUser = this.getUserData();
        if (cachedUser && this.getAccessToken()) return cachedUser;

        try {
            const response: AxiosResponse<UserDto> = await axios.get(
                `${BASE_URL}/api/auth/me`,
                { headers: this.getHeaders() }
            );
            this.setUserData(response.data);
            return response.data;
        } catch (error) {
            this.clearStorage();
            return null;
        }
    }

    isAuthenticated(): boolean {
        return !!this.getAccessToken();
    }

    private handleError(error: unknown): void {
        if (axios.isAxiosError<ApiError>(error)) {
            console.error(`API Error:`, error.response?.data?.message || error.message);
        } else {
            console.error('Unknown error:', error);
        }
    }
}

export const authApi = new AuthApi();
export default authApi;