package com.lifeos.repository;

import com.lifeos.entity.HabitLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface HabitLogRepository extends JpaRepository<HabitLog, UUID> {
    List<HabitLog> findAllByHabitId(UUID habitId);
    Optional<HabitLog> findByHabitIdAndDate(UUID habitId, LocalDate date);
    List<HabitLog> findAllByHabitIdAndDateBetween(UUID habitId, LocalDate start, LocalDate end);
}
