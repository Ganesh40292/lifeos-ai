package com.lifeos.controller;

import com.lifeos.dto.request.HealthMetricRequest;
import com.lifeos.dto.request.WorkoutRequest;
import com.lifeos.dto.response.HealthMetricResponse;
import com.lifeos.dto.response.WorkoutResponse;
import com.lifeos.dto.response.HealthInsightsResponse;
import com.lifeos.service.HealthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/health")
@RequiredArgsConstructor
public class HealthController {

    private final HealthService healthService;

    // --- Workouts ---

    @GetMapping("/workouts")
    public ResponseEntity<List<WorkoutResponse>> getWorkouts(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(healthService.getUserWorkouts(userDetails.getUsername()));
    }

    @PostMapping("/workouts")
    public ResponseEntity<WorkoutResponse> createWorkout(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody WorkoutRequest request) {
        return new ResponseEntity<>(healthService.createWorkout(userDetails.getUsername(), request), HttpStatus.CREATED);
    }

    @PutMapping("/workouts/{id}")
    public ResponseEntity<WorkoutResponse> updateWorkout(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody WorkoutRequest request) {
        return ResponseEntity.ok(healthService.updateWorkout(id, userDetails.getUsername(), request));
    }

    @DeleteMapping("/workouts/{id}")
    public ResponseEntity<Void> deleteWorkout(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        healthService.deleteWorkout(id, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }

    // --- Health Metrics ---

    @GetMapping("/metrics")
    public ResponseEntity<List<HealthMetricResponse>> getMetrics(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(healthService.getUserHealthMetrics(userDetails.getUsername()));
    }

    @PostMapping("/metrics")
    public ResponseEntity<HealthMetricResponse> saveMetric(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody HealthMetricRequest request) {
        return ResponseEntity.ok(healthService.saveHealthMetric(userDetails.getUsername(), request));
    }

    @GetMapping("/insights")
    public ResponseEntity<HealthInsightsResponse> getInsights(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(healthService.getHealthInsights(userDetails.getUsername()));
    }
}
