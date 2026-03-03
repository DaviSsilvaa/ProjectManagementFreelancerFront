/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user'); 

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser)); 
      api.defaults.headers.Authorization = `Bearer ${storedToken}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/users/login', { email, password });
    
    const { token: newToken, user: userData } = response.data;

    setToken(newToken);
    setUser(userData);

    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    
    api.defaults.headers.Authorization = `Bearer ${newToken}`;
  };

  const logout = () => {
    setToken(null);
    setUser(null); 
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.Authorization;
  };

  const updateUserInfo = (newData) => {
  setUser(prev => {
    const updated = { ...prev, ...newData };
    localStorage.setItem('user', JSON.stringify(updated));
    return updated;
  });
};

  return (
    <AuthContext.Provider value={{ token, user, login, logout, loading, updateUserInfo }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);