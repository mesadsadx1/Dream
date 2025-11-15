import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from '../services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    console.log('Checking auth, token exists:', !!token);
    
    if (token) {
      try {
        const response = await axios.get('/auth/me');
        console.log('Auth check successful:', response.data);
        setUser(response.data);
      } catch (error) {
        console.error('Auth check failed:', error);
        // Если это админ токен, восстанавливаем данные из токена
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          if (payload.isAdmin) {
            setUser({
              id: payload.id,
              username: payload.username,
              email: payload.email,
              isAdmin: true
            });
          } else {
            localStorage.removeItem('token');
          }
        } catch (e) {
          localStorage.removeItem('token');
        }
      }
    }
    setLoading(false);
  };

  const login = async (credentials) => {
    try {
      console.log('Attempting login...');
      
      const response = await axios.post('/auth/login', {
        email: credentials.email,
        password: credentials.password
      });
      
      console.log('Login response:', response.data);
      
      const { token, user } = response.data;
      
      // Сохраняем токен
      localStorage.setItem('token', token);
      
      // Сохраняем пользователя
      setUser(user);
      
      toast.success(response.data.message || 'Добро пожаловать!');
      
      // Небольшая задержка перед навигацией
      setTimeout(() => {
        navigate('/dashboard');
      }, 100);
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 'Ошибка входа';
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('/auth/register', userData);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      setUser(user);
      
      toast.success('Регистрация успешна!');
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 100);
      
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || 'Ошибка регистрации';
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
    toast.success('Вы вышли из системы');
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    checkAuth,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};