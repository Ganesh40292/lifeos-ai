package com.lifeos.service;

import com.lifeos.entity.User;
import com.lifeos.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GamificationService {

    private final UserRepository userRepository;
    @Lazy
    private final NotificationService notificationService;

    public enum ActivityType {
        ADD_NOTE(10),
        ADD_TRANSACTION(10),
        COMPLETE_ASSIGNMENT(25),
        LOG_WORKOUT(20),
        FOCUS_SESSION(30),
        COMPLETE_HABIT(10),
        STUDY_QUIZ(30);

        private final int xp;

        ActivityType(int xp) {
            this.xp = xp;
        }

        public int getXp() {
            return this.xp;
        }
    }

    /**
     * Award XP to user and update daily activity streaks.
     * Fires level-up and streak notifications when milestones are reached.
     */
    @Transactional
    public User awardXp(UUID userId, ActivityType activity) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        int currentXp = user.getXp() + activity.getXp();
        int currentLevel = user.getLevel();
        boolean leveledUp = false;

        // Level Up logic: level * 100 XP per level
        int xpNeeded = getXpNeededForNextLevel(currentLevel);
        while (currentXp >= xpNeeded) {
            currentXp -= xpNeeded;
            currentLevel++;
            xpNeeded = getXpNeededForNextLevel(currentLevel);
            leveledUp = true;
        }

        user.setXp(currentXp);
        user.setLevel(currentLevel);

        // Streak calculation
        LocalDate today = LocalDate.now();
        LocalDate lastActive = user.getLastActiveDate();
        boolean newStreakMilestone = false;

        if (lastActive == null) {
            user.setStreakDays(1);
        } else if (lastActive.equals(today.minusDays(1))) {
            int newStreak = user.getStreakDays() + 1;
            user.setStreakDays(newStreak);
            // Celebrate streak milestones: 3, 7, 14, 30, 60, 100 days
            if (newStreak == 3 || newStreak == 7 || newStreak == 14 ||
                newStreak == 30 || newStreak == 60 || newStreak == 100) {
                newStreakMilestone = true;
            }
        } else if (!lastActive.equals(today)) {
            user.setStreakDays(1);
        }

        user.setLastActiveDate(today);
        User saved = userRepository.save(user);

        // Send notifications after save (non-blocking, best-effort)
        if (leveledUp) {
            try { notificationService.notifyLevelUp(userId, currentLevel); } catch (Exception ignored) {}
        }
        if (newStreakMilestone) {
            try { notificationService.notifyStreak(userId, saved.getStreakDays()); } catch (Exception ignored) {}
        }

        return saved;
    }

    public int getXpNeededForNextLevel(int currentLevel) {
        return currentLevel * 100;
    }
}
