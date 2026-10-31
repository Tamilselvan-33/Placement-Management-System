package com.placement.management.repository;

import com.placement.management.entity.Application;
import com.placement.management.enums.ApplicationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByStudentId(Long studentId);
    Page<Application> findByStudentId(Long studentId, Pageable pageable);

    List<Application> findByJobDriveId(Long jobDriveId);
    Page<Application> findByJobDriveId(Long jobDriveId, Pageable pageable);

    Optional<Application> findByStudentIdAndJobDriveId(Long studentId, Long jobDriveId);
    boolean existsByStudentIdAndJobDriveId(Long studentId, Long jobDriveId);

    long countByJobDriveId(Long jobDriveId);
    long countByStudentId(Long studentId);
    long countByStatus(ApplicationStatus status);

    @Query("SELECT a FROM Application a WHERE " +
           "(:companyId IS NULL OR a.jobDrive.company.id = :companyId) AND " +
           "(:driveId IS NULL OR a.jobDrive.id = :driveId) AND " +
           "(:studentId IS NULL OR a.student.id = :studentId) AND " +
           "(:status IS NULL OR a.status = :status) AND " +
           "(:search IS NULL OR LOWER(a.student.user.fullName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           " OR LOWER(a.student.registrationNumber) LIKE LOWER(CONCAT('%', :search, '%')) " +
           " OR LOWER(a.jobDrive.jobTitle) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Application> findWithFilters(
            @Param("companyId") Long companyId,
            @Param("driveId") Long driveId,
            @Param("studentId") Long studentId,
            @Param("status") ApplicationStatus status,
            @Param("search") String search,
            Pageable pageable
    );

    @Query("SELECT a.status as status, COUNT(a) as total FROM Application a GROUP BY a.status")
    List<Object[]> getApplicationStatusCounts();
}
