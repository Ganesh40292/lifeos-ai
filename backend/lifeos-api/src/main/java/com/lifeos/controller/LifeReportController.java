package com.lifeos.controller;

import com.lifeos.dto.response.ApiResponse;
import com.lifeos.dto.response.LifeReportResponse;
import com.lifeos.dto.response.UserResponse;
import com.lifeos.service.LifeReportService;
import com.lifeos.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class LifeReportController {

    private final LifeReportService lifeReportService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<LifeReportResponse>> getReport(
            Authentication authentication,
            @RequestParam(defaultValue = "WEEK") String period) {
        UserResponse user = userService.getUserByEmail(authentication.getName());
        LifeReportResponse response = lifeReportService.generateReport(user.getId(), period);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
