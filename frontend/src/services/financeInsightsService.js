import api from './api';

export const financeInsightsService = {
  getInsights: async () => {
    const response = await api.get('/finance/insights');
    return response.data;
  }
};
