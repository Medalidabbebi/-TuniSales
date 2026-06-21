package com.tunisales.business.web.rest;

import com.tunisales.business.domain.enumeration.OrderStatus;
import com.tunisales.business.repository.OrderRepository;
import com.tunisales.business.security.AuthoritiesConstants;
import com.tunisales.business.security.SecurityUtils;
import com.tunisales.business.service.OrderQueryService;
import com.tunisales.business.service.OrderService;
import com.tunisales.business.service.criteria.OrderCriteria;
import com.tunisales.business.service.dto.OrderDTO;
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
 * REST controller for managing Orders (the core sales flow BF4-BF7).
 *
 * Rules:
 *  POST /orders                    → ROLE_COMMERCIAL only; status auto-set to PENDING
 *  PUT  /orders/{id}/validate      → ROLE_ADMIN_COMMERCIAL only; sets ACCEPTED|NEGOTIATED|REFUSED
 *  PUT  /orders/{id}/confirm       → ROLE_COMMERCIAL only; called after ACCEPTED or renegotiation
 *  PUT  /orders/{id}/return        → ROLE_ADMIN_CLIENT, ROLE_RESPONSABLE_PV; sets RETURNED
 *  GET  /orders                    → ADMIN sees all; COMMERCIAL sees own; ADMIN_CLIENT/RESPONSABLE_PV see linked
 *  PUT  /orders/{id}               → ROLE_ADMIN_COMMERCIAL (general update)
 *  DELETE /orders/{id}             → ROLE_ADMIN_SYSTEME
 */
@RestController
@RequestMapping("/api")
public class OrderResource {

    private final Logger log = LoggerFactory.getLogger(OrderResource.class);

    private static final String ENTITY_NAME = "businessServiceOrder";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final OrderService orderService;

    private final OrderRepository orderRepository;

    private final OrderQueryService orderQueryService;

    public OrderResource(OrderService orderService, OrderRepository orderRepository, OrderQueryService orderQueryService) {
        this.orderService = orderService;
        this.orderRepository = orderRepository;
        this.orderQueryService = orderQueryService;
    }

    /**
     * POST /orders : Create a new offer (ROLE_COMMERCIAL only).
     * Status is forced to PENDING; paymentMethod and discountPercent validated here.
     */
    @PostMapping("/orders")
    @PreAuthorize(
        "hasAuthority(\"ROLE_ADMIN\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.COMMERCIAL + "\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.VENDEUR + "\")"
    )
    public ResponseEntity<OrderDTO> createOrder(@Valid @RequestBody OrderDTO orderDTO) throws URISyntaxException {
        log.debug("REST request to save Order : {}", orderDTO);
        if (orderDTO.getId() != null) {
            throw new BadRequestAlertException("A new order cannot already have an ID", ENTITY_NAME, "idexists");
        }
        // Business rule: new orders are always PENDING
        orderDTO.setStatus(OrderStatus.PENDING);
        // Business rule: set the creating commercial's login
        orderDTO.setCreatedByLogin(SecurityUtils.getCurrentUserLogin().orElse(null));

        OrderDTO result = orderService.createOrder(orderDTO);
        return ResponseEntity
            .created(new URI("/api/orders/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * PUT /orders/{id}/validate : Validate an order (ROLE_ADMIN_COMMERCIAL only).
     * Allowed transitions: PENDING → ACCEPTED | NEGOTIATED | REFUSED.
     */
    @PutMapping("/orders/{id}/validate")
    @PreAuthorize("hasAuthority(\"ROLE_ADMIN\") or hasAuthority(\"" + AuthoritiesConstants.ADMIN_COMMERCIAL + "\")")
    public ResponseEntity<OrderDTO> validateOrder(
        @PathVariable Long id,
        @RequestParam String decision
    ) {
        log.debug("REST request to validate Order {} with decision {}", id, decision);
        if (!List.of("ACCEPTED", "NEGOTIATED", "REFUSED", "UNDER_REVIEW", "APPROVED",
                "IN_PREPARATION", "SHIPPED", "DELIVERED", "INVOICED", "PAID", "CANCELLED").contains(decision)) {
            throw new BadRequestAlertException("Invalid decision", ENTITY_NAME, "invaliddecision");
        }
        OrderDTO result = orderService.validateOrder(id, decision);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .body(result);
    }

    /**
     * PUT /orders/{id}/confirm : Confirm an order after acceptance or renegotiation (ROLE_COMMERCIAL only).
     */
    @PutMapping("/orders/{id}/confirm")
    @PreAuthorize(
        "hasAuthority(\"ROLE_ADMIN\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.COMMERCIAL + "\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.VENDEUR + "\")"
    )
    public ResponseEntity<OrderDTO> confirmOrder(@PathVariable Long id) {
        log.debug("REST request to confirm Order {}", id);
        String currentLogin = SecurityUtils.getCurrentUserLogin()
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        OrderDTO result = orderService.confirmOrder(id, currentLogin);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .body(result);
    }

    /**
     * PUT /orders/{id}/return : Return an order (ROLE_ADMIN_CLIENT, ROLE_RESPONSABLE_PV).
     * Sets status to RETURNED and triggers stock movement back to warehouse.
     */
    @PutMapping("/orders/{id}/return")
    @PreAuthorize(
        "hasAuthority(\"ROLE_ADMIN\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.ADMIN_CLIENT + "\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.RESPONSABLE_PV + "\")"
    )
    public ResponseEntity<OrderDTO> returnOrder(@PathVariable Long id) {
        log.debug("REST request to return Order {}", id);
        OrderDTO result = orderService.returnOrder(id);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .body(result);
    }

    /**
     * PUT /orders/{id} : General update by ROLE_ADMIN_COMMERCIAL.
     */
    @PutMapping("/orders/{id}")
    @PreAuthorize("hasAuthority(\"ROLE_ADMIN\") or hasAuthority(\"" + AuthoritiesConstants.ADMIN_COMMERCIAL + "\")")
    public ResponseEntity<OrderDTO> updateOrder(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody OrderDTO orderDTO
    ) throws URISyntaxException {
        log.debug("REST request to update Order : {}, {}", id, orderDTO);
        if (orderDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, orderDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }
        if (!orderRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }
        OrderDTO result = orderService.update(orderDTO);
        return ResponseEntity
            .ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, orderDTO.getId().toString()))
            .body(result);
    }

    /**
     * PATCH /orders/{id} : Partial update (ROLE_ADMIN_COMMERCIAL).
     */
    @PatchMapping(value = "/orders/{id}", consumes = { "application/json", "application/merge-patch+json" })
    @PreAuthorize("hasAuthority(\"ROLE_ADMIN\") or hasAuthority(\"" + AuthoritiesConstants.ADMIN_COMMERCIAL + "\")")
    public ResponseEntity<OrderDTO> partialUpdateOrder(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody OrderDTO orderDTO
    ) throws URISyntaxException {
        log.debug("REST request to partial update Order partially : {}, {}", id, orderDTO);
        if (orderDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, orderDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }
        if (!orderRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }
        Optional<OrderDTO> result = orderService.partialUpdate(orderDTO);
        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, orderDTO.getId().toString())
        );
    }

    /**
     * GET /orders : get orders — scope filtered by role.
     * ADMIN_SYSTEME / ADMIN_COMMERCIAL see all; COMMERCIAL sees own; ADMIN_CLIENT / RESPONSABLE_PV see linked.
     */
    @GetMapping("/orders")
    @PreAuthorize(
        "hasAuthority(\"ROLE_ADMIN\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.ADMIN_SYSTEME + "\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.ADMIN_COMMERCIAL + "\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.COMMERCIAL + "\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.VENDEUR + "\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.ADMIN_CLIENT + "\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.RESPONSABLE_PV + "\")"
    )
    public ResponseEntity<List<OrderDTO>> getAllOrders(
        OrderCriteria criteria,
        @org.springdoc.api.annotations.ParameterObject Pageable pageable
    ) {
        log.debug("REST request to get Orders by criteria: {}", criteria);
        String currentLogin = SecurityUtils.getCurrentUserLogin().orElse(null);
        Page<OrderDTO> page = orderService.findByCriteriaAndRole(criteria, pageable, currentLogin);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * GET /orders/count : count orders.
     */
    @GetMapping("/orders/count")
    @PreAuthorize(
        "hasAuthority(\"ROLE_ADMIN\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.ADMIN_SYSTEME + "\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.ADMIN_COMMERCIAL + "\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.COMMERCIAL + "\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.VENDEUR + "\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.ADMIN_CLIENT + "\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.RESPONSABLE_PV + "\")"
    )
    public ResponseEntity<Long> countOrders(OrderCriteria criteria) {
        log.debug("REST request to count Orders by criteria: {}", criteria);
        return ResponseEntity.ok().body(orderQueryService.countByCriteria(criteria));
    }

    /**
     * GET /orders/{id} : get one order.
     */
    @GetMapping("/orders/{id}")
    @PreAuthorize(
        "hasAuthority(\"ROLE_ADMIN\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.ADMIN_SYSTEME + "\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.ADMIN_COMMERCIAL + "\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.COMMERCIAL + "\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.VENDEUR + "\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.ADMIN_CLIENT + "\") or " +
        "hasAuthority(\"" + AuthoritiesConstants.RESPONSABLE_PV + "\")"
    )
    public ResponseEntity<OrderDTO> getOrder(@PathVariable Long id) {
        log.debug("REST request to get Order : {}", id);
        Optional<OrderDTO> orderDTO = orderService.findOne(id);
        return ResponseUtil.wrapOrNotFound(orderDTO);
    }

    /**
     * DELETE /orders/{id} : delete (ROLE_ADMIN_SYSTEME only).
     */
    @DeleteMapping("/orders/{id}")
    @PreAuthorize("hasAuthority(\"ROLE_ADMIN\") or hasAuthority(\"" + AuthoritiesConstants.ADMIN_SYSTEME + "\")")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        log.debug("REST request to delete Order : {}", id);
        orderService.delete(id);
        return ResponseEntity
            .noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}
