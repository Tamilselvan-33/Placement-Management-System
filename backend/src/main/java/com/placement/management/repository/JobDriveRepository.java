package com.placement.management.repository;

import com.placement.management.entity.JobDrive;
import com.placement.management.enums.DriveStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobDriveRepository extends JpaRepository<JobDrive, Long> {
    List<JobDrive> findByCompanyId(Long companyId);
    Page<JobDrive> findByCompanyId(Long companyId, Pageable pageable);
    List<JobDrive> findByStatus(DriveStatus status);

    @Query("SELECT j FROM JobDrive j WHERE " +
           "(:companyId IS NULL OR j.company.id = :companyId) AND " +
           "(:status IS NULL OR j.status = :status) AND " +
           "(:search IS NULL OR LOWER(j.jobTitle) LIKE LOWER(CONCAT('%', :search, '%')) " +
           " OR LOWER(j.company.companyName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           " OR LOWER(j.jobLocation) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<JobDrive> findWithFilters(
            @Param("companyId") Long companyId,
            @Param("status") DriveStatus status,
            @Param("search") String search,
            Pageable pageable
    );

    @Query("SELECT j FROM JobDrive j WHERE j.status = 'OPEN' ORDER BY j.applicationDeadline ASC")
    List<JobDrive> findActiveDrives();
}
