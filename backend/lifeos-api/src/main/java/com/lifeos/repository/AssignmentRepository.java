package com.lifeos.repository;

import com.lifeos.entity.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository interface for Assignment operations.
 */
@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, UUID> {
    List<Assignment> findAllByUserId(UUID userId);
    Optional<Assignment> findByIdAndUserId(UUID id, UUID userId);
}
