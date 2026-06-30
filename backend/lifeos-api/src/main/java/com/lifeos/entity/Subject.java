package com.lifeos.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

/**
 * Subject entity representing a course subject registered by a user.
 */
@Entity
@Table(name = "subjects")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Subject {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 20)
    private String code;

    @Column(name = "attended_classes", nullable = false)
    private int attendedClasses;

    @Column(name = "total_classes", nullable = false)
    private int totalClasses;

    @Column(nullable = false)
    private int credits;

    @Column(length = 5)
    private String grade;

    public double getAttendancePercentage() {
        if (totalClasses == 0) return 100.0;
        return Math.round(((double) attendedClasses / totalClasses) * 1000.0) / 10.0;
    }
}
