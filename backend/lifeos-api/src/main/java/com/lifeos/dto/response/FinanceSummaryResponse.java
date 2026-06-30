package com.lifeos.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * Response exposing comprehensive monthly finance summary statistics.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FinanceSummaryResponse {
    private BigDecimal totalIncome;
    private BigDecimal totalExpenses;
    private BigDecimal netBalance;
    private List<BudgetResponse> budgets;
    private List<TransactionResponse> recentTransactions;
    private List<SavingsGoalResponse> savingsGoals;
    private Map<String, BigDecimal> categoryExpenses; // Expense breakdown per category for current month
}
