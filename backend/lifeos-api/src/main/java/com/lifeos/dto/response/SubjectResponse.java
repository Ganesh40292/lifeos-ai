package com.lifeos.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

/**
 * Response exposing Subject data.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubjectResponse {
    private UUID id;
    private String name;
    private String code;
    private int attendedClasses;
    private int totalClasses;
    private int credits;
    private String grade;
    private double attendancePercentage;
}
