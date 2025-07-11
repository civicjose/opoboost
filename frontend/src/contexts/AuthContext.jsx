// frontend/src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import api from '../api/auth';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Estado de carga

  useEffect(() => {
    const token = localStorage.getItem('token');
    const usr = localStorage.getItem('user');
    if (token && usr) {
      try {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(JSON.parse(usr));
      } catch (e) {
        // Si el usuario en localStorage está corrupto, lo limpiamos
        console.error("Failed to parse user from localStorage", e);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false); // Terminamos de cargar
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token, user: usr } = res.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(usr));
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(usr);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}