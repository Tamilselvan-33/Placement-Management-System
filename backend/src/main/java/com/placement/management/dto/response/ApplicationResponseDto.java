package com.placement.management.dto.response;

import com.placement.management.enums.ApplicationStatus;
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
public class ApplicationResponseDto {
    private Long id;
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private String studentRegNo;
    private String studentDepartment;
    private BigDecimal studentCgpa;
    private Integer studentBacklogs;
    private boolean studentHasResume;

    private Long driveId;
    private String jobTitle;
    private Long companyId;
    private String companyName;
    private String companyLogoUrl;
    private BigDecimal salaryPackage;
    private String jobLocation;
    private LocalDate applicationDeadline;

    private LocalDateTime applicationDate;
    private ApplicationStatus status;
    private String notes;

    private Long latestInterviewId;
    private String latestInterviewRound;
    private LocalDate latestInterviewDate;
    private String latestInterviewTime;
    private String latestInterviewVenueOrLink;

    private Long offerId;
    private BigDecimal offerCtc;
    private String offerStatus;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
