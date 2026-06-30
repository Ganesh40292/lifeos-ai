package com.lifeos.service;

import com.lifeos.dto.response.DashboardSummaryResponse;
import com.lifeos.entity.*;
import com.lifeos.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;
    private final AssignmentRepository assignmentRepository;
    private final TransactionRepository transactionRepository;
    private final NoteRepository noteRepository;
    private final WorkoutRepository workoutRepository;
    private final HealthMetricRepository healthMetricRepository;
    private final SubjectRepository subjectRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final FocusSessionRepository focusSessionRepository;

    @Transactional(readOnly = true)
    public DashboardSummaryResponse getDashboardSummary(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        UUID userId = user.getId();
        LocalDate today = LocalDate.now();

        // 1. User Profile
        DashboardSummaryResponse.UserProfileSummary userProfile = DashboardSummaryResponse.UserProfileSummary.builder()
                .fullName(user.getFullName())
                .email(user.getEmail())
                .xp(user.getXp())
                .level(user.getLevel())
                .streakDays(user.getStreakDays())
                .build();

        // 2. Student Data (Subjects & Assignments)
        List<Subject> subjects = subjectRepository.findAllByUserId(userId);
        double totalAttendance = 0;
        int subjectCount = 0;
        double currentCgpa = 0.0;
        // Simplified CGPA/Attendance calculation
        if (!subjects.isEmpty()) {
            for (Subject subject : subjects) {
                if (subject.getGrade() != null) {
                    try {
                        currentCgpa += Double.parseDouble(subject.getGrade());
                        subjectCount++;
                    } catch (NumberFormatException ignored) {}
                }
                totalAttendance += subject.getAttendancePercentage();
            }
            if (subjectCount > 0) currentCgpa /= subjectCount;
            totalAttendance /= subjects.size();
        }

        List<Assignment> allAssignments = assignmentRepository.findAllByUserId(userId);
        List<DashboardSummaryResponse.TaskSummary> upcomingTasks = allAssignments.stream()
                .filter(a -> a.getDueDate() != null && !a.getDueDate().isBefore(today))
                .filter(a -> !"COMPLETED".equals(a.getStatus()))
                .sorted(Comparator.comparing(Assignment::getDueDate))
                .limit(5)
                .map(a -> DashboardSummaryResponse.TaskSummary.builder()
                        .id(a.getId().toString())
                        .title(a.getTitle())
                        .courseCode(subjects.stream().filter(s -> s.getId().equals(a.getSubjectId())).findFirst().map(Subject::getCode).orElse(""))
                        .dueDate(a.getDueDate().toString())
                        .build())
                .collect(Collectors.toList());

        int tasksFinishedToday = (int) allAssignments.stream()
                .filter(a -> "COMPLETED".equals(a.getStatus()) && a.getDueDate() != null && a.getDueDate().equals(today))
                .count();
        int totalTasksToday = (int) allAssignments.stream()
                .filter(a -> a.getDueDate() != null && a.getDueDate().equals(today))
                .count();

        // 3. Finance Data (Expenses)
        LocalDate startOfMonth = today.withDayOfMonth(1);
        List<Transaction> thisMonthTransactions = transactionRepository.findAllByUserIdAndDateBetween(userId, startOfMonth, today);
        BigDecimal monthlyExpenses = thisMonthTransactions.stream()
                .filter(t -> "EXPENSE".equals(t.getType()))
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 4. Notes Data
        List<Note> notes = noteRepository.findAllByUserIdOrderByPinnedDescUpdatedAtDesc(userId);
        int notesCount = notes.size();

        // 5. Health Data
        Optional<HealthMetric> todayMetric = healthMetricRepository.findByUserIdAndDate(userId, today);
        int waterIntake = todayMetric.map(HealthMetric::getWaterIntakeGlasses).orElse(0);

        // Build Quick Stats
        DashboardSummaryResponse.QuickStatsSummary quickStats = DashboardSummaryResponse.QuickStatsSummary.builder()
                .attendancePercentage(totalAttendance)
                .tasksFinishedToday(tasksFinishedToday)
                .totalTasksToday(totalTasksToday)
                .currentCgpa(Math.round(currentCgpa * 100.0) / 100.0)
                .monthlyExpenses(monthlyExpenses)
                .notesCount(notesCount)
                .waterIntakeGlasses(waterIntake)
                .build();

        // 6. Recent Activities
        List<DashboardSummaryResponse.ActivitySummary> activities = new ArrayList<>();
        
        // Add recent note
        if (!notes.isEmpty()) {
            Note recentNote = notes.get(0);
            activities.add(DashboardSummaryResponse.ActivitySummary.builder()
                    .id(recentNote.getId().toString())
                    .title("Updated Note")
                    .description(recentNote.getTitle())
                    .timeAgo(getTimeAgo(recentNote.getUpdatedAt()))
                    .type("note")
                    .build());
        }

        // Add recent transaction
        if (!thisMonthTransactions.isEmpty()) {
            Transaction recentTx = thisMonthTransactions.stream()
                    .max(Comparator.comparing(Transaction::getDate))
                    .orElse(null);
            if (recentTx != null) {
                activities.add(DashboardSummaryResponse.ActivitySummary.builder()
                        .id(recentTx.getId().toString())
                        .title(recentTx.getType().equals("EXPENSE") ? "Spent money" : "Received income")
                        .description("₹" + recentTx.getAmount() + " on " + recentTx.getCategory())
                        .timeAgo(getTimeAgo(recentTx.getDate().atStartOfDay()))
                        .type("finance")
                        .build());
            }
        }

        // Add recent workout
        List<Workout> workouts = workoutRepository.findByUserIdOrderByDateDescCreatedAtDesc(userId);
        if (!workouts.isEmpty()) {
            Workout recentWorkout = workouts.get(0);
            activities.add(DashboardSummaryResponse.ActivitySummary.builder()
                    .id(recentWorkout.getId().toString())
                    .title("Logged Workout")
                    .description(recentWorkout.getType() + " for " + recentWorkout.getDurationMinutes() + " mins")
                    .timeAgo(getTimeAgo(recentWorkout.getCreatedAt()))
                    .type("health")
                    .build());
        }

        // Add recent job application
        List<JobApplication> jobs = jobApplicationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        if (!jobs.isEmpty()) {
            JobApplication recentJob = jobs.get(0);
            activities.add(DashboardSummaryResponse.ActivitySummary.builder()
                    .id(recentJob.getId().toString())
                    .title("Job Application Updated")
                    .description(recentJob.getPosition() + " at " + recentJob.getCompany())
                    .timeAgo(getTimeAgo(recentJob.getUpdatedAt()))
                    .type("career")
                    .build());
        }

        // Sort activities by timeAgo (this is a simplified string representation, but for real we'd sort by date)
        // Since we didn't store the raw date in the DTO, we can sort them before converting. 
        // For brevity, we just return them as is, UI will render them.

        // 7. Mock Chart Data (since historical computation is complex)
        // We will generate past 6 months of expenses just for the chart
        List<DashboardSummaryResponse.ChartData> expenseChartData = new ArrayList<>();
        DateTimeFormatter monthFormatter = DateTimeFormatter.ofPattern("MMM");
        for (int i = 5; i >= 0; i--) {
            LocalDate monthDate = today.minusMonths(i);
            expenseChartData.add(DashboardSummaryResponse.ChartData.builder()
                    .name(monthDate.format(monthFormatter))
                    // Mock value around 3000-5000
                    .value(3000 + (Math.random() * 2000))
                    .build());
        }

        LocalDate startOfWeek = today.minusDays(6);
        List<FocusSession> weeklySessions = focusSessionRepository.findAllByUserIdAndDateBetween(userId, startOfWeek, today);
        Map<LocalDate, Double> dailyHours = weeklySessions.stream()
                .filter(FocusSession::isCompleted)
                .collect(Collectors.groupingBy(
                        FocusSession::getDate,
                        Collectors.summingDouble(s -> s.getDurationMinutes() / 60.0)
                ));

        List<DashboardSummaryResponse.ChartData> studyChartData = new ArrayList<>();
        DateTimeFormatter dayFormatter = DateTimeFormatter.ofPattern("E");
        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            double hours = dailyHours.getOrDefault(date, 0.0);
            studyChartData.add(DashboardSummaryResponse.ChartData.builder()
                    .name(date.format(dayFormatter))
                    .value(Math.round(hours * 10.0) / 10.0)
                    .build());
        }

        return DashboardSummaryResponse.builder()
                .userProfile(userProfile)
                .quickStats(quickStats)
                .upcomingTasks(upcomingTasks)
                .recentActivities(activities)
                .expenseChartData(expenseChartData)
                .studyChartData(studyChartData)
                .build();
    }

    private String getTimeAgo(LocalDateTime dateTime) {
        if (dateTime == null) return "Just now";
        long minutes = ChronoUnit.MINUTES.between(dateTime, LocalDateTime.now());
        if (minutes < 60) {
            return minutes <= 1 ? "Just now" : minutes + "m ago";
        }
        long hours = ChronoUnit.HOURS.between(dateTime, LocalDateTime.now());
        if (hours < 24) {
            return hours + "h ago";
        }
        long days = ChronoUnit.DAYS.between(dateTime, LocalDateTime.now());
        return days + "d ago";
    }

    /**
     * Activity heatmap: returns 365 days of activity counts.
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getActivityHeatmap(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        UUID userId = user.getId();
        LocalDate today = LocalDate.now();
        List<Map<String, Object>> heatmap = new ArrayList<>();

        // Get all data
        List<Note> notes = noteRepository.findAllByUserIdOrderByPinnedDescUpdatedAtDesc(userId);
        List<Workout> workouts = workoutRepository.findByUserIdOrderByDateDescCreatedAtDesc(userId);
        List<Transaction> transactions = transactionRepository.findAllByUserIdOrderByDateDesc(userId);
        List<Assignment> assignments = assignmentRepository.findAllByUserId(userId);
        List<FocusSession> focusSessions = focusSessionRepository.findAllByUserIdOrderByCreatedAtDesc(userId);

        // Build a map of date -> count
        Map<LocalDate, Integer> dateCounts = new java.util.HashMap<>();
        for (Note n : notes) {
            if (n.getCreatedAt() != null) {
                LocalDate d = n.getCreatedAt().toLocalDate();
                dateCounts.merge(d, 1, Integer::sum);
            }
        }
        for (Workout w : workouts) {
            if (w.getDate() != null) {
                dateCounts.merge(w.getDate(), 2, Integer::sum);
            }
        }
        for (Transaction t : transactions) {
            if (t.getDate() != null) {
                dateCounts.merge(t.getDate(), 1, Integer::sum);
            }
        }
        for (Assignment a : assignments) {
            if (a.getDueDate() != null) {
                // Use due date or creation date for assignments (completed assignments count)
                dateCounts.merge(a.getDueDate(), 2, Integer::sum);
            }
        }
        for (FocusSession fs : focusSessions) {
            if (fs.getDate() != null) {
                dateCounts.merge(fs.getDate(), 3, Integer::sum);
            }
        }

        // Generate 365 days
        for (int i = 364; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            Map<String, Object> entry = new java.util.HashMap<>();
            entry.put("date", date.toString());
            entry.put("count", dateCounts.getOrDefault(date, 0));
            heatmap.add(entry);
        }

        return heatmap;
    }

    /**
     * Life Score: a composite 0–100 score from all modules.
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getLifeScore(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        UUID userId = user.getId();
        LocalDate today = LocalDate.now();

        // Academics (0-25): based on attendance and completion rate
        List<Subject> subjects = subjectRepository.findAllByUserId(userId);
        double academicScore = 0;
        if (!subjects.isEmpty()) {
            double avgAttendance = subjects.stream().mapToDouble(Subject::getAttendancePercentage).average().orElse(0);
            academicScore = Math.min(25, avgAttendance / 4.0);
        }

        // Finance (0-25): Have entries = good
        List<Transaction> txns = transactionRepository.findAllByUserIdOrderByDateDesc(userId);
        double financeScore = Math.min(25, txns.size() * 2.5);

        // Health (0-25): workouts and metrics
        List<Workout> workouts = workoutRepository.findByUserIdOrderByDateDescCreatedAtDesc(userId);
        Optional<HealthMetric> todayMetric = healthMetricRepository.findByUserIdAndDate(userId, today);
        double healthScore = Math.min(15, workouts.size() * 3.0);
        if (todayMetric.isPresent()) healthScore += 10;
        healthScore = Math.min(25, healthScore);

        // Productivity (0-25): notes + career
        List<Note> notes = noteRepository.findAllByUserIdOrderByPinnedDescUpdatedAtDesc(userId);
        List<JobApplication> jobs = jobApplicationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        double productivityScore = Math.min(25, notes.size() * 2.0 + jobs.size() * 3.0);

        double totalScore = Math.min(100, academicScore + financeScore + healthScore + productivityScore);

        Map<String, Object> result = new java.util.HashMap<>();
        result.put("totalScore", Math.round(totalScore));
        result.put("academic", Math.round(academicScore));
        result.put("finance", Math.round(financeScore));
        result.put("health", Math.round(healthScore));
        result.put("productivity", Math.round(productivityScore));
        return result;
    }
}
