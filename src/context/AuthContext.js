import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

if (!process.env.REACT_APP_API_URL) {
  throw new Error('Environment variable REACT_APP_API_URL is required');
}

export const API_URL = process.env.REACT_APP_API_URL;
const TOKEN_STORAGE_KEY = 'auth_token';

const readStoredToken = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem(TOKEN_STORAGE_KEY);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => readStoredToken());

  const saveToken = useCallback((value) => {
    if (typeof window === 'undefined') {
      return;
    }

    if (value) {
      localStorage.setItem(TOKEN_STORAGE_KEY, value);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
    setToken(value);
  }, []);

  const getAuthHeaders = useCallback(() => {
    if (!token) {
      return {};
    }
    return {
      Authorization: `Bearer ${token}`
    };
  }, [token]);

  const refreshAuth = useCallback(async () => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.get(`${API_URL}/auth/me`, {
        headers: getAuthHeaders()
      });
      setUser(data.user);
    } catch (error) {
      setUser(null);
      if (error.response?.status === 401) {
        saveToken(null);
      }
    } finally {
      setLoading(false);
    }
  }, [token, getAuthHeaders, saveToken]);

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  const login = async (email, password) => {
    const { data } = await axios.post(`${API_URL}/auth/login`, { email, password });
    saveToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async ({ name, email, password }) => {
    const { data } = await axios.post(`${API_URL}/users`, { name, email, password });
    if (data.token && data.user) {
      // Backward compatibility (if endpoint later returns token)
      saveToken(data.token);
      setUser(data.user);
    }
    return data;
  };

  const activateAccount = async (tokenValue) => {
    const { data } = await axios.post(`${API_URL}/auth/activate`, { token: tokenValue });
    saveToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = useCallback(async () => {
    try {
      await axios.post(`${API_URL}/auth/logout`);
    } catch (error) {
      // ignore logout errors
    }
    saveToken(null);
    setUser(null);
  }, [saveToken]);

  const value = {
    user,
    token,
    loading,
    login,
    register,
    activateAccount,
    logout,
    refreshAuth,
    getAuthHeaders
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
