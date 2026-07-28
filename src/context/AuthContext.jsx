import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('aegis_token');
      if (!token) {
        setAdmin(null);
        setLoading(false);
        return;
      }

      const res = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        localStorage.removeItem('aegis_token');
        setAdmin(null);
        setLoading(false);
        return;
      }

      const data = await res.json();
      if (data.success && (data.user || data.admin)) {
        setAdmin(data.user || data.admin);
      } else {
        localStorage.removeItem('aegis_token');
        setAdmin(null);
      }
    } catch (err) {
      console.error('Auth check error:', err);
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    let res;
    try {
      res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
    } catch (netErr) {
      throw new Error('Network error: Could not reach backend server. Please verify Express server is running on port 5000.');
    }

    let data;
    try {
      const text = await res.text();
      data = text ? JSON.parse(text) : {};
    } catch (parseErr) {
      throw new Error(`Server returned non-JSON response (${res.status}). Verify database service is running.`);
    }

    if (!res.ok || !data.success) {
      throw new Error(data.error || data.message || 'Login failed');
    }

    const userData = data.user || data.admin;
    setAdmin(userData);
    if (data.token) {
      localStorage.setItem('aegis_token', data.token);
    }
    return data;
  };

  const register = async (formData) => {
    let res;
    try {
      res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
    } catch (netErr) {
      throw new Error('Network error: Could not reach backend server.');
    }

    let data;
    try {
      const text = await res.text();
      data = text ? JSON.parse(text) : {};
    } catch (parseErr) {
      throw new Error(`Server returned non-JSON response (${res.status}).`);
    }

    if (!res.ok || !data.success) {
      throw new Error(data.error || data.message || 'Registration failed');
    }

    const userData = data.user || data.admin;
    setAdmin(userData);
    if (data.token) {
      localStorage.setItem('aegis_token', data.token);
    }
    return data;
  };

  const logout = async () => {
    try {
      localStorage.removeItem('aegis_token');
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setAdmin(null);
    }
  };

  return (
    <AuthContext.Provider value={{ admin, loading, login, register, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
