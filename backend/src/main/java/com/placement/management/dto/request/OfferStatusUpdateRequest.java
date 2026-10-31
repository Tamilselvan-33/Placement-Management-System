package com.placement.management.dto.request;

import com.placement.management.enums.OfferStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OfferStatusUpdateRequest {
    @NotNull(message = "Offer status is required")
    private OfferStatus status;

    private String remarks;
}
