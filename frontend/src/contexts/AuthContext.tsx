import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserDto } from '../types/auth';
import authApi from '../api/auth.api';

interface AuthContextType {
    user: UserDto | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (user: UserDto) => void;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            try {
                const currentUser = await authApi.getCurrentUser();
                setUser(currentUser);
            } catch {
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };
        init();
    }, []);

    const login = useCallback((userData: UserDto) => {
        setUser(userData);
    }, []);

    const logout = useCallback(async () => {
        await authApi.logout();
        setUser(null);
    }, []);

    const refreshUser = useCallback(async () => {
        const token = authApi.getAccessToken();
        if (!token) return;
        authApi.clearStorage();
        // Re-set token so getCurrentUser works
        authApi.setAccessTokenFromOAuth(token);
        const fresh = await authApi.getCurrentUser();
        setUser(fresh);
    }, []);

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            isLoading,
            login,
            logout,
            refreshUser,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};