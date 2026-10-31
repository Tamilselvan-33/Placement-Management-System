package com.placement.management.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "companies", indexes = {
    @Index(name = "idx_company_name", columnList = "companyName"),
    @Index(name = "idx_company_email", columnList = "companyEmail", unique = true),
    @Index(name = "idx_company_industry", columnList = "industry")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false, length = 150)
    private String companyName;

    @Column(nullable = false, unique = true, length = 120)
    private String companyEmail;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 200)
    private String website;

    @Column(length = 100)
    private String industry;

    @Column(length = 150)
    private String location;

    @Column(length = 100)
    private String contactPerson;

    @Column(length = 20)
    private String contactPhone;

    @Column(length = 255)
    private String logoUrl;

    @Builder.Default
    @Column(nullable = false)
    private boolean verified = true;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
