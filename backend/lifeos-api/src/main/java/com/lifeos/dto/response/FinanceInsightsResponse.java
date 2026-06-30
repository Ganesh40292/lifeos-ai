package com.lifeos.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FinanceInsightsResponse {
    private List<String> anomalyAlerts;
    private List<String> budgetWarnings;
    private List<String> savingTips;
}
