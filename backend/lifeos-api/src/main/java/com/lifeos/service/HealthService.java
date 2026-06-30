package com.lifeos.service;

import com.lifeos.dto.request.HealthMetricRequest;
import com.lifeos.dto.request.WorkoutRequest;
import com.lifeos.dto.response.HealthMetricResponse;
import com.lifeos.dto.response.WorkoutResponse;
import com.lifeos.dto.response.HealthInsightsResponse;
import com.lifeos.entity.HealthMetric;
import com.lifeos.entity.User;
import com.lifeos.entity.Workout;
import com.lifeos.repository.HealthMetricRepository;
import com.lifeos.repository.UserRepository;
import com.lifeos.repository.WorkoutRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HealthService {

    private final WorkoutRepository workoutRepository;
    private final HealthMetricRepository healthMetricRepository;
    private final UserRepository userRepository;
    private final GamificationService gamificationService;

    // --- Workouts ---

    @Transactional(readOnly = true)
    public List<WorkoutResponse> getUserWorkouts(String userEmail) {
        User user = getUserByEmail(userEmail);
        return workoutRepository.findByUserIdOrderByDateDescCreatedAtDesc(user.getId())
                .stream()
                .map(this::mapToWorkoutResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public WorkoutResponse createWorkout(String userEmail, WorkoutRequest request) {
        User user = getUserByEmail(userEmail);

        Workout workout = Workout.builder()
                .user(user)
                .type(request.getType())
                .durationMinutes(request.getDurationMinutes())
                .caloriesBurned(request.getCaloriesBurned())
                .date(request.getDate())
                .notes(request.getNotes())
                .build();

        Workout saved = workoutRepository.save(workout);
        gamificationService.awardXp(user.getId(), GamificationService.ActivityType.LOG_WORKOUT);
        return mapToWorkoutResponse(saved);
    }

    @Transactional
    public WorkoutResponse updateWorkout(UUID id, String userEmail, WorkoutRequest request) {
        Workout workout = getWorkoutByIdAndUser(id, userEmail);

        workout.setType(request.getType());
        workout.setDurationMinutes(request.getDurationMinutes());
        workout.setCaloriesBurned(request.getCaloriesBurned());
        workout.setDate(request.getDate());
        workout.setNotes(request.getNotes());

        return mapToWorkoutResponse(workoutRepository.save(workout));
    }

    @Transactional
    public void deleteWorkout(UUID id, String userEmail) {
        Workout workout = getWorkoutByIdAndUser(id, userEmail);
        workoutRepository.delete(workout);
    }

    // --- Health Metrics ---

    @Transactional(readOnly = true)
    public List<HealthMetricResponse> getUserHealthMetrics(String userEmail) {
        User user = getUserByEmail(userEmail);
        return healthMetricRepository.findByUserIdOrderByDateAsc(user.getId())
                .stream()
                .map(this::mapToHealthMetricResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public HealthMetricResponse saveHealthMetric(String userEmail, HealthMetricRequest request) {
        User user = getUserByEmail(userEmail);

        // Check if a metric for this date already exists for the user
        HealthMetric metric = healthMetricRepository.findByUserIdAndDate(user.getId(), request.getDate())
                .orElse(HealthMetric.builder()
                        .user(user)
                        .date(request.getDate())
                        .build());

        metric.setWeight(request.getWeight());
        metric.setWaterIntakeGlasses(request.getWaterIntakeGlasses());
        metric.setSleepHours(request.getSleepHours());
        metric.setNotes(request.getNotes());

        return mapToHealthMetricResponse(healthMetricRepository.save(metric));
    }

    // --- Helpers ---

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private Workout getWorkoutByIdAndUser(UUID id, String email) {
        Workout workout = workoutRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Workout not found"));
        if (!workout.getUser().getEmail().equals(email)) {
            throw new RuntimeException("Not authorized to access this workout");
        }
        return workout;
    }

    private WorkoutResponse mapToWorkoutResponse(Workout workout) {
        return WorkoutResponse.builder()
                .id(workout.getId())
                .type(workout.getType())
                .durationMinutes(workout.getDurationMinutes())
                .caloriesBurned(workout.getCaloriesBurned())
                .date(workout.getDate())
                .notes(workout.getNotes())
                .createdAt(workout.getCreatedAt())
                .updatedAt(workout.getUpdatedAt())
                .build();
    }

    private HealthMetricResponse mapToHealthMetricResponse(HealthMetric metric) {
        return HealthMetricResponse.builder()
                .id(metric.getId())
                .date(metric.getDate())
                .weight(metric.getWeight())
                .waterIntakeGlasses(metric.getWaterIntakeGlasses())
                .sleepHours(metric.getSleepHours())
                .notes(metric.getNotes())
                .createdAt(metric.getCreatedAt())
                .updatedAt(metric.getUpdatedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public HealthInsightsResponse getHealthInsights(String userEmail) {
        User user = getUserByEmail(userEmail);
        LocalDate start = LocalDate.now().minusDays(7);
        LocalDate end = LocalDate.now();

        // 1. Calculate Sleep and Water average
        List<HealthMetric> metrics = healthMetricRepository.findByUserIdOrderByDateAsc(user.getId());
        List<HealthMetric> last7DaysMetrics = metrics.stream()
                .filter(m -> m.getDate() != null && !m.getDate().isBefore(start) && !m.getDate().isAfter(end))
                .collect(Collectors.toList());

        double totalSleep = 0.0;
        int sleepDays = 0;
        double totalWater = 0.0;
        int waterDays = 0;

        for (HealthMetric m : last7DaysMetrics) {
            if (m.getSleepHours() != null) {
                totalSleep += m.getSleepHours().doubleValue();
                sleepDays++;
            }
            if (m.getWaterIntakeGlasses() != null) {
                totalWater += m.getWaterIntakeGlasses();
                waterDays++;
            }
        }

        double avgSleep = sleepDays > 0 ? totalSleep / sleepDays : 0.0;
        double avgWater = waterDays > 0 ? totalWater / waterDays : 0.0;

        // 2. Count Workouts
        List<Workout> workouts = workoutRepository.findByUserIdOrderByDateDescCreatedAtDesc(user.getId());
        long workoutCount = workouts.stream()
                .filter(w -> w.getDate() != null && !w.getDate().isBefore(start) && !w.getDate().isAfter(end))
                .count();

        // 3. Compile advice
        List<String> advice = new java.util.ArrayList<>();

        if (avgSleep == 0.0) {
            advice.add("Try logging your sleep hours daily. Consistency is key to building healthy lifestyle awareness.");
        } else if (avgSleep < 7.0) {
            advice.add(String.format("Your average sleep this week is %.1f hours. Aim for 7-8 hours to improve muscle recovery, mental clarity, and memory consolidation.", avgSleep));
        } else {
            advice.add(String.format("Great job! Averaging %.1f hours of sleep daily keeps your nervous system fully charged.", avgSleep));
        }

        if (avgWater == 0.0) {
            advice.add("Track your daily water intake. Staying hydrated increases energy levels and helps flush metabolic toxins.");
        } else if (avgWater < 8.0) {
            if (workoutCount > 0) {
                advice.add(String.format("Since you completed %d workouts this week, your average hydration of %.1f glasses is low. Try adding a glass before and after sessions to speed up recovery.", workoutCount, avgWater));
            } else {
                advice.add(String.format("Your average water intake of %.1f glasses is under the daily target of 8 glasses. Place a water reminder near your study desk!", avgWater));
            }
        } else {
            advice.add(String.format("Perfect hydration! An average of %.1f glasses of water daily keeps your metabolism running at maximum efficiency.", avgWater));
        }

        if (workoutCount >= 4) {
            advice.add(String.format("Fantastic physical consistency! Logging %d workouts this week shows incredible commitment. Make sure to schedule rest days.", workoutCount));
        } else if (workoutCount == 0) {
            advice.add("No workouts logged in the last 7 days. Even a brisk 15-minute walk or light stretching can help reduce stress and improve focus.");
        } else {
            advice.add(String.format("Logged %d workout%s this week. Aiming for 3-4 sessions weekly can establish stable cardiorespiratory health.", workoutCount, workoutCount == 1 ? "" : "s"));
        }

        return HealthInsightsResponse.builder()
                .averageSleep(Math.round(avgSleep * 10.0) / 10.0)
                .averageWater(Math.round(avgWater * 10.0) / 10.0)
                .workoutCount((int) workoutCount)
                .adviceList(advice)
                .build();
    }
}
