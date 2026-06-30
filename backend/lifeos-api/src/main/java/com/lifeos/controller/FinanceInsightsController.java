package com.lifeos.controller;

import com.lifeos.dto.response.FinanceInsightsResponse;
import com.lifeos.service.FinanceInsightsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/finance/insights")
@RequiredArgsConstructor
public class FinanceInsightsController {

    private final FinanceInsightsService financeInsightsService;

    @GetMapping
    public ResponseEntity<FinanceInsightsResponse> getInsights(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(financeInsightsService.getInsights(userDetails.getUsername()));
    }
}
