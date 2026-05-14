package com.tunisales.business.web.rest;

import com.tunisales.business.repository.InvoiceRepository;
import com.tunisales.business.security.AuthoritiesConstants;
import com.tunisales.business.service.InvoiceQueryService;
import com.tunisales.business.service.InvoiceService;
import com.tunisales.business.service.criteria.InvoiceCriteria;
import com.tunisales.business.service.dto.InvoiceDTO;
import com.tunisales.business.web.rest.errors.BadRequestAlertException;
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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing Invoices (BF8).
 *
 * Rules:
 *  POST /invoices          → ROLE_ADMIN_COMMERCIAL (manual trigger)
 *  GET  /invoices          → ROLE_ADMIN_COMMERCIAL, ROLE_ADMIN_SYSTEME
 *  PUT  /invoices/{id}/print → ROLE_COMMERCIAL, ROLE_ADMIN_COMMERCIAL (sets printed = true)
 */
@RestController
@RequestMapping("/api")
public class InvoiceResource {

    private final Logger log = LoggerFactory.getLogger(InvoiceResource.class);

    private static final String ENTITY_NAME = "businessServiceInvoice";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final InvoiceService invoiceService;

    private final InvoiceRepository invoiceRepository;

    private final InvoiceQueryService invoiceQueryService;

    public InvoiceResource(InvoiceService invoiceService, InvoiceRepository invoiceRepository, InvoiceQueryService invoiceQueryService) {
        this.invoiceService = invoiceService;
        this.invoiceRepository = invoiceRepository;
        this.invoiceQueryService = invoiceQueryService;
    }

    /**
     * POST /invoices : Create a new invoice (manual trigger by ROLE_ADMIN_COMMERCIAL).
     */
    @PostMapping("/invoices")
    @PreAuthorize("hasAuthority(\"ROLE_ADMIN\") or hasAuthority(\"" + AuthoritiesConstants.ADMIN_COMMERCIAL + "\")")
    public ResponseEntity<InvoiceDTO> createInvoice(@Valid @RequestBody InvoiceDTO invoiceDTO) throws URISyntaxException {
        log.debug("REST request to save Invoice : {}", invoiceDTO);
        if (invoiceDTO.getId() != null) {
            throw new BadRequestAlertException("A new invoice cannot already have an ID", ENTITY_NAME, "idexists");
        }
        InvoiceDTO result = invoiceService.save(invoiceDTO);
        return ResponseEntity
            .created(new URI("/api/invoices/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * PUT /invoices/{id} : Update invoice (ROLE_ADMIN_COMMERCIAL).
     */
    @PutMapping("/invoices/{id}")
    @PreAuthorize("hasAuthority(\"ROLE_ADMIN\") or hasAuthority(\"" + AuthoritiesConstants.ADMIN_COMMERCIAL + "\")")
    public ResponseEntity<InvoiceDTO> updateInvoice(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody InvoiceDTO invoiceDTO
    ) throws URISyntaxException {
        log.debug("REST request to update Invoice : {}, {}", id, invoiceDTO);
        if (invoiceDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, invoiceDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }
        if (!invoiceRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }
        InvoiceDTO result = invoiceService.update(invoiceDTO);
        return ResponseEntity
            .ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, invoiceDTO.getId().toString()))
            .body(result);
    }

    /**
     * PATCH /invoices/{id} : Partial update (ROLE_ADMIN_COMMERCIAL).
     */
    @PatchMapping(value = "/invoices/{id}", consumes = { "application/json", "application/merge-patch+json" })
    @PreAuthorize("hasAuthority(\"ROLE_ADMIN\") or hasAuthority(\"" + AuthoritiesConstants.ADMIN_COMMERCIAL + "\")")
    public ResponseEntity<InvoiceDTO> partialUpdateInvoice(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody InvoiceDTO invoiceDTO
    ) throws URISyntaxException {
        log.debug("REST request to partial update Invoice partially : {}, {}", id, invoiceDTO);
        if (invoiceDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, invoiceDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }
        if (!invoiceRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }
        Optional<InvoiceDTO> result = invoiceService.partialUpdate(invoiceDTO);
        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, invoiceDTO.getId().toString())
        );
    }

    /**
     * PUT /invoices/{id}/print : Mark invoice as printed (ROLE_COMMERCIAL + ROLE_ADMIN_COMMERCIAL).
     */
    @PutMapping("/invoices/{id}/print")
    @PreAuthorize(
        "hasAuthority(\"ROLE_ADMIN\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.COMMERCIAL + "\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.ADMIN_COMMERCIAL + "\")"
    )
    public ResponseEntity<InvoiceDTO> markAsPrinted(@PathVariable Long id) {
        log.debug("REST request to mark Invoice {} as printed", id);
        InvoiceDTO invoiceDTO = invoiceService.findOne(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        invoiceDTO.setPrinted(true);
        InvoiceDTO result = invoiceService.update(invoiceDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .body(result);
    }

    /**
     * GET /invoices : get all invoices (ROLE_ADMIN_COMMERCIAL + ROLE_ADMIN_SYSTEME).
     */
    @GetMapping("/invoices")
    @PreAuthorize(
        "hasAuthority(\"ROLE_ADMIN\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.ADMIN_COMMERCIAL + "\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.ADMIN_SYSTEME + "\")"
    )
    public ResponseEntity<List<InvoiceDTO>> getAllInvoices(
        InvoiceCriteria criteria,
        @org.springdoc.api.annotations.ParameterObject Pageable pageable
    ) {
        log.debug("REST request to get Invoices by criteria: {}", criteria);
        Page<InvoiceDTO> page = invoiceQueryService.findByCriteria(criteria, pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * GET /invoices/count.
     */
    @GetMapping("/invoices/count")
    @PreAuthorize(
        "hasAuthority(\"ROLE_ADMIN\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.ADMIN_COMMERCIAL + "\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.ADMIN_SYSTEME + "\")"
    )
    public ResponseEntity<Long> countInvoices(InvoiceCriteria criteria) {
        log.debug("REST request to count Invoices by criteria: {}", criteria);
        return ResponseEntity.ok().body(invoiceQueryService.countByCriteria(criteria));
    }

    /**
     * GET /invoices/{id}.
     */
    @GetMapping("/invoices/{id}")
    @PreAuthorize(
        "hasAuthority(\"ROLE_ADMIN\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.ADMIN_COMMERCIAL + "\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.ADMIN_SYSTEME + "\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.COMMERCIAL + "\")"
    )
    public ResponseEntity<InvoiceDTO> getInvoice(@PathVariable Long id) {
        log.debug("REST request to get Invoice : {}", id);
        Optional<InvoiceDTO> invoiceDTO = invoiceService.findOne(id);
        return ResponseUtil.wrapOrNotFound(invoiceDTO);
    }

    /**
     * DELETE /invoices/{id} : ROLE_ADMIN_SYSTEME only.
     */
    @DeleteMapping("/invoices/{id}")
    @PreAuthorize("hasAuthority(\"ROLE_ADMIN\") or hasAuthority(\"" + AuthoritiesConstants.ADMIN_SYSTEME + "\")")
    public ResponseEntity<Void> deleteInvoice(@PathVariable Long id) {
        log.debug("REST request to delete Invoice : {}", id);
        invoiceService.delete(id);
        return ResponseEntity
            .noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}
