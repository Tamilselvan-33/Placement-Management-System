package com.placement.management.dto.request;

import com.placement.management.enums.DriveStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobDriveRequest {

    private Long companyId; // optional when created by company recruiter

    @NotBlank(message = "Job title is required")
    private String jobTitle;

    @NotBlank(message = "Job description is required")
    private String jobDescription;

    @NotBlank(message = "Required skills are required")
    private String requiredSkills;

    @NotBlank(message = "Eligible departments are required (e.g., CSE,ECE,IT)")
    private String eligibleDepartments;

    @NotNull(message = "Minimum CGPA is required")
    @DecimalMin(value = "0.0", message = "CGPA must be positive")
    private BigDecimal minimumCgpa;

    @NotNull(message = "Maximum backlogs must be specified")
    @Min(value = 0, message = "Backlogs cannot be negative")
    private Integer maxBacklogs;

    @NotNull(message = "Graduation year is required")
    private Integer graduationYear;

    @NotNull(message = "Salary package (CTC in LPA) is required")
    @DecimalMin(value = "0.1", message = "Salary package must be positive")
    private BigDecimal salaryPackage;

    @NotBlank(message = "Job location is required")
    private String jobLocation;

    @NotBlank(message = "Employment type is required")
    private String employmentType;

    @NotNull(message = "Opening date is required")
    private LocalDate openingDate;

    @NotNull(message = "Application deadline is required")
    private LocalDate applicationDeadline;

    private DriveStatus status;
}
