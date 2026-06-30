package com.lifeos.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalTime;
import java.util.UUID;

/**
 * Request payload for creating a Timetable Entry.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TimetableRequest {

    @NotNull(message = "Associated subject ID is required")
    private UUID subjectId;

    @NotBlank(message = "Day of week is required")
    private String dayOfWeek; // MONDAY, TUESDAY ...

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    private LocalTime endTime;

    @NotBlank(message = "Room/location is required")
    @Size(max = 50, message = "Room length cannot exceed 50 characters")
    private String room;
}
