package com.lifeos.controller;

import com.lifeos.dto.request.JobApplicationRequest;
import com.lifeos.dto.response.JobApplicationResponse;
import com.lifeos.service.JobApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/job-applications")
@RequiredArgsConstructor
public class JobApplicationController {

    private final JobApplicationService jobApplicationService;

    @GetMapping
    public ResponseEntity<List<JobApplicationResponse>> getJobApplications(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(jobApplicationService.getJobApplications(userDetails.getUsername()));
    }

    @PostMapping
    public ResponseEntity<JobApplicationResponse> createJobApplication(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody JobApplicationRequest request) {
        return new ResponseEntity<>(jobApplicationService.createJobApplication(userDetails.getUsername(), request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<JobApplicationResponse> updateJobApplication(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody JobApplicationRequest request) {
        return ResponseEntity.ok(jobApplicationService.updateJobApplication(id, request, userDetails.getUsername()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJobApplication(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        jobApplicationService.deleteJobApplication(id, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
}
