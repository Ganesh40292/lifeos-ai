package com.lifeos.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FocusSessionResponse {
    private UUID id;
    private int durationMinutes;
    private LocalDate date;
    private boolean completed;
    private LocalDateTime createdAt;
}
