package com.placement.management.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardDto {
    private long totalStudents;
    private long totalCompanies;
    private long totalJobDrives;
    private long totalApplications;
    private long totalPlacedStudents;
    private long totalUnplacedStudents;
    private double placementPercentage;

    private BigDecimal highestPackage;
    private BigDecimal averagePackage;
    private BigDecimal medianPackage;

    private List<Map<String, Object>> recentActivities;
}
