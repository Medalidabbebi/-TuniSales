package com.tunisales.platform.service.mapper;

import com.tunisales.platform.domain.Objective;
import com.tunisales.platform.service.dto.ObjectiveDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link Objective} and its DTO {@link ObjectiveDTO}.
 */
@Mapper(componentModel = "spring")
public interface ObjectiveMapper extends EntityMapper<ObjectiveDTO, Objective> {}
