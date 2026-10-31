package com.placement.management.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlacementPolicyRequest {

    @NotBlank(message = "Policy name is required")
    private String policyName;

    @NotNull(message = "Max offers allowed is required")
    @Min(value = 1, message = "Max offers must be at least 1")
    private Integer maxOffersAllowed;

    private boolean allowApplicationsAfterAcceptance;

    @NotNull(message = "Dream company CTC threshold is required")
    @DecimalMin(value = "0.0")
    private BigDecimal dreamCompanyCtcThreshold;

    private boolean allowDreamCompanyParticipation;
    private BigDecimal minCgpaDefault;
    private Integer maxBacklogsDefault;
}
