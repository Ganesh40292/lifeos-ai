package com.lifeos.dto.response;

import lombok.*;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LifeReportResponse {
    private String period; // "WEEK" or "MONTH"
    private long tasksCompleted;
    private double totalExpenses;
    private long workoutsLogged;
    private long notesCreated;
    private int xpEarned;
    private String generatedAt;
    private String dateRange;
}
