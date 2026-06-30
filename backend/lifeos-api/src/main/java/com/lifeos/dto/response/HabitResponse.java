package com.lifeos.dto.response;

import lombok.*;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HabitResponse {
    private UUID id;
    private String name;
    private String description;
    private int streakDays;
    private LocalDate lastCompleted;
    private boolean completedToday;
}
