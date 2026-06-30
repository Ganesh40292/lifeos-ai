package com.lifeos.repository;

import com.lifeos.entity.HealthMetric;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface HealthMetricRepository extends JpaRepository<HealthMetric, UUID> {
    List<HealthMetric> findByUserIdOrderByDateAsc(UUID userId);
    Optional<HealthMetric> findByUserIdAndDate(UUID userId, LocalDate date);
}
