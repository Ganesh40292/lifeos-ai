package com.lifeos.controller;

import com.lifeos.dto.request.HabitRequest;
import com.lifeos.dto.response.ApiResponse;
import com.lifeos.dto.response.HabitResponse;
import com.lifeos.dto.response.UserResponse;
import com.lifeos.service.HabitService;
import com.lifeos.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/habits")
@RequiredArgsConstructor
public class HabitController {

    private final HabitService habitService;
    private final UserService userService;

    private UUID getUserId(Authentication authentication) {
        UserResponse user = userService.getUserByEmail(authentication.getName());
        return user.getId();
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<HabitResponse>>> getHabits(Authentication authentication) {
        List<HabitResponse> responses = habitService.getHabits(getUserId(authentication));
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<HabitResponse>> addHabit(
            Authentication authentication,
            @Valid @RequestBody HabitRequest request) {
        HabitResponse response = habitService.addHabit(getUserId(authentication), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteHabit(
            Authentication authentication,
            @PathVariable UUID id) {
        habitService.deleteHabit(getUserId(authentication), id);
        return ResponseEntity.ok(ApiResponse.success("Habit deleted successfully", null));
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<ApiResponse<HabitResponse>> toggleHabit(
            Authentication authentication,
            @PathVariable UUID id) {
        HabitResponse response = habitService.toggleHabit(getUserId(authentication), id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
