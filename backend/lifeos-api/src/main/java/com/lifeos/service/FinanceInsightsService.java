package com.lifeos.service;

import com.lifeos.dto.response.FinanceInsightsResponse;
import com.lifeos.entity.Budget;
import com.lifeos.entity.Transaction;
import com.lifeos.entity.User;
import com.lifeos.repository.BudgetRepository;
import com.lifeos.repository.TransactionRepository;
import com.lifeos.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FinanceInsightsService {

    private final TransactionRepository transactionRepository;
    private final BudgetRepository budgetRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public FinanceInsightsResponse getInsights(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        UUID userId = user.getId();

        LocalDate today = LocalDate.now();
        int month = today.getMonthValue();
        int year = today.getYear();

        // 1. Get transactions for this month
        List<Transaction> thisMonthTxns = transactionRepository.findAllByUserIdOrderByDateDesc(userId)
                .stream()
                .filter(t -> t.getDate() != null && t.getDate().getMonthValue() == month && t.getDate().getYear() == year)
                .collect(Collectors.toList());

        // 2. Get budgets
        List<Budget> budgets = budgetRepository.findAllByUserId(userId)
                .stream()
                .filter(b -> b.getMonth() == month && b.getYear() == year)
                .collect(Collectors.toList());

        List<String> anomalies = new ArrayList<>();
        List<String> warnings = new ArrayList<>();
        List<String> tips = new ArrayList<>();

        if (thisMonthTxns.isEmpty()) {
            tips.add("Log some transactions this month to start seeing custom financial insights!");
            return new FinanceInsightsResponse(anomalies, warnings, tips);
        }

        // Group expenses by category
        Map<String, BigDecimal> expensesByCategory = thisMonthTxns.stream()
                .filter(t -> "EXPENSE".equalsIgnoreCase(t.getType()))
                .collect(Collectors.groupingBy(
                        Transaction::getCategory,
                        Collectors.reducing(BigDecimal.ZERO, Transaction::getAmount, BigDecimal::add)
                ));

        BigDecimal totalExpenses = expensesByCategory.values().stream()
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // --- Rule 1: Budget Warnings ---
        for (Budget budget : budgets) {
            BigDecimal categorySpent = expensesByCategory.getOrDefault(budget.getCategory(), BigDecimal.ZERO);
            BigDecimal budgetLimit = budget.getLimitAmount();
            if (budgetLimit.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal ratio = categorySpent.divide(budgetLimit, 4, RoundingMode.HALF_UP);
                if (ratio.compareTo(new BigDecimal("1.0")) >= 0) {
                    warnings.add(String.format("Overbudget Alert! You spent ₹%s on %s, exceeding your ₹%s budget.",
                            categorySpent.toPlainString(), budget.getCategory(), budgetLimit.toPlainString()));
                } else if (ratio.compareTo(new BigDecimal("0.8")) >= 0) {
                    warnings.add(String.format("Warning! You spent 80%% or more of your %s budget (₹%s of ₹%s).",
                            budget.getCategory(), categorySpent.toPlainString(), budgetLimit.toPlainString()));
                }
            }
        }

        // --- Rule 2: Anomaly Detection ---
        // Fetch historical transactions (past 6 months) to get average category costs
        List<Transaction> historicalTxns = transactionRepository.findAllByUserIdOrderByDateDesc(userId);
        Map<String, Double> categoryAverages = historicalTxns.stream()
                .filter(t -> "EXPENSE".equalsIgnoreCase(t.getType()))
                .collect(Collectors.groupingBy(
                        Transaction::getCategory,
                        Collectors.averagingDouble(t -> t.getAmount().doubleValue())
                ));

        for (Transaction txn : thisMonthTxns) {
            if ("EXPENSE".equalsIgnoreCase(txn.getType())) {
                double avg = categoryAverages.getOrDefault(txn.getCategory(), 0.0);
                if (avg > 0 && txn.getAmount().doubleValue() > avg * 2.5) {
                    anomalies.add(String.format("Unusual Expense! You spent ₹%s on %s (avg is usually ₹%.2f).",
                            txn.getAmount().toPlainString(), txn.getCategory(), avg));
                }
            }
        }

        // --- Rule 3: Saving Tips ---
        if (totalExpenses.compareTo(BigDecimal.ZERO) > 0) {
            // Check leisure / entertainment categories (Leisure, Other, etc.)
            BigDecimal leisureSpent = expensesByCategory.getOrDefault("Leisure", BigDecimal.ZERO);
            BigDecimal transportSpent = expensesByCategory.getOrDefault("Transport", BigDecimal.ZERO);
            
            BigDecimal leisureRatio = leisureSpent.divide(totalExpenses, 4, RoundingMode.HALF_UP);
            if (leisureRatio.compareTo(new BigDecimal("0.3")) > 0) {
                tips.add(String.format("High leisure spending detected! You spent %.1f%% of this month's budget on Leisure. Try restricting dining out or subscriptions.", 
                        leisureRatio.doubleValue() * 100));
            }

            BigDecimal totalIncome = thisMonthTxns.stream()
                    .filter(t -> "INCOME".equalsIgnoreCase(t.getType()))
                    .map(Transaction::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            if (totalIncome.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal savingsRatio = totalIncome.subtract(totalExpenses).divide(totalIncome, 4, RoundingMode.HALF_UP);
                if (savingsRatio.compareTo(new BigDecimal("0.2")) < 0) {
                    tips.add(String.format("Low savings warning! You saved only %.1f%% of your income this month. Aim to save at least 20%%.",
                            savingsRatio.doubleValue() * 100));
                } else {
                    tips.add("Great job! Your savings rate is healthy (above 20%). Keep it up!");
                }
            }
        }

        return new FinanceInsightsResponse(anomalies, warnings, tips);
    }
}
