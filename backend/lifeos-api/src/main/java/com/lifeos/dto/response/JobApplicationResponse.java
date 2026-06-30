package com.lifeos.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobApplicationResponse {
    private UUID id;
    private String company;
    private String position;
    private String status;
    private LocalDate dateApplied;
    private String url;
    private String salaryRange;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
