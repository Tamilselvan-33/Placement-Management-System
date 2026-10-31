package com.placement.management.repository;

import com.placement.management.entity.Student;
import com.placement.management.enums.PlacementStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByUserId(Long userId);
    Optional<Student> findByUserEmail(String email);
    Optional<Student> findByRegistrationNumber(String registrationNumber);
    boolean existsByRegistrationNumber(String registrationNumber);

    long countByPlacementStatus(PlacementStatus status);

    @Query("SELECT s FROM Student s WHERE " +
           "(:search IS NULL OR LOWER(s.user.fullName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           " OR LOWER(s.registrationNumber) LIKE LOWER(CONCAT('%', :search, '%')) " +
           " OR LOWER(s.user.email) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:department IS NULL OR s.department = :department) AND " +
           "(:graduationYear IS NULL OR s.graduationYear = :graduationYear) AND " +
           "(:placementStatus IS NULL OR s.placementStatus = :placementStatus)")
    Page<Student> findWithFilters(
            @Param("search") String search,
            @Param("department") String department,
            @Param("graduationYear") Integer graduationYear,
            @Param("placementStatus") PlacementStatus placementStatus,
            Pageable pageable
    );

    @Query("SELECT s.department as department, " +
           "COUNT(s) as totalStudents, " +
           "SUM(CASE WHEN s.placementStatus = 'PLACED' THEN 1 ELSE 0 END) as placedStudents " +
           "FROM Student s GROUP BY s.department")
    List<Object[]> getDepartmentPlacementStats();

    @Query("SELECT s.graduationYear as year, " +
           "COUNT(s) as totalStudents, " +
           "SUM(CASE WHEN s.placementStatus = 'PLACED' THEN 1 ELSE 0 END) as placedStudents " +
           "FROM Student s GROUP BY s.graduationYear ORDER BY s.graduationYear ASC")
    List<Object[]> getYearlyPlacementStats();
}
