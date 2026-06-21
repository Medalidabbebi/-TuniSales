package com.tunisales.inventory.web.rest;

import com.tunisales.inventory.repository.StockItemRepository;
import com.tunisales.inventory.security.AuthoritiesConstants;
import com.tunisales.inventory.service.StockItemQueryService;
import com.tunisales.inventory.service.StockItemService;
import com.tunisales.inventory.service.criteria.StockItemCriteria;
import com.tunisales.inventory.service.dto.StockItemDTO;
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
 * REST controller for managing {@link com.tunisales.inventory.domain.StockItem}.
 * read → ROLE_MAGASINIER + ROLE_COMMERCIAL + ROLE_VENDEUR + ROLE_ADMIN_COMMERCIAL + ROLE_ADMIN_SYSTEME;
 * write → ROLE_MAGASINIER + ROLE_ADMIN_COMMERCIAL.
 */
@RestController
@RequestMapping("/api")
@PreAuthorize(
    "hasAuthority(\"ROLE_ADMIN\") or " +
    "hasAuthority(\"" + AuthoritiesConstants.MAGASINIER + "\") or " +
    "hasAuthority(\"" + AuthoritiesConstants.COMMERCIAL + "\") or " +
    "hasAuthority(\"" + AuthoritiesConstants.VENDEUR + "\") or " +
    "hasAuthority(\"" + AuthoritiesConstants.ADMIN_COMMERCIAL + "\") or " +
    "hasAuthority(\"" + AuthoritiesConstants.ADMIN_SYSTEME + "\")"
)
public class StockItemResource {

    private final Logger log = LoggerFactory.getLogger(StockItemResource.class);

    private static final String ENTITY_NAME = "inventoryServiceStockItem";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final StockItemService stockItemService;

    private final StockItemRepository stockItemRepository;

    private final StockItemQueryService stockItemQueryService;

    public StockItemResource(
        StockItemService stockItemService,
        StockItemRepository stockItemRepository,
        StockItemQueryService stockItemQueryService
    ) {
        this.stockItemService = stockItemService;
        this.stockItemRepository = stockItemRepository;
        this.stockItemQueryService = stockItemQueryService;
    }

    @PostMapping("/stock-items")
    @PreAuthorize(
        "hasAuthority(\"ROLE_ADMIN\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.MAGASINIER + "\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.ADMIN_COMMERCIAL + "\")"
    )
    public ResponseEntity<StockItemDTO> createStockItem(@Valid @RequestBody StockItemDTO stockItemDTO) throws URISyntaxException {
        log.debug("REST request to save StockItem : {}", stockItemDTO);
        if (stockItemDTO.getId() != null) {
            throw new BadRequestAlertException("A new stockItem cannot already have an ID", ENTITY_NAME, "idexists");
        }
        StockItemDTO result = stockItemService.save(stockItemDTO);
        return ResponseEntity
            .created(new URI("/api/stock-items/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    @PutMapping("/stock-items/{id}")
    @PreAuthorize(
        "hasAuthority(\"ROLE_ADMIN\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.MAGASINIER + "\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.ADMIN_COMMERCIAL + "\")"
    )
    public ResponseEntity<StockItemDTO> updateStockItem(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody StockItemDTO stockItemDTO
    ) throws URISyntaxException {
        log.debug("REST request to update StockItem : {}, {}", id, stockItemDTO);
        if (stockItemDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, stockItemDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!stockItemRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        StockItemDTO result = stockItemService.update(stockItemDTO);
        return ResponseEntity
            .ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, stockItemDTO.getId().toString()))
            .body(result);
    }

    @PatchMapping(value = "/stock-items/{id}", consumes = { "application/json", "application/merge-patch+json" })
    @PreAuthorize(
        "hasAuthority(\"ROLE_ADMIN\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.MAGASINIER + "\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.ADMIN_COMMERCIAL + "\")"
    )
    public ResponseEntity<StockItemDTO> partialUpdateStockItem(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody StockItemDTO stockItemDTO
    ) throws URISyntaxException {
        log.debug("REST request to partial update StockItem partially : {}, {}", id, stockItemDTO);
        if (stockItemDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, stockItemDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!stockItemRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<StockItemDTO> result = stockItemService.partialUpdate(stockItemDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, stockItemDTO.getId().toString())
        );
    }

    @GetMapping("/stock-items")
    public ResponseEntity<List<StockItemDTO>> getAllStockItems(
        StockItemCriteria criteria,
        @org.springdoc.api.annotations.ParameterObject Pageable pageable
    ) {
        log.debug("REST request to get StockItems by criteria: {}", criteria);
        Page<StockItemDTO> page = stockItemQueryService.findByCriteria(criteria, pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    @GetMapping("/stock-items/count")
    public ResponseEntity<Long> countStockItems(StockItemCriteria criteria) {
        log.debug("REST request to count StockItems by criteria: {}", criteria);
        return ResponseEntity.ok().body(stockItemQueryService.countByCriteria(criteria));
    }

    @GetMapping("/stock-items/{id}")
    public ResponseEntity<StockItemDTO> getStockItem(@PathVariable Long id) {
        log.debug("REST request to get StockItem : {}", id);
        Optional<StockItemDTO> stockItemDTO = stockItemService.findOne(id);
        return ResponseUtil.wrapOrNotFound(stockItemDTO);
    }

    @DeleteMapping("/stock-items/{id}")
    @PreAuthorize(
        "hasAuthority(\"ROLE_ADMIN\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.ADMIN_COMMERCIAL + "\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.ADMIN_SYSTEME + "\")"
    )
    public ResponseEntity<Void> deleteStockItem(@PathVariable Long id) {
        log.debug("REST request to delete StockItem : {}", id);
        stockItemService.delete(id);
        return ResponseEntity
            .noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }

    /**
     * {@code POST  /stock-items/{id}/declare-missing} : Mark a stock item as MANQUANT.
     */
    @PostMapping("/stock-items/{id}/declare-missing")
    @PreAuthorize("hasAuthority(\"" + AuthoritiesConstants.MAGASINIER + "\")")
    public ResponseEntity<StockItemDTO> declareMissing(@PathVariable Long id) {
        log.debug("REST request to declare StockItem as missing : {}", id);
        if (!stockItemRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }
        StockItemDTO result = stockItemService.declareMissing(id);
        return ResponseEntity.ok().body(result);
    }

    /**
     * {@code POST  /stock-items/{id}/declare-lost} : Mark a stock item as PERDU.
     */
    @PostMapping("/stock-items/{id}/declare-lost")
    @PreAuthorize(
        "hasAuthority(\"ROLE_ADMIN\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.MAGASINIER + "\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.ADMIN_COMMERCIAL + "\")"
    )
    public ResponseEntity<StockItemDTO> declareLost(@PathVariable Long id) {
        log.debug("REST request to declare StockItem as lost : {}", id);
        if (!stockItemRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }
        StockItemDTO result = stockItemService.declareLost(id);
        return ResponseEntity.ok().body(result);
    }

    /**
     * {@code POST  /stock-items/{id}/recover} : Recover a missing/lost stock item back to LOCAL.
     */
    @PostMapping("/stock-items/{id}/recover")
    @PreAuthorize(
        "hasAuthority(\"ROLE_ADMIN\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.MAGASINIER + "\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.ADMIN_COMMERCIAL + "\")"
    )
    public ResponseEntity<StockItemDTO> recover(@PathVariable Long id) {
        log.debug("REST request to recover StockItem : {}", id);
        if (!stockItemRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }
        StockItemDTO result = stockItemService.recover(id);
        return ResponseEntity.ok().body(result);
    }

    /**
     * {@code POST  /stock-items/{id}/mark-sold} : Mark a stock item as SOLD (e.g. by the vendeur who sold it).
     */
    @PostMapping("/stock-items/{id}/mark-sold")
    @PreAuthorize(
        "hasAuthority(\"ROLE_ADMIN\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.MAGASINIER + "\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.VENDEUR + "\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.ADMIN_COMMERCIAL + "\")"
    )
    public ResponseEntity<StockItemDTO> markSold(@PathVariable Long id) {
        log.debug("REST request to mark StockItem as SOLD : {}", id);
        if (!stockItemRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }
        StockItemDTO result = stockItemService.markSold(id);
        return ResponseEntity.ok().body(result);
    }
}
