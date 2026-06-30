package com.lifeos.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Request payload for creating or updating an Assignment.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssignmentRequest {

    @NotBlank(message = "Assignment title is required")
    @Size(max = 200, message = "Assignment title cannot exceed 200 characters")
    private String title;

    @NotNull(message = "Associated subject ID is required")
    private UUID subjectId;

    @NotNull(message = "Due date is required")
    private LocalDate dueDate;

    @NotBlank(message = "Status is required")
    private String status; // TODO, IN_PROGRESS, SUBMITTED

    @NotBlank(message = "Priority is required")
    private String priority; // HIGH, MEDIUM, LOW
}
