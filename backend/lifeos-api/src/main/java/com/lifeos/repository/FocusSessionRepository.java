package com.lifeos.repository;

import com.lifeos.entity.FocusSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface FocusSessionRepository extends JpaRepository<FocusSession, UUID> {
    List<FocusSession> findAllByUserIdOrderByCreatedAtDesc(UUID userId);
    List<FocusSession> findAllByUserIdAndDateBetween(UUID userId, LocalDate startDate, LocalDate endDate);
}
