package com.lifeos.controller;

import com.lifeos.dto.response.DashboardSummaryResponse;
import com.lifeos.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryResponse> getSummary(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(dashboardService.getDashboardSummary(userDetails.getUsername()));
    }

    @GetMapping("/activity-heatmap")
    public ResponseEntity<List<Map<String, Object>>> getActivityHeatmap(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(dashboardService.getActivityHeatmap(userDetails.getUsername()));
    }

    @GetMapping("/life-score")
    public ResponseEntity<Map<String, Object>> getLifeScore(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(dashboardService.getLifeScore(userDetails.getUsername()));
    }
}
