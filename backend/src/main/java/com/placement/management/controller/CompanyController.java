package com.placement.management.controller;

import com.placement.management.dto.request.*;
import com.placement.management.dto.response.*;
import com.placement.management.enums.ApplicationStatus;
import com.placement.management.security.UserPrincipal;
import com.placement.management.service.CompanyService;
import com.placement.management.service.StudentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/company")
@PreAuthorize("hasRole('COMPANY')")
@RequiredArgsConstructor
public class CompanyController {

    private final CompanyService companyService;
    private final StudentService studentService;

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<CompanyResponseDto>> getProfile(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        CompanyResponseDto profile = companyService.getProfile(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Company profile", profile));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<CompanyResponseDto>> updateProfile(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody CompanyProfileUpdateRequest request) {
        CompanyResponseDto updated = companyService.updateProfile(userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", updated));
    }

    @GetMapping("/drives")
    public ResponseEntity<ApiResponse<Page<JobDriveResponseDto>>> getMyDrives(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<JobDriveResponseDto> drives = companyService.getCompanyDrives(
                userPrincipal.getId(),
                PageRequest.of(page, size, Sort.by("createdAt").descending())
        );
        return ResponseEntity.ok(ApiResponse.success("Company job drives", drives));
    }

    @GetMapping("/drives/{id}")
    public ResponseEntity<ApiResponse<JobDriveResponseDto>> getDriveById(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        JobDriveResponseDto drive = companyService.getDriveById(userPrincipal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Job drive details", drive));
    }

    @PostMapping("/drives")
    public ResponseEntity<ApiResponse<JobDriveResponseDto>> createDrive(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody JobDriveRequest request) {
        JobDriveResponseDto drive = companyService.createJobDrive(userPrincipal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Job drive created successfully", drive));
    }

    @PutMapping("/drives/{id}")
    public ResponseEntity<ApiResponse<JobDriveResponseDto>> updateDrive(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id,
            @Valid @RequestBody JobDriveRequest request) {
        JobDriveResponseDto updated = companyService.updateJobDrive(userPrincipal.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Job drive updated successfully", updated));
    }

    @GetMapping("/drives/{id}/applications")
    public ResponseEntity<ApiResponse<Page<ApplicationResponseDto>>> getDriveApplications(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id,
            @RequestParam(required = false) ApplicationStatus status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<ApplicationResponseDto> applications = companyService.getDriveApplications(
                userPrincipal.getId(), id, status, search,
                PageRequest.of(page, size, Sort.by("createdAt").descending())
        );
        return ResponseEntity.ok(ApiResponse.success("Drive applications", applications));
    }

    @PutMapping("/applications/{id}/status")
    public ResponseEntity<ApiResponse<ApplicationResponseDto>> updateApplicationStatus(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id,
            @Valid @RequestBody ApplicationStatusUpdateRequest request) {
        ApplicationResponseDto updated = companyService.updateApplicationStatus(userPrincipal.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Application status updated", updated));
    }

    @GetMapping("/interviews")
    public ResponseEntity<ApiResponse<Page<InterviewResponseDto>>> getCompanyInterviews(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<InterviewResponseDto> interviews = companyService.getCompanyInterviews(
                userPrincipal.getId(),
                PageRequest.of(page, size, Sort.by("interviewDate").descending())
        );
        return ResponseEntity.ok(ApiResponse.success("Scheduled interviews", interviews));
    }

    @PostMapping("/interviews")
    public ResponseEntity<ApiResponse<InterviewResponseDto>> scheduleInterview(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody InterviewScheduleRequest request) {
        InterviewResponseDto interview = companyService.scheduleInterview(userPrincipal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Interview scheduled successfully", interview));
    }

    @PutMapping("/interviews/{id}")
    public ResponseEntity<ApiResponse<InterviewResponseDto>> updateInterview(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id,
            @Valid @RequestBody InterviewUpdateRequest request) {
        InterviewResponseDto updated = companyService.updateInterview(userPrincipal.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Interview updated successfully", updated));
    }

    @GetMapping("/offers")
    public ResponseEntity<ApiResponse<Page<OfferResponseDto>>> getCompanyOffers(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<OfferResponseDto> offers = companyService.getCompanyOffers(
                userPrincipal.getId(),
                PageRequest.of(page, size, Sort.by("createdAt").descending())
        );
        return ResponseEntity.ok(ApiResponse.success("Issued offers", offers));
    }

    @PostMapping("/offers")
    public ResponseEntity<ApiResponse<OfferResponseDto>> issueOffer(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody OfferCreateRequest request) {
        OfferResponseDto offer = companyService.issueOffer(userPrincipal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Offer issued successfully", offer));
    }

    @GetMapping("/resumes/{studentId}")
    public ResponseEntity<Resource> downloadStudentResume(@PathVariable Long studentId) {
        Resource resource = studentService.downloadResumeByStudentId(studentId);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
}
