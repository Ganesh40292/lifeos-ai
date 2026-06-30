import api from './api';

export const dashboardService = {
  getSummary: async () => {
    const response = await api.get('/dashboard/summary');
    return response.data;
  },

  getActivityHeatmap: async () => {
    const response = await api.get('/dashboard/activity-heatmap');
    return response.data;
  },

  getLifeScore: async () => {
    const response = await api.get('/dashboard/life-score');
    return response.data;
  },

  getLifeReport: async (period = 'WEEK') => {
    const response = await api.get('/reports', {
      params: { period }
    });
    return response.data;
  }
};
