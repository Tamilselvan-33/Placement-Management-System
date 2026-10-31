package com.placement.management.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EligibilityResultDto {
    private boolean eligible;
    private List<String> reasons;
    private Long driveId;
    private String jobTitle;
    private String companyName;

    // Comparisons
    private BigDecimal studentCgpa;
    private BigDecimal requiredCgpa;

    private Integer studentBacklogs;
    private Integer maxBacklogsAllowed;

    private String studentDepartment;
    private String eligibleDepartments;

    private Integer studentGraduationYear;
    private Integer driveGraduationYear;

    private boolean existingOfferAccepted;
    private boolean isDreamCompanyDrive;
}
