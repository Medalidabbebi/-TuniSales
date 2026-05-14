package com.tunisales.platform.service;

import com.tunisales.platform.domain.*; // for static metamodels
import com.tunisales.platform.domain.Document;
import com.tunisales.platform.repository.DocumentRepository;
import com.tunisales.platform.service.criteria.DocumentCriteria;
import com.tunisales.platform.service.dto.DocumentDTO;
import com.tunisales.platform.service.mapper.DocumentMapper;
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
 * Service for executing complex queries for {@link Document} entities in the database.
 * The main input is a {@link DocumentCriteria} which gets converted to {@link Specification},
 * in a way that all the filters must apply.
 * It returns a {@link List} of {@link DocumentDTO} or a {@link Page} of {@link DocumentDTO} which fulfills the criteria.
 */
@Service
@Transactional(readOnly = true)
public class DocumentQueryService extends QueryService<Document> {

    private final Logger log = LoggerFactory.getLogger(DocumentQueryService.class);

    private final DocumentRepository documentRepository;

    private final DocumentMapper documentMapper;

    public DocumentQueryService(DocumentRepository documentRepository, DocumentMapper documentMapper) {
        this.documentRepository = documentRepository;
        this.documentMapper = documentMapper;
    }

    /**
     * Return a {@link List} of {@link DocumentDTO} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public List<DocumentDTO> findByCriteria(DocumentCriteria criteria) {
        log.debug("find by criteria : {}", criteria);
        final Specification<Document> specification = createSpecification(criteria);
        return documentMapper.toDto(documentRepository.findAll(specification));
    }

    /**
     * Return a {@link Page} of {@link DocumentDTO} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @param page The page, which should be returned.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public Page<DocumentDTO> findByCriteria(DocumentCriteria criteria, Pageable page) {
        log.debug("find by criteria : {}, page: {}", criteria, page);
        final Specification<Document> specification = createSpecification(criteria);
        return documentRepository.findAll(specification, page).map(documentMapper::toDto);
    }

    /**
     * Return the number of matching entities in the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the number of matching entities.
     */
    @Transactional(readOnly = true)
    public long countByCriteria(DocumentCriteria criteria) {
        log.debug("count by criteria : {}", criteria);
        final Specification<Document> specification = createSpecification(criteria);
        return documentRepository.count(specification);
    }

    /**
     * Function to convert {@link DocumentCriteria} to a {@link Specification}
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching {@link Specification} of the entity.
     */
    protected Specification<Document> createSpecification(DocumentCriteria criteria) {
        Specification<Document> specification = Specification.where(null);
        if (criteria != null) {
            // This has to be called first, because the distinct method returns null
            if (criteria.getDistinct() != null) {
                specification = specification.and(distinct(criteria.getDistinct()));
            }
            if (criteria.getId() != null) {
                specification = specification.and(buildRangeSpecification(criteria.getId(), Document_.id));
            }
            if (criteria.getTenantId() != null) {
                specification = specification.and(buildRangeSpecification(criteria.getTenantId(), Document_.tenantId));
            }
            if (criteria.getEntityType() != null) {
                specification = specification.and(buildSpecification(criteria.getEntityType(), Document_.entityType));
            }
            if (criteria.getEntityId() != null) {
                specification = specification.and(buildStringSpecification(criteria.getEntityId(), Document_.entityId));
            }
            if (criteria.getDocType() != null) {
                specification = specification.and(buildSpecification(criteria.getDocType(), Document_.docType));
            }
            if (criteria.getFilename() != null) {
                specification = specification.and(buildStringSpecification(criteria.getFilename(), Document_.filename));
            }
            if (criteria.getStorageUrl() != null) {
                specification = specification.and(buildStringSpecification(criteria.getStorageUrl(), Document_.storageUrl));
            }
            if (criteria.getMimeType() != null) {
                specification = specification.and(buildStringSpecification(criteria.getMimeType(), Document_.mimeType));
            }
            if (criteria.getSizeBytes() != null) {
                specification = specification.and(buildRangeSpecification(criteria.getSizeBytes(), Document_.sizeBytes));
            }
            if (criteria.getUploadedByLogin() != null) {
                specification = specification.and(buildStringSpecification(criteria.getUploadedByLogin(), Document_.uploadedByLogin));
            }
            if (criteria.getCreatedAt() != null) {
                specification = specification.and(buildRangeSpecification(criteria.getCreatedAt(), Document_.createdAt));
            }
            if (criteria.getUpdatedAt() != null) {
                specification = specification.and(buildRangeSpecification(criteria.getUpdatedAt(), Document_.updatedAt));
            }
        }
        return specification;
    }
}
