package com.placement.management.repository;

import com.placement.management.entity.Interview;
import com.placement.management.enums.InterviewStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewRepository extends JpaRepository<Interview, Long> {
    List<Interview> findByStudentId(Long studentId);
    Page<Interview> findByStudentId(Long studentId, Pageable pageable);

    List<Interview> findByCompanyId(Long companyId);
    Page<Interview> findByCompanyId(Long companyId, Pageable pageable);

    List<Interview> findByApplicationId(Long applicationId);

    @Query("SELECT i FROM Interview i WHERE " +
           "(:companyId IS NULL OR i.company.id = :companyId) AND " +
           "(:studentId IS NULL OR i.student.id = :studentId) AND " +
           "(:driveId IS NULL OR i.jobDrive.id = :driveId) AND " +
           "(:status IS NULL OR i.status = :status)")
    Page<Interview> findWithFilters(
            @Param("companyId") Long companyId,
            @Param("studentId") Long studentId,
            @Param("driveId") Long driveId,
            @Param("status") InterviewStatus status,
            Pageable pageable
    );
}
