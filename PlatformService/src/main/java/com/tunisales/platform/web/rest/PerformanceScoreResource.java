package com.tunisales.platform.web.rest;

import com.tunisales.platform.repository.PerformanceScoreRepository;
import com.tunisales.platform.service.PerformanceScoreQueryService;
import com.tunisales.platform.service.PerformanceScoreService;
import com.tunisales.platform.service.criteria.PerformanceScoreCriteria;
import com.tunisales.platform.service.dto.PerformanceScoreDTO;
import com.tunisales.platform.web.rest.errors.BadRequestAlertException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import com.tunisales.platform.security.AuthoritiesConstants;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link com.tunisales.platform.domain.PerformanceScore}.
 * write → ROLE_ADMIN_COMMERCIAL, ROLE_CHEF_PARC; read-all → ROLE_ADMIN_COMMERCIAL, ROLE_ADMIN_SYSTEME; read-own → ROLE_COMMERCIAL.
 */
@RestController
@RequestMapping("/api")
public class PerformanceScoreResource {

    private final Logger log = LoggerFactory.getLogger(PerformanceScoreResource.class);

    private static final String ENTITY_NAME = "platformServicePerformanceScore";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final PerformanceScoreService performanceScoreService;

    private final PerformanceScoreRepository performanceScoreRepository;

    private final PerformanceScoreQueryService performanceScoreQueryService;

    public PerformanceScoreResource(
        PerformanceScoreService performanceScoreService,
        PerformanceScoreRepository performanceScoreRepository,
        PerformanceScoreQueryService performanceScoreQueryService
    ) {
        this.performanceScoreService = performanceScoreService;
        this.performanceScoreRepository = performanceScoreRepository;
        this.performanceScoreQueryService = performanceScoreQueryService;
    }

    /**
     * {@code POST  /performance-scores} : Create a new performanceScore.
     *
     * @param performanceScoreDTO the performanceScoreDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new performanceScoreDTO, or with status {@code 400 (Bad Request)} if the performanceScore has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/performance-scores")
    @PreAuthorize(
        "hasAuthority(\"ROLE_ADMIN\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.ADMIN_COMMERCIAL + "\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.CHEF_PARC + "\")"
    )
    public ResponseEntity<PerformanceScoreDTO> createPerformanceScore(@Valid @RequestBody PerformanceScoreDTO performanceScoreDTO)
        throws URISyntaxException {
        log.debug("REST request to save PerformanceScore : {}", performanceScoreDTO);
        if (performanceScoreDTO.getId() != null) {
            throw new BadRequestAlertException("A new performanceScore cannot already have an ID", ENTITY_NAME, "idexists");
        }
        PerformanceScoreDTO result = performanceScoreService.save(performanceScoreDTO);
        return ResponseEntity
            .created(new URI("/api/performance-scores/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code PUT  /performance-scores/:id} : Updates an existing performanceScore.
     *
     * @param id the id of the performanceScoreDTO to save.
     * @param performanceScoreDTO the performanceScoreDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated performanceScoreDTO,
     * or with status {@code 400 (Bad Request)} if the performanceScoreDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the performanceScoreDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/performance-scores/{id}")
    @PreAuthorize(
        "hasAuthority(\"ROLE_ADMIN\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.ADMIN_COMMERCIAL + "\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.CHEF_PARC + "\")"
    )
    public ResponseEntity<PerformanceScoreDTO> updatePerformanceScore(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody PerformanceScoreDTO performanceScoreDTO
    ) throws URISyntaxException {
        log.debug("REST request to update PerformanceScore : {}, {}", id, performanceScoreDTO);
        if (performanceScoreDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, performanceScoreDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!performanceScoreRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        PerformanceScoreDTO result = performanceScoreService.update(performanceScoreDTO);
        return ResponseEntity
            .ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, performanceScoreDTO.getId().toString()))
            .body(result);
    }

    /**
     * {@code PATCH  /performance-scores/:id} : Partial updates given fields of an existing performanceScore, field will ignore if it is null
     *
     * @param id the id of the performanceScoreDTO to save.
     * @param performanceScoreDTO the performanceScoreDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated performanceScoreDTO,
     * or with status {@code 400 (Bad Request)} if the performanceScoreDTO is not valid,
     * or with status {@code 404 (Not Found)} if the performanceScoreDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the performanceScoreDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/performance-scores/{id}", consumes = { "application/json", "application/merge-patch+json" })
    @PreAuthorize(
        "hasAuthority(\"ROLE_ADMIN\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.ADMIN_COMMERCIAL + "\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.CHEF_PARC + "\")"
    )
    public ResponseEntity<PerformanceScoreDTO> partialUpdatePerformanceScore(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody PerformanceScoreDTO performanceScoreDTO
    ) throws URISyntaxException {
        log.debug("REST request to partial update PerformanceScore partially : {}, {}", id, performanceScoreDTO);
        if (performanceScoreDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, performanceScoreDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!performanceScoreRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<PerformanceScoreDTO> result = performanceScoreService.partialUpdate(performanceScoreDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, performanceScoreDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /performance-scores} : get all the performanceScores.
     *
     * @param pageable the pagination information.
     * @param criteria the criteria which the requested entities should match.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of performanceScores in body.
     */
    @GetMapping("/performance-scores")
    @PreAuthorize(
        "hasAuthority(\"ROLE_ADMIN\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.ADMIN_COMMERCIAL + "\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.ADMIN_SYSTEME + "\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.COMMERCIAL + "\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.CHEF_PARC + "\")"
    )
    public ResponseEntity<List<PerformanceScoreDTO>> getAllPerformanceScores(
        PerformanceScoreCriteria criteria,
        @org.springdoc.api.annotations.ParameterObject Pageable pageable
    ) {
        log.debug("REST request to get PerformanceScores by criteria: {}", criteria);
        Page<PerformanceScoreDTO> page = performanceScoreQueryService.findByCriteria(criteria, pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /performance-scores/count} : count all the performanceScores.
     *
     * @param criteria the criteria which the requested entities should match.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the count in body.
     */
    @GetMapping("/performance-scores/count")
    @PreAuthorize(
        "hasAuthority(\"ROLE_ADMIN\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.ADMIN_COMMERCIAL + "\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.ADMIN_SYSTEME + "\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.COMMERCIAL + "\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.CHEF_PARC + "\")"
    )
    public ResponseEntity<Long> countPerformanceScores(PerformanceScoreCriteria criteria) {
        log.debug("REST request to count PerformanceScores by criteria: {}", criteria);
        return ResponseEntity.ok().body(performanceScoreQueryService.countByCriteria(criteria));
    }

    /**
     * {@code GET  /performance-scores/:id} : get the "id" performanceScore.
     *
     * @param id the id of the performanceScoreDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the performanceScoreDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/performance-scores/{id}")
    @PreAuthorize(
        "hasAuthority(\"ROLE_ADMIN\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.ADMIN_COMMERCIAL + "\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.ADMIN_SYSTEME + "\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.COMMERCIAL + "\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.CHEF_PARC + "\")"
    )
    public ResponseEntity<PerformanceScoreDTO> getPerformanceScore(@PathVariable Long id) {
        log.debug("REST request to get PerformanceScore : {}", id);
        Optional<PerformanceScoreDTO> performanceScoreDTO = performanceScoreService.findOne(id);
        return ResponseUtil.wrapOrNotFound(performanceScoreDTO);
    }

    /**
     * {@code DELETE  /performance-scores/:id} : delete the "id" performanceScore.
     *
     * @param id the id of the performanceScoreDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/performance-scores/{id}")
    @PreAuthorize(
        "hasAuthority(\"ROLE_ADMIN\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.ADMIN_COMMERCIAL + "\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.ADMIN_SYSTEME + "\")"
    )
    public ResponseEntity<Void> deletePerformanceScore(@PathVariable Long id) {
        log.debug("REST request to delete PerformanceScore : {}", id);
        performanceScoreService.delete(id);
        return ResponseEntity
            .noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}
