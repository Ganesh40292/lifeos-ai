package com.lifeos.service;

import com.lifeos.dto.request.AssignmentRequest;
import com.lifeos.dto.request.SubjectRequest;
import com.lifeos.dto.request.TimetableRequest;
import com.lifeos.dto.response.AssignmentResponse;
import com.lifeos.dto.response.SubjectResponse;
import com.lifeos.dto.response.TimetableResponse;
import com.lifeos.entity.Assignment;
import com.lifeos.entity.Subject;
import com.lifeos.entity.TimetableEntry;
import com.lifeos.entity.FocusSession;
import com.lifeos.exception.ResourceNotFoundException;
import com.lifeos.dto.response.StudentAnalyticsResponse;
import java.time.LocalDate;
import com.lifeos.dto.response.StudyScheduleResponse;
import com.lifeos.repository.AssignmentRepository;
import com.lifeos.repository.SubjectRepository;
import com.lifeos.repository.TimetableEntryRepository;
import com.lifeos.repository.FocusSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.ArrayList;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Service orchestrating Student module business logic.
 */
@Service
@RequiredArgsConstructor
public class StudentService {

    private final SubjectRepository subjectRepository;
    private final AssignmentRepository assignmentRepository;
    private final TimetableEntryRepository timetableEntryRepository;
    private final FocusSessionRepository focusSessionRepository;
    private final GamificationService gamificationService;

    // --- Subject Core Services ---

    @Transactional(readOnly = true)
    public List<SubjectResponse> getSubjects(UUID userId) {
        return subjectRepository.findAllByUserId(userId).stream()
                .map(this::mapToSubjectResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public SubjectResponse addSubject(UUID userId, SubjectRequest request) {
        Subject subject = Subject.builder()
                .userId(userId)
                .name(request.getName())
                .code(request.getCode())
                .attendedClasses(0)
                .totalClasses(0)
                .credits(request.getCredits())
                .build();
        return mapToSubjectResponse(subjectRepository.save(subject));
    }

    @Transactional
    public void deleteSubject(UUID userId, UUID subjectId) {
        Subject subject = subjectRepository.findByIdAndUserId(subjectId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found"));
        subjectRepository.delete(subject);
    }

    @Transactional
    public SubjectResponse updateAttendance(UUID userId, UUID subjectId, boolean attended) {
        Subject subject = subjectRepository.findByIdAndUserId(subjectId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found"));
        
        subject.setTotalClasses(subject.getTotalClasses() + 1);
        if (attended) {
            subject.setAttendedClasses(subject.getAttendedClasses() + 1);
        }
        
        return mapToSubjectResponse(subjectRepository.save(subject));
    }

    // --- Assignment Services ---

    @Transactional(readOnly = true)
    public List<AssignmentResponse> getAssignments(UUID userId) {
        List<Assignment> assignments = assignmentRepository.findAllByUserId(userId);
        List<Subject> subjects = subjectRepository.findAllByUserId(userId);
        Map<UUID, Subject> subjectMap = subjects.stream()
                .collect(Collectors.toMap(Subject::getId, Function.identity()));

        return assignments.stream()
                .map(a -> mapToAssignmentResponse(a, subjectMap.get(a.getSubjectId())))
                .collect(Collectors.toList());
    }

    @Transactional
    public AssignmentResponse addAssignment(UUID userId, AssignmentRequest request) {
        // Verify subject ownership
        Subject subject = subjectRepository.findByIdAndUserId(request.getSubjectId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found or access denied"));

        Assignment assignment = Assignment.builder()
                .userId(userId)
                .subjectId(request.getSubjectId())
                .title(request.getTitle())
                .dueDate(request.getDueDate())
                .status(request.getStatus())
                .priority(request.getPriority())
                .build();

        return mapToAssignmentResponse(assignmentRepository.save(assignment), subject);
    }

    @Transactional
    public AssignmentResponse updateAssignmentStatus(UUID userId, UUID assignmentId, String status) {
        Assignment assignment = assignmentRepository.findByIdAndUserId(assignmentId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));
        
        boolean wasDone = "DONE".equalsIgnoreCase(assignment.getStatus()) || "SUBMITTED".equalsIgnoreCase(assignment.getStatus());
        assignment.setStatus(status);
        boolean isDone = "DONE".equalsIgnoreCase(status) || "SUBMITTED".equalsIgnoreCase(status);
        
        Subject subject = subjectRepository.findByIdAndUserId(assignment.getSubjectId(), userId).orElse(null);
        Assignment saved = assignmentRepository.save(assignment);
        
        if (isDone && !wasDone) {
            gamificationService.awardXp(userId, GamificationService.ActivityType.COMPLETE_ASSIGNMENT);
        }
        
        return mapToAssignmentResponse(saved, subject);
    }

    // --- Timetable Entry Services ---

    @Transactional(readOnly = true)
    public List<TimetableResponse> getTimetable(UUID userId) {
        List<TimetableEntry> entries = timetableEntryRepository.findAllByUserId(userId);
        List<Subject> subjects = subjectRepository.findAllByUserId(userId);
        Map<UUID, Subject> subjectMap = subjects.stream()
                .collect(Collectors.toMap(Subject::getId, Function.identity()));

        return entries.stream()
                .map(e -> mapToTimetableResponse(e, subjectMap.get(e.getSubjectId())))
                .collect(Collectors.toList());
    }

    @Transactional
    public TimetableResponse addTimetableEntry(UUID userId, TimetableRequest request) {
        // Verify subject ownership
        Subject subject = subjectRepository.findByIdAndUserId(request.getSubjectId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found or access denied"));

        TimetableEntry entry = TimetableEntry.builder()
                .userId(userId)
                .subjectId(request.getSubjectId())
                .dayOfWeek(request.getDayOfWeek())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .room(request.getRoom())
                .build();

        return mapToTimetableResponse(timetableEntryRepository.save(entry), subject);
    }

    // --- Mapping Helpers ---

    private SubjectResponse mapToSubjectResponse(Subject subject) {
        return SubjectResponse.builder()
                .id(subject.getId())
                .name(subject.getName())
                .code(subject.getCode())
                .attendedClasses(subject.getAttendedClasses())
                .totalClasses(subject.getTotalClasses())
                .credits(subject.getCredits())
                .grade(subject.getGrade())
                .attendancePercentage(subject.getAttendancePercentage())
                .build();
    }

    private AssignmentResponse mapToAssignmentResponse(Assignment assignment, Subject subject) {
        return AssignmentResponse.builder()
                .id(assignment.getId())
                .title(assignment.getTitle())
                .dueDate(assignment.getDueDate())
                .status(assignment.getStatus())
                .priority(assignment.getPriority())
                .subjectId(assignment.getSubjectId())
                .subjectName(subject != null ? subject.getName() : "Unknown")
                .subjectCode(subject != null ? subject.getCode() : "N/A")
                .build();
    }

    private TimetableResponse mapToTimetableResponse(TimetableEntry entry, Subject subject) {
        return TimetableResponse.builder()
                .id(entry.getId())
                .dayOfWeek(entry.getDayOfWeek())
                .startTime(entry.getStartTime())
                .endTime(entry.getEndTime())
                .room(entry.getRoom())
                .subjectId(entry.getSubjectId())
                .subjectName(subject != null ? subject.getName() : "Unknown")
                .subjectCode(subject != null ? subject.getCode() : "N/A")
                .build();
    }

    @Transactional(readOnly = true)
    public StudentAnalyticsResponse getAnalytics(UUID userId) {
        List<Subject> subjects = subjectRepository.findAllByUserId(userId);
        List<Assignment> assignments = assignmentRepository.findAllByUserId(userId);
        List<FocusSession> focusSessions = focusSessionRepository.findAllByUserIdOrderByCreatedAtDesc(userId);

        // 1. GPA Calculation
        double totalWeightedGrade = 0.0;
        int totalCreditsWithGrades = 0;
        int totalCredits = 0;

        for (Subject subject : subjects) {
            totalCredits += subject.getCredits();
            if (subject.getGrade() != null && !subject.getGrade().trim().isEmpty()) {
                double val = parseGrade(subject.getGrade());
                if (val >= 0) {
                    totalWeightedGrade += val * subject.getCredits();
                    totalCreditsWithGrades += subject.getCredits();
                }
            }
        }

        double cgpa = totalCreditsWithGrades > 0 ? (totalWeightedGrade / totalCreditsWithGrades) : 0.0;
        cgpa = Math.round(cgpa * 100.0) / 100.0;

        // 2. Attendance Rates & Alerts
        int totalAttended = 0;
        int totalClasses = 0;
        List<StudentAnalyticsResponse.LowAttendanceAlert> alerts = new ArrayList<>();

        for (Subject subject : subjects) {
            totalAttended += subject.getAttendedClasses();
            totalClasses += subject.getTotalClasses();
            
            double pct = subject.getAttendancePercentage();
            if (pct < 75.0 && subject.getTotalClasses() > 0) {
                alerts.add(new StudentAnalyticsResponse.LowAttendanceAlert(
                    subject.getId(),
                    subject.getName(),
                    subject.getCode(),
                    pct,
                    subject.getAttendedClasses(),
                    subject.getTotalClasses()
                ));
            }
        }

        double overallAttendance = totalClasses > 0 ? ((double) totalAttended / totalClasses * 100.0) : 100.0;
        overallAttendance = Math.round(overallAttendance * 10.0) / 10.0;

        // 3. Assignment Completion Rate
        long completedAssignments = assignments.stream()
                .filter(a -> "DONE".equalsIgnoreCase(a.getStatus()) || "SUBMITTED".equalsIgnoreCase(a.getStatus()))
                .count();
        double completionRate = assignments.isEmpty() ? 100.0 : ((double) completedAssignments / assignments.size() * 100.0);
        completionRate = Math.round(completionRate * 10.0) / 10.0;

        // 4. Study Hours (minutes)
        int studyMinutes = focusSessions.stream()
                .filter(FocusSession::isCompleted)
                .mapToInt(FocusSession::getDurationMinutes)
                .sum();

        return StudentAnalyticsResponse.builder()
                .cgpa(cgpa)
                .overallAttendance(overallAttendance)
                .assignmentCompletionRate(completionRate)
                .totalCredits(totalCredits)
                .studyMinutes(studyMinutes)
                .lowAttendanceAlerts(alerts)
                .build();
    }

    private double parseGrade(String gradeStr) {
        String clean = gradeStr.trim().toUpperCase();
        switch (clean) {
            case "A+":
            case "A":   return 4.0;
            case "A-":  return 3.7;
            case "B+":  return 3.3;
            case "B":   return 3.0;
            case "B-":  return 2.7;
            case "C+":  return 2.3;
            case "C":   return 2.0;
            case "C-":  return 1.7;
            case "D+":  return 1.3;
            case "D":   return 1.0;
            case "F":   return 0.0;
            default:
                try {
                    double val = Double.parseDouble(clean);
                    if (val > 4.0) {
                        return val / 2.5; // normalize 10-scale to 4.0 GPA scale
                    }
                    return val;
                } catch (NumberFormatException e) {
                    return -1.0;
                }
        }
    }

    @Transactional(readOnly = true)
    public List<StudyScheduleResponse> getStudySchedule(UUID userId) {
        LocalDate today = LocalDate.now();
        List<Assignment> activeAssignments = assignmentRepository.findAllByUserId(userId).stream()
                .filter(a -> !"DONE".equalsIgnoreCase(a.getStatus()) && !"SUBMITTED".equalsIgnoreCase(a.getStatus()))
                .filter(a -> a.getDueDate() != null && a.getDueDate().isAfter(today))
                .collect(Collectors.toList());

        List<StudyScheduleResponse> schedule = new ArrayList<>();

        // Generate schedule for the next 7 days (from tomorrow to next 7 days)
        for (int i = 1; i <= 7; i++) {
            LocalDate date = today.plusDays(i);
            List<StudyScheduleResponse.StudyBlock> blocksForDay = new ArrayList<>();

            for (Assignment assignment : activeAssignments) {
                LocalDate dueDate = assignment.getDueDate();
                // We suggest studying from tomorrow up to the day before the due date
                if (!date.isAfter(dueDate.minusDays(1))) {
                    long totalDaysWindow = java.time.temporal.ChronoUnit.DAYS.between(today, dueDate);
                    if (totalDaysWindow > 0) {
                        String name = assignment.getTitle();
                        String lower = name.toLowerCase();
                        int duration = 60; // default 60 mins
                        
                        // Higher weight task detection
                        if (lower.contains("exam") || lower.contains("test") || lower.contains("project") || 
                            lower.contains("midterm") || lower.contains("final")) {
                            duration = 120; // 2 hours
                        }

                        long daysLeft = java.time.temporal.ChronoUnit.DAYS.between(date, dueDate);
                        String msg = "Due in " + daysLeft + " " + (daysLeft == 1 ? "day" : "days");

                        blocksForDay.add(StudyScheduleResponse.StudyBlock.builder()
                                .assignmentName(name)
                                .durationMinutes(duration)
                                .message(msg)
                                .build());
                    }
                }
            }

            if (!blocksForDay.isEmpty()) {
                schedule.add(StudyScheduleResponse.builder()
                        .date(date)
                        .blocks(blocksForDay)
                        .build());
            }
        }

        return schedule;
    }
}
