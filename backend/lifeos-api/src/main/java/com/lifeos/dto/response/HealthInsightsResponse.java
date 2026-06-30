package com.lifeos.dto.response;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HealthInsightsResponse {
    private double averageSleep;
    private double averageWater;
    private int workoutCount;
    private List<String> adviceList;
}
