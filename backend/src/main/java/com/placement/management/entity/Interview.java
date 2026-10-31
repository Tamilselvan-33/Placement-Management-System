package com.placement.management.entity;

import com.placement.management.enums.InterviewMode;
import com.placement.management.enums.InterviewRound;
import com.placement.management.enums.InterviewStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "interviews", indexes = {
    @Index(name = "idx_interview_app", columnList = "application_id"),
    @Index(name = "idx_interview_student", columnList = "student_id"),
    @Index(name = "idx_interview_company", columnList = "company_id"),
    @Index(name = "idx_interview_drive", columnList = "job_drive_id"),
    @Index(name = "idx_interview_date", columnList = "interviewDate")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Interview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    private Application application;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_drive_id", nullable = false)
    private JobDrive jobDrive;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private InterviewRound round;

    @Column(nullable = false)
    private LocalDate interviewDate;

    @Column(nullable = false, length = 20)
    private String interviewTime; // e.g. "10:30 AM" or "14:00"

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(nullable = false, length = 20)
    private InterviewMode mode = InterviewMode.ONLINE;

    @Column(length = 255)
    private String venueOrLink;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(nullable = false, length = 30)
    private InterviewStatus status = InterviewStatus.SCHEDULED;

    @Column(columnDefinition = "TEXT")
    private String feedback;

    @Column(length = 100)
    private String interviewerName;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
