package com.lifeos.service;

import com.lifeos.dto.response.LifeReportResponse;
import com.lifeos.entity.*;
import com.lifeos.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LifeReportService {

    private final AssignmentRepository assignmentRepository;
    private final TransactionRepository transactionRepository;
    private final WorkoutRepository workoutRepository;
    private final NoteRepository noteRepository;

    @Transactional(readOnly = true)
    public LifeReportResponse generateReport(UUID userId, String period) {
        LocalDate end = LocalDate.now();
        LocalDate start = "MONTH".equalsIgnoreCase(period) ? end.minusDays(30) : end.minusDays(7);

        // 1. Completed Assignments (Tasks)
        List<Assignment> assignments = assignmentRepository.findAllByUserId(userId);
        long completedTasks = assignments.stream()
                .filter(a -> ("DONE".equalsIgnoreCase(a.getStatus()) || "SUBMITTED".equalsIgnoreCase(a.getStatus()))
                        && a.getDueDate() != null && !a.getDueDate().isBefore(start) && !a.getDueDate().isAfter(end))
                .count();

        // 2. Total Expenses
        List<Transaction> transactions = transactionRepository.findAllByUserIdAndDateBetween(userId, start, end);
        double totalExpenses = transactions.stream()
                .filter(t -> "EXPENSE".equalsIgnoreCase(t.getType()))
                .mapToDouble(t -> t.getAmount() != null ? t.getAmount().doubleValue() : 0.0)
                .sum();

        // 3. Workouts Logged
        List<Workout> workouts = workoutRepository.findByUserIdOrderByDateDescCreatedAtDesc(userId);
        long workoutsLogged = workouts.stream()
                .filter(w -> w.getDate() != null && !w.getDate().isBefore(start) && !w.getDate().isAfter(end))
                .count();

        // 4. Notes Created
        List<Note> notes = noteRepository.findAllByUserIdOrderByPinnedDescUpdatedAtDesc(userId);
        long notesCreated = notes.stream()
                .filter(n -> n.getCreatedAt() != null && !n.getCreatedAt().toLocalDate().isBefore(start) && !n.getCreatedAt().toLocalDate().isAfter(end))
                .count();

        // 5. XP Earned approximation based on logged events
        // complete assignment = 15xp, log workout = 20xp, create note = 5xp
        int xpEarned = (int) (completedTasks * 15 + workoutsLogged * 20 + notesCreated * 5);

        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("MMM dd, yyyy");
        String dateRange = start.format(dtf) + " - " + end.format(dtf);

        return LifeReportResponse.builder()
                .period(period.toUpperCase())
                .tasksCompleted(completedTasks)
                .totalExpenses(Math.round(totalExpenses * 100.0) / 100.0)
                .workoutsLogged(workoutsLogged)
                .notesCreated(notesCreated)
                .xpEarned(xpEarned)
                .generatedAt(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")))
                .dateRange(dateRange)
                .build();
    }
}
