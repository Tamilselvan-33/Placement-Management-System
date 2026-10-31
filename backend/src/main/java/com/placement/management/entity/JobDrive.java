package com.placement.management.entity;

import com.placement.management.enums.DriveStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "job_drives", indexes = {
    @Index(name = "idx_drive_company", columnList = "company_id"),
    @Index(name = "idx_drive_status", columnList = "status"),
    @Index(name = "idx_drive_deadline", columnList = "applicationDeadline")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobDrive {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @Column(nullable = false, length = 150)
    private String jobTitle;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String jobDescription;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String requiredSkills;

    // Comma-separated list of eligible department codes or names, e.g. "CSE,ECE,IT,MECH" or "ALL"
    @Column(nullable = false, length = 255)
    private String eligibleDepartments;

    @Column(precision = 4, scale = 2, nullable = false)
    private BigDecimal minimumCgpa;

    @Builder.Default
    @Column(nullable = false)
    private Integer maxBacklogs = 0;

    @Column(nullable = false)
    private Integer graduationYear;

    // CTC in LPA, e.g., 12.50
    @Column(precision = 10, scale = 2, nullable = false)
    private BigDecimal salaryPackage;

    @Column(nullable = false, length = 150)
    private String jobLocation;

    @Column(nullable = false, length = 50)
    private String employmentType; // Full Time, Internship, Internship + Full Time

    @Column(nullable = false)
    private LocalDate openingDate;

    @Column(nullable = false)
    private LocalDate applicationDeadline;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(nullable = false, length = 30)
    private DriveStatus status = DriveStatus.OPEN;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
