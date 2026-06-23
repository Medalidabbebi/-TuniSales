package com.tunisales.business.service;

import com.tunisales.business.domain.Delivery;
import com.tunisales.business.domain.Mission;
import com.tunisales.business.domain.Visit;
import com.tunisales.business.domain.enumeration.DeliveryStatus;
import com.tunisales.business.domain.enumeration.MissionStatus;
import com.tunisales.business.domain.enumeration.OrderStatus;
import com.tunisales.business.domain.enumeration.VisitStatus;
import com.tunisales.business.repository.DeliveryRepository;
import com.tunisales.business.repository.MissionRepository;
import com.tunisales.business.repository.VisitRepository;
import com.tunisales.business.service.dto.DeliveryDTO;
import com.tunisales.business.service.mapper.DeliveryMapper;
import com.tunisales.business.web.rest.errors.BadRequestAlertException;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link Delivery}.
 */
@Service
@Transactional
public class DeliveryService {

    private static final String ENTITY_NAME = "businessServiceDelivery";

    private final Logger log = LoggerFactory.getLogger(DeliveryService.class);

    private final DeliveryRepository deliveryRepository;

    private final DeliveryMapper deliveryMapper;

    private final MissionRepository missionRepository;

    private final VisitRepository visitRepository;

    public DeliveryService(
        DeliveryRepository deliveryRepository,
        DeliveryMapper deliveryMapper,
        MissionRepository missionRepository,
        VisitRepository visitRepository
    ) {
        this.deliveryRepository = deliveryRepository;
        this.deliveryMapper = deliveryMapper;
        this.missionRepository = missionRepository;
        this.visitRepository = visitRepository;
    }

    /**
     * Save a delivery.
     *
     * @param deliveryDTO the entity to save.
     * @return the persisted entity.
     */
    public DeliveryDTO save(DeliveryDTO deliveryDTO) {
        log.debug("Request to save Delivery : {}", deliveryDTO);
        validateDeliveryNumberUniqueness(deliveryDTO);
        Delivery delivery = deliveryMapper.toEntity(deliveryDTO);
        delivery = deliveryRepository.save(delivery);
        cascadeStatusToMissionAndVisit(delivery);
        return deliveryMapper.toDto(delivery);
    }

    /**
     * Update a delivery.
     *
     * @param deliveryDTO the entity to save.
     * @return the persisted entity.
     */
    public DeliveryDTO update(DeliveryDTO deliveryDTO) {
        log.debug("Request to update Delivery : {}", deliveryDTO);
        validateDeliveryNumberUniqueness(deliveryDTO);
        Delivery delivery = deliveryMapper.toEntity(deliveryDTO);
        delivery = deliveryRepository.save(delivery);
        cascadeStatusToMissionAndVisit(delivery);
        return deliveryMapper.toDto(delivery);
    }

    /**
     * Partially update a delivery.
     *
     * @param deliveryDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<DeliveryDTO> partialUpdate(DeliveryDTO deliveryDTO) {
        log.debug("Request to partially update Delivery : {}", deliveryDTO);
        validateDeliveryNumberUniqueness(deliveryDTO);

        return deliveryRepository
            .findById(deliveryDTO.getId())
            .map(existingDelivery -> {
                deliveryMapper.partialUpdate(existingDelivery, deliveryDTO);

                return existingDelivery;
            })
            .map(deliveryRepository::save)
            .map(delivery -> {
                cascadeStatusToMissionAndVisit(delivery);
                return delivery;
            })
            .map(deliveryMapper::toDto);
    }

    /**
     * Ensures no other delivery already uses this deliveryNumber, throwing a
     * clean 400 BadRequestAlertException instead of letting the DB's unique
     * constraint surface as an unhandled 500 at transaction commit time.
     */
    private void validateDeliveryNumberUniqueness(DeliveryDTO deliveryDTO) {
        if (deliveryDTO.getDeliveryNumber() == null) {
            return;
        }

        deliveryRepository
            .findOneByDeliveryNumber(deliveryDTO.getDeliveryNumber())
            .ifPresent(existingDelivery -> {
                if (deliveryDTO.getId() == null || !existingDelivery.getId().equals(deliveryDTO.getId())) {
                    throw new BadRequestAlertException("Delivery number already exists", ENTITY_NAME, "deliverynumberalreadyexists");
                }
            });
    }

    /**
     * Reflects an Order's status onto every Delivery linked to that order, which in
     * turn cascades onto each delivery's linked Mission/Visit.
     *
     * @param orderId the id of the order whose status changed.
     * @param orderStatus the order's new status.
     */
    public void cascadeFromOrderStatus(Long orderId, OrderStatus orderStatus) {
        DeliveryStatus mapped = fromOrderStatus(orderStatus);
        if (mapped == null) {
            return;
        }
        deliveryRepository
            .findByOrderId(orderId)
            .forEach(delivery -> {
                if (delivery.getStatus() != mapped) {
                    delivery.setStatus(mapped);
                    deliveryRepository.save(delivery);
                }
                cascadeStatusToMissionAndVisit(delivery);
            });
    }

    private DeliveryStatus fromOrderStatus(OrderStatus status) {
        switch (status) {
            case DRAFT:
            case PENDING:
            case SUBMITTED:
            case UNDER_REVIEW:
            case APPROVED:
            case ACCEPTED:
            case NEGOTIATED:
            case CONFIRMED:
                return DeliveryStatus.PENDING;
            case IN_PREPARATION:
                return DeliveryStatus.IN_PREPARATION;
            case SHIPPED:
                return DeliveryStatus.SHIPPED;
            case DELIVERED:
            case INVOICED:
            case PAID:
                return DeliveryStatus.DELIVERED;
            case REFUSED:
            case REJECTED:
            case CANCELLED:
            case RETURNED:
                return DeliveryStatus.FAILED;
            default:
                return null;
        }
    }

    /**
     * Reflects a Delivery's status onto its linked Mission and Visit (if any).
     * The Mission/Visit attached to the mapped Delivery entity may just be a
     * client-supplied snapshot, so the authoritative record is re-fetched by
     * id before its status is mutated.
     */
    private void cascadeStatusToMissionAndVisit(Delivery delivery) {
        DeliveryStatus status = delivery.getStatus();
        if (status == null) {
            return;
        }

        Mission missionRef = delivery.getMission();
        if (missionRef != null && missionRef.getId() != null) {
            MissionStatus mapped = toMissionStatus(status);
            if (mapped != null) {
                missionRepository
                    .findById(missionRef.getId())
                    .filter(mission -> mission.getStatus() != mapped)
                    .ifPresent(mission -> missionRepository.save(mission.status(mapped)));
            }
        }

        Visit visitRef = delivery.getVisit();
        if (visitRef != null && visitRef.getId() != null) {
            VisitStatus mapped = toVisitStatus(status);
            if (mapped != null) {
                visitRepository
                    .findById(visitRef.getId())
                    .filter(visit -> visit.getStatus() != mapped)
                    .ifPresent(visit -> visitRepository.save(visit.status(mapped)));
            }
        }
    }

    private MissionStatus toMissionStatus(DeliveryStatus status) {
        switch (status) {
            case PENDING:
                return MissionStatus.PLANNED;
            case IN_PREPARATION:
            case SHIPPED:
                return MissionStatus.IN_PROGRESS;
            case DELIVERED:
                return MissionStatus.COMPLETED;
            case FAILED:
                return MissionStatus.CANCELLED;
            default:
                return null;
        }
    }

    private VisitStatus toVisitStatus(DeliveryStatus status) {
        switch (status) {
            case PENDING:
                return VisitStatus.PLANNED;
            case IN_PREPARATION:
            case SHIPPED:
                return VisitStatus.IN_PROGRESS;
            case DELIVERED:
                return VisitStatus.COMPLETED;
            case FAILED:
                return VisitStatus.MISSED;
            default:
                return null;
        }
    }

    /**
     * Get all the deliveries.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<DeliveryDTO> findAll(Pageable pageable) {
        log.debug("Request to get all Deliveries");
        return deliveryRepository.findAll(pageable).map(deliveryMapper::toDto);
    }

    /**
     * Get all the deliveries with eager load of many-to-many relationships.
     *
     * @return the list of entities.
     */
    public Page<DeliveryDTO> findAllWithEagerRelationships(Pageable pageable) {
        return deliveryRepository.findAllWithEagerRelationships(pageable).map(deliveryMapper::toDto);
    }

    /**
     * Get one delivery by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<DeliveryDTO> findOne(Long id) {
        log.debug("Request to get Delivery : {}", id);
        return deliveryRepository.findOneWithEagerRelationships(id).map(deliveryMapper::toDto);
    }

    /**
     * Delete the delivery by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        log.debug("Request to delete Delivery : {}", id);
        deliveryRepository.deleteById(id);
    }
}
