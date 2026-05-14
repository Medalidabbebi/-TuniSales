package com.tunisales.platform.service;

import com.tunisales.platform.domain.*; // for static metamodels
import com.tunisales.platform.domain.PerformanceScore;
import com.tunisales.platform.repository.PerformanceScoreRepository;
import com.tunisales.platform.service.criteria.PerformanceScoreCriteria;
import com.tunisales.platform.service.dto.PerformanceScoreDTO;
import com.tunisales.platform.service.mapper.PerformanceScoreMapper;
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
 * Service for executing complex queries for {@link PerformanceScore} entities in the database.
 * The main input is a {@link PerformanceScoreCriteria} which gets converted to {@link Specification},
 * in a way that all the filters must apply.
 * It returns a {@link List} of {@link PerformanceScoreDTO} or a {@link Page} of {@link PerformanceScoreDTO} which fulfills the criteria.
 */
@Service
@Transactional(readOnly = true)
public class PerformanceScoreQueryService extends QueryService<PerformanceScore> {

    private final Logger log = LoggerFactory.getLogger(PerformanceScoreQueryService.class);

    private final PerformanceScoreRepository performanceScoreRepository;

    private final PerformanceScoreMapper performanceScoreMapper;

    public PerformanceScoreQueryService(
        PerformanceScoreRepository performanceScoreRepository,
        PerformanceScoreMapper performanceScoreMapper
    ) {
        this.performanceScoreRepository = performanceScoreRepository;
        this.performanceScoreMapper = performanceScoreMapper;
    }

    /**
     * Return a {@link List} of {@link PerformanceScoreDTO} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public List<PerformanceScoreDTO> findByCriteria(PerformanceScoreCriteria criteria) {
        log.debug("find by criteria : {}", criteria);
        final Specification<PerformanceScore> specification = createSpecification(criteria);
        return performanceScoreMapper.toDto(performanceScoreRepository.findAll(specification));
    }

    /**
     * Return a {@link Page} of {@link PerformanceScoreDTO} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @param page The page, which should be returned.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public Page<PerformanceScoreDTO> findByCriteria(PerformanceScoreCriteria criteria, Pageable page) {
        log.debug("find by criteria : {}, page: {}", criteria, page);
        final Specification<PerformanceScore> specification = createSpecification(criteria);
        return performanceScoreRepository.findAll(specification, page).map(performanceScoreMapper::toDto);
    }

    /**
     * Return the number of matching entities in the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the number of matching entities.
     */
    @Transactional(readOnly = true)
    public long countByCriteria(PerformanceScoreCriteria criteria) {
        log.debug("count by criteria : {}", criteria);
        final Specification<PerformanceScore> specification = createSpecification(criteria);
        return performanceScoreRepository.count(specification);
    }

    /**
     * Function to convert {@link PerformanceScoreCriteria} to a {@link Specification}
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching {@link Specification} of the entity.
     */
    protected Specification<PerformanceScore> createSpecification(PerformanceScoreCriteria criteria) {
        Specification<PerformanceScore> specification = Specification.where(null);
        if (criteria != null) {
            // This has to be called first, because the distinct method returns null
            if (criteria.getDistinct() != null) {
                specification = specification.and(distinct(criteria.getDistinct()));
            }
            if (criteria.getId() != null) {
                specification = specification.and(buildRangeSpecification(criteria.getId(), PerformanceScore_.id));
            }
            if (criteria.getTenantId() != null) {
                specification = specification.and(buildRangeSpecification(criteria.getTenantId(), PerformanceScore_.tenantId));
            }
            if (criteria.getUserLogin() != null) {
                specification = specification.and(buildStringSpecification(criteria.getUserLogin(), PerformanceScore_.userLogin));
            }
            if (criteria.getPeriod() != null) {
                specification = specification.and(buildStringSpecification(criteria.getPeriod(), PerformanceScore_.period));
            }
            if (criteria.getScore() != null) {
                specification = specification.and(buildRangeSpecification(criteria.getScore(), PerformanceScore_.score));
            }
            if (criteria.getClassification() != null) {
                specification = specification.and(buildSpecification(criteria.getClassification(), PerformanceScore_.classification));
            }
            if (criteria.getDeltaVsPrevious() != null) {
                specification =
                    specification.and(buildRangeSpecification(criteria.getDeltaVsPrevious(), PerformanceScore_.deltaVsPrevious));
            }
            if (criteria.getCalculatedAt() != null) {
                specification = specification.and(buildRangeSpecification(criteria.getCalculatedAt(), PerformanceScore_.calculatedAt));
            }
        }
        return specification;
    }
}
