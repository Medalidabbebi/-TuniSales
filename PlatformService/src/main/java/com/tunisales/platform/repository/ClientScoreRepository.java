package com.tunisales.platform.repository;

import com.tunisales.platform.domain.ClientScore;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the ClientScore entity.
 */
@SuppressWarnings("unused")
@Repository
public interface ClientScoreRepository extends JpaRepository<ClientScore, Long>, JpaSpecificationExecutor<ClientScore> {}
