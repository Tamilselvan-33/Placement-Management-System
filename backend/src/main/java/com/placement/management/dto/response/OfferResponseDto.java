package com.placement.management.dto.response;

import com.placement.management.enums.OfferStatus;
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
public class OfferResponseDto {
    private Long id;
    private Long applicationId;

    private Long studentId;
    private String studentName;
    private String studentRegNo;
    private String studentEmail;
    private String studentDepartment;

    private Long companyId;
    private String companyName;
    private String companyLogoUrl;

    private Long driveId;
    private String jobTitle;

    private BigDecimal ctc;
    private LocalDate offerDate;
    private LocalDate joiningDate;
    private OfferStatus status;
    private String remarks;
    private String offerLetterUrl;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
