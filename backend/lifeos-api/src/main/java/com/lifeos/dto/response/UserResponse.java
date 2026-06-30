package com.lifeos.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Response DTO exposing safe user profile fields (no password).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {

    private UUID id;
    private String fullName;
    private String email;
    private String avatar;
    private LocalDateTime createdAt;
    private int xp;
    private int level;
    private int streakDays;
    private boolean twoFactorEnabled;
}
