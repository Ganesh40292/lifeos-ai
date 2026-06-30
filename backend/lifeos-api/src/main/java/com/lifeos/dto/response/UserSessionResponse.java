package com.lifeos.dto.response;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSessionResponse {
    private UUID id;
    private String device;
    private String ipAddress;
    private LocalDateTime lastActive;
    private boolean isCurrentSession;
}
