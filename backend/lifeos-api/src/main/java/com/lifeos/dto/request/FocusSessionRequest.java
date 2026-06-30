package com.lifeos.dto.request;

import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FocusSessionRequest {
    @Min(value = 1, message = "Duration must be at least 1 minute")
    private int durationMinutes;
    private boolean completed;
}
