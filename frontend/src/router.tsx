import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LandingPage from './pages/LandingPage';
import MainLayout from './components/layout/MainLayout';
import HomePage from './pages/HomePage';
import CarsPage from './pages/CarsPage';
import ProfilePage from './pages/ProfilePage';
import AboutPage from './pages/AboutPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import NotFoundPage from './pages/NotFoundPage';
import VerificationPage from './pages/VerificationPage';
import MapPage from './pages/MapPage';
import AdminPage from './pages/AdminPage';
import AdminManagementPage from './pages/AdminManagementPage';
import CompleteProfilePage from './pages/CompleteProfilePage';
import ProtectedRoute from './components/layout/ProtectedRoute.tsx';
import { Role } from './types/auth';

// Root redirect: authenticated users go to /map, others see landing
const RootRedirect: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  return isAuthenticated ? <Navigate to="/map" replace /> : <LandingPage />;
};

// SisAdmin-only route guard
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (user?.role !== Role.SISADMIN) return <Navigate to="/map" replace />;
  return <>{children}</>;
};

// Admin or SisAdmin route guard
const AdminOrSisRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (user?.role !== Role.ADMIN && user?.role !== Role.SISADMIN) return <Navigate to="/map" replace />;
  return <>{children}</>;
};

export const Router: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/complete-profile" element={<CompleteProfilePage />} />

          <Route element={<MainLayout />}>
            <Route
              path="/map"
              element={
                <ProtectedRoute>
                  <MapPage />
                </ProtectedRoute>
              }
            />
            <Route path="/home" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/cars" element={<CarsPage />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/verification"
              element={
                <ProtectedRoute>
                  <VerificationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminOrSisRoute>
                    <AdminPage />
                  </AdminOrSisRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-management"
              element={
                <ProtectedRoute>
                  <AdminOrSisRoute>
                    <AdminManagementPage />
                  </AdminOrSisRoute>
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};
