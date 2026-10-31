package com.placement.management.service;

import com.placement.management.dto.request.StudentProfileUpdateRequest;
import com.placement.management.dto.response.*;
import com.placement.management.entity.Resume;
import com.placement.management.enums.OfferStatus;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface StudentService {
    StudentResponseDto getProfile(Long userId);
    StudentResponseDto updateProfile(Long userId, StudentProfileUpdateRequest request);
    
    Resume uploadResume(Long userId, MultipartFile file);
    Resource downloadResume(Long userId);
    Resource downloadResumeByStudentId(Long studentId);

    List<JobDriveResponseDto> getAvailableDrives(Long userId, String search);
    JobDriveResponseDto getDriveDetails(Long userId, Long driveId);
    EligibilityResultDto checkEligibility(Long userId, Long driveId);

    ApplicationResponseDto applyToDrive(Long userId, Long driveId);
    Page<ApplicationResponseDto> getMyApplications(Long userId, Pageable pageable);
    ApplicationResponseDto withdrawApplication(Long userId, Long applicationId);

    List<InterviewResponseDto> getMyInterviews(Long userId);
    List<OfferResponseDto> getMyOffers(Long userId);
    OfferResponseDto respondToOffer(Long userId, Long offerId, OfferStatus status, String remarks);
}
