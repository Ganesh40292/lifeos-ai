package com.lifeos.controller;

import com.lifeos.dto.request.LoginRequest;
import com.lifeos.dto.request.RegisterRequest;
import com.lifeos.dto.response.ApiResponse;
import com.lifeos.dto.response.AuthResponse;
import com.lifeos.dto.response.UserResponse;
import com.lifeos.service.AuthService;
import com.lifeos.service.UserService;
import jakarta.validation.Valid;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.UUID;
import com.lifeos.dto.response.TwoFactorSetupResponse;
import com.lifeos.dto.response.UserSessionResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    public AuthController(AuthService authService, UserService userService) {
        this.authService = authService;
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest request,
            HttpServletRequest httpServletRequest) {
        String ipAddress = getClientIp(httpServletRequest);
        String device = httpServletRequest.getHeader("User-Agent");
        AuthResponse response = authService.register(request, ipAddress, device);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpServletRequest) {
        String ipAddress = getClientIp(httpServletRequest);
        String device = httpServletRequest.getHeader("User-Agent");
        AuthResponse response = authService.login(request, ipAddress, device);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/google")
    public ResponseEntity<AuthResponse> googleLogin(
            @RequestBody(required = false) com.lifeos.dto.request.GoogleLoginRequest bodyRequest,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String fullName,
            @RequestParam(required = false) String avatar,
            HttpServletRequest httpServletRequest) {
        String userEmail = bodyRequest != null && bodyRequest.getEmail() != null ? bodyRequest.getEmail() : email;
        String userFullName = bodyRequest != null && bodyRequest.getFullName() != null ? bodyRequest.getFullName() : fullName;
        String userAvatar = bodyRequest != null && bodyRequest.getAvatar() != null ? bodyRequest.getAvatar() : avatar;

        if (userEmail == null || userEmail.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        String ipAddress = getClientIp(httpServletRequest);
        String device = httpServletRequest.getHeader("User-Agent");
        AuthResponse response = authService.loginOrRegisterGoogle(userEmail, userFullName, userAvatar, ipAddress, device);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        UserResponse userResponse = userService.getUserByEmail(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(userResponse));
    }

    // --- Two-Factor Authentication (2FA) ---

    @PostMapping("/2fa/verify")
    public ResponseEntity<AuthResponse> verify2FaLogin(
            @RequestParam String tempToken,
            @RequestParam int code,
            HttpServletRequest httpServletRequest) {
        String ipAddress = getClientIp(httpServletRequest);
        String device = httpServletRequest.getHeader("User-Agent");
        AuthResponse response = authService.verify2FaLogin(tempToken, code, ipAddress, device);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/2fa/setup")
    public ResponseEntity<TwoFactorSetupResponse> setup2Fa(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(authService.setup2Fa(authentication.getName()));
    }

    @PostMapping("/2fa/enable")
    public ResponseEntity<Void> enable2Fa(Authentication authentication, @RequestParam int code) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        authService.enable2Fa(authentication.getName(), code);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/2fa/disable")
    public ResponseEntity<Void> disable2Fa(Authentication authentication, @RequestParam int code) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        authService.disable2Fa(authentication.getName(), code);
        return ResponseEntity.ok().build();
    }

    // --- Active Session Management ---

    @GetMapping("/sessions")
    public ResponseEntity<List<UserSessionResponse>> getActiveSessions(
            Authentication authentication,
            HttpServletRequest httpServletRequest) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String currentToken = extractToken(httpServletRequest);
        return ResponseEntity.ok(authService.getActiveSessions(authentication.getName(), currentToken));
    }

    @DeleteMapping("/sessions/{id}")
    public ResponseEntity<Void> revokeSession(Authentication authentication, @PathVariable UUID id) {
        authService.revokeSession(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest httpServletRequest) {
        String token = extractToken(httpServletRequest);
        if (token != null) {
            authService.revokeSessionByToken(token);
        }
        return ResponseEntity.ok().build();
    }

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }

    private String extractToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
