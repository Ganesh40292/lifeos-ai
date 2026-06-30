package com.lifeos.service;

import com.lifeos.dto.request.FocusSessionRequest;
import com.lifeos.dto.response.FocusSessionResponse;
import com.lifeos.entity.FocusSession;
import com.lifeos.entity.User;
import com.lifeos.repository.FocusSessionRepository;
import com.lifeos.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FocusSessionService {

    private final FocusSessionRepository focusSessionRepository;
    private final UserRepository userRepository;
    private final GamificationService gamificationService;

    @Transactional(readOnly = true)
    public List<FocusSessionResponse> getFocusSessions(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return focusSessionRepository.findAllByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public FocusSessionResponse createFocusSession(String email, FocusSessionRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        FocusSession session = FocusSession.builder()
                .userId(user.getId())
                .durationMinutes(request.getDurationMinutes())
                .completed(request.isCompleted())
                .date(LocalDate.now())
                .build();

        FocusSession saved = focusSessionRepository.save(session);
        if (request.isCompleted()) {
            gamificationService.awardXp(user.getId(), GamificationService.ActivityType.FOCUS_SESSION);
        }
        return mapToResponse(saved);
    }

    private FocusSessionResponse mapToResponse(FocusSession session) {
        return FocusSessionResponse.builder()
                .id(session.getId())
                .durationMinutes(session.getDurationMinutes())
                .date(session.getDate())
                .completed(session.isCompleted())
                .createdAt(session.getCreatedAt())
                .build();
    }
}
