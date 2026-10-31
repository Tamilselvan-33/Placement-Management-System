package com.placement.management.dto.response;

import com.placement.management.enums.PlacementStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentResponseDto {
    private Long id;
    private Long userId;
    private String fullName;
    private String email;
    private String phone;
    private String registrationNumber;
    private String department;
    private String degree;
    private Integer graduationYear;
    private BigDecimal cgpa;
    private Integer backlogs;
    private String technicalSkills;
    private String programmingLanguages;
    private String projects;
    private String certifications;
    private String linkedinUrl;
    private String githubUrl;
    private String portfolioUrl;
    private PlacementStatus placementStatus;
    private boolean active;
    private boolean hasResume;
    private String resumeFileName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
