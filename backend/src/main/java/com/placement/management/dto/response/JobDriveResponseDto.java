package com.placement.management.dto.response;

import com.placement.management.enums.DriveStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobDriveResponseDto {
    private Long id;
    private Long companyId;
    private String companyName;
    private String companyLogoUrl;
    private String companyWebsite;
    private String companyLocation;
    private String jobTitle;
    private String jobDescription;
    private String requiredSkills;
    private String eligibleDepartments;
    private BigDecimal minimumCgpa;
    private Integer maxBacklogs;
    private Integer graduationYear;
    private BigDecimal salaryPackage; // CTC LPA
    private String jobLocation;
    private String employmentType;
    private LocalDate openingDate;
    private LocalDate applicationDeadline;
    private DriveStatus status;
    private long totalApplications;
    private boolean isEligible; // Computed if student is querying
    private String eligibilityReason;
    private boolean hasApplied;
    private String myApplicationStatus;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
