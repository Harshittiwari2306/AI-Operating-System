import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

// Configure axios base URL to standard FastAPI port
axios.defaults.baseURL =
  import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Add request interceptor to automatically insert authorization token
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await axios.get('/api/auth/profile');
      setUser(res.data);
    } catch (err) {
      console.error("Profile fetch error:", err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const params = new URLSearchParams();
    params.append('username', email);
    params.append('password', password);

    const res = await axios.post('/api/auth/login', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    localStorage.setItem('token', res.data.access_token);
    await fetchProfile();
    return res.data;
  };

  const signup = async (email, password, fullName, interests, dailyGoal) => {
    const res = await axios.post('/api/auth/signup', {
      email,
      password,
      full_name: fullName,
      interests,
      daily_hours_goal: parseFloat(dailyGoal)
    });
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateProfile = async (data) => {
    const res = await axios.put('/api/auth/profile', data);
    setUser(res.data);
    return res.data;
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    updateProfile,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
