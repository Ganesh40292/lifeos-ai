package com.lifeos.controller;

import com.lifeos.dto.request.BudgetRequest;
import com.lifeos.dto.request.SavingsGoalRequest;
import com.lifeos.dto.request.TransactionRequest;
import com.lifeos.dto.response.*;
import com.lifeos.service.FinanceService;
import com.lifeos.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * REST controller for Finance Module endpoints.
 */
@RestController
@RequestMapping("/api/finance")
@RequiredArgsConstructor
public class FinanceController {

    private final FinanceService financeService;
    private final UserService userService;

    private UUID getUserId(Authentication authentication) {
        UserResponse user = userService.getUserByEmail(authentication.getName());
        return user.getId();
    }

    // --- Summary Endpoint ---

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<FinanceSummaryResponse>> getFinanceSummary(Authentication authentication) {
        FinanceSummaryResponse summary = financeService.getFinanceSummary(getUserId(authentication));
        return ResponseEntity.ok(ApiResponse.success(summary));
    }

    // --- Transaction Endpoints ---

    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse<List<TransactionResponse>>> getTransactions(Authentication authentication) {
        List<TransactionResponse> responses = financeService.getTransactions(getUserId(authentication));
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @PostMapping("/transactions")
    public ResponseEntity<ApiResponse<TransactionResponse>> addTransaction(
            Authentication authentication,
            @Valid @RequestBody TransactionRequest request) {
        TransactionResponse response = financeService.addTransaction(getUserId(authentication), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    @DeleteMapping("/transactions/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTransaction(
            Authentication authentication,
            @PathVariable UUID id) {
        financeService.deleteTransaction(getUserId(authentication), id);
        return ResponseEntity.ok(ApiResponse.success("Transaction deleted successfully", null));
    }

    // --- Budget Endpoints ---

    @GetMapping("/budgets")
    public ResponseEntity<ApiResponse<List<BudgetResponse>>> getBudgets(
            Authentication authentication,
            @RequestParam int month,
            @RequestParam int year) {
        List<BudgetResponse> responses = financeService.getBudgets(getUserId(authentication), month, year);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @PostMapping("/budgets")
    public ResponseEntity<ApiResponse<BudgetResponse>> addOrUpdateBudget(
            Authentication authentication,
            @Valid @RequestBody BudgetRequest request) {
        BudgetResponse response = financeService.addOrUpdateBudget(getUserId(authentication), request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // --- Savings Goal Endpoints ---

    @GetMapping("/savings")
    public ResponseEntity<ApiResponse<List<SavingsGoalResponse>>> getSavingsGoals(Authentication authentication) {
        List<SavingsGoalResponse> responses = financeService.getSavingsGoals(getUserId(authentication));
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @PostMapping("/savings")
    public ResponseEntity<ApiResponse<SavingsGoalResponse>> addSavingsGoal(
            Authentication authentication,
            @Valid @RequestBody SavingsGoalRequest request) {
        SavingsGoalResponse response = financeService.addSavingsGoal(getUserId(authentication), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    @PatchMapping("/savings/{id}/contribute")
    public ResponseEntity<ApiResponse<SavingsGoalResponse>> contributeToSavingsGoal(
            Authentication authentication,
            @PathVariable UUID id,
            @RequestParam BigDecimal amount) {
        SavingsGoalResponse response = financeService.contributeToSavingsGoal(getUserId(authentication), id, amount);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
