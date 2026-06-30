import { createContext, useState, useEffect, useCallback } from 'react';
import authService from '@/services/authService';
import { STORAGE_KEYS } from '@/utils/constants';

export const AuthContext = createContext(null);

/**
 * AuthProvider manages authentication state across the application.
 *
 * Provides:
 * - user: Current user object
 * - token: JWT token string
 * - isAuthenticated: Boolean auth status
 * - loading: Initial auth check loading state
 * - login(email, password): Authenticate and store token
 * - register(fullName, email, password): Create account and store token
 * - logout(): Clear auth state and redirect
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEYS.TOKEN));
  const [loading, setLoading] = useState(true);

  // On mount, verify the stored token by fetching the current user
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await authService.getCurrentUser();
        setUser(data.data || data);
      } catch {
        // Token invalid or expired
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  const login = useCallback(async (email, password) => {
    const data = await authService.login({ email, password });
    if (data.twoFactorRequired) {
      return data;
    }
    const jwt = data.token;
    const userData = data.user;

    localStorage.setItem(STORAGE_KEYS.TOKEN, jwt);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
    setToken(jwt);
    setUser(userData);

    return data;
  }, []);

  const loginWith2Fa = useCallback(async (tempToken, code) => {
    const data = await authService.verify2FaLogin(tempToken, code);
    const jwt = data.token;
    const userData = data.user;

    localStorage.setItem(STORAGE_KEYS.TOKEN, jwt);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
    setToken(jwt);
    setUser(userData);

    return data;
  }, []);

  const register = useCallback(async (fullName, email, password) => {
    const data = await authService.register({ fullName, email, password });
    const jwt = data.token;
    const userData = data.user;

    localStorage.setItem(STORAGE_KEYS.TOKEN, jwt);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
    setToken(jwt);
    setUser(userData);

    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!token) return;
    try {
      const data = await authService.getCurrentUser();
      setUser(data.data || data);
    } catch (e) {
      console.error(e);
    }
  }, [token]);

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    loading,
    login,
    loginWith2Fa,
    register,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
