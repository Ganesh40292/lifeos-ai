package com.lifeos.service;

import com.lifeos.dto.request.JobApplicationRequest;
import com.lifeos.dto.response.JobApplicationResponse;
import com.lifeos.entity.JobApplication;
import com.lifeos.entity.User;
import com.lifeos.repository.JobApplicationRepository;
import com.lifeos.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobApplicationService {

    private final JobApplicationRepository jobApplicationRepository;
    private final UserRepository userRepository;

    public List<JobApplicationResponse> getJobApplications(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return jobApplicationRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public JobApplicationResponse createJobApplication(String userEmail, JobApplicationRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        JobApplication jobApplication = JobApplication.builder()
                .user(user)
                .company(request.getCompany())
                .position(request.getPosition())
                .status(request.getStatus())
                .dateApplied(request.getDateApplied())
                .url(request.getUrl())
                .salaryRange(request.getSalaryRange())
                .notes(request.getNotes())
                .build();

        JobApplication saved = jobApplicationRepository.save(jobApplication);
        return mapToResponse(saved);
    }

    public JobApplicationResponse updateJobApplication(UUID id, JobApplicationRequest request, String userEmail) {
        JobApplication jobApplication = jobApplicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job application not found"));

        if (!jobApplication.getUser().getEmail().equals(userEmail)) {
            throw new RuntimeException("Unauthorized");
        }

        jobApplication.setCompany(request.getCompany());
        jobApplication.setPosition(request.getPosition());
        jobApplication.setStatus(request.getStatus());
        jobApplication.setDateApplied(request.getDateApplied());
        jobApplication.setUrl(request.getUrl());
        jobApplication.setSalaryRange(request.getSalaryRange());
        jobApplication.setNotes(request.getNotes());

        JobApplication updated = jobApplicationRepository.save(jobApplication);
        return mapToResponse(updated);
    }

    public void deleteJobApplication(UUID id, String userEmail) {
        JobApplication jobApplication = jobApplicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job application not found"));

        if (!jobApplication.getUser().getEmail().equals(userEmail)) {
            throw new RuntimeException("Unauthorized");
        }

        jobApplicationRepository.delete(jobApplication);
    }

    private JobApplicationResponse mapToResponse(JobApplication jobApplication) {
        return JobApplicationResponse.builder()
                .id(jobApplication.getId())
                .company(jobApplication.getCompany())
                .position(jobApplication.getPosition())
                .status(jobApplication.getStatus())
                .dateApplied(jobApplication.getDateApplied())
                .url(jobApplication.getUrl())
                .salaryRange(jobApplication.getSalaryRange())
                .notes(jobApplication.getNotes())
                .createdAt(jobApplication.getCreatedAt())
                .updatedAt(jobApplication.getUpdatedAt())
                .build();
    }
}
