import api from './api';

/**
 * Service methods for Finance Module (Transactions, Budgets, and Savings Goals).
 */
const financeService = {
  // --- Summary ---
  getFinanceSummary: async () => {
    const response = await api.get('/finance/summary');
    return response.data;
  },

  // --- Transactions ---
  getTransactions: async () => {
    const response = await api.get('/finance/transactions');
    return response.data;
  },

  addTransaction: async (transactionData) => {
    const response = await api.post('/finance/transactions', transactionData);
    return response.data;
  },

  deleteTransaction: async (id) => {
    const response = await api.delete(`/finance/transactions/${id}`);
    return response.data;
  },

  // --- Budgets ---
  getBudgets: async (month, year) => {
    const response = await api.get('/finance/budgets', {
      params: { month, year },
    });
    return response.data;
  },

  addOrUpdateBudget: async (budgetData) => {
    const response = await api.post('/finance/budgets', budgetData);
    return response.data;
  },

  // --- Savings Goals ---
  getSavingsGoals: async () => {
    const response = await api.get('/finance/savings');
    return response.data;
  },

  addSavingsGoal: async (goalData) => {
    const response = await api.post('/finance/savings', goalData);
    return response.data;
  },

  contributeToSavingsGoal: async (id, amount) => {
    const response = await api.patch(`/finance/savings/${id}/contribute`, null, {
      params: { amount },
    });
    return response.data;
  },
};

export default financeService;
