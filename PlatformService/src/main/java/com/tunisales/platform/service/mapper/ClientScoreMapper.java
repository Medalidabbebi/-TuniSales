package com.tunisales.platform.service.mapper;

import com.tunisales.platform.domain.ClientScore;
import com.tunisales.platform.service.dto.ClientScoreDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link ClientScore} and its DTO {@link ClientScoreDTO}.
 */
@Mapper(componentModel = "spring")
public interface ClientScoreMapper extends EntityMapper<ClientScoreDTO, ClientScore> {}
