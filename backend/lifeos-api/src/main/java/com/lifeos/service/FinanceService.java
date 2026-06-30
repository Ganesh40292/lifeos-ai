package com.lifeos.service;

import com.lifeos.dto.request.BudgetRequest;
import com.lifeos.dto.request.SavingsGoalRequest;
import com.lifeos.dto.request.TransactionRequest;
import com.lifeos.dto.response.BudgetResponse;
import com.lifeos.dto.response.FinanceSummaryResponse;
import com.lifeos.dto.response.SavingsGoalResponse;
import com.lifeos.dto.response.TransactionResponse;
import com.lifeos.entity.Budget;
import com.lifeos.entity.SavingsGoal;
import com.lifeos.entity.Transaction;
import com.lifeos.exception.BadRequestException;
import com.lifeos.exception.ResourceNotFoundException;
import com.lifeos.repository.BudgetRepository;
import com.lifeos.repository.SavingsGoalRepository;
import com.lifeos.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service orchestrating Finance module business logic.
 */
@Service
@RequiredArgsConstructor
public class FinanceService {

    private final TransactionRepository transactionRepository;
    private final BudgetRepository budgetRepository;
    private final SavingsGoalRepository savingsGoalRepository;
    private final GamificationService gamificationService;

    // --- Transactions ---

    @Transactional(readOnly = true)
    public List<TransactionResponse> getTransactions(UUID userId) {
        return transactionRepository.findAllByUserIdOrderByDateDesc(userId).stream()
                .map(this::mapToTransactionResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public TransactionResponse addTransaction(UUID userId, TransactionRequest request) {
        String finalCategory = autoCategorize(request.getDescription(), request.getType(), request.getCategory());

        Transaction transaction = Transaction.builder()
                .userId(userId)
                .amount(request.getAmount())
                .type(request.getType().toUpperCase())
                .category(finalCategory)
                .description(request.getDescription())
                .date(request.getDate())
                .build();
        Transaction saved = transactionRepository.save(transaction);
        gamificationService.awardXp(userId, GamificationService.ActivityType.ADD_TRANSACTION);
        return mapToTransactionResponse(saved);
    }

    @Transactional
    public void deleteTransaction(UUID userId, UUID transactionId) {
        Transaction transaction = transactionRepository.findByIdAndUserId(transactionId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));
        transactionRepository.delete(transaction);
    }

    // --- Budgets ---

    @Transactional(readOnly = true)
    public List<BudgetResponse> getBudgets(UUID userId, int month, int year) {
        List<Budget> budgets = budgetRepository.findAllByUserIdAndMonthAndYear(userId, month, year);
        
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
        
        List<Transaction> expenses = transactionRepository.findAllByUserIdAndDateBetween(userId, startDate, endDate)
                .stream()
                .filter(t -> "EXPENSE".equals(t.getType()))
                .collect(Collectors.toList());

        return budgets.stream()
                .map(b -> {
                    BigDecimal spent = expenses.stream()
                            .filter(t -> b.getCategory().equalsIgnoreCase(t.getCategory()))
                            .map(Transaction::getAmount)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    return mapToBudgetResponse(b, spent);
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public BudgetResponse addOrUpdateBudget(UUID userId, BudgetRequest request) {
        Optional<Budget> existing = budgetRepository.findByUserIdAndCategoryAndMonthAndYear(
                userId, request.getCategory(), request.getMonth(), request.getYear());

        Budget budget;
        if (existing.isPresent()) {
            budget = existing.get();
            budget.setLimitAmount(request.getLimitAmount());
        } else {
            budget = Budget.builder()
                    .userId(userId)
                    .category(request.getCategory())
                    .limitAmount(request.getLimitAmount())
                    .month(request.getMonth())
                    .year(request.getYear())
                    .build();
        }
        
        Budget saved = budgetRepository.save(budget);
        
        LocalDate startDate = LocalDate.of(request.getYear(), request.getMonth(), 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
        BigDecimal spent = transactionRepository.findAllByUserIdAndDateBetween(userId, startDate, endDate)
                .stream()
                .filter(t -> "EXPENSE".equals(t.getType()) && saved.getCategory().equalsIgnoreCase(t.getCategory()))
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return mapToBudgetResponse(saved, spent);
    }

    // --- Savings Goals ---

    @Transactional(readOnly = true)
    public List<SavingsGoalResponse> getSavingsGoals(UUID userId) {
        return savingsGoalRepository.findAllByUserId(userId).stream()
                .map(this::mapToSavingsGoalResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public SavingsGoalResponse addSavingsGoal(UUID userId, SavingsGoalRequest request) {
        SavingsGoal goal = SavingsGoal.builder()
                .userId(userId)
                .name(request.getName())
                .targetAmount(request.getTargetAmount())
                .currentAmount(request.getCurrentAmount() != null ? request.getCurrentAmount() : BigDecimal.ZERO)
                .targetDate(request.getTargetDate())
                .build();
        return mapToSavingsGoalResponse(savingsGoalRepository.save(goal));
    }

    @Transactional
    public SavingsGoalResponse contributeToSavingsGoal(UUID userId, UUID goalId, BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Contribution amount must be greater than 0");
        }
        SavingsGoal goal = savingsGoalRepository.findByIdAndUserId(goalId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Savings goal not found"));

        goal.setCurrentAmount(goal.getCurrentAmount().add(amount));
        
        // Log an expense transaction for this savings contribution
        Transaction contributionTx = Transaction.builder()
                .userId(userId)
                .amount(amount)
                .type("EXPENSE")
                .category("Savings")
                .description("Contribution to goal: " + goal.getName())
                .date(LocalDate.now())
                .build();
        transactionRepository.save(contributionTx);

        return mapToSavingsGoalResponse(savingsGoalRepository.save(goal));
    }

    // --- Summary ---

    @Transactional(readOnly = true)
    public FinanceSummaryResponse getFinanceSummary(UUID userId) {
        LocalDate today = LocalDate.now();
        int month = today.getMonthValue();
        int year = today.getYear();

        LocalDate startOfMonth = LocalDate.of(year, month, 1);
        LocalDate endOfMonth = startOfMonth.withDayOfMonth(startOfMonth.lengthOfMonth());

        List<Transaction> allTransactions = transactionRepository.findAllByUserIdOrderByDateDesc(userId);
        BigDecimal netBalance = allTransactions.stream()
                .map(t -> "INCOME".equals(t.getType()) ? t.getAmount() : t.getAmount().negate())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<Transaction> monthTransactions = allTransactions.stream()
                .filter(t -> !t.getDate().isBefore(startOfMonth) && !t.getDate().isAfter(endOfMonth))
                .collect(Collectors.toList());

        BigDecimal monthlyIncome = monthTransactions.stream()
                .filter(t -> "INCOME".equals(t.getType()))
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal monthlyExpense = monthTransactions.stream()
                .filter(t -> "EXPENSE".equals(t.getType()))
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, BigDecimal> categoryExpenses = monthTransactions.stream()
                .filter(t -> "EXPENSE".equals(t.getType()))
                .collect(Collectors.groupingBy(
                        Transaction::getCategory,
                        Collectors.reducing(BigDecimal.ZERO, Transaction::getAmount, BigDecimal::add)
                ));

        List<Budget> budgets = budgetRepository.findAllByUserIdAndMonthAndYear(userId, month, year);
        List<BudgetResponse> budgetResponses = budgets.stream()
                .map(b -> {
                    BigDecimal spent = categoryExpenses.getOrDefault(b.getCategory(), BigDecimal.ZERO);
                    return mapToBudgetResponse(b, spent);
                })
                .collect(Collectors.toList());

        List<SavingsGoalResponse> savingsGoals = savingsGoalRepository.findAllByUserId(userId).stream()
                .map(this::mapToSavingsGoalResponse)
                .collect(Collectors.toList());

        List<TransactionResponse> recentTransactions = allTransactions.stream()
                .limit(5)
                .map(this::mapToTransactionResponse)
                .collect(Collectors.toList());

        return FinanceSummaryResponse.builder()
                .totalIncome(monthlyIncome)
                .totalExpenses(monthlyExpense)
                .netBalance(netBalance)
                .budgets(budgetResponses)
                .recentTransactions(recentTransactions)
                .savingsGoals(savingsGoals)
                .categoryExpenses(categoryExpenses)
                .build();
    }

    // --- Helper Mappings ---

    private TransactionResponse mapToTransactionResponse(Transaction transaction) {
        return TransactionResponse.builder()
                .id(transaction.getId())
                .amount(transaction.getAmount())
                .type(transaction.getType())
                .category(transaction.getCategory())
                .description(transaction.getDescription())
                .date(transaction.getDate())
                .build();
    }

    private BudgetResponse mapToBudgetResponse(Budget budget, BigDecimal spentAmount) {
        return BudgetResponse.builder()
                .id(budget.getId())
                .category(budget.getCategory())
                .limitAmount(budget.getLimitAmount())
                .spentAmount(spentAmount)
                .month(budget.getMonth())
                .year(budget.getYear())
                .build();
    }

    private SavingsGoalResponse mapToSavingsGoalResponse(SavingsGoal goal) {
        double progress = 0.0;
        if (goal.getTargetAmount().compareTo(BigDecimal.ZERO) > 0) {
            progress = goal.getCurrentAmount()
                    .multiply(new BigDecimal(100))
                    .divide(goal.getTargetAmount(), 2, RoundingMode.HALF_UP)
                    .doubleValue();
            if (progress > 100.0) progress = 100.0;
        }
        return SavingsGoalResponse.builder()
                .id(goal.getId())
                .name(goal.getName())
                .targetAmount(goal.getTargetAmount())
                .currentAmount(goal.getCurrentAmount())
                .targetDate(goal.getTargetDate())
                .progressPercentage(progress)
                .build();
    }

    private String autoCategorize(String description, String type, String existingCategory) {
        if (existingCategory != null && !existingCategory.trim().isEmpty() && 
            !"Other".equalsIgnoreCase(existingCategory) && !"Uncategorized".equalsIgnoreCase(existingCategory)) {
            return existingCategory;
        }

        if (description == null || description.trim().isEmpty()) {
            return "Other";
        }

        String desc = description.toLowerCase();

        if ("INCOME".equalsIgnoreCase(type)) {
            if (desc.contains("salary") || desc.contains("payroll") || desc.contains("wage")) return "Salary";
            if (desc.contains("dividend") || desc.contains("stock") || desc.contains("investment")) return "Investment";
            if (desc.contains("bonus") || desc.contains("gift") || desc.contains("award")) return "Gift";
            return "Other Income";
        }

        // Expenses auto-categorization
        if (desc.contains("zomato") || desc.contains("swiggy") || desc.contains("food") || 
            desc.contains("cafe") || desc.contains("restaurant") || desc.contains("starbucks") || 
            desc.contains("pizza") || desc.contains("burger") || desc.contains("dinner") || 
            desc.contains("lunch") || desc.contains("eats") || desc.contains("grocery") ||
            desc.contains("groceries") || desc.contains("supermarket") || desc.contains("kirana")) {
            return "Food";
        }

        if (desc.contains("uber") || desc.contains("ola") || desc.contains("cab") || 
            desc.contains("metro") || desc.contains("train") || desc.contains("bus") || 
            desc.contains("petrol") || desc.contains("fuel") || desc.contains("diesel") || 
            desc.contains("flight") || desc.contains("ticket") || desc.contains("travel")) {
            return "Transportation";
        }

        if (desc.contains("gym") || desc.contains("fitness") || desc.contains("doctor") || 
            desc.contains("medical") || desc.contains("medicine") || desc.contains("hospital") || 
            desc.contains("dentist") || desc.contains("therapy") || desc.contains("protein") || 
            desc.contains("supplement") || desc.contains("health")) {
            return "Health";
        }

        if (desc.contains("netflix") || desc.contains("spotify") || desc.contains("youtube") || 
            desc.contains("amazon prime") || desc.contains("disney") || desc.contains("movie") || 
            desc.contains("theatre") || desc.contains("concert") || desc.contains("game") || 
            desc.contains("steam") || desc.contains("playstation") || desc.contains("xbox")) {
            return "Entertainment";
        }

        if (desc.contains("electricity") || desc.contains("water") || desc.contains("gas") || 
            desc.contains("wifi") || desc.contains("broadband") || desc.contains("mobile") || 
            desc.contains("phone") || desc.contains("recharge") || desc.contains("postpaid") || 
            desc.contains("internet") || desc.contains("bill")) {
            return "Utilities";
        }

        if (desc.contains("rent") || desc.contains("landlord") || desc.contains("apartment") || 
            desc.contains("pg") || desc.contains("hostel") || desc.contains("room")) {
            return "Rent";
        }

        if (desc.contains("book") || desc.contains("course") || desc.contains("udemy") || 
            desc.contains("coursera") || desc.contains("stationery") || desc.contains("college") || 
            desc.contains("tuition") || desc.contains("fee") || desc.contains("fees") || 
            desc.contains("exam")) {
            return "Education";
        }

        return "Other";
    }
}
