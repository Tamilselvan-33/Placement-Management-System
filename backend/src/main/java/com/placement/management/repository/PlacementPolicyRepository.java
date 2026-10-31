package com.placement.management.repository;

import com.placement.management.entity.PlacementPolicy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PlacementPolicyRepository extends JpaRepository<PlacementPolicy, Long> {
    Optional<PlacementPolicy> findFirstByIsActiveTrueOrderByIdDesc();
}
