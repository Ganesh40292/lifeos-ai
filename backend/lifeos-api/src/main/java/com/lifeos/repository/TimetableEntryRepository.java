package com.lifeos.repository;

import com.lifeos.entity.TimetableEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository interface for TimetableEntry operations.
 */
@Repository
public interface TimetableEntryRepository extends JpaRepository<TimetableEntry, UUID> {
    List<TimetableEntry> findAllByUserId(UUID userId);
    Optional<TimetableEntry> findByIdAndUserId(UUID id, UUID userId);
}
