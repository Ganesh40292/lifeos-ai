package com.lifeos.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HealthMetricRequest {

    @NotNull(message = "Date is required")
    private LocalDate date;

    private BigDecimal weight;

    private Integer waterIntakeGlasses;

    private BigDecimal sleepHours;

    private String notes;
}
