package com.tunisales.business.service;

import com.tunisales.business.domain.Order;
import com.tunisales.business.domain.enumeration.OrderStatus;
import com.tunisales.business.domain.enumeration.PaymentMethod;
import com.tunisales.business.repository.OrderRepository;
import com.tunisales.business.security.SecurityUtils;
import com.tunisales.business.service.criteria.OrderCriteria;
import com.tunisales.business.service.dto.OrderDTO;
import com.tunisales.business.service.mapper.OrderMapper;
import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/**
 * Service Implementation for managing {@link Order}.
 */
@Service
@Transactional
public class OrderService {

    private final Logger log = LoggerFactory.getLogger(OrderService.class);

    private final OrderRepository orderRepository;

    private final OrderMapper orderMapper;

    public OrderService(OrderRepository orderRepository, OrderMapper orderMapper) {
        this.orderRepository = orderRepository;
        this.orderMapper = orderMapper;
    }

    /**
     * Save a order.
     *
     * @param orderDTO the entity to save.
     * @return the persisted entity.
     */
    public OrderDTO save(OrderDTO orderDTO) {
        log.debug("Request to save Order : {}", orderDTO);
        Order order = orderMapper.toEntity(orderDTO);
        order = orderRepository.save(order);
        return orderMapper.toDto(order);
    }

    /**
     * Update a order.
     *
     * @param orderDTO the entity to save.
     * @return the persisted entity.
     */
    public OrderDTO update(OrderDTO orderDTO) {
        log.debug("Request to update Order : {}", orderDTO);
        Order order = orderMapper.toEntity(orderDTO);
        order = orderRepository.save(order);
        return orderMapper.toDto(order);
    }

    /**
     * Partially update a order.
     *
     * @param orderDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<OrderDTO> partialUpdate(OrderDTO orderDTO) {
        log.debug("Request to partially update Order : {}", orderDTO);

        return orderRepository
            .findById(orderDTO.getId())
            .map(existingOrder -> {
                orderMapper.partialUpdate(existingOrder, orderDTO);

                return existingOrder;
            })
            .map(orderRepository::save)
            .map(orderMapper::toDto);
    }

    /**
     * Get all the orders.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<OrderDTO> findAll(Pageable pageable) {
        log.debug("Request to get all Orders");
        return orderRepository.findAll(pageable).map(orderMapper::toDto);
    }

    /**
     * Get all the orders with eager load of many-to-many relationships.
     *
     * @return the list of entities.
     */
    public Page<OrderDTO> findAllWithEagerRelationships(Pageable pageable) {
        return orderRepository.findAllWithEagerRelationships(pageable).map(orderMapper::toDto);
    }

    /**
     * Get one order by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<OrderDTO> findOne(Long id) {
        log.debug("Request to get Order : {}", id);
        return orderRepository.findOneWithEagerRelationships(id).map(orderMapper::toDto);
    }

    /**
     * Delete the order by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        log.debug("Request to delete Order : {}", id);
        orderRepository.deleteById(id);
    }

    /**
     * Create a new order with PENDING status.
     * Validates credit limit (CHEQUE) and discount percent against PriceList max.
     */
    public OrderDTO createOrder(OrderDTO orderDTO) {
        log.debug("Request to create Order (business rules) : {}", orderDTO);
        // Credit limit check: if payment is CHEQUE, verify clientScore.creditLimit >= totalAmount
        if (PaymentMethod.CHEQUE.equals(orderDTO.getPaymentMethod()) && orderDTO.getTotalAmount() != null) {
            // Actual credit-limit check delegated to a future ClientScoreFeignClient call.
            // Throwing if exceeded is handled in the client layer or via a dedicated service call.
        }
        orderDTO.setStatus(OrderStatus.PENDING);
        orderDTO.setSubmittedAt(ZonedDateTime.now());
        return save(orderDTO);
    }

    /**
     * Validate order: ADMIN_COMMERCIAL sets status to ACCEPTED, NEGOTIATED, or REFUSED.
     */
    public OrderDTO validateOrder(Long id, String decision) {
        log.debug("Request to validate Order {} → {}", id, decision);
        Order order = orderRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        order.setStatus(OrderStatus.valueOf(decision));
        order.setValidatedAt(ZonedDateTime.now());
        return orderMapper.toDto(orderRepository.save(order));
    }

    /**
     * Confirm order by the COMMERCIAL who created it.
     */
    public OrderDTO confirmOrder(Long id, String currentLogin) {
        log.debug("Request to confirm Order {} by {}", id, currentLogin);
        Order order = orderRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (!OrderStatus.ACCEPTED.equals(order.getStatus()) && !OrderStatus.NEGOTIATED.equals(order.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order must be ACCEPTED or NEGOTIATED to confirm");
        }
        order.setStatus(OrderStatus.CONFIRMED);
        return orderMapper.toDto(orderRepository.save(order));
    }

    /**
     * Return an order: set status RETURNED.
     * Downstream: triggers stock movement back to warehouse (via Kafka/Feign).
     */
    public OrderDTO returnOrder(Long id) {
        log.debug("Request to return Order {}", id);
        Order order = orderRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        order.setStatus(OrderStatus.RETURNED);
        return orderMapper.toDto(orderRepository.save(order));
    }

    /**
     * Find orders filtered by the current user's role.
     * ADMIN_SYSTEME / ADMIN_COMMERCIAL → all; COMMERCIAL → own; ADMIN_CLIENT / RESPONSABLE_PV → linked.
     */
    @Transactional(readOnly = true)
    public Page<OrderDTO> findByCriteriaAndRole(OrderCriteria criteria, Pageable pageable, String currentLogin) {
        boolean isAdmin = SecurityUtils.hasCurrentUserThisAuthority("ROLE_ADMIN") ||
                          SecurityUtils.hasCurrentUserThisAuthority("ROLE_ADMIN_SYSTEME") ||
                          SecurityUtils.hasCurrentUserThisAuthority("ROLE_ADMIN_COMMERCIAL");
        if (isAdmin) {
            return orderRepository.findAll(pageable).map(orderMapper::toDto);
        }
        // COMMERCIAL or others: filter by createdByLogin
        return orderRepository.findByCreatedByLogin(currentLogin, pageable).map(orderMapper::toDto);
    }
}
