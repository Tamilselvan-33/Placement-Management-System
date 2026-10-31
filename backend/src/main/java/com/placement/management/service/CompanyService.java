package com.placement.management.service;

import com.placement.management.dto.request.*;
import com.placement.management.dto.response.*;
import com.placement.management.enums.ApplicationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface CompanyService {
    CompanyResponseDto getProfile(Long userId);
    CompanyResponseDto updateProfile(Long userId, CompanyProfileUpdateRequest request);

    JobDriveResponseDto createJobDrive(Long userId, JobDriveRequest request);
    JobDriveResponseDto updateJobDrive(Long userId, Long driveId, JobDriveRequest request);
    Page<JobDriveResponseDto> getCompanyDrives(Long userId, Pageable pageable);
    JobDriveResponseDto getDriveById(Long userId, Long driveId);

    Page<ApplicationResponseDto> getDriveApplications(
            Long userId,
            Long driveId,
            ApplicationStatus status,
            String search,
            Pageable pageable
    );
    ApplicationResponseDto updateApplicationStatus(
            Long userId,
            Long applicationId,
            ApplicationStatusUpdateRequest request
    );

    InterviewResponseDto scheduleInterview(Long userId, InterviewScheduleRequest request);
    InterviewResponseDto updateInterview(Long userId, Long interviewId, InterviewUpdateRequest request);
    Page<InterviewResponseDto> getCompanyInterviews(Long userId, Pageable pageable);

    OfferResponseDto issueOffer(Long userId, OfferCreateRequest request);
    Page<OfferResponseDto> getCompanyOffers(Long userId, Pageable pageable);
}
