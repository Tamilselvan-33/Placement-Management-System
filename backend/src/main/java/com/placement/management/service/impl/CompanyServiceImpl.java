package com.placement.management.service.impl;

import com.placement.management.dto.request.*;
import com.placement.management.dto.response.*;
import com.placement.management.entity.*;
import com.placement.management.enums.*;
import com.placement.management.exception.BadRequestException;
import com.placement.management.exception.ConflictException;
import com.placement.management.exception.ResourceNotFoundException;
import com.placement.management.repository.*;
import com.placement.management.service.CompanyService;
import com.placement.management.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.util.Comparator;

@Service
@RequiredArgsConstructor
@Slf4j
public class CompanyServiceImpl implements CompanyService {

    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final JobDriveRepository jobDriveRepository;
    private final ApplicationRepository applicationRepository;
    private final InterviewRepository interviewRepository;
    private final OfferRepository offerRepository;
    private final NotificationService notificationService;

    @Override
    @Transactional(readOnly = true)
    public CompanyResponseDto getProfile(Long userId) {
        Company company = getCompanyByUserId(userId);
        return mapToCompanyDto(company);
    }

    @Override
    @Transactional
    public CompanyResponseDto updateProfile(Long userId, CompanyProfileUpdateRequest request) {
        Company company = getCompanyByUserId(userId);

        if (StringUtils.hasText(request.getCompanyName())) {
            company.setCompanyName(request.getCompanyName().trim());
            company.getUser().setFullName(request.getCompanyName().trim());
        }
        if (request.getContactPerson() != null) {
            company.setContactPerson(request.getContactPerson().trim());
        }
        if (request.getContactPhone() != null) {
            company.setContactPhone(request.getContactPhone().trim());
            company.getUser().setPhone(request.getContactPhone().trim());
        }
        if (request.getIndustry() != null) company.setIndustry(request.getIndustry());
        if (request.getLocation() != null) company.setLocation(request.getLocation());
        if (request.getWebsite() != null) company.setWebsite(request.getWebsite());
        if (request.getDescription() != null) company.setDescription(request.getDescription());
        if (request.getLogoUrl() != null) company.setLogoUrl(request.getLogoUrl());

        userRepository.save(company.getUser());
        company = companyRepository.save(company);
        return mapToCompanyDto(company);
    }

    @Override
    @Transactional
    public JobDriveResponseDto createJobDrive(Long userId, JobDriveRequest request) {
        Company company = getCompanyByUserId(userId);

        if (request.getApplicationDeadline().isBefore(request.getOpeningDate())) {
            throw new BadRequestException("Application deadline cannot be before opening date");
        }

        JobDrive drive = JobDrive.builder()
                .company(company)
                .jobTitle(request.getJobTitle().trim())
                .jobDescription(request.getJobDescription().trim())
                .requiredSkills(request.getRequiredSkills().trim())
                .eligibleDepartments(request.getEligibleDepartments().trim().toUpperCase())
                .minimumCgpa(request.getMinimumCgpa())
                .maxBacklogs(request.getMaxBacklogs())
                .graduationYear(request.getGraduationYear())
                .salaryPackage(request.getSalaryPackage())
                .jobLocation(request.getJobLocation().trim())
                .employmentType(request.getEmploymentType().trim())
                .openingDate(request.getOpeningDate())
                .applicationDeadline(request.getApplicationDeadline())
                .status(request.getStatus() != null ? request.getStatus() : DriveStatus.OPEN)
                .build();

        drive = jobDriveRepository.save(drive);
        return mapToDriveDto(drive);
    }

    @Override
    @Transactional
    public JobDriveResponseDto updateJobDrive(Long userId, Long driveId, JobDriveRequest request) {
        Company company = getCompanyByUserId(userId);
        JobDrive drive = jobDriveRepository.findById(driveId)
                .orElseThrow(() -> new ResourceNotFoundException("Job drive not found: " + driveId));

        if (!drive.getCompany().getId().equals(company.getId())) {
            throw new BadRequestException("You can only modify your own job drives");
        }

        if (request.getApplicationDeadline() != null && request.getOpeningDate() != null) {
            if (request.getApplicationDeadline().isBefore(request.getOpeningDate())) {
                throw new BadRequestException("Application deadline cannot be before opening date");
            }
            drive.setOpeningDate(request.getOpeningDate());
            drive.setApplicationDeadline(request.getApplicationDeadline());
        }

        if (StringUtils.hasText(request.getJobTitle())) drive.setJobTitle(request.getJobTitle().trim());
        if (StringUtils.hasText(request.getJobDescription())) drive.setJobDescription(request.getJobDescription().trim());
        if (StringUtils.hasText(request.getRequiredSkills())) drive.setRequiredSkills(request.getRequiredSkills().trim());
        if (StringUtils.hasText(request.getEligibleDepartments())) drive.setEligibleDepartments(request.getEligibleDepartments().trim().toUpperCase());
        if (request.getMinimumCgpa() != null) drive.setMinimumCgpa(request.getMinimumCgpa());
        if (request.getMaxBacklogs() != null) drive.setMaxBacklogs(request.getMaxBacklogs());
        if (request.getGraduationYear() != null) drive.setGraduationYear(request.getGraduationYear());
        if (request.getSalaryPackage() != null) drive.setSalaryPackage(request.getSalaryPackage());
        if (StringUtils.hasText(request.getJobLocation())) drive.setJobLocation(request.getJobLocation().trim());
        if (StringUtils.hasText(request.getEmploymentType())) drive.setEmploymentType(request.getEmploymentType().trim());
        if (request.getStatus() != null) drive.setStatus(request.getStatus());

        drive = jobDriveRepository.save(drive);
        return mapToDriveDto(drive);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<JobDriveResponseDto> getCompanyDrives(Long userId, Pageable pageable) {
        Company company = getCompanyByUserId(userId);
        return jobDriveRepository.findByCompanyId(company.getId(), pageable)
                .map(this::mapToDriveDto);
    }

    @Override
    @Transactional(readOnly = true)
    public JobDriveResponseDto getDriveById(Long userId, Long driveId) {
        Company company = getCompanyByUserId(userId);
        JobDrive drive = jobDriveRepository.findById(driveId)
                .orElseThrow(() -> new ResourceNotFoundException("Job drive not found: " + driveId));

        if (!drive.getCompany().getId().equals(company.getId())) {
            throw new BadRequestException("Unauthorized access to job drive");
        }
        return mapToDriveDto(drive);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ApplicationResponseDto> getDriveApplications(
            Long userId,
            Long driveId,
            ApplicationStatus status,
            String search,
            Pageable pageable) {
        Company company = getCompanyByUserId(userId);

        if (driveId != null) {
            JobDrive drive = jobDriveRepository.findById(driveId)
                    .orElseThrow(() -> new ResourceNotFoundException("Job drive not found: " + driveId));
            if (!drive.getCompany().getId().equals(company.getId())) {
                throw new BadRequestException("Unauthorized access to drive applications");
            }
        }

        return applicationRepository.findWithFilters(company.getId(), driveId, null, status, search, pageable)
                .map(this::mapToApplicationDto);
    }

    @Override
    @Transactional
    public ApplicationResponseDto updateApplicationStatus(
            Long userId,
            Long applicationId,
            ApplicationStatusUpdateRequest request) {
        Company company = getCompanyByUserId(userId);
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + applicationId));

        if (!application.getJobDrive().getCompany().getId().equals(company.getId())) {
            throw new BadRequestException("Unauthorized access to application");
        }

        application.setStatus(request.getStatus());
        if (StringUtils.hasText(request.getNotes())) {
            application.setNotes(request.getNotes());
        }
        application = applicationRepository.save(application);

        // Notify Student
        notificationService.sendNotification(
                application.getStudent().getUser(),
                "Application Status Update",
                "Your application for " + application.getJobDrive().getJobTitle() + " at " +
                        company.getCompanyName() + " is now " + request.getStatus().name() + ".",
                NotificationType.APPLICATION_UPDATE
        );

        return mapToApplicationDto(application);
    }

    @Override
    @Transactional
    public InterviewResponseDto scheduleInterview(Long userId, InterviewScheduleRequest request) {
        Company company = getCompanyByUserId(userId);
        Application application = applicationRepository.findById(request.getApplicationId())
                .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + request.getApplicationId()));

        if (!application.getJobDrive().getCompany().getId().equals(company.getId())) {
            throw new BadRequestException("Unauthorized access to schedule interview");
        }

        Interview interview = Interview.builder()
                .application(application)
                .student(application.getStudent())
                .company(company)
                .jobDrive(application.getJobDrive())
                .round(request.getRound())
                .interviewDate(request.getInterviewDate())
                .interviewTime(request.getInterviewTime())
                .mode(request.getMode())
                .venueOrLink(request.getVenueOrLink())
                .interviewerName(request.getInterviewerName())
                .feedback(request.getFeedback())
                .status(InterviewStatus.SCHEDULED)
                .build();

        interview = interviewRepository.save(interview);

        // Update application status to INTERVIEW_SCHEDULED
        application.setStatus(ApplicationStatus.INTERVIEW_SCHEDULED);
        applicationRepository.save(application);

        // Notify Student
        notificationService.sendNotification(
                application.getStudent().getUser(),
                "Interview Scheduled",
                String.format("You have a %s scheduled with %s on %s at %s.",
                        request.getRound().getDisplayName(),
                        company.getCompanyName(),
                        request.getInterviewDate(),
                        request.getInterviewTime()),
                NotificationType.INTERVIEW_SCHEDULED
        );

        return mapToInterviewDto(interview);
    }

    @Override
    @Transactional
    public InterviewResponseDto updateInterview(Long userId, Long interviewId, InterviewUpdateRequest request) {
        Company company = getCompanyByUserId(userId);
        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found: " + interviewId));

        if (!interview.getCompany().getId().equals(company.getId())) {
            throw new BadRequestException("Unauthorized access to interview");
        }

        if (request.getRound() != null) interview.setRound(request.getRound());
        if (request.getInterviewDate() != null) interview.setInterviewDate(request.getInterviewDate());
        if (StringUtils.hasText(request.getInterviewTime())) interview.setInterviewTime(request.getInterviewTime());
        if (request.getMode() != null) interview.setMode(request.getMode());
        if (request.getVenueOrLink() != null) interview.setVenueOrLink(request.getVenueOrLink());
        if (request.getStatus() != null) interview.setStatus(request.getStatus());
        if (request.getFeedback() != null) interview.setFeedback(request.getFeedback());
        if (request.getInterviewerName() != null) interview.setInterviewerName(request.getInterviewerName());

        interview = interviewRepository.save(interview);

        // If completed or rescheduled, notify student
        if (request.getStatus() == InterviewStatus.RESCHEDULED || request.getStatus() == InterviewStatus.CANCELLED) {
            notificationService.sendNotification(
                    interview.getStudent().getUser(),
                    "Interview " + request.getStatus().name(),
                    "Your interview with " + company.getCompanyName() + " has been " + request.getStatus().name().toLowerCase() + ".",
                    NotificationType.INTERVIEW_SCHEDULED
            );
        }

        return mapToInterviewDto(interview);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<InterviewResponseDto> getCompanyInterviews(Long userId, Pageable pageable) {
        Company company = getCompanyByUserId(userId);
        return interviewRepository.findByCompanyId(company.getId(), pageable)
                .map(this::mapToInterviewDto);
    }

    @Override
    @Transactional
    public OfferResponseDto issueOffer(Long userId, OfferCreateRequest request) {
        Company company = getCompanyByUserId(userId);
        Application application = applicationRepository.findById(request.getApplicationId())
                .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + request.getApplicationId()));

        if (!application.getJobDrive().getCompany().getId().equals(company.getId())) {
            throw new BadRequestException("Unauthorized access to application");
        }

        if (offerRepository.findByApplicationId(application.getId()).isPresent()) {
            throw new ConflictException("An offer has already been issued for this application.");
        }

        Offer offer = Offer.builder()
                .student(application.getStudent())
                .company(company)
                .jobDrive(application.getJobDrive())
                .application(application)
                .ctc(request.getCtc())
                .offerDate(request.getOfferDate())
                .joiningDate(request.getJoiningDate())
                .remarks(request.getRemarks())
                .offerLetterUrl(request.getOfferLetterUrl())
                .status(OfferStatus.PENDING)
                .build();

        offer = offerRepository.save(offer);

        // Update application status to OFFERED
        application.setStatus(ApplicationStatus.OFFERED);
        applicationRepository.save(application);

        // Notify Student
        notificationService.sendNotification(
                application.getStudent().getUser(),
                "Congratulations! Job Offer Received",
                String.format("You have received an offer for %s from %s with a package of %.2f LPA!",
                        application.getJobDrive().getJobTitle(),
                        company.getCompanyName(),
                        request.getCtc()),
                NotificationType.OFFER_RECEIVED
        );

        return mapToOfferDto(offer);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OfferResponseDto> getCompanyOffers(Long userId, Pageable pageable) {
        Company company = getCompanyByUserId(userId);
        return offerRepository.findByCompanyId(company.getId(), pageable)
                .map(this::mapToOfferDto);
    }

    private Company getCompanyByUserId(Long userId) {
        return companyRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Company profile not found for user: " + userId));
    }

    private CompanyResponseDto mapToCompanyDto(Company c) {
        return CompanyResponseDto.builder()
                .id(c.getId())
                .userId(c.getUser().getId())
                .companyName(c.getCompanyName())
                .companyEmail(c.getCompanyEmail())
                .description(c.getDescription())
                .website(c.getWebsite())
                .industry(c.getIndustry())
                .location(c.getLocation())
                .contactPerson(c.getContactPerson())
                .contactPhone(c.getContactPhone())
                .logoUrl(c.getLogoUrl())
                .verified(c.isVerified())
                .totalDrivesPosted(jobDriveRepository.findByCompanyId(c.getId()).size())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }

    private JobDriveResponseDto mapToDriveDto(JobDrive drive) {
        return JobDriveResponseDto.builder()
                .id(drive.getId())
                .companyId(drive.getCompany().getId())
                .companyName(drive.getCompany().getCompanyName())
                .companyLogoUrl(drive.getCompany().getLogoUrl())
                .companyWebsite(drive.getCompany().getWebsite())
                .companyLocation(drive.getCompany().getLocation())
                .jobTitle(drive.getJobTitle())
                .jobDescription(drive.getJobDescription())
                .requiredSkills(drive.getRequiredSkills())
                .eligibleDepartments(drive.getEligibleDepartments())
                .minimumCgpa(drive.getMinimumCgpa())
                .maxBacklogs(drive.getMaxBacklogs())
                .graduationYear(drive.getGraduationYear())
                .salaryPackage(drive.getSalaryPackage())
                .jobLocation(drive.getJobLocation())
                .employmentType(drive.getEmploymentType())
                .openingDate(drive.getOpeningDate())
                .applicationDeadline(drive.getApplicationDeadline())
                .status(drive.getStatus())
                .totalApplications(applicationRepository.countByJobDriveId(drive.getId()))
                .createdAt(drive.getCreatedAt())
                .updatedAt(drive.getUpdatedAt())
                .build();
    }

    private ApplicationResponseDto mapToApplicationDto(Application app) {
        Interview latestInterview = interviewRepository.findByApplicationId(app.getId()).stream()
                .max(Comparator.comparing(Interview::getInterviewDate))
                .orElse(null);

        Offer offer = offerRepository.findByApplicationId(app.getId()).orElse(null);

        return ApplicationResponseDto.builder()
                .id(app.getId())
                .studentId(app.getStudent().getId())
                .studentName(app.getStudent().getUser().getFullName())
                .studentEmail(app.getStudent().getUser().getEmail())
                .studentRegNo(app.getStudent().getRegistrationNumber())
                .studentDepartment(app.getStudent().getDepartment())
                .studentCgpa(app.getStudent().getCgpa())
                .studentBacklogs(app.getStudent().getBacklogs())
                .studentHasResume(app.getStudent().getResume() != null)
                .driveId(app.getJobDrive().getId())
                .jobTitle(app.getJobDrive().getJobTitle())
                .companyId(app.getJobDrive().getCompany().getId())
                .companyName(app.getJobDrive().getCompany().getCompanyName())
                .companyLogoUrl(app.getJobDrive().getCompany().getLogoUrl())
                .salaryPackage(app.getJobDrive().getSalaryPackage())
                .jobLocation(app.getJobDrive().getJobLocation())
                .applicationDeadline(app.getJobDrive().getApplicationDeadline())
                .applicationDate(app.getApplicationDate())
                .status(app.getStatus())
                .notes(app.getNotes())
                .latestInterviewId(latestInterview != null ? latestInterview.getId() : null)
                .latestInterviewRound(latestInterview != null ? latestInterview.getRound().getDisplayName() : null)
                .latestInterviewDate(latestInterview != null ? latestInterview.getInterviewDate() : null)
                .latestInterviewTime(latestInterview != null ? latestInterview.getInterviewTime() : null)
                .latestInterviewVenueOrLink(latestInterview != null ? latestInterview.getVenueOrLink() : null)
                .offerId(offer != null ? offer.getId() : null)
                .offerCtc(offer != null ? offer.getCtc() : null)
                .offerStatus(offer != null ? offer.getStatus().name() : null)
                .createdAt(app.getCreatedAt())
                .updatedAt(app.getUpdatedAt())
                .build();
    }

    private InterviewResponseDto mapToInterviewDto(Interview i) {
        return InterviewResponseDto.builder()
                .id(i.getId())
                .applicationId(i.getApplication().getId())
                .studentId(i.getStudent().getId())
                .studentName(i.getStudent().getUser().getFullName())
                .studentRegNo(i.getStudent().getRegistrationNumber())
                .studentEmail(i.getStudent().getUser().getEmail())
                .studentDepartment(i.getStudent().getDepartment())
                .companyId(i.getCompany().getId())
                .companyName(i.getCompany().getCompanyName())
                .driveId(i.getJobDrive().getId())
                .jobTitle(i.getJobDrive().getJobTitle())
                .round(i.getRound())
                .roundDisplayName(i.getRound().getDisplayName())
                .interviewDate(i.getInterviewDate())
                .interviewTime(i.getInterviewTime())
                .mode(i.getMode())
                .venueOrLink(i.getVenueOrLink())
                .status(i.getStatus())
                .feedback(i.getFeedback())
                .interviewerName(i.getInterviewerName())
                .createdAt(i.getCreatedAt())
                .updatedAt(i.getUpdatedAt())
                .build();
    }

    private OfferResponseDto mapToOfferDto(Offer o) {
        return OfferResponseDto.builder()
                .id(o.getId())
                .applicationId(o.getApplication().getId())
                .studentId(o.getStudent().getId())
                .studentName(o.getStudent().getUser().getFullName())
                .studentRegNo(o.getStudent().getRegistrationNumber())
                .studentEmail(o.getStudent().getUser().getEmail())
                .studentDepartment(o.getStudent().getDepartment())
                .companyId(o.getCompany().getId())
                .companyName(o.getCompany().getCompanyName())
                .companyLogoUrl(o.getCompany().getLogoUrl())
                .driveId(o.getJobDrive().getId())
                .jobTitle(o.getJobDrive().getJobTitle())
                .ctc(o.getCtc())
                .offerDate(o.getOfferDate())
                .joiningDate(o.getJoiningDate())
                .status(o.getStatus())
                .remarks(o.getRemarks())
                .offerLetterUrl(o.getOfferLetterUrl())
                .createdAt(o.getCreatedAt())
                .updatedAt(o.getUpdatedAt())
                .build();
    }
}
