package com.tunisales.platform.web.rest;

import com.tunisales.platform.repository.ClientScoreRepository;
import com.tunisales.platform.service.ClientScoreQueryService;
import com.tunisales.platform.service.ClientScoreService;
import com.tunisales.platform.service.criteria.ClientScoreCriteria;
import com.tunisales.platform.service.dto.ClientScoreDTO;
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
 * REST controller for managing {@link com.tunisales.platform.domain.ClientScore}.
 * write → ROLE_ADMIN_COMMERCIAL; read → ROLE_ADMIN_COMMERCIAL + ROLE_ADMIN_CLIENT.
 */
@RestController
@RequestMapping("/api")
@PreAuthorize(
    "hasAuthority(\"ROLE_ADMIN\") or " +
    "hasAuthority(\"" + AuthoritiesConstants.ADMIN_COMMERCIAL + "\") or " +
    "hasAuthority(\"" + AuthoritiesConstants.ADMIN_CLIENT + "\")"
)
public class ClientScoreResource {

    private final Logger log = LoggerFactory.getLogger(ClientScoreResource.class);

    private static final String ENTITY_NAME = "platformServiceClientScore";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final ClientScoreService clientScoreService;

    private final ClientScoreRepository clientScoreRepository;

    private final ClientScoreQueryService clientScoreQueryService;

    public ClientScoreResource(
        ClientScoreService clientScoreService,
        ClientScoreRepository clientScoreRepository,
        ClientScoreQueryService clientScoreQueryService
    ) {
        this.clientScoreService = clientScoreService;
        this.clientScoreRepository = clientScoreRepository;
        this.clientScoreQueryService = clientScoreQueryService;
    }

    /**
     * {@code POST  /client-scores} : Create a new clientScore.
     *
     * @param clientScoreDTO the clientScoreDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new clientScoreDTO, or with status {@code 400 (Bad Request)} if the clientScore has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/client-scores")
    public ResponseEntity<ClientScoreDTO> createClientScore(@Valid @RequestBody ClientScoreDTO clientScoreDTO) throws URISyntaxException {
        log.debug("REST request to save ClientScore : {}", clientScoreDTO);
        if (clientScoreDTO.getId() != null) {
            throw new BadRequestAlertException("A new clientScore cannot already have an ID", ENTITY_NAME, "idexists");
        }
        ClientScoreDTO result = clientScoreService.save(clientScoreDTO);
        return ResponseEntity
            .created(new URI("/api/client-scores/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code PUT  /client-scores/:id} : Updates an existing clientScore.
     *
     * @param id the id of the clientScoreDTO to save.
     * @param clientScoreDTO the clientScoreDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated clientScoreDTO,
     * or with status {@code 400 (Bad Request)} if the clientScoreDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the clientScoreDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/client-scores/{id}")
    public ResponseEntity<ClientScoreDTO> updateClientScore(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody ClientScoreDTO clientScoreDTO
    ) throws URISyntaxException {
        log.debug("REST request to update ClientScore : {}, {}", id, clientScoreDTO);
        if (clientScoreDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, clientScoreDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!clientScoreRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        ClientScoreDTO result = clientScoreService.update(clientScoreDTO);
        return ResponseEntity
            .ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, clientScoreDTO.getId().toString()))
            .body(result);
    }

    /**
     * {@code PATCH  /client-scores/:id} : Partial updates given fields of an existing clientScore, field will ignore if it is null
     *
     * @param id the id of the clientScoreDTO to save.
     * @param clientScoreDTO the clientScoreDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated clientScoreDTO,
     * or with status {@code 400 (Bad Request)} if the clientScoreDTO is not valid,
     * or with status {@code 404 (Not Found)} if the clientScoreDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the clientScoreDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/client-scores/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<ClientScoreDTO> partialUpdateClientScore(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody ClientScoreDTO clientScoreDTO
    ) throws URISyntaxException {
        log.debug("REST request to partial update ClientScore partially : {}, {}", id, clientScoreDTO);
        if (clientScoreDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, clientScoreDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!clientScoreRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<ClientScoreDTO> result = clientScoreService.partialUpdate(clientScoreDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, clientScoreDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /client-scores} : get all the clientScores.
     *
     * @param pageable the pagination information.
     * @param criteria the criteria which the requested entities should match.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of clientScores in body.
     */
    @GetMapping("/client-scores")
    public ResponseEntity<List<ClientScoreDTO>> getAllClientScores(
        ClientScoreCriteria criteria,
        @org.springdoc.api.annotations.ParameterObject Pageable pageable
    ) {
        log.debug("REST request to get ClientScores by criteria: {}", criteria);
        Page<ClientScoreDTO> page = clientScoreQueryService.findByCriteria(criteria, pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /client-scores/count} : count all the clientScores.
     *
     * @param criteria the criteria which the requested entities should match.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the count in body.
     */
    @GetMapping("/client-scores/count")
    public ResponseEntity<Long> countClientScores(ClientScoreCriteria criteria) {
        log.debug("REST request to count ClientScores by criteria: {}", criteria);
        return ResponseEntity.ok().body(clientScoreQueryService.countByCriteria(criteria));
    }

    /**
     * {@code GET  /client-scores/:id} : get the "id" clientScore.
     *
     * @param id the id of the clientScoreDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the clientScoreDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/client-scores/{id}")
    public ResponseEntity<ClientScoreDTO> getClientScore(@PathVariable Long id) {
        log.debug("REST request to get ClientScore : {}", id);
        Optional<ClientScoreDTO> clientScoreDTO = clientScoreService.findOne(id);
        return ResponseUtil.wrapOrNotFound(clientScoreDTO);
    }

    /**
     * {@code DELETE  /client-scores/:id} : delete the "id" clientScore.
     *
     * @param id the id of the clientScoreDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/client-scores/{id}")
    public ResponseEntity<Void> deleteClientScore(@PathVariable Long id) {
        log.debug("REST request to delete ClientScore : {}", id);
        clientScoreService.delete(id);
        return ResponseEntity
            .noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}
