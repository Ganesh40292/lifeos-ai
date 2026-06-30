package com.lifeos.controller;

import com.lifeos.dto.request.ChatRequest;
import com.lifeos.dto.response.ApiResponse;
import com.lifeos.dto.response.ChatResponse;
import com.lifeos.dto.response.UserResponse;
import com.lifeos.service.GeminiService;
import com.lifeos.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * REST controller for AI Copilot endpoints.
 */
@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final GeminiService geminiService;
    private final UserService userService;

    private UUID getUserId(Authentication authentication) {
        UserResponse user = userService.getUserByEmail(authentication.getName());
        return user.getId();
    }

    @PostMapping("/chat")
    public ResponseEntity<ApiResponse<ChatResponse>> chat(
            Authentication authentication,
            @Valid @RequestBody ChatRequest request) {
        UUID userId = getUserId(authentication);
        ChatResponse response = geminiService.chat(userId, request.getMessage());
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
