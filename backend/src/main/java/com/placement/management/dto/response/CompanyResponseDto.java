package com.placement.management.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyResponseDto {
    private Long id;
    private Long userId;
    private String companyName;
    private String companyEmail;
    private String description;
    private String website;
    private String industry;
    private String location;
    private String contactPerson;
    private String contactPhone;
    private String logoUrl;
    private boolean verified;
    private long totalDrivesPosted;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
