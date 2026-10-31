package com.placement.management.service;

import com.placement.management.dto.request.CompanyProfileUpdateRequest;
import com.placement.management.dto.request.CompanyRegisterRequest;
import com.placement.management.dto.request.JobDriveRequest;
import com.placement.management.dto.request.PlacementPolicyRequest;
import com.placement.management.dto.response.*;
import com.placement.management.entity.PlacementPolicy;
import com.placement.management.enums.ApplicationStatus;
import com.placement.management.enums.DriveStatus;
import com.placement.management.enums.PlacementStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AdminService {
    AdminDashboardDto getDashboardOverview();
    AnalyticsDto getAnalytics();

    Page<StudentResponseDto> getAllStudents(
            String search,
            String department,
            Integer graduationYear,
            PlacementStatus placementStatus,
            Pageable pageable
    );
    StudentResponseDto getStudentById(Long id);
    StudentResponseDto toggleStudentStatus(Long id, boolean active);

    Page<CompanyResponseDto> getAllCompanies(String search, Pageable pageable);
    CompanyResponseDto getCompanyById(Long id);
    CompanyResponseDto createCompany(CompanyRegisterRequest request);
    CompanyResponseDto updateCompany(Long id, CompanyProfileUpdateRequest request);
    void deleteCompany(Long id);

    Page<JobDriveResponseDto> getAllDrives(
            Long companyId,
            DriveStatus status,
            String search,
            Pageable pageable
    );
    JobDriveResponseDto getDriveById(Long id);
    JobDriveResponseDto createDrive(JobDriveRequest request);
    JobDriveResponseDto updateDrive(Long id, JobDriveRequest request);
    void deleteDrive(Long id);

    Page<ApplicationResponseDto> getAllApplications(
            Long companyId,
            Long driveId,
            Long studentId,
            ApplicationStatus status,
            String search,
            Pageable pageable
    );

    PlacementPolicy getActivePolicy();
    PlacementPolicy updatePolicy(PlacementPolicyRequest request);
}
