package com.lifeos.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HealthMetricResponse {
    private UUID id;
    private LocalDate date;
    private BigDecimal weight;
    private Integer waterIntakeGlasses;
    private BigDecimal sleepHours;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
