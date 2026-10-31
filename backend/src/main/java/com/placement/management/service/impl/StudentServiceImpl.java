package com.placement.management.service.impl;

import com.placement.management.dto.request.StudentProfileUpdateRequest;
import com.placement.management.dto.response.*;
import com.placement.management.entity.*;
import com.placement.management.enums.*;
import com.placement.management.exception.BadRequestException;
import com.placement.management.exception.ConflictException;
import com.placement.management.exception.ResourceNotFoundException;
import com.placement.management.repository.*;
import com.placement.management.service.NotificationService;
import com.placement.management.service.StudentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class StudentServiceImpl implements StudentService {

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final JobDriveRepository jobDriveRepository;
    private final ApplicationRepository applicationRepository;
    private final InterviewRepository interviewRepository;
    private final OfferRepository offerRepository;
    private final ResumeRepository resumeRepository;
    private final PlacementPolicyRepository policyRepository;
    private final NotificationService notificationService;

    private static final String UPLOAD_DIR = "uploads/resumes";

    @Override
    @Transactional(readOnly = true)
    public StudentResponseDto getProfile(Long userId) {
        Student student = getStudentByUserId(userId);
        return mapToStudentDto(student);
    }

    @Override
    @Transactional
    public StudentResponseDto updateProfile(Long userId, StudentProfileUpdateRequest request) {
        Student student = getStudentByUserId(userId);
        User user = student.getUser();

        if (StringUtils.hasText(request.getFullName())) {
            user.setFullName(request.getFullName().trim());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone().trim());
        }
        userRepository.save(user);

        if (StringUtils.hasText(request.getDepartment())) {
            student.setDepartment(request.getDepartment().trim().toUpperCase());
        }
        if (StringUtils.hasText(request.getDegree())) {
            student.setDegree(request.getDegree().trim());
        }
        if (request.getGraduationYear() != null) {
            student.setGraduationYear(request.getGraduationYear());
        }
        if (request.getCgpa() != null) {
            student.setCgpa(request.getCgpa());
        }
        if (request.getBacklogs() != null) {
            student.setBacklogs(request.getBacklogs());
        }
        student.setTechnicalSkills(request.getTechnicalSkills());
        student.setProgrammingLanguages(request.getProgrammingLanguages());
        student.setProjects(request.getProjects());
        student.setCertifications(request.getCertifications());
        student.setLinkedinUrl(request.getLinkedinUrl());
        student.setGithubUrl(request.getGithubUrl());
        student.setPortfolioUrl(request.getPortfolioUrl());

        student = studentRepository.save(student);
        return mapToStudentDto(student);
    }

    @Override
    @Transactional
    public Resume uploadResume(Long userId, MultipartFile file) {
        Student student = getStudentByUserId(userId);

        if (file.isEmpty()) {
            throw new BadRequestException("Uploaded file is empty");
        }
        if (!"application/pdf".equalsIgnoreCase(file.getContentType()) &&
            !file.getOriginalFilename().toLowerCase().endsWith(".pdf")) {
            throw new BadRequestException("Only PDF resumes are supported");
        }
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new BadRequestException("Resume file size must not exceed 5MB");
        }

        try {
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalName = file.getOriginalFilename();
            String storedFileName = "resume_student_" + student.getId() + "_" + System.currentTimeMillis() + ".pdf";
            Path targetLocation = uploadPath.resolve(storedFileName);

            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            Resume resume = resumeRepository.findByStudentId(student.getId()).orElse(null);
            if (resume == null) {
                resume = Resume.builder()
                        .student(student)
                        .fileName(storedFileName)
                        .originalFileName(originalName)
                        .fileType(file.getContentType())
                        .fileSize(file.getSize())
                        .filePath(targetLocation.toString())
                        .build();
            } else {
                // Delete previous file if exists
                try {
                    Files.deleteIfExists(Paths.get(resume.getFilePath()));
                } catch (Exception ignored) {}

                resume.setFileName(storedFileName);
                resume.setOriginalFileName(originalName);
                resume.setFileType(file.getContentType());
                resume.setFileSize(file.getSize());
                resume.setFilePath(targetLocation.toString());
                resume.setUploadedAt(LocalDateTime.now());
            }

            Resume saved = resumeRepository.save(resume);
            student.setResume(saved);
            studentRepository.save(student);

            return saved;
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file: " + ex.getMessage(), ex);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Resource downloadResume(Long userId) {
        Student student = getStudentByUserId(userId);
        return getResumeResource(student.getId());
    }

    @Override
    @Transactional(readOnly = true)
    public Resource downloadResumeByStudentId(Long studentId) {
        return getResumeResource(studentId);
    }

    private Resource getResumeResource(Long studentId) {
        Resume resume = resumeRepository.findByStudentId(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found for student"));
        try {
            Path filePath = Paths.get(resume.getFilePath()).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new ResourceNotFoundException("File not found or unreadable");
            }
        } catch (MalformedURLException ex) {
            throw new ResourceNotFoundException("Invalid file path");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobDriveResponseDto> getAvailableDrives(Long userId, String search) {
        Student student = getStudentByUserId(userId);
        List<JobDrive> drives = jobDriveRepository.findActiveDrives();

        return drives.stream()
                .filter(d -> {
                    if (!StringUtils.hasText(search)) return true;
                    String s = search.toLowerCase();
                    return d.getJobTitle().toLowerCase().contains(s) ||
                           d.getCompany().getCompanyName().toLowerCase().contains(s) ||
                           d.getJobLocation().toLowerCase().contains(s) ||
                           d.getRequiredSkills().toLowerCase().contains(s);
                })
                .map(drive -> mapToDriveDto(drive, student))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public JobDriveResponseDto getDriveDetails(Long userId, Long driveId) {
        Student student = getStudentByUserId(userId);
        JobDrive drive = jobDriveRepository.findById(driveId)
                .orElseThrow(() -> new ResourceNotFoundException("Job drive not found: " + driveId));
        return mapToDriveDto(drive, student);
    }

    @Override
    @Transactional(readOnly = true)
    public EligibilityResultDto checkEligibility(Long userId, Long driveId) {
        Student student = getStudentByUserId(userId);
        JobDrive drive = jobDriveRepository.findById(driveId)
                .orElseThrow(() -> new ResourceNotFoundException("Job drive not found: " + driveId));

        return evaluateEligibility(student, drive);
    }

    private EligibilityResultDto evaluateEligibility(Student student, JobDrive drive) {
        List<String> reasons = new ArrayList<>();
        boolean isEligible = true;

        // 1. Drive status check
        if (drive.getStatus() != DriveStatus.OPEN) {
            reasons.add("Drive is currently " + drive.getStatus().name() + " and not accepting applications.");
            isEligible = false;
        }

        // 2. Deadline check
        if (LocalDate.now().isAfter(drive.getApplicationDeadline())) {
            reasons.add("Application deadline passed on " + drive.getApplicationDeadline() + ".");
            isEligible = false;
        }

        // 3. Department check
        String allowedDepts = drive.getEligibleDepartments() != null ? drive.getEligibleDepartments().toUpperCase() : "";
        String studentDept = student.getDepartment() != null ? student.getDepartment().toUpperCase() : "";
        if (!allowedDepts.contains("ALL") && !Arrays.asList(allowedDepts.split("[,\\s]+")).contains(studentDept)) {
            reasons.add("Your department (" + studentDept + ") is not eligible. Required: " + allowedDepts);
            isEligible = false;
        }

        // 4. CGPA check
        if (student.getCgpa() == null || student.getCgpa().compareTo(drive.getMinimumCgpa()) < 0) {
            reasons.add(String.format("Minimum CGPA required is %.2f. Your CGPA is %.2f.",
                    drive.getMinimumCgpa(), student.getCgpa() != null ? student.getCgpa() : BigDecimal.ZERO));
            isEligible = false;
        }

        // 5. Backlogs check
        if (student.getBacklogs() != null && student.getBacklogs() > drive.getMaxBacklogs()) {
            reasons.add(String.format("Maximum backlogs allowed is %d. You currently have %d backlogs.",
                    drive.getMaxBacklogs(), student.getBacklogs()));
            isEligible = false;
        }

        // 6. Graduation Year check
        if (student.getGraduationYear() != null && !student.getGraduationYear().equals(drive.getGraduationYear())) {
            reasons.add("Target graduation batch is " + drive.getGraduationYear() + ". Your graduation year is " + student.getGraduationYear() + ".");
            isEligible = false;
        }

        // 7. Policy checks
        PlacementPolicy policy = policyRepository.findFirstByIsActiveTrueOrderByIdDesc().orElse(null);
        boolean hasAcceptedOffer = offerRepository.countByStudentIdAndStatus(student.getId(), OfferStatus.ACCEPTED) > 0;
        boolean isDream = false;

        if (policy != null && hasAcceptedOffer) {
            isDream = drive.getSalaryPackage().compareTo(policy.getDreamCompanyCtcThreshold()) >= 0;
            if (!policy.isAllowApplicationsAfterAcceptance()) {
                if (policy.isAllowDreamCompanyParticipation() && isDream) {
                    // Allowed under Dream Company exception!
                } else {
                    reasons.add("You have already accepted an offer. Placement policy restricts further applications.");
                    isEligible = false;
                }
            }
        }

        return EligibilityResultDto.builder()
                .eligible(isEligible)
                .reasons(reasons)
                .driveId(drive.getId())
                .jobTitle(drive.getJobTitle())
                .companyName(drive.getCompany().getCompanyName())
                .studentCgpa(student.getCgpa())
                .requiredCgpa(drive.getMinimumCgpa())
                .studentBacklogs(student.getBacklogs())
                .maxBacklogsAllowed(drive.getMaxBacklogs())
                .studentDepartment(student.getDepartment())
                .eligibleDepartments(drive.getEligibleDepartments())
                .studentGraduationYear(student.getGraduationYear())
                .driveGraduationYear(drive.getGraduationYear())
                .existingOfferAccepted(hasAcceptedOffer)
                .isDreamCompanyDrive(isDream)
                .build();
    }

    @Override
    @Transactional
    public ApplicationResponseDto applyToDrive(Long userId, Long driveId) {
        Student student = getStudentByUserId(userId);
        JobDrive drive = jobDriveRepository.findById(driveId)
                .orElseThrow(() -> new ResourceNotFoundException("Job drive not found: " + driveId));

        if (applicationRepository.existsByStudentIdAndJobDriveId(student.getId(), drive.getId())) {
            throw new ConflictException("You have already submitted an application for this drive.");
        }

        EligibilityResultDto eligibility = evaluateEligibility(student, drive);
        if (!eligibility.isEligible()) {
            throw new BadRequestException("You are not eligible for this drive: " + String.join(" ", eligibility.getReasons()));
        }

        Application application = Application.builder()
                .student(student)
                .jobDrive(drive)
                .status(ApplicationStatus.APPLIED)
                .build();
        application = applicationRepository.save(application);

        // Notify Student and Company
        notificationService.sendNotification(
                student.getUser(),
                "Application Submitted",
                "Your application for " + drive.getJobTitle() + " at " + drive.getCompany().getCompanyName() + " was submitted successfully.",
                NotificationType.APPLICATION_UPDATE
        );
        notificationService.sendNotification(
                drive.getCompany().getUser(),
                "New Applicant",
                student.getUser().getFullName() + " applied for " + drive.getJobTitle() + ".",
                NotificationType.APPLICATION_UPDATE
        );

        return mapToApplicationDto(application);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ApplicationResponseDto> getMyApplications(Long userId, Pageable pageable) {
        Student student = getStudentByUserId(userId);
        return applicationRepository.findByStudentId(student.getId(), pageable)
                .map(this::mapToApplicationDto);
    }

    @Override
    @Transactional
    public ApplicationResponseDto withdrawApplication(Long userId, Long applicationId) {
        Student student = getStudentByUserId(userId);
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + applicationId));

        if (!application.getStudent().getId().equals(student.getId())) {
            throw new BadRequestException("Unauthorized access to this application.");
        }

        if (application.getStatus() != ApplicationStatus.APPLIED) {
            throw new BadRequestException("Application can only be withdrawn while in 'APPLIED' status.");
        }

        application.setStatus(ApplicationStatus.WITHDRAWN);
        application = applicationRepository.save(application);

        notificationService.sendNotification(
                student.getUser(),
                "Application Withdrawn",
                "You have withdrawn your application for " + application.getJobDrive().getJobTitle() + ".",
                NotificationType.APPLICATION_UPDATE
        );

        return mapToApplicationDto(application);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InterviewResponseDto> getMyInterviews(Long userId) {
        Student student = getStudentByUserId(userId);
        return interviewRepository.findByStudentId(student.getId()).stream()
                .map(this::mapToInterviewDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<OfferResponseDto> getMyOffers(Long userId) {
        Student student = getStudentByUserId(userId);
        return offerRepository.findByStudentId(student.getId()).stream()
                .map(this::mapToOfferDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public OfferResponseDto respondToOffer(Long userId, Long offerId, OfferStatus status, String remarks) {
        Student student = getStudentByUserId(userId);
        Offer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new ResourceNotFoundException("Offer not found: " + offerId));

        if (!offer.getStudent().getId().equals(student.getId())) {
            throw new BadRequestException("Unauthorized access to this offer.");
        }

        if (offer.getStatus() != OfferStatus.PENDING) {
            throw new BadRequestException("Offer has already been " + offer.getStatus().name().toLowerCase() + ".");
        }

        if (status == OfferStatus.ACCEPTED) {
            // Placement policy check: max offers
            PlacementPolicy policy = policyRepository.findFirstByIsActiveTrueOrderByIdDesc().orElse(null);
            int maxOffers = policy != null ? policy.getMaxOffersAllowed() : 1;
            long acceptedOffersCount = offerRepository.countByStudentIdAndStatus(student.getId(), OfferStatus.ACCEPTED);
            if (acceptedOffersCount >= maxOffers) {
                throw new BadRequestException("Cannot accept offer: Placement policy allows a maximum of " + maxOffers + " accepted offer(s).");
            }

            offer.setStatus(OfferStatus.ACCEPTED);
            student.setPlacementStatus(PlacementStatus.PLACED);
            studentRepository.save(student);

            offer.getApplication().setStatus(ApplicationStatus.OFFER_ACCEPTED);
            applicationRepository.save(offer.getApplication());
        } else if (status == OfferStatus.DECLINED) {
            offer.setStatus(OfferStatus.DECLINED);
            offer.getApplication().setStatus(ApplicationStatus.OFFER_DECLINED);
            applicationRepository.save(offer.getApplication());
        } else {
            throw new BadRequestException("Invalid status transition: Must be ACCEPTED or DECLINED.");
        }

        if (StringUtils.hasText(remarks)) {
            offer.setRemarks(remarks);
        }
        offer = offerRepository.save(offer);

        // Notify company
        notificationService.sendNotification(
                offer.getCompany().getUser(),
                "Offer " + status.name(),
                student.getUser().getFullName() + " has " + status.name().toLowerCase() + " the offer for " + offer.getJobDrive().getJobTitle() + ".",
                NotificationType.OFFER_RECEIVED
        );

        return mapToOfferDto(offer);
    }

    private Student getStudentByUserId(Long userId) {
        return studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for user: " + userId));
    }

    private StudentResponseDto mapToStudentDto(Student student) {
        boolean hasResume = student.getResume() != null;
        return StudentResponseDto.builder()
                .id(student.getId())
                .userId(student.getUser().getId())
                .fullName(student.getUser().getFullName())
                .email(student.getUser().getEmail())
                .phone(student.getUser().getPhone())
                .registrationNumber(student.getRegistrationNumber())
                .department(student.getDepartment())
                .degree(student.getDegree())
                .graduationYear(student.getGraduationYear())
                .cgpa(student.getCgpa())
                .backlogs(student.getBacklogs())
                .technicalSkills(student.getTechnicalSkills())
                .programmingLanguages(student.getProgrammingLanguages())
                .projects(student.getProjects())
                .certifications(student.getCertifications())
                .linkedinUrl(student.getLinkedinUrl())
                .githubUrl(student.getGithubUrl())
                .portfolioUrl(student.getPortfolioUrl())
                .placementStatus(student.getPlacementStatus())
                .active(student.isActive())
                .hasResume(hasResume)
                .resumeFileName(hasResume ? student.getResume().getOriginalFileName() : null)
                .createdAt(student.getCreatedAt())
                .updatedAt(student.getUpdatedAt())
                .build();
    }

    private JobDriveResponseDto mapToDriveDto(JobDrive drive, Student student) {
        EligibilityResultDto eligibility = evaluateEligibility(student, drive);
        Optional<Application> existingApp = applicationRepository.findByStudentIdAndJobDriveId(student.getId(), drive.getId());

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
                .isEligible(eligibility.isEligible())
                .eligibilityReason(String.join("; ", eligibility.getReasons()))
                .hasApplied(existingApp.isPresent())
                .myApplicationStatus(existingApp.map(a -> a.getStatus().name()).orElse(null))
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
