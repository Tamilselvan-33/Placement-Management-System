package com.placement.management.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyProfileUpdateRequest {

    @NotBlank(message = "Company name is required")
    private String companyName;

    private String contactPerson;
    private String contactPhone;
    private String industry;
    private String location;
    private String website;
    private String description;
    private String logoUrl;
}
