package com.lifeos.repository;

import com.lifeos.entity.Habit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface HabitRepository extends JpaRepository<Habit, UUID> {
    List<Habit> findAllByUserIdOrderByCreatedAtDesc(UUID userId);
    Optional<Habit> findByIdAndUserId(UUID id, UUID userId);
}
