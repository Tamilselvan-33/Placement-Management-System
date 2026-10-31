package com.placement.management.entity;

import com.placement.management.enums.PlacementStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "students", indexes = {
    @Index(name = "idx_student_reg_no", columnList = "registrationNumber", unique = true),
    @Index(name = "idx_student_dept", columnList = "department"),
    @Index(name = "idx_student_grad_year", columnList = "graduationYear"),
    @Index(name = "idx_student_placement_status", columnList = "placementStatus")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false, unique = true, length = 50)
    private String registrationNumber;

    @Column(nullable = false, length = 100)
    private String department;

    @Column(length = 50)
    private String degree;

    @Column(nullable = false)
    private Integer graduationYear;

    @Column(precision = 4, scale = 2)
    private BigDecimal cgpa;

    @Builder.Default
    @Column(nullable = false)
    private Integer backlogs = 0;

    @Column(columnDefinition = "TEXT")
    private String technicalSkills;

    @Column(columnDefinition = "TEXT")
    private String programmingLanguages;

    @Column(columnDefinition = "TEXT")
    private String projects;

    @Column(columnDefinition = "TEXT")
    private String certifications;

    @Column(length = 255)
    private String linkedinUrl;

    @Column(length = 255)
    private String githubUrl;

    @Column(length = 255)
    private String portfolioUrl;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(nullable = false, length = 30)
    private PlacementStatus placementStatus = PlacementStatus.UNPLACED;

    @Builder.Default
    @Column(nullable = false)
    private boolean active = true;

    @OneToOne(mappedBy = "student", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Resume resume;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
