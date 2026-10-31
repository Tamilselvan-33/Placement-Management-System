package com.placement.management.repository;

import com.placement.management.entity.Offer;
import com.placement.management.enums.OfferStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface OfferRepository extends JpaRepository<Offer, Long> {
    List<Offer> findByStudentId(Long studentId);
    Page<Offer> findByStudentId(Long studentId, Pageable pageable);

    List<Offer> findByCompanyId(Long companyId);
    Page<Offer> findByCompanyId(Long companyId, Pageable pageable);

    Optional<Offer> findByApplicationId(Long applicationId);

    long countByStudentIdAndStatus(Long studentId, OfferStatus status);

    @Query("SELECT o FROM Offer o WHERE " +
           "(:companyId IS NULL OR o.company.id = :companyId) AND " +
           "(:studentId IS NULL OR o.student.id = :studentId) AND " +
           "(:status IS NULL OR o.status = :status)")
    Page<Offer> findWithFilters(
            @Param("companyId") Long companyId,
            @Param("studentId") Long studentId,
            @Param("status") OfferStatus status,
            Pageable pageable
    );

    @Query("SELECT MAX(o.ctc) FROM Offer o WHERE o.status = 'ACCEPTED' OR o.status = 'PENDING'")
    BigDecimal findHighestPackage();

    @Query("SELECT AVG(o.ctc) FROM Offer o WHERE o.status = 'ACCEPTED' OR o.status = 'PENDING'")
    BigDecimal findAveragePackage();

    @Query("SELECT o.ctc FROM Offer o WHERE o.status = 'ACCEPTED' OR o.status = 'PENDING' ORDER BY o.ctc ASC")
    List<BigDecimal> findAllActiveOfferPackagesSorted();

    @Query("SELECT o.company.companyName, COUNT(o) as hires, AVG(o.ctc) as avgPackage " +
           "FROM Offer o WHERE o.status = 'ACCEPTED' " +
           "GROUP BY o.company.companyName ORDER BY hires DESC")
    List<Object[]> getCompanyHiringStats();
}
