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
public class AnalyticsDto {
    private List<Map<String, Object>> departmentStats;
    private List<Map<String, Object>> yearlyStats;
    private List<Map<String, Object>> companyHiringStats;
    private List<Map<String, Object>> applicationStatusStats;

    private BigDecimal highestPackage;
    private BigDecimal averagePackage;
    private BigDecimal medianPackage;
    private double placementRate;
}
