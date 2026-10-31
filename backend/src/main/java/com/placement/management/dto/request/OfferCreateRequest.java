package com.placement.management.dto.request;

import jakarta.validation.constraints.DecimalMin;
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
public class OfferCreateRequest {

    @NotNull(message = "Application ID is required")
    private Long applicationId;

    @NotNull(message = "CTC (LPA) is required")
    @DecimalMin(value = "0.1", message = "CTC must be positive")
    private BigDecimal ctc;

    @NotNull(message = "Offer date is required")
    private LocalDate offerDate;

    private LocalDate joiningDate;
    private String remarks;
    private String offerLetterUrl;
}
