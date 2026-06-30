package com.lifeos.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkoutRequest {

    @NotBlank(message = "Type is required")
    private String type;

    @NotNull(message = "Duration is required")
    private Integer durationMinutes;

    private Integer caloriesBurned;

    @NotNull(message = "Date is required")
    private LocalDate date;

    private String notes;
}
