package com.tunisales.platform.service;

import com.tunisales.platform.domain.*; // for static metamodels
import com.tunisales.platform.domain.Objective;
import com.tunisales.platform.repository.ObjectiveRepository;
import com.tunisales.platform.service.criteria.ObjectiveCriteria;
import com.tunisales.platform.service.dto.ObjectiveDTO;
import com.tunisales.platform.service.mapper.ObjectiveMapper;
import java.util.List;
import javax.persistence.criteria.JoinType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tech.jhipster.service.QueryService;

/**
 * Service for executing complex queries for {@link Objective} entities in the database.
 * The main input is a {@link ObjectiveCriteria} which gets converted to {@link Specification},
 * in a way that all the filters must apply.
 * It returns a {@link List} of {@link ObjectiveDTO} or a {@link Page} of {@link ObjectiveDTO} which fulfills the criteria.
 */
@Service
@Transactional(readOnly = true)
public class ObjectiveQueryService extends QueryService<Objective> {

    private final Logger log = LoggerFactory.getLogger(ObjectiveQueryService.class);

    private final ObjectiveRepository objectiveRepository;

    private final ObjectiveMapper objectiveMapper;

    public ObjectiveQueryService(ObjectiveRepository objectiveRepository, ObjectiveMapper objectiveMapper) {
        this.objectiveRepository = objectiveRepository;
        this.objectiveMapper = objectiveMapper;
    }

    /**
     * Return a {@link List} of {@link ObjectiveDTO} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public List<ObjectiveDTO> findByCriteria(ObjectiveCriteria criteria) {
        log.debug("find by criteria : {}", criteria);
        final Specification<Objective> specification = createSpecification(criteria);
        return objectiveMapper.toDto(objectiveRepository.findAll(specification));
    }

    /**
     * Return a {@link Page} of {@link ObjectiveDTO} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @param page The page, which should be returned.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public Page<ObjectiveDTO> findByCriteria(ObjectiveCriteria criteria, Pageable page) {
        log.debug("find by criteria : {}, page: {}", criteria, page);
        final Specification<Objective> specification = createSpecification(criteria);
        return objectiveRepository.findAll(specification, page).map(objectiveMapper::toDto);
    }

    /**
     * Return the number of matching entities in the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the number of matching entities.
     */
    @Transactional(readOnly = true)
    public long countByCriteria(ObjectiveCriteria criteria) {
        log.debug("count by criteria : {}", criteria);
        final Specification<Objective> specification = createSpecification(criteria);
        return objectiveRepository.count(specification);
    }

    /**
     * Function to convert {@link ObjectiveCriteria} to a {@link Specification}
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching {@link Specification} of the entity.
     */
    protected Specification<Objective> createSpecification(ObjectiveCriteria criteria) {
        Specification<Objective> specification = Specification.where(null);
        if (criteria != null) {
            // This has to be called first, because the distinct method returns null
            if (criteria.getDistinct() != null) {
                specification = specification.and(distinct(criteria.getDistinct()));
            }
            if (criteria.getId() != null) {
                specification = specification.and(buildRangeSpecification(criteria.getId(), Objective_.id));
            }
            if (criteria.getTenantId() != null) {
                specification = specification.and(buildRangeSpecification(criteria.getTenantId(), Objective_.tenantId));
            }
            if (criteria.getAssignedToLogin() != null) {
                specification = specification.and(buildStringSpecification(criteria.getAssignedToLogin(), Objective_.assignedToLogin));
            }
            if (criteria.getPeriod() != null) {
                specification = specification.and(buildStringSpecification(criteria.getPeriod(), Objective_.period));
            }
            if (criteria.getMetricType() != null) {
                specification = specification.and(buildSpecification(criteria.getMetricType(), Objective_.metricType));
            }
            if (criteria.getTargetValue() != null) {
                specification = specification.and(buildRangeSpecification(criteria.getTargetValue(), Objective_.targetValue));
            }
            if (criteria.getAchievedValue() != null) {
                specification = specification.and(buildRangeSpecification(criteria.getAchievedValue(), Objective_.achievedValue));
            }
            if (criteria.getCreatedAt() != null) {
                specification = specification.and(buildRangeSpecification(criteria.getCreatedAt(), Objective_.createdAt));
            }
            if (criteria.getUpdatedAt() != null) {
                specification = specification.and(buildRangeSpecification(criteria.getUpdatedAt(), Objective_.updatedAt));
            }
        }
        return specification;
    }
}
