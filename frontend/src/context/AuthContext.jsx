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

  // On mount, handle Google OAuth callback OR verify stored token
  useEffect(() => {
    const handleAuthCheck = async () => {
      // 1. Check if returning from Google OAuth redirect (hash or query token)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const searchParams = new URLSearchParams(window.location.search);
      const accessToken = hashParams.get('access_token') || searchParams.get('access_token');

      if (accessToken) {
        try {
          // Fetch Google User Profile using OAuth access token
          const res = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`);
          if (res.ok) {
            const googleUser = await res.json();
            const userData = {
              id: googleUser.sub,
              fullName: googleUser.name || 'Google User',
              email: googleUser.email,
              avatar: googleUser.picture,
              xp: 250,
              level: 2,
              streakDays: 3
            };

            // Save session
            localStorage.setItem(STORAGE_KEYS.TOKEN, accessToken);
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
            setToken(accessToken);
            setUser(userData);

            // Clean up URL parameters and navigate to home
            window.history.replaceState(null, '', window.location.pathname);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn('Google OAuth token validation failed, falling back to local auth:', err);
        }
      }

      // 2. Fallback to verifying existing stored token
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

    handleAuthCheck();
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
