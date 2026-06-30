package com.lifeos.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Response DTO exposing Assignment data with nested subject metadata.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssignmentResponse {
    private UUID id;
    private String title;
    private LocalDate dueDate;
    private String status;
    private String priority;
    private UUID subjectId;
    private String subjectName;
    private String subjectCode;
}
