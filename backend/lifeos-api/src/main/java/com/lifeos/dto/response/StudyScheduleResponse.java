package com.lifeos.dto.response;

import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudyScheduleResponse {
    private LocalDate date;
    private List<StudyBlock> blocks;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudyBlock {
        private String assignmentName;
        private int durationMinutes;
        private String message;
    }
}
