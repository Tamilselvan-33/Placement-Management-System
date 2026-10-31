package com.placement.management.entity;

import com.placement.management.enums.OfferStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "offers", indexes = {
    @Index(name = "idx_offer_student", columnList = "student_id"),
    @Index(name = "idx_offer_company", columnList = "company_id"),
    @Index(name = "idx_offer_drive", columnList = "job_drive_id"),
    @Index(name = "idx_offer_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Offer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_drive_id", nullable = false)
    private JobDrive jobDrive;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false, unique = true)
    private Application application;

    @Column(precision = 10, scale = 2, nullable = false)
    private BigDecimal ctc;

    @Column(nullable = false)
    private LocalDate offerDate;

    private LocalDate joiningDate;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(nullable = false, length = 30)
    private OfferStatus status = OfferStatus.PENDING;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @Column(length = 255)
    private String offerLetterUrl;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
