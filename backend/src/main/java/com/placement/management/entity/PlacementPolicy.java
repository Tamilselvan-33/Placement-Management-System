package com.placement.management.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "placement_policies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlacementPolicy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String policyName;

    @Builder.Default
    @Column(nullable = false)
    private Integer maxOffersAllowed = 1;

    @Builder.Default
    @Column(nullable = false)
    private boolean allowApplicationsAfterAcceptance = false;

    // Minimum CTC (LPA) for a drive to be considered a "Dream Company"
    @Builder.Default
    @Column(precision = 10, scale = 2, nullable = false)
    private BigDecimal dreamCompanyCtcThreshold = new BigDecimal("10.00");

    // Can students with an existing standard offer still participate in Dream Company drives?
    @Builder.Default
    @Column(nullable = false)
    private boolean allowDreamCompanyParticipation = true;

    @Builder.Default
    @Column(precision = 4, scale = 2)
    private BigDecimal minCgpaDefault = new BigDecimal("6.00");

    @Builder.Default
    @Column(nullable = false)
    private Integer maxBacklogsDefault = 0;

    @Builder.Default
    @Column(nullable = false)
    private boolean isActive = true;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
