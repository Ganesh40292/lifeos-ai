package com.lifeos.repository;

import com.lifeos.entity.UserSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserSessionRepository extends JpaRepository<UserSession, UUID> {
    List<UserSession> findByUserIdOrderByLastActiveDesc(UUID userId);
    Optional<UserSession> findByTokenHash(String tokenHash);
    void deleteByTokenHash(String tokenHash);
}
