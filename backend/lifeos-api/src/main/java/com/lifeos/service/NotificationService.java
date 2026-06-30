package com.lifeos.service;

import com.lifeos.dto.response.NotificationResponse;
import com.lifeos.entity.Notification;
import com.lifeos.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service responsible for creating, persisting, and pushing real-time notifications.
 * Notifications are pushed via WebSocket and also stored in the database.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Sends a notification to a user. Persists to DB and pushes via WebSocket.
     */
    @Transactional
    public NotificationResponse sendNotification(UUID userId, String type, String title, String message) {
        Notification notification = Notification.builder()
                .userId(userId)
                .type(type)
                .title(title)
                .message(message)
                .build();

        Notification saved = notificationRepository.save(notification);
        NotificationResponse response = toResponse(saved);

        // Push via WebSocket to user-specific topic
        try {
            messagingTemplate.convertAndSend("/topic/notifications/" + userId, response);
            log.debug("Pushed WebSocket notification to user {}: {}", userId, title);
        } catch (Exception e) {
            log.warn("Could not push WebSocket notification (client may not be connected): {}", e.getMessage());
        }

        return response;
    }

    /**
     * Fetch all notifications for a user (paginated by latest 50).
     */
    @Transactional(readOnly = true)
    public List<NotificationResponse> getNotifications(UUID userId) {
        return notificationRepository.findAllByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .limit(50)
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Fetch unread notification count.
     */
    @Transactional(readOnly = true)
    public long getUnreadCount(UUID userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    /**
     * Mark all notifications as read for a user.
     */
    @Transactional
    public void markAllRead(UUID userId) {
        notificationRepository.markAllReadByUserId(userId);
    }

    // ─── Predefined notification factory methods ────────────────────────────

    public void notifyLevelUp(UUID userId, int newLevel) {
        sendNotification(userId, "LEVEL_UP",
                "🎉 Level Up!",
                "Congratulations! You've reached Level " + newLevel + ". Keep going!");
    }

    public void notifyBudgetAlert(UUID userId, String category, int percent) {
        sendNotification(userId, "BUDGET_ALERT",
                "💸 Budget Alert",
                "You've used " + percent + "% of your " + category + " budget this month.");
    }

    public void notifyStreak(UUID userId, int days) {
        sendNotification(userId, "STREAK",
                "🔥 " + days + "-Day Streak!",
                "You've been active for " + days + " days in a row. Amazing consistency!");
    }

    // ─── Mapper ─────────────────────────────────────────────────────────────

    private NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .type(n.getType())
                .title(n.getTitle())
                .message(n.getMessage())
                .read(n.isRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
