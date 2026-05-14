package com.tunisales.platform.repository;

import com.tunisales.platform.domain.Objective;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Objective entity.
 */
@SuppressWarnings("unused")
@Repository
public interface ObjectiveRepository extends JpaRepository<Objective, Long>, JpaSpecificationExecutor<Objective> {}
