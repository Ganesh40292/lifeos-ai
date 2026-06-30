package com.lifeos.repository;

import com.lifeos.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository interface for Subject operations.
 */
@Repository
public interface SubjectRepository extends JpaRepository<Subject, UUID> {
    List<Subject> findAllByUserId(UUID userId);
    Optional<Subject> findByIdAndUserId(UUID id, UUID userId);
}
