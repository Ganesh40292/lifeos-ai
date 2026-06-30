package com.lifeos.service;

import com.lifeos.dto.request.HabitRequest;
import com.lifeos.dto.response.HabitResponse;
import com.lifeos.entity.Habit;
import com.lifeos.entity.HabitLog;
import com.lifeos.exception.ResourceNotFoundException;
import com.lifeos.repository.HabitLogRepository;
import com.lifeos.repository.HabitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HabitService {

    private final HabitRepository habitRepository;
    private final HabitLogRepository habitLogRepository;
    private final GamificationService gamificationService;

    @Transactional(readOnly = true)
    public List<HabitResponse> getHabits(UUID userId) {
        LocalDate today = LocalDate.now();
        return habitRepository.findAllByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(h -> {
                    boolean completedToday = habitLogRepository.findByHabitIdAndDate(h.getId(), today)
                            .map(HabitLog::isCompleted)
                            .orElse(false);
                    return mapToResponse(h, completedToday);
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public HabitResponse addHabit(UUID userId, HabitRequest request) {
        Habit habit = Habit.builder()
                .userId(userId)
                .name(request.getName())
                .description(request.getDescription())
                .streakDays(0)
                .build();
        return mapToResponse(habitRepository.save(habit), false);
    }

    @Transactional
    public void deleteHabit(UUID userId, UUID habitId) {
        Habit habit = habitRepository.findByIdAndUserId(habitId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Habit not found"));
        habitRepository.delete(habit);
    }

    @Transactional
    public HabitResponse toggleHabit(UUID userId, UUID habitId) {
        Habit habit = habitRepository.findByIdAndUserId(habitId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Habit not found"));

        LocalDate today = LocalDate.now();
        Optional<HabitLog> existingLog = habitLogRepository.findByHabitIdAndDate(habitId, today);

        boolean completedToday;

        if (existingLog.isPresent()) {
            // Undo completion
            habitLogRepository.delete(existingLog.get());
            completedToday = false;

            // Recalculate streak to previous completion state
            if (habit.getStreakDays() > 0) {
                habit.setStreakDays(Math.max(0, habit.getStreakDays() - 1));
            }
            // Find most recent completion date before today
            LocalDate lastVal = null;
            List<HabitLog> historicalLogs = habitLogRepository.findAllByHabitId(habitId);
            for (HabitLog log : historicalLogs) {
                if (!log.getDate().equals(today) && log.isCompleted()) {
                    if (lastVal == null || log.getDate().isAfter(lastVal)) {
                        lastVal = log.getDate();
                    }
                }
            }
            habit.setLastCompleted(lastVal);
        } else {
            // Complete today
            HabitLog log = HabitLog.builder()
                    .habitId(habitId)
                    .date(today)
                    .completed(true)
                    .build();
            habitLogRepository.save(log);
            completedToday = true;

            LocalDate yesterday = today.minusDays(1);
            if (habit.getLastCompleted() == null) {
                habit.setStreakDays(1);
            } else if (habit.getLastCompleted().equals(yesterday)) {
                habit.setStreakDays(habit.getStreakDays() + 1);
            } else if (!habit.getLastCompleted().equals(today)) {
                // Streak broken, reset to 1
                habit.setStreakDays(1);
            }
            habit.setLastCompleted(today);

            // Award 10 XP for daily completion!
            gamificationService.awardXp(userId, GamificationService.ActivityType.COMPLETE_HABIT);
        }

        Habit saved = habitRepository.save(habit);
        return mapToResponse(saved, completedToday);
    }

    private HabitResponse mapToResponse(Habit habit, boolean completedToday) {
        return HabitResponse.builder()
                .id(habit.getId())
                .name(habit.getName())
                .description(habit.getDescription())
                .streakDays(habit.getStreakDays())
                .lastCompleted(habit.getLastCompleted())
                .completedToday(completedToday)
                .build();
    }
}
