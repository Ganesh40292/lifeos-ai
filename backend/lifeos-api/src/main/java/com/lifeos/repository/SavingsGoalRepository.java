package com.lifeos.repository;

import com.lifeos.entity.SavingsGoal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository interface for SavingsGoal operations.
 */
@Repository
public interface SavingsGoalRepository extends JpaRepository<SavingsGoal, UUID> {
    List<SavingsGoal> findAllByUserId(UUID userId);
    Optional<SavingsGoal> findByIdAndUserId(UUID id, UUID userId);
}
