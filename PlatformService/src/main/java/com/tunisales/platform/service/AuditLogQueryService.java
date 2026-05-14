package com.tunisales.platform.service;

import com.tunisales.platform.domain.*; // for static metamodels
import com.tunisales.platform.domain.AuditLog;
import com.tunisales.platform.repository.AuditLogRepository;
import com.tunisales.platform.service.criteria.AuditLogCriteria;
import com.tunisales.platform.service.dto.AuditLogDTO;
import com.tunisales.platform.service.mapper.AuditLogMapper;
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
 * Service for executing complex queries for {@link AuditLog} entities in the database.
 * The main input is a {@link AuditLogCriteria} which gets converted to {@link Specification},
 * in a way that all the filters must apply.
 * It returns a {@link List} of {@link AuditLogDTO} or a {@link Page} of {@link AuditLogDTO} which fulfills the criteria.
 */
@Service
@Transactional(readOnly = true)
public class AuditLogQueryService extends QueryService<AuditLog> {

    private final Logger log = LoggerFactory.getLogger(AuditLogQueryService.class);

    private final AuditLogRepository auditLogRepository;

    private final AuditLogMapper auditLogMapper;

    public AuditLogQueryService(AuditLogRepository auditLogRepository, AuditLogMapper auditLogMapper) {
        this.auditLogRepository = auditLogRepository;
        this.auditLogMapper = auditLogMapper;
    }

    /**
     * Return a {@link List} of {@link AuditLogDTO} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public List<AuditLogDTO> findByCriteria(AuditLogCriteria criteria) {
        log.debug("find by criteria : {}", criteria);
        final Specification<AuditLog> specification = createSpecification(criteria);
        return auditLogMapper.toDto(auditLogRepository.findAll(specification));
    }

    /**
     * Return a {@link Page} of {@link AuditLogDTO} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @param page The page, which should be returned.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public Page<AuditLogDTO> findByCriteria(AuditLogCriteria criteria, Pageable page) {
        log.debug("find by criteria : {}, page: {}", criteria, page);
        final Specification<AuditLog> specification = createSpecification(criteria);
        return auditLogRepository.findAll(specification, page).map(auditLogMapper::toDto);
    }

    /**
     * Return the number of matching entities in the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the number of matching entities.
     */
    @Transactional(readOnly = true)
    public long countByCriteria(AuditLogCriteria criteria) {
        log.debug("count by criteria : {}", criteria);
        final Specification<AuditLog> specification = createSpecification(criteria);
        return auditLogRepository.count(specification);
    }

    /**
     * Function to convert {@link AuditLogCriteria} to a {@link Specification}
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching {@link Specification} of the entity.
     */
    protected Specification<AuditLog> createSpecification(AuditLogCriteria criteria) {
        Specification<AuditLog> specification = Specification.where(null);
        if (criteria != null) {
            // This has to be called first, because the distinct method returns null
            if (criteria.getDistinct() != null) {
                specification = specification.and(distinct(criteria.getDistinct()));
            }
            if (criteria.getId() != null) {
                specification = specification.and(buildRangeSpecification(criteria.getId(), AuditLog_.id));
            }
            if (criteria.getTenantId() != null) {
                specification = specification.and(buildRangeSpecification(criteria.getTenantId(), AuditLog_.tenantId));
            }
            if (criteria.getEntityType() != null) {
                specification = specification.and(buildStringSpecification(criteria.getEntityType(), AuditLog_.entityType));
            }
            if (criteria.getEntityId() != null) {
                specification = specification.and(buildStringSpecification(criteria.getEntityId(), AuditLog_.entityId));
            }
            if (criteria.getAction() != null) {
                specification = specification.and(buildSpecification(criteria.getAction(), AuditLog_.action));
            }
            if (criteria.getIpAddress() != null) {
                specification = specification.and(buildStringSpecification(criteria.getIpAddress(), AuditLog_.ipAddress));
            }
            if (criteria.getUserAgent() != null) {
                specification = specification.and(buildStringSpecification(criteria.getUserAgent(), AuditLog_.userAgent));
            }
            if (criteria.getPerformedByLogin() != null) {
                specification = specification.and(buildStringSpecification(criteria.getPerformedByLogin(), AuditLog_.performedByLogin));
            }
            if (criteria.getCreatedAt() != null) {
                specification = specification.and(buildRangeSpecification(criteria.getCreatedAt(), AuditLog_.createdAt));
            }
        }
        return specification;
    }
}
