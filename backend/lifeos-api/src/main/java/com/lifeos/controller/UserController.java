package com.lifeos.controller;

import com.lifeos.dto.request.ChangePasswordRequest;
import com.lifeos.dto.request.UpdateProfileRequest;
import com.lifeos.dto.response.UserResponse;
import com.lifeos.service.UserService;
import com.lifeos.service.GamificationService;
import com.lifeos.repository.UserRepository;
import com.lifeos.entity.User;
import com.lifeos.exception.ResourceNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final GamificationService gamificationService;

    @GetMapping("/profile")
    public ResponseEntity<UserResponse> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(userService.getUserByEmail(userDetails.getUsername()));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserResponse> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.updateProfile(userDetails.getUsername(), request));
    }

    @PostMapping("/change-password")
    public ResponseEntity<Void> changePassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(userDetails.getUsername(), request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/xp")
    public ResponseEntity<UserResponse> awardXp(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam GamificationService.ActivityType activityType) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userDetails.getUsername()));
        User updatedUser = gamificationService.awardXp(user.getId(), activityType);
        return ResponseEntity.ok(userService.mapToResponse(updatedUser));
    }
}
