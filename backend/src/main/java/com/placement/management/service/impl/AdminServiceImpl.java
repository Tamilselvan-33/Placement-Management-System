package com.placement.management.service.impl;

import com.placement.management.dto.request.CompanyProfileUpdateRequest;
import com.placement.management.dto.request.CompanyRegisterRequest;
import com.placement.management.dto.request.JobDriveRequest;
import com.placement.management.dto.request.PlacementPolicyRequest;
import com.placement.management.dto.response.*;
import com.placement.management.entity.*;
import com.placement.management.enums.*;
import com.placement.management.exception.BadRequestException;
import com.placement.management.exception.ConflictException;
import com.placement.management.exception.ResourceNotFoundException;
import com.placement.management.repository.*;
import com.placement.management.service.AdminService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final CompanyRepository companyRepository;
    private final JobDriveRepository jobDriveRepository;
    private final ApplicationRepository applicationRepository;
    private final InterviewRepository interviewRepository;
    private final OfferRepository offerRepository;
    private final PlacementPolicyRepository policyRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public AdminDashboardDto getDashboardOverview() {
        long totalStudents = studentRepository.count();
        long totalCompanies = companyRepository.count();
        long totalDrives = jobDriveRepository.count();
        long totalApplications = applicationRepository.count();
        long placedStudents = studentRepository.countByPlacementStatus(PlacementStatus.PLACED);
        long unplacedStudents = totalStudents - placedStudents;

        double placementPercentage = totalStudents > 0
                ? Math.round(((double) placedStudents / totalStudents * 100.0) * 10.0) / 10.0
                : 0.0;

        BigDecimal highestPackage = offerRepository.findHighestPackage();
        BigDecimal averagePackage = offerRepository.findAveragePackage();
        if (averagePackage != null) {
            averagePackage = averagePackage.setScale(2, RoundingMode.HALF_UP);
        }

        BigDecimal medianPackage = calculateMedianPackage();

        // Recent activities
        List<Map<String, Object>> activities = new ArrayList<>();
        Page<Application> recentApps = applicationRepository.findAll(
                PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "createdAt"))
        );
        for (Application a : recentApps.getContent()) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", a.getId());
            map.put("type", "APPLICATION");
            map.put("title", a.getStudent().getUser().getFullName() + " applied for " + a.getJobDrive().getJobTitle());
            map.put("subtitle", a.getJobDrive().getCompany().getCompanyName() + " • " + a.getStatus().name());
            map.put("timestamp", a.getCreatedAt());
            activities.add(map);
        }

        return AdminDashboardDto.builder()
                .totalStudents(totalStudents)
                .totalCompanies(totalCompanies)
                .totalJobDrives(totalDrives)
                .totalApplications(totalApplications)
                .totalPlacedStudents(placedStudents)
                .totalUnplacedStudents(unplacedStudents)
                .placementPercentage(placementPercentage)
                .highestPackage(highestPackage != null ? highestPackage : BigDecimal.ZERO)
                .averagePackage(averagePackage != null ? averagePackage : BigDecimal.ZERO)
                .medianPackage(medianPackage != null ? medianPackage : BigDecimal.ZERO)
                .recentActivities(activities)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public AnalyticsDto getAnalytics() {
        // Department stats
        List<Object[]> rawDeptStats = studentRepository.getDepartmentPlacementStats();
        List<Map<String, Object>> deptStats = new ArrayList<>();
        for (Object[] row : rawDeptStats) {
            String dept = (String) row[0];
            long total = ((Number) row[1]).longValue();
            long placed = row[2] != null ? ((Number) row[2]).longValue() : 0L;
            double rate = total > 0 ? Math.round(((double) placed / total * 100.0) * 10.0) / 10.0 : 0.0;

            Map<String, Object> map = new HashMap<>();
            map.put("department", dept);
            map.put("totalStudents", total);
            map.put("placedStudents", placed);
            map.put("placementRate", rate);
            deptStats.add(map);
        }

        // Yearly stats
        List<Object[]> rawYearStats = studentRepository.getYearlyPlacementStats();
        List<Map<String, Object>> yearStats = new ArrayList<>();
        for (Object[] row : rawYearStats) {
            Integer year = (Integer) row[0];
            long total = ((Number) row[1]).longValue();
            long placed = row[2] != null ? ((Number) row[2]).longValue() : 0L;
            double rate = total > 0 ? Math.round(((double) placed / total * 100.0) * 10.0) / 10.0 : 0.0;

            Map<String, Object> map = new HashMap<>();
            map.put("year", year);
            map.put("totalStudents", total);
            map.put("placedStudents", placed);
            map.put("placementRate", rate);
            yearStats.add(map);
        }

        // Company hiring stats
        List<Object[]> rawCompanyStats = offerRepository.getCompanyHiringStats();
        List<Map<String, Object>> companyStats = new ArrayList<>();
        for (Object[] row : rawCompanyStats) {
            String company = (String) row[0];
            long hires = ((Number) row[1]).longValue();
            BigDecimal avgCtc = row[2] != null
                    ? BigDecimal.valueOf(((Number) row[2]).doubleValue()).setScale(2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;

            Map<String, Object> map = new HashMap<>();
            map.put("companyName", company);
            map.put("hires", hires);
            map.put("averagePackage", avgCtc);
            companyStats.add(map);
        }

        // Application status conversion counts
        List<Object[]> rawStatusStats = applicationRepository.getApplicationStatusCounts();
        List<Map<String, Object>> statusStats = new ArrayList<>();
        for (Object[] row : rawStatusStats) {
            ApplicationStatus st = (ApplicationStatus) row[0];
            long count = ((Number) row[1]).longValue();

            Map<String, Object> map = new HashMap<>();
            map.put("status", st.name());
            map.put("count", count);
            statusStats.add(map);
        }

        BigDecimal highest = offerRepository.findHighestPackage();
        BigDecimal average = offerRepository.findAveragePackage();
        if (average != null) {
            average = average.setScale(2, RoundingMode.HALF_UP);
        }
        BigDecimal median = calculateMedianPackage();

        long totalStudents = studentRepository.count();
        long placed = studentRepository.countByPlacementStatus(PlacementStatus.PLACED);
        double overallPlacementRate = totalStudents > 0
                ? Math.round(((double) placed / totalStudents * 100.0) * 10.0) / 10.0
                : 0.0;

        return AnalyticsDto.builder()
                .departmentStats(deptStats)
                .yearlyStats(yearStats)
                .companyHiringStats(companyStats)
                .applicationStatusStats(statusStats)
                .highestPackage(highest != null ? highest : BigDecimal.ZERO)
                .averagePackage(average != null ? average : BigDecimal.ZERO)
                .medianPackage(median != null ? median : BigDecimal.ZERO)
                .placementRate(overallPlacementRate)
                .build();
    }

    private BigDecimal calculateMedianPackage() {
        List<BigDecimal> packages = offerRepository.findAllActiveOfferPackagesSorted();
        if (packages.isEmpty()) return BigDecimal.ZERO;

        int size = packages.size();
        if (size % 2 == 1) {
            return packages.get(size / 2);
        } else {
            BigDecimal m1 = packages.get(size / 2 - 1);
            BigDecimal m2 = packages.get(size / 2);
            return m1.add(m2).divide(BigDecimal.valueOf(2), 2, RoundingMode.HALF_UP);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Page<StudentResponseDto> getAllStudents(
            String search,
            String department,
            Integer graduationYear,
            PlacementStatus placementStatus,
            Pageable pageable) {
        String cleanSearch = StringUtils.hasText(search) ? search.trim() : null;
        String cleanDept = StringUtils.hasText(department) ? department.trim() : null;

        return studentRepository.findWithFilters(cleanSearch, cleanDept, graduationYear, placementStatus, pageable)
                .map(this::mapToStudentDto);
    }

    @Override
    @Transactional(readOnly = true)
    public StudentResponseDto getStudentById(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + id));
        return mapToStudentDto(student);
    }

    @Override
    @Transactional
    public StudentResponseDto toggleStudentStatus(Long id, boolean active) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + id));
        student.setActive(active);
        student.getUser().setActive(active);
        userRepository.save(student.getUser());
        student = studentRepository.save(student);
        return mapToStudentDto(student);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CompanyResponseDto> getAllCompanies(String search, Pageable pageable) {
        String cleanSearch = StringUtils.hasText(search) ? search.trim() : null;
        return companyRepository.findWithFilters(cleanSearch, pageable)
                .map(this::mapToCompanyDto);
    }

    @Override
    @Transactional(readOnly = true)
    public CompanyResponseDto getCompanyById(Long id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found: " + id));
        return mapToCompanyDto(company);
    }

    @Override
    @Transactional
    public CompanyResponseDto createCompany(CompanyRegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email is already registered: " + request.getEmail());
        }
        if (companyRepository.existsByCompanyEmail(request.getEmail())) {
            throw new ConflictException("Company email is already registered: " + request.getEmail());
        }

        User user = User.builder()
                .email(request.getEmail().toLowerCase().trim())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getCompanyName().trim())
                .phone(request.getContactPhone())
                .role(Role.ROLE_COMPANY)
                .active(true)
                .build();
        user = userRepository.save(user);

        Company company = Company.builder()
                .user(user)
                .companyName(request.getCompanyName().trim())
                .companyEmail(request.getEmail().toLowerCase().trim())
                .contactPerson(request.getContactPerson().trim())
                .contactPhone(request.getContactPhone())
                .industry(request.getIndustry())
                .location(request.getLocation())
                .website(request.getWebsite())
                .description(request.getDescription())
                .verified(true)
                .build();
        company = companyRepository.save(company);

        return mapToCompanyDto(company);
    }

    @Override
    @Transactional
    public CompanyResponseDto updateCompany(Long id, CompanyProfileUpdateRequest request) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found: " + id));

        if (StringUtils.hasText(request.getCompanyName())) {
            company.setCompanyName(request.getCompanyName().trim());
            company.getUser().setFullName(request.getCompanyName().trim());
        }
        if (request.getContactPerson() != null) company.setContactPerson(request.getContactPerson().trim());
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
    public void deleteCompany(Long id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found: " + id));
        company.getUser().setActive(false);
        userRepository.save(company.getUser());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<JobDriveResponseDto> getAllDrives(
            Long companyId,
            DriveStatus status,
            String search,
            Pageable pageable) {
        String cleanSearch = StringUtils.hasText(search) ? search.trim() : null;
        return jobDriveRepository.findWithFilters(companyId, status, cleanSearch, pageable)
                .map(this::mapToDriveDto);
    }

    @Override
    @Transactional(readOnly = true)
    public JobDriveResponseDto getDriveById(Long id) {
        JobDrive drive = jobDriveRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job drive not found: " + id));
        return mapToDriveDto(drive);
    }

    @Override
    @Transactional
    public JobDriveResponseDto createDrive(JobDriveRequest request) {
        if (request.getCompanyId() == null) {
            throw new BadRequestException("Company ID is required to create a drive");
        }
        Company company = companyRepository.findById(request.getCompanyId())
                .orElseThrow(() -> new ResourceNotFoundException("Company not found: " + request.getCompanyId()));

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
    public JobDriveResponseDto updateDrive(Long id, JobDriveRequest request) {
        JobDrive drive = jobDriveRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job drive not found: " + id));

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
    @Transactional
    public void deleteDrive(Long id) {
        JobDrive drive = jobDriveRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job drive not found: " + id));
        drive.setStatus(DriveStatus.CANCELLED);
        jobDriveRepository.save(drive);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ApplicationResponseDto> getAllApplications(
            Long companyId,
            Long driveId,
            Long studentId,
            ApplicationStatus status,
            String search,
            Pageable pageable) {
        String cleanSearch = StringUtils.hasText(search) ? search.trim() : null;
        return applicationRepository.findWithFilters(companyId, driveId, studentId, status, cleanSearch, pageable)
                .map(this::mapToApplicationDto);
    }

    @Override
    @Transactional(readOnly = true)
    public PlacementPolicy getActivePolicy() {
        return policyRepository.findFirstByIsActiveTrueOrderByIdDesc()
                .orElseGet(() -> {
                    PlacementPolicy defaultPolicy = PlacementPolicy.builder()
                            .policyName("Standard Campus Placement Policy")
                            .maxOffersAllowed(1)
                            .allowApplicationsAfterAcceptance(false)
                            .dreamCompanyCtcThreshold(new BigDecimal("10.00"))
                            .allowDreamCompanyParticipation(true)
                            .minCgpaDefault(new BigDecimal("6.00"))
                            .maxBacklogsDefault(0)
                            .isActive(true)
                            .build();
                    return policyRepository.save(defaultPolicy);
                });
    }

    @Override
    @Transactional
    public PlacementPolicy updatePolicy(PlacementPolicyRequest request) {
        PlacementPolicy policy = getActivePolicy();
        policy.setPolicyName(request.getPolicyName().trim());
        policy.setMaxOffersAllowed(request.getMaxOffersAllowed());
        policy.setAllowApplicationsAfterAcceptance(request.isAllowApplicationsAfterAcceptance());
        policy.setDreamCompanyCtcThreshold(request.getDreamCompanyCtcThreshold());
        policy.setAllowDreamCompanyParticipation(request.isAllowDreamCompanyParticipation());
        if (request.getMinCgpaDefault() != null) policy.setMinCgpaDefault(request.getMinCgpaDefault());
        if (request.getMaxBacklogsDefault() != null) policy.setMaxBacklogsDefault(request.getMaxBacklogsDefault());

        return policyRepository.save(policy);
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
}
