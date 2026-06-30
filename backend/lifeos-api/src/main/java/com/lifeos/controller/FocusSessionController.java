package com.lifeos.controller;

import com.lifeos.dto.request.FocusSessionRequest;
import com.lifeos.dto.response.FocusSessionResponse;
import com.lifeos.service.FocusSessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/focus-sessions")
@RequiredArgsConstructor
public class FocusSessionController {

    private final FocusSessionService focusSessionService;

    @GetMapping
    public ResponseEntity<List<FocusSessionResponse>> getSessions(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(focusSessionService.getFocusSessions(userDetails.getUsername()));
    }

    @PostMapping
    public ResponseEntity<FocusSessionResponse> createSession(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody FocusSessionRequest request) {
        return ResponseEntity.ok(focusSessionService.createFocusSession(userDetails.getUsername(), request));
    }
}
