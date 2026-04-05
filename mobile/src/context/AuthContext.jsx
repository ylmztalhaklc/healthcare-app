import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  async function loadStoredAuth() {
    try {
      const storedToken = await AsyncStorage.getItem('access_token');
      const storedUser = await AsyncStorage.getItem('user');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.warn('Auth load error:', e);
    } finally {
      setLoading(false);
    }
  }

  async function login(email, password) {
    const res = await authAPI.login({ email, password });
    const { access_token, user: userData } = res.data;
    await AsyncStorage.setItem('access_token', access_token);
    await AsyncStorage.setItem('user', JSON.stringify(userData));
    setToken(access_token);
    setUser(userData);
    return userData;
  }

  async function register(fullName, email, password, role) {
    const res = await authAPI.register({
      full_name: fullName,
      email,
      password,
      role,
    });
    const { access_token, user: userData } = res.data;
    await AsyncStorage.setItem('access_token', access_token);
    await AsyncStorage.setItem('user', JSON.stringify(userData));
    setToken(access_token);
    setUser(userData);
    return userData;
  }

  async function logout() {
    await AsyncStorage.removeItem('access_token');
    await AsyncStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
