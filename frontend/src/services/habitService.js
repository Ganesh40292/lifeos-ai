import api from './api';

/**
 * Service methods for Habit Tracker Module.
 */
const habitService = {
  getHabits: async () => {
    const response = await api.get('/habits');
    return response.data;
  },

  addHabit: async (habitData) => {
    const response = await api.post('/habits', habitData);
    return response.data;
  },

  deleteHabit: async (id) => {
    const response = await api.delete(`/habits/${id}`);
    return response.data;
  },

  toggleHabit: async (id) => {
    const response = await api.patch(`/habits/${id}/toggle`);
    return response.data;
  },
};

export default habitService;
