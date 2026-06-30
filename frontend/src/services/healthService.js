import api from './api';

export const healthService = {
  // --- Workouts ---
  getWorkouts: async () => {
    const response = await api.get('/health/workouts');
    return response.data;
  },

  createWorkout: async (workoutData) => {
    const response = await api.post('/health/workouts', workoutData);
    return response.data;
  },

  updateWorkout: async (id, workoutData) => {
    const response = await api.put(`/health/workouts/${id}`, workoutData);
    return response.data;
  },

  deleteWorkout: async (id) => {
    const response = await api.delete(`/health/workouts/${id}`);
    return response.data;
  },

  // --- Health Metrics ---
  getMetrics: async () => {
    const response = await api.get('/health/metrics');
    return response.data;
  },

  saveMetric: async (metricData) => {
    const response = await api.post('/health/metrics', metricData);
    return response.data;
  },

  getHealthInsights: async () => {
    const response = await api.get('/health/insights');
    return response.data;
  }
};
