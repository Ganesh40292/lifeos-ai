import api from './api';

export const focusService = {
  getSessions: async () => {
    const response = await api.get('/focus-sessions');
    return response.data;
  },

  createSession: async (sessionData) => {
    const response = await api.post('/focus-sessions', sessionData);
    return response.data;
  }
};
