package com.lifeos.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalTime;
import java.util.UUID;

/**
 * TimetableEntry entity representing recurring classes on specific days of the week.
 */
@Entity
@Table(name = "timetable_entries")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimetableEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "subject_id", nullable = false)
    private UUID subjectId;

    @Column(name = "day_of_week", nullable = false, length = 15)
    private String dayOfWeek; // MONDAY, TUESDAY ...

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(nullable = false, length = 50)
    private String room;
}
