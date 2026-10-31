package com.placement.management.entity;

import com.placement.management.enums.ApplicationStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "applications",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_student_drive", columnNames = {"student_id", "job_drive_id"})
    },
    indexes = {
        @Index(name = "idx_app_student", columnList = "student_id"),
        @Index(name = "idx_app_drive", columnList = "job_drive_id"),
        @Index(name = "idx_app_status", columnList = "status")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_drive_id", nullable = false)
    private JobDrive jobDrive;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime applicationDate;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(nullable = false, length = 30)
    private ApplicationStatus status = ApplicationStatus.APPLIED;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
