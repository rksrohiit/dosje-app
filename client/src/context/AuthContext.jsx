import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('dosje_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await api.auth.getMe();
          setUser(res.data.user || res.data); // mock fallback handling
        } catch (error) {
          console.error('Failed to get user session', error);
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      // Mock logic for demo without real backend:
      // In reality, this would be: const res = await api.auth.login(email, password);
      // We will simulate response if api fails for demo purposes
      let resData;
      try {
        const res = await api.auth.login(email, password);
        resData = res.data;
      } catch (e) {
        console.warn('API login failed, using mock data for demo.', e);
        // Fallback mock
        const roleMap = {
          'admin@dosje.gov.in': 'admin',
          'inspector@pmu.gov.in': 'pmu',
          'manager@ngo1.org': 'ngo',
          'beneficiary@test.com': 'beneficiary',
        };
        const role = roleMap[email] || 'user';
        resData = { token: 'mock-token', user: { email, role, name: email.split('@')[0] } };
      }

      localStorage.setItem('dosje_token', resData.token);
      setToken(resData.token);
      setUser(resData.user);
      return resData;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('dosje_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
