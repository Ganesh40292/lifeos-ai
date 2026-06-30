package com.lifeos.controller;

import com.lifeos.dto.request.AssignmentRequest;
import com.lifeos.dto.request.SubjectRequest;
import com.lifeos.dto.request.TimetableRequest;
import com.lifeos.dto.response.ApiResponse;
import com.lifeos.dto.response.AssignmentResponse;
import com.lifeos.dto.response.SubjectResponse;
import com.lifeos.dto.response.TimetableResponse;
import com.lifeos.dto.response.UserResponse;
import com.lifeos.dto.response.StudentAnalyticsResponse;
import com.lifeos.dto.response.StudyScheduleResponse;
import com.lifeos.service.StudentService;
import com.lifeos.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST controller for Student Module endpoints.
 */
@RestController
@RequestMapping("/api/student")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;
    private final UserService userService;

    private UUID getUserId(Authentication authentication) {
        UserResponse user = userService.getUserByEmail(authentication.getName());
        return user.getId();
    }

    // --- Subject Endpoints ---

    @GetMapping("/subjects")
    public ResponseEntity<ApiResponse<List<SubjectResponse>>> getSubjects(Authentication authentication) {
        List<SubjectResponse> responses = studentService.getSubjects(getUserId(authentication));
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @PostMapping("/subjects")
    public ResponseEntity<ApiResponse<SubjectResponse>> addSubject(
            Authentication authentication,
            @Valid @RequestBody SubjectRequest request) {
        SubjectResponse response = studentService.addSubject(getUserId(authentication), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    @DeleteMapping("/subjects/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSubject(
        Authentication authentication,
        @PathVariable UUID id) {
        studentService.deleteSubject(getUserId(authentication), id);
        return ResponseEntity.ok(ApiResponse.success("Subject deleted successfully", null));
    }

    @PatchMapping("/subjects/{id}/attendance")
    public ResponseEntity<ApiResponse<SubjectResponse>> updateAttendance(
            Authentication authentication,
            @PathVariable UUID id,
            @RequestParam boolean attended) {
        SubjectResponse response = studentService.updateAttendance(getUserId(authentication), id, attended);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // --- Assignment Endpoints ---

    @GetMapping("/assignments")
    public ResponseEntity<ApiResponse<List<AssignmentResponse>>> getAssignments(Authentication authentication) {
        List<AssignmentResponse> responses = studentService.getAssignments(getUserId(authentication));
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @PostMapping("/assignments")
    public ResponseEntity<ApiResponse<AssignmentResponse>> addAssignment(
            Authentication authentication,
            @Valid @RequestBody AssignmentRequest request) {
        AssignmentResponse response = studentService.addAssignment(getUserId(authentication), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    @PatchMapping("/assignments/{id}/status")
    public ResponseEntity<ApiResponse<AssignmentResponse>> updateAssignmentStatus(
            Authentication authentication,
            @PathVariable UUID id,
            @RequestParam String status) {
        AssignmentResponse response = studentService.updateAssignmentStatus(getUserId(authentication), id, status);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // --- Timetable Endpoints ---

    @GetMapping("/timetable")
    public ResponseEntity<ApiResponse<List<TimetableResponse>>> getTimetable(Authentication authentication) {
        List<TimetableResponse> responses = studentService.getTimetable(getUserId(authentication));
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @PostMapping("/timetable")
    public ResponseEntity<ApiResponse<TimetableResponse>> addTimetableEntry(
            Authentication authentication,
            @Valid @RequestBody TimetableRequest request) {
        TimetableResponse response = studentService.addTimetableEntry(getUserId(authentication), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    @GetMapping("/analytics")
    public ResponseEntity<ApiResponse<StudentAnalyticsResponse>> getAnalytics(Authentication authentication) {
        StudentAnalyticsResponse response = studentService.getAnalytics(getUserId(authentication));
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/scheduler")
    public ResponseEntity<ApiResponse<List<StudyScheduleResponse>>> getStudySchedule(Authentication authentication) {
        List<StudyScheduleResponse> response = studentService.getStudySchedule(getUserId(authentication));
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
