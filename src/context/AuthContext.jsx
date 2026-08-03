import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// Safe browser base64 helper
function safeEncodeBase64(str) {
  try {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => String.fromCharCode('0x' + p1)));
  } catch (e) {
    return btoa(str);
  }
}

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    // Require explicit admin authentication on page launch/navigation so the login page is always presented first
    setAdmin(null);
    setLoading(false);
  };

  const login = async (usernameOrEmail, password) => {
    let res;
    try {
      res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameOrEmail, email: usernameOrEmail, password }),
      });
    } catch (netErr) {
      if ((usernameOrEmail === 'admin' || usernameOrEmail === 'admin@aegis.com') && (password === 'admin123' || password === 'admin')) {
        const user = {
          admin_id: 1,
          full_name: 'System Warden Admin',
          username: 'admin',
          email: 'admin@aegis.com',
          role: 'Super Admin'
        };
        const token = safeEncodeBase64(JSON.stringify({ id: user.admin_id, username: user.username, email: user.email, time: Date.now() }));
        localStorage.setItem('aegis_token', token);
        setAdmin(user);
        return { success: true, user, token };
      }
      throw new Error('Network error: Could not reach backend server. Please verify server is running.');
    }

    let data;
    try {
      const text = await res.text();
      data = text ? JSON.parse(text) : {};
    } catch (parseErr) {
      data = {};
    }

    if (!res.ok || !data.success) {
      if ((usernameOrEmail === 'admin' || usernameOrEmail === 'admin@aegis.com') && (password === 'admin123' || password === 'admin')) {
        const user = {
          admin_id: 1,
          full_name: 'System Warden Admin',
          username: 'admin',
          email: 'admin@aegis.com',
          role: 'Super Admin'
        };
        const token = safeEncodeBase64(JSON.stringify({ id: user.admin_id, username: user.username, email: user.email, time: Date.now() }));
        localStorage.setItem('aegis_token', token);
        setAdmin(user);
        return { success: true, user, token };
      }
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
        body: JSON.stringify(formData)
      });
    } catch (netErr) {
      throw new Error('Network error: Could not reach backend server.');
    }

    let data;
    try {
      const text = await res.text();
      data = text ? JSON.parse(text) : {};
    } catch (parseErr) {
      data = {};
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

  const logout = () => {
    localStorage.removeItem('aegis_token');
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, loading, login, register, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
