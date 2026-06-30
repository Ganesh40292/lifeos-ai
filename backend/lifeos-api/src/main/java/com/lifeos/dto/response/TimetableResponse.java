package com.lifeos.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalTime;
import java.util.UUID;

/**
 * Response DTO exposing Timetable Entries with subject metadata.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimetableResponse {
    private UUID id;
    private String dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;
    private String room;
    private UUID subjectId;
    private String subjectName;
    private String subjectCode;
}
