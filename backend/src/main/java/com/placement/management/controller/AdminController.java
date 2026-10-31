package com.placement.management.controller;

import com.placement.management.dto.request.CompanyProfileUpdateRequest;
import com.placement.management.dto.request.CompanyRegisterRequest;
import com.placement.management.dto.request.JobDriveRequest;
import com.placement.management.dto.request.PlacementPolicyRequest;
import com.placement.management.dto.response.*;
import com.placement.management.entity.PlacementPolicy;
import com.placement.management.enums.ApplicationStatus;
import com.placement.management.enums.DriveStatus;
import com.placement.management.enums.PlacementStatus;
import com.placement.management.service.AdminService;
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
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final StudentService studentService;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<AdminDashboardDto>> getDashboard() {
        AdminDashboardDto dashboard = adminService.getDashboardOverview();
        return ResponseEntity.ok(ApiResponse.success("Admin dashboard overview", dashboard));
    }

    @GetMapping("/analytics")
    public ResponseEntity<ApiResponse<AnalyticsDto>> getAnalytics() {
        AnalyticsDto analytics = adminService.getAnalytics();
        return ResponseEntity.ok(ApiResponse.success("Placement analytics", analytics));
    }

    // --- Students ---
    @GetMapping("/students")
    public ResponseEntity<ApiResponse<Page<StudentResponseDto>>> getStudents(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) Integer graduationYear,
            @RequestParam(required = false) PlacementStatus placementStatus,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort sort = direction.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Page<StudentResponseDto> students = adminService.getAllStudents(
                search, department, graduationYear, placementStatus, PageRequest.of(page, size, sort)
        );
        return ResponseEntity.ok(ApiResponse.success("Students retrieved", students));
    }

    @GetMapping("/students/{id}")
    public ResponseEntity<ApiResponse<StudentResponseDto>> getStudentById(@PathVariable Long id) {
        StudentResponseDto student = adminService.getStudentById(id);
        return ResponseEntity.ok(ApiResponse.success("Student details", student));
    }

    @GetMapping("/students/{id}/resume")
    public ResponseEntity<Resource> downloadStudentResume(@PathVariable Long id) {
        Resource resource = studentService.downloadResumeByStudentId(id);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    @PatchMapping("/students/{id}/status")
    public ResponseEntity<ApiResponse<StudentResponseDto>> toggleStudentStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body) {
        boolean active = body.getOrDefault("active", true);
        StudentResponseDto updated = adminService.toggleStudentStatus(id, active);
        return ResponseEntity.ok(ApiResponse.success("Student status updated", updated));
    }

    // --- Companies ---
    @GetMapping("/companies")
    public ResponseEntity<ApiResponse<Page<CompanyResponseDto>>> getCompanies(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort sort = direction.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Page<CompanyResponseDto> companies = adminService.getAllCompanies(search, PageRequest.of(page, size, sort));
        return ResponseEntity.ok(ApiResponse.success("Companies retrieved", companies));
    }

    @GetMapping("/companies/{id}")
    public ResponseEntity<ApiResponse<CompanyResponseDto>> getCompanyById(@PathVariable Long id) {
        CompanyResponseDto company = adminService.getCompanyById(id);
        return ResponseEntity.ok(ApiResponse.success("Company details", company));
    }

    @PostMapping("/companies")
    public ResponseEntity<ApiResponse<CompanyResponseDto>> createCompany(@Valid @RequestBody CompanyRegisterRequest request) {
        CompanyResponseDto company = adminService.createCompany(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Company created successfully", company));
    }

    @PutMapping("/companies/{id}")
    public ResponseEntity<ApiResponse<CompanyResponseDto>> updateCompany(
            @PathVariable Long id,
            @Valid @RequestBody CompanyProfileUpdateRequest request) {
        CompanyResponseDto updated = adminService.updateCompany(id, request);
        return ResponseEntity.ok(ApiResponse.success("Company updated successfully", updated));
    }

    @DeleteMapping("/companies/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCompany(@PathVariable Long id) {
        adminService.deleteCompany(id);
        return ResponseEntity.ok(ApiResponse.success("Company deactivated successfully", null));
    }

    // --- Placement Drives ---
    @GetMapping("/drives")
    public ResponseEntity<ApiResponse<Page<JobDriveResponseDto>>> getDrives(
            @RequestParam(required = false) Long companyId,
            @RequestParam(required = false) DriveStatus status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort sort = direction.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Page<JobDriveResponseDto> drives = adminService.getAllDrives(
                companyId, status, search, PageRequest.of(page, size, sort)
        );
        return ResponseEntity.ok(ApiResponse.success("Placement drives retrieved", drives));
    }

    @GetMapping("/drives/{id}")
    public ResponseEntity<ApiResponse<JobDriveResponseDto>> getDriveById(@PathVariable Long id) {
        JobDriveResponseDto drive = adminService.getDriveById(id);
        return ResponseEntity.ok(ApiResponse.success("Drive details", drive));
    }

    @PostMapping("/drives")
    public ResponseEntity<ApiResponse<JobDriveResponseDto>> createDrive(@Valid @RequestBody JobDriveRequest request) {
        JobDriveResponseDto drive = adminService.createDrive(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Placement drive created successfully", drive));
    }

    @PutMapping("/drives/{id}")
    public ResponseEntity<ApiResponse<JobDriveResponseDto>> updateDrive(
            @PathVariable Long id,
            @Valid @RequestBody JobDriveRequest request) {
        JobDriveResponseDto updated = adminService.updateDrive(id, request);
        return ResponseEntity.ok(ApiResponse.success("Placement drive updated successfully", updated));
    }

    @DeleteMapping("/drives/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDrive(@PathVariable Long id) {
        adminService.deleteDrive(id);
        return ResponseEntity.ok(ApiResponse.success("Placement drive cancelled successfully", null));
    }

    // --- Applications ---
    @GetMapping("/applications")
    public ResponseEntity<ApiResponse<Page<ApplicationResponseDto>>> getApplications(
            @RequestParam(required = false) Long companyId,
            @RequestParam(required = false) Long driveId,
            @RequestParam(required = false) Long studentId,
            @RequestParam(required = false) ApplicationStatus status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort sort = direction.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Page<ApplicationResponseDto> apps = adminService.getAllApplications(
                companyId, driveId, studentId, status, search, PageRequest.of(page, size, sort)
        );
        return ResponseEntity.ok(ApiResponse.success("Applications retrieved", apps));
    }

    // --- Placement Policy ---
    @GetMapping("/policies")
    public ResponseEntity<ApiResponse<PlacementPolicy>> getPolicy() {
        PlacementPolicy policy = adminService.getActivePolicy();
        return ResponseEntity.ok(ApiResponse.success("Active placement policy", policy));
    }

    @PutMapping("/policies")
    public ResponseEntity<ApiResponse<PlacementPolicy>> updatePolicy(@Valid @RequestBody PlacementPolicyRequest request) {
        PlacementPolicy policy = adminService.updatePolicy(request);
        return ResponseEntity.ok(ApiResponse.success("Placement policy updated successfully", policy));
    }
}
