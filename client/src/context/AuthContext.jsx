/**
 * Auth Context 
 */

import React, { createContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import API from '../api/endpoints';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data } = await axiosClient.get(API.AUTH.ME);
      setUser(data.user);
    } catch (error) {
      // 401 is expected when not logged in - ignore silently
      if (error.response?.status === 401) {
        setUser(null);
        // Silently ignore - no console spam
      } else {
        console.error('Auth check error:', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const { data } = await axiosClient.post(API.AUTH.LOGIN, { email, password });
      setUser(data.user);
      return { success: true, data };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      const payload = {
        name: userData.name.trim(),
        email: userData.email.trim().toLowerCase(),
        password: userData.password,
        role: userData.role || 'citizen',
        phone: userData.phone || '',
      };

      const { data } = await axiosClient.post(API.AUTH.REGISTER, payload);
      setUser(data.user);
      return { success: true, data };
    } catch (error) {
      let message = error.response?.data?.message || 'Registration failed';
      const errors = error.response?.data?.errors || [];
      
      if (errors.length > 0) {
        message = errors.map(e => e.message).join(', ');
      }
      
      return { 
        success: false, 
        error: message,
        validationErrors: errors 
      };
    }
  };

  const logout = async () => {
    try {
      await axiosClient.post(API.AUTH.LOGOUT);
      setUser(null);
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      register, 
      logout, 
      checkAuth 
    }}>
      {children}
    </AuthContext.Provider>
  );
};