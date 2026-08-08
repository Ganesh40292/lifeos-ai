import api from './api';

/**
 * Authentication service — handles login, register, and user profile calls.
 */
const authService = {
  /**
   * Register a new user.
   * @param {{ fullName: string, email: string, password: string }} data
   * @returns {Promise<{ token: string, user: object }>}
   */
  register: async (data) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  /**
   * Log in an existing user.
   * @param {{ email: string, password: string }} data
   * @returns {Promise<{ token: string, user: object }>}
   */
  login: async (data) => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  /**
   * Log in or register via Google OAuth.
   */
  googleLogin: async ({ email, fullName, avatar }) => {
    const response = await api.post('/auth/google', { email, fullName, avatar });
    return response.data;
  },

  /**
   * Get the currently authenticated user's profile.
   * @returns {Promise<object>}
   */
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // --- Two-Factor Authentication (2FA) ---
  verify2FaLogin: async (tempToken, code) => {
    const response = await api.post('/auth/2fa/verify', null, {
      params: { tempToken, code },
    });
    return response.data;
  },

  setup2Fa: async () => {
    const response = await api.get('/auth/2fa/setup');
    return response.data;
  },

  enable2Fa: async (code) => {
    const response = await api.post('/auth/2fa/enable', null, {
      params: { code },
    });
    return response.data;
  },

  disable2Fa: async (code) => {
    const response = await api.post('/auth/2fa/disable', null, {
      params: { code },
    });
    return response.data;
  },

  // --- Active Session Management ---
  getSessions: async () => {
    const response = await api.get('/auth/sessions');
    return response.data;
  },

  revokeSession: async (id) => {
    const response = await api.delete(`/auth/sessions/${id}`);
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
};

export default authService;
