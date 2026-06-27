package com.tunisales.business.web.rest;

import com.tunisales.business.domain.enumeration.ClaimStatus;
import com.tunisales.business.repository.ClaimRepository;
import com.tunisales.business.security.AuthoritiesConstants;
import com.tunisales.business.service.ClaimService;
import com.tunisales.business.service.dto.ClaimDTO;
import com.tunisales.business.web.rest.errors.BadRequestAlertException;
import java.net.URI;
import java.net.URISyntaxException;
import java.time.ZonedDateTime;
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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import com.tunisales.business.security.SecurityUtils;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link com.tunisales.business.domain.Claim} (réclamation / demande de récupération).
 * create → ROLE_RESPONSABLE_PV + ROLE_ADMIN_COMMERCIAL; read → + ROLE_ADMIN_SYSTEME; resolve/delete → ROLE_ADMIN_COMMERCIAL + ROLE_ADMIN_SYSTEME.
 */
@RestController
@RequestMapping("/api")
public class ClaimResource {

    private final Logger log = LoggerFactory.getLogger(ClaimResource.class);

    private static final String ENTITY_NAME = "businessServiceClaim";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final ClaimService claimService;

    private final ClaimRepository claimRepository;

    public ClaimResource(ClaimService claimService, ClaimRepository claimRepository) {
        this.claimService = claimService;
        this.claimRepository = claimRepository;
    }

    @PostMapping("/claims")
    @PreAuthorize(
        "hasAuthority(\"ROLE_ADMIN\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.RESPONSABLE_PV + "\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.ADMIN_COMMERCIAL + "\")"
    )
    public ResponseEntity<ClaimDTO> createClaim(@Valid @RequestBody ClaimDTO claimDTO) throws URISyntaxException {
        log.debug("REST request to save Claim : {}", claimDTO);
        if (claimDTO.getId() != null) {
            throw new BadRequestAlertException("A new claim cannot already have an ID", ENTITY_NAME, "idexists");
        }
        claimDTO.setStatus(ClaimStatus.OPEN);
        claimDTO.setCreatedAt(ZonedDateTime.now());
        claimDTO.setCreatedByLogin(SecurityUtils.getCurrentUserLogin().orElse(null));
        if (claimDTO.getTenantId() == null) {
            claimDTO.setTenantId(1L);
        }

        ClaimDTO result = claimService.save(claimDTO);
        return ResponseEntity
            .created(new URI("/api/claims/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    @PatchMapping(value = "/claims/{id}", consumes = { "application/json", "application/merge-patch+json" })
    @PreAuthorize(
        "hasAuthority(\"ROLE_ADMIN\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.ADMIN_COMMERCIAL + "\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.ADMIN_SYSTEME + "\")"
    )
    public ResponseEntity<ClaimDTO> partialUpdateClaim(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody ClaimDTO claimDTO
    ) throws URISyntaxException {
        log.debug("REST request to partial update Claim partially : {}, {}", id, claimDTO);
        if (claimDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, claimDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }
        if (!claimRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<ClaimDTO> result = claimService.partialUpdate(claimDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, claimDTO.getId().toString())
        );
    }

    @GetMapping("/claims")
    @PreAuthorize(
        "hasAuthority(\"ROLE_ADMIN\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.RESPONSABLE_PV + "\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.ADMIN_COMMERCIAL + "\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.ADMIN_SYSTEME + "\")"
    )
    public ResponseEntity<List<ClaimDTO>> getAllClaims(@org.springdoc.api.annotations.ParameterObject Pageable pageable) {
        log.debug("REST request to get all Claims");
        Page<ClaimDTO> page = claimService.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    @GetMapping("/claims/count")
    @PreAuthorize(
        "hasAuthority(\"ROLE_ADMIN\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.RESPONSABLE_PV + "\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.ADMIN_COMMERCIAL + "\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.ADMIN_SYSTEME + "\")"
    )
    public ResponseEntity<Long> countClaims() {
        log.debug("REST request to count Claims");
        return ResponseEntity.ok().body(claimRepository.count());
    }

    @GetMapping("/claims/{id}")
    @PreAuthorize(
        "hasAuthority(\"ROLE_ADMIN\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.RESPONSABLE_PV + "\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.ADMIN_COMMERCIAL + "\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.ADMIN_SYSTEME + "\")"
    )
    public ResponseEntity<ClaimDTO> getClaim(@PathVariable Long id) {
        log.debug("REST request to get Claim : {}", id);
        Optional<ClaimDTO> claimDTO = claimService.findOne(id);
        return ResponseUtil.wrapOrNotFound(claimDTO);
    }

    @DeleteMapping("/claims/{id}")
    @PreAuthorize(
        "hasAuthority(\"ROLE_ADMIN\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.ADMIN_COMMERCIAL + "\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.ADMIN_SYSTEME + "\")"
    )
    public ResponseEntity<Void> deleteClaim(@PathVariable Long id) {
        log.debug("REST request to delete Claim : {}", id);
        claimService.delete(id);
        return ResponseEntity
            .noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}
