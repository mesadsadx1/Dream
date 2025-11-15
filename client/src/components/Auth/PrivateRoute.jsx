import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingScreen from '../UI/LoadingScreen';

const PrivateRoute = () => {
  const { user, loading, isAuthenticated } = useAuth();

  console.log('PrivateRoute - loading:', loading, 'user:', user, 'isAuthenticated:', isAuthenticated);

  if (loading) {
    return <LoadingScreen />;
  }

  // Проверяем и токен тоже
  const token = localStorage.getItem('token');
  
  if (!user && !token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;