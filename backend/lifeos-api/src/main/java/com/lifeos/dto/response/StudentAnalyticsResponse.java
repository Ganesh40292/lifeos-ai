package com.lifeos.dto.response;

import lombok.*;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentAnalyticsResponse {
    private double cgpa;
    private double overallAttendance;
    private double assignmentCompletionRate;
    private int totalCredits;
    private int studyMinutes;
    private List<LowAttendanceAlert> lowAttendanceAlerts;

    @Data
    @AllArgsConstructor
    public static class LowAttendanceAlert {
        private UUID subjectId;
        private String subjectName;
        private String subjectCode;
        private double attendancePercentage;
        private int attendedClasses;
        private int totalClasses;
    }
}
