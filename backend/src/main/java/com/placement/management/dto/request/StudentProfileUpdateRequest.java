package com.placement.management.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentProfileUpdateRequest {

    @NotBlank(message = "Full name is required")
    private String fullName;

    private String phone;
    private String department;
    private String degree;
    private Integer graduationYear;

    @DecimalMin(value = "0.0", message = "CGPA cannot be negative")
    @DecimalMax(value = "10.0", message = "CGPA cannot exceed 10.0")
    private BigDecimal cgpa;

    @Min(value = 0, message = "Backlogs cannot be negative")
    private Integer backlogs;

    private String technicalSkills;
    private String programmingLanguages;
    private String projects;
    private String certifications;
    private String linkedinUrl;
    private String githubUrl;
    private String portfolioUrl;
}
