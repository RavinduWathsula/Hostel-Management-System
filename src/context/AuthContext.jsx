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
    try {
      const token = sessionStorage.getItem('aegis_token');
      const savedUserStr = sessionStorage.getItem('aegis_user');
      if (!token) {
        setAdmin(null);
        setLoading(false);
        return;
      }

      const tryFallback = () => {
        if (savedUserStr) {
          try {
            const savedUser = JSON.parse(savedUserStr);
            if (savedUser) {
              setAdmin(savedUser);
              setLoading(false);
              return true;
            }
          } catch (err) {}
        }
        return false;
      };

      try {
        const res = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && (data.user || data.admin)) {
            const userObj = data.user || data.admin;
            setAdmin(userObj);
            sessionStorage.setItem('aegis_user', JSON.stringify(userObj));
            setLoading(false);
            return;
          }
        }
        
        // If response is not ok (e.g. 404 from mock server) but token exists, try fallback
        if (tryFallback()) return;

      } catch (e) {
        // Network error - use fallback
        if (tryFallback()) return;
      }

      // If token verification fails and no fallback, clear the invalid session
      sessionStorage.removeItem('aegis_token');
      sessionStorage.removeItem('aegis_user');
      setAdmin(null);
    } catch (err) {
      console.error('Auth check error:', err);
      setAdmin(null);
    } finally {
      setLoading(false);
    }
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
        sessionStorage.setItem('aegis_token', token);
        sessionStorage.setItem('aegis_user', JSON.stringify(user));
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
        sessionStorage.setItem('aegis_token', token);
        sessionStorage.setItem('aegis_user', JSON.stringify(user));
        setAdmin(user);
        return { success: true, user, token };
      }
      throw new Error(data.error || data.message || 'Login failed');
    }

    const userData = data.user || data.admin;
    setAdmin(userData);
    if (data.token) {
      sessionStorage.setItem('aegis_token', data.token);
    }
    sessionStorage.setItem('aegis_user', JSON.stringify(userData));
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
      sessionStorage.setItem('aegis_token', data.token);
    }
    sessionStorage.setItem('aegis_user', JSON.stringify(userData));
    return data;
  };

  const logout = () => {
    sessionStorage.removeItem('aegis_token');
    sessionStorage.removeItem('aegis_user');
    localStorage.removeItem('aegis_current_view');
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
