package com.lifeos.repository;

import com.lifeos.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository interface for Budget operations.
 */
@Repository
public interface BudgetRepository extends JpaRepository<Budget, UUID> {
    List<Budget> findAllByUserId(UUID userId);
    List<Budget> findAllByUserIdAndMonthAndYear(UUID userId, int month, int year);
    Optional<Budget> findByUserIdAndCategoryAndMonthAndYear(UUID userId, String category, int month, int year);
    Optional<Budget> findByIdAndUserId(UUID id, UUID userId);
}
