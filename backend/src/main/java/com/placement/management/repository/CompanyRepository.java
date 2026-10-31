package com.placement.management.repository;

import com.placement.management.entity.Company;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {
    Optional<Company> findByUserId(Long userId);
    Optional<Company> findByUserEmail(String email);
    Optional<Company> findByCompanyEmail(String companyEmail);
    boolean existsByCompanyEmail(String companyEmail);

    @Query("SELECT c FROM Company c WHERE " +
           "(:search IS NULL OR LOWER(c.companyName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           " OR LOWER(c.industry) LIKE LOWER(CONCAT('%', :search, '%')) " +
           " OR LOWER(c.location) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Company> findWithFilters(@Param("search") String search, Pageable pageable);
}
