package com.tunisales.platform.service;

import com.tunisales.platform.domain.*; // for static metamodels
import com.tunisales.platform.domain.ClientScore;
import com.tunisales.platform.repository.ClientScoreRepository;
import com.tunisales.platform.service.criteria.ClientScoreCriteria;
import com.tunisales.platform.service.dto.ClientScoreDTO;
import com.tunisales.platform.service.mapper.ClientScoreMapper;
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
 * Service for executing complex queries for {@link ClientScore} entities in the database.
 * The main input is a {@link ClientScoreCriteria} which gets converted to {@link Specification},
 * in a way that all the filters must apply.
 * It returns a {@link List} of {@link ClientScoreDTO} or a {@link Page} of {@link ClientScoreDTO} which fulfills the criteria.
 */
@Service
@Transactional(readOnly = true)
public class ClientScoreQueryService extends QueryService<ClientScore> {

    private final Logger log = LoggerFactory.getLogger(ClientScoreQueryService.class);

    private final ClientScoreRepository clientScoreRepository;

    private final ClientScoreMapper clientScoreMapper;

    public ClientScoreQueryService(ClientScoreRepository clientScoreRepository, ClientScoreMapper clientScoreMapper) {
        this.clientScoreRepository = clientScoreRepository;
        this.clientScoreMapper = clientScoreMapper;
    }

    /**
     * Return a {@link List} of {@link ClientScoreDTO} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public List<ClientScoreDTO> findByCriteria(ClientScoreCriteria criteria) {
        log.debug("find by criteria : {}", criteria);
        final Specification<ClientScore> specification = createSpecification(criteria);
        return clientScoreMapper.toDto(clientScoreRepository.findAll(specification));
    }

    /**
     * Return a {@link Page} of {@link ClientScoreDTO} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @param page The page, which should be returned.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public Page<ClientScoreDTO> findByCriteria(ClientScoreCriteria criteria, Pageable page) {
        log.debug("find by criteria : {}, page: {}", criteria, page);
        final Specification<ClientScore> specification = createSpecification(criteria);
        return clientScoreRepository.findAll(specification, page).map(clientScoreMapper::toDto);
    }

    /**
     * Return the number of matching entities in the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the number of matching entities.
     */
    @Transactional(readOnly = true)
    public long countByCriteria(ClientScoreCriteria criteria) {
        log.debug("count by criteria : {}", criteria);
        final Specification<ClientScore> specification = createSpecification(criteria);
        return clientScoreRepository.count(specification);
    }

    /**
     * Function to convert {@link ClientScoreCriteria} to a {@link Specification}
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching {@link Specification} of the entity.
     */
    protected Specification<ClientScore> createSpecification(ClientScoreCriteria criteria) {
        Specification<ClientScore> specification = Specification.where(null);
        if (criteria != null) {
            // This has to be called first, because the distinct method returns null
            if (criteria.getDistinct() != null) {
                specification = specification.and(distinct(criteria.getDistinct()));
            }
            if (criteria.getId() != null) {
                specification = specification.and(buildRangeSpecification(criteria.getId(), ClientScore_.id));
            }
            if (criteria.getTenantId() != null) {
                specification = specification.and(buildRangeSpecification(criteria.getTenantId(), ClientScore_.tenantId));
            }
            if (criteria.getClientId() != null) {
                specification = specification.and(buildRangeSpecification(criteria.getClientId(), ClientScore_.clientId));
            }
            if (criteria.getClientName() != null) {
                specification = specification.and(buildStringSpecification(criteria.getClientName(), ClientScore_.clientName));
            }
            if (criteria.getPeriod() != null) {
                specification = specification.and(buildStringSpecification(criteria.getPeriod(), ClientScore_.period));
            }
            if (criteria.getScore() != null) {
                specification = specification.and(buildRangeSpecification(criteria.getScore(), ClientScore_.score));
            }
            if (criteria.getClassification() != null) {
                specification = specification.and(buildSpecification(criteria.getClassification(), ClientScore_.classification));
            }
            if (criteria.getCalculatedAt() != null) {
                specification = specification.and(buildRangeSpecification(criteria.getCalculatedAt(), ClientScore_.calculatedAt));
            }
        }
        return specification;
    }
}
