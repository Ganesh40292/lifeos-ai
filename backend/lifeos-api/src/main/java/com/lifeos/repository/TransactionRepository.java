package com.lifeos.repository;

import com.lifeos.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository interface for Transaction operations.
 */
@Repository
public interface TransactionRepository extends JpaRepository<Transaction, UUID> {
    List<Transaction> findAllByUserIdOrderByDateDesc(UUID userId);
    List<Transaction> findAllByUserIdAndDateBetween(UUID userId, LocalDate startDate, LocalDate endDate);
    Optional<Transaction> findByIdAndUserId(UUID id, UUID userId);
}
