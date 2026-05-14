package com.tunisales.platform.repository;

import com.tunisales.platform.domain.PerformanceScore;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the PerformanceScore entity.
 */
@SuppressWarnings("unused")
@Repository
public interface PerformanceScoreRepository extends JpaRepository<PerformanceScore, Long>, JpaSpecificationExecutor<PerformanceScore> {}
