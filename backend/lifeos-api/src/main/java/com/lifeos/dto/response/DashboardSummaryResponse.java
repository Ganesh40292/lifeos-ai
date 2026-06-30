package com.lifeos.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryResponse {

    private UserProfileSummary userProfile;
    private QuickStatsSummary quickStats;
    private List<ChartData> expenseChartData;
    private List<ChartData> studyChartData;
    private List<TaskSummary> upcomingTasks;
    private List<ActivitySummary> recentActivities;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserProfileSummary {
        private String fullName;
        private String email;
        private int xp;
        private int level;
        private int streakDays;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuickStatsSummary {
        private double attendancePercentage;
        private int tasksFinishedToday;
        private int totalTasksToday;
        private double currentCgpa;
        private BigDecimal monthlyExpenses;
        private int notesCount;
        private int waterIntakeGlasses;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChartData {
        private String name;
        private Number value;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TaskSummary {
        private String id;
        private String title;
        private String courseCode;
        private String dueDate; // ISO date string
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ActivitySummary {
        private String id;
        private String title;
        private String description;
        private String timeAgo;
        private String type; // e.g., 'finance', 'note', 'health', 'career'
    }
}
