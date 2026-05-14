package com.tunisales.inventory.web.rest;

import com.tunisales.inventory.repository.StockAuditRepository;
import com.tunisales.inventory.security.AuthoritiesConstants;
import com.tunisales.inventory.service.StockAuditQueryService;
import com.tunisales.inventory.service.StockAuditService;
import com.tunisales.inventory.service.criteria.StockAuditCriteria;
import com.tunisales.inventory.service.dto.StockAuditDTO;
import com.tunisales.inventory.web.rest.errors.BadRequestAlertException;
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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link com.tunisales.inventory.domain.StockAudit}.
 * write → ROLE_MAGASINIER + ROLE_ADMIN_COMMERCIAL;
 * read → + ROLE_COMMERCIAL + ROLE_ADMIN_SYSTEME.
 * CONFLICT is detected when physicalCount != theoreticalCount.
 */
@RestController
@RequestMapping("/api")
@PreAuthorize(
    "hasAuthority(\"ROLE_ADMIN\") or " +
    "hasAuthority(\"" + AuthoritiesConstants.MAGASINIER + "\") or " +
    "hasAuthority(\"" + AuthoritiesConstants.ADMIN_COMMERCIAL + "\") or " +
    "hasAuthority(\"" + AuthoritiesConstants.COMMERCIAL + "\") or " +
    "hasAuthority(\"" + AuthoritiesConstants.ADMIN_SYSTEME + "\")"
)
public class StockAuditResource {

    private final Logger log = LoggerFactory.getLogger(StockAuditResource.class);

    private static final String ENTITY_NAME = "inventoryServiceStockAudit";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final StockAuditService stockAuditService;

    private final StockAuditRepository stockAuditRepository;

    private final StockAuditQueryService stockAuditQueryService;

    public StockAuditResource(
        StockAuditService stockAuditService,
        StockAuditRepository stockAuditRepository,
        StockAuditQueryService stockAuditQueryService
    ) {
        this.stockAuditService = stockAuditService;
        this.stockAuditRepository = stockAuditRepository;
        this.stockAuditQueryService = stockAuditQueryService;
    }

    @PostMapping("/stock-audits")
    @PreAuthorize(
        "hasAuthority(\"ROLE_ADMIN\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.MAGASINIER + "\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.ADMIN_COMMERCIAL + "\")"
    )
    public ResponseEntity<StockAuditDTO> createStockAudit(@Valid @RequestBody StockAuditDTO stockAuditDTO) throws URISyntaxException {
        log.debug("REST request to save StockAudit : {}", stockAuditDTO);
        if (stockAuditDTO.getId() != null) {
            throw new BadRequestAlertException("A new stockAudit cannot already have an ID", ENTITY_NAME, "idexists");
        }
        StockAuditDTO result = stockAuditService.save(stockAuditDTO);
        HttpHeaders headers = HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, result.getId().toString());
        if (hasConflict(result)) {
            headers.add("X-Audit-Conflict", "true");
        }
        return ResponseEntity.created(new URI("/api/stock-audits/" + result.getId())).headers(headers).body(result);
    }

    @PutMapping("/stock-audits/{id}")
    @PreAuthorize(
        "hasAuthority(\"ROLE_ADMIN\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.MAGASINIER + "\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.ADMIN_COMMERCIAL + "\")"
    )
    public ResponseEntity<StockAuditDTO> updateStockAudit(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody StockAuditDTO stockAuditDTO
    ) throws URISyntaxException {
        log.debug("REST request to update StockAudit : {}, {}", id, stockAuditDTO);
        if (stockAuditDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, stockAuditDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!stockAuditRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        StockAuditDTO result = stockAuditService.update(stockAuditDTO);
        HttpHeaders headers = HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, stockAuditDTO.getId().toString());
        if (hasConflict(result)) {
            headers.add("X-Audit-Conflict", "true");
        }
        return ResponseEntity.ok().headers(headers).body(result);
    }

    @PatchMapping(value = "/stock-audits/{id}", consumes = { "application/json", "application/merge-patch+json" })
    @PreAuthorize(
        "hasAuthority(\"ROLE_ADMIN\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.MAGASINIER + "\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.ADMIN_COMMERCIAL + "\")"
    )
    public ResponseEntity<StockAuditDTO> partialUpdateStockAudit(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody StockAuditDTO stockAuditDTO
    ) throws URISyntaxException {
        log.debug("REST request to partial update StockAudit partially : {}, {}", id, stockAuditDTO);
        if (stockAuditDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, stockAuditDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!stockAuditRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<StockAuditDTO> result = stockAuditService.partialUpdate(stockAuditDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, stockAuditDTO.getId().toString())
        );
    }

    @GetMapping("/stock-audits")
    public ResponseEntity<List<StockAuditDTO>> getAllStockAudits(
        StockAuditCriteria criteria,
        @org.springdoc.api.annotations.ParameterObject Pageable pageable
    ) {
        log.debug("REST request to get StockAudits by criteria: {}", criteria);
        Page<StockAuditDTO> page = stockAuditQueryService.findByCriteria(criteria, pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    @GetMapping("/stock-audits/count")
    public ResponseEntity<Long> countStockAudits(StockAuditCriteria criteria) {
        log.debug("REST request to count StockAudits by criteria: {}", criteria);
        return ResponseEntity.ok().body(stockAuditQueryService.countByCriteria(criteria));
    }

    @GetMapping("/stock-audits/{id}")
    public ResponseEntity<StockAuditDTO> getStockAudit(@PathVariable Long id) {
        log.debug("REST request to get StockAudit : {}", id);
        Optional<StockAuditDTO> stockAuditDTO = stockAuditService.findOne(id);
        return ResponseUtil.wrapOrNotFound(stockAuditDTO);
    }

    @DeleteMapping("/stock-audits/{id}")
    @PreAuthorize("hasAuthority(\"" + AuthoritiesConstants.ADMIN_COMMERCIAL + "\")")
    public ResponseEntity<Void> deleteStockAudit(@PathVariable Long id) {
        log.debug("REST request to delete StockAudit : {}", id);
        stockAuditService.delete(id);
        return ResponseEntity
            .noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }

    private boolean hasConflict(StockAuditDTO dto) {
        Integer theoretical = dto.getTheoreticalCount();
        Integer physical = dto.getPhysicalCount();
        return theoretical != null && physical != null && !theoretical.equals(physical);
    }
}
