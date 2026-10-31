package com.placement.management.controller;

import com.placement.management.dto.request.OfferStatusUpdateRequest;
import com.placement.management.dto.request.StudentProfileUpdateRequest;
import com.placement.management.dto.response.*;
import com.placement.management.entity.Resume;
import com.placement.management.security.UserPrincipal;
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
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/student")
@PreAuthorize("hasRole('STUDENT')")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<StudentResponseDto>> getProfile(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        StudentResponseDto profile = studentService.getProfile(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Student profile", profile));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<StudentResponseDto>> updateProfile(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody StudentProfileUpdateRequest request) {
        StudentResponseDto updated = studentService.updateProfile(userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", updated));
    }

    @PostMapping(value = "/resume", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<String>> uploadResume(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam("file") MultipartFile file) {
        Resume resume = studentService.uploadResume(userPrincipal.getId(), file);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Resume uploaded successfully", resume.getOriginalFileName()));
    }

    @GetMapping("/resume")
    public ResponseEntity<Resource> downloadResume(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        Resource resource = studentService.downloadResume(userPrincipal.getId());
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    @GetMapping("/drives")
    public ResponseEntity<ApiResponse<List<JobDriveResponseDto>>> getAvailableDrives(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(required = false) String search) {
        List<JobDriveResponseDto> drives = studentService.getAvailableDrives(userPrincipal.getId(), search);
        return ResponseEntity.ok(ApiResponse.success("Available job drives", drives));
    }

    @GetMapping("/drives/{id}")
    public ResponseEntity<ApiResponse<JobDriveResponseDto>> getDriveDetails(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        JobDriveResponseDto drive = studentService.getDriveDetails(userPrincipal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Job drive details", drive));
    }

    @GetMapping("/drives/{id}/eligibility")
    public ResponseEntity<ApiResponse<EligibilityResultDto>> checkEligibility(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        EligibilityResultDto result = studentService.checkEligibility(userPrincipal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Eligibility calculation", result));
    }

    @PostMapping("/drives/{id}/apply")
    public ResponseEntity<ApiResponse<ApplicationResponseDto>> applyToDrive(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        ApplicationResponseDto app = studentService.applyToDrive(userPrincipal.getId(), id);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Application submitted successfully", app));
    }

    @GetMapping("/applications")
    public ResponseEntity<ApiResponse<Page<ApplicationResponseDto>>> getMyApplications(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<ApplicationResponseDto> apps = studentService.getMyApplications(
                userPrincipal.getId(),
                PageRequest.of(page, size, Sort.by("createdAt").descending())
        );
        return ResponseEntity.ok(ApiResponse.success("My applications", apps));
    }

    @PostMapping("/applications/{id}/withdraw")
    public ResponseEntity<ApiResponse<ApplicationResponseDto>> withdrawApplication(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        ApplicationResponseDto app = studentService.withdrawApplication(userPrincipal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Application withdrawn successfully", app));
    }

    @GetMapping("/interviews")
    public ResponseEntity<ApiResponse<List<InterviewResponseDto>>> getMyInterviews(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<InterviewResponseDto> interviews = studentService.getMyInterviews(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("My scheduled interviews", interviews));
    }

    @GetMapping("/offers")
    public ResponseEntity<ApiResponse<List<OfferResponseDto>>> getMyOffers(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<OfferResponseDto> offers = studentService.getMyOffers(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("My placement offers", offers));
    }

    @PostMapping("/offers/{id}/respond")
    public ResponseEntity<ApiResponse<OfferResponseDto>> respondToOffer(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id,
            @Valid @RequestBody OfferStatusUpdateRequest request) {
        OfferResponseDto offer = studentService.respondToOffer(
                userPrincipal.getId(), id, request.getStatus(), request.getRemarks()
        );
        return ResponseEntity.ok(ApiResponse.success("Offer response recorded: " + request.getStatus().name(), offer));
    }
}
