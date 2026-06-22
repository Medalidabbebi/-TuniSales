package com.tunisales.business.service.mapper;

import com.tunisales.business.domain.Delivery;
import com.tunisales.business.domain.Mission;
import com.tunisales.business.domain.Order;
import com.tunisales.business.domain.Visit;
import com.tunisales.business.service.dto.DeliveryDTO;
import com.tunisales.business.service.dto.MissionDTO;
import com.tunisales.business.service.dto.OrderDTO;
import com.tunisales.business.service.dto.VisitDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link Delivery} and its DTO {@link DeliveryDTO}.
 */
@Mapper(componentModel = "spring")
public interface DeliveryMapper extends EntityMapper<DeliveryDTO, Delivery> {
    @Mapping(target = "order", source = "order", qualifiedByName = "orderOrderNumber")
    @Mapping(target = "mission", source = "mission", qualifiedByName = "missionTitle")
    @Mapping(target = "visit", source = "visit", qualifiedByName = "visitObjective")
    DeliveryDTO toDto(Delivery s);

    @Named("orderOrderNumber")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "orderNumber", source = "orderNumber")
    OrderDTO toDtoOrderOrderNumber(Order order);

    @Named("missionTitle")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "title", source = "title")
    MissionDTO toDtoMissionTitle(Mission mission);

    @Named("visitObjective")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "objective", source = "objective")
    VisitDTO toDtoVisitObjective(Visit visit);
}
