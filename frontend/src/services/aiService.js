import api from './api';

/**
 * Service methods for the AI Copilot assistant.
 */
const aiService = {
  chat: async (message) => {
    const response = await api.post('/ai/chat', { message });
    return response.data;
  }
};

export default aiService;
