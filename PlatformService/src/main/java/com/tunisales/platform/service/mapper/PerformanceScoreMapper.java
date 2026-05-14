package com.tunisales.platform.service.mapper;

import com.tunisales.platform.domain.PerformanceScore;
import com.tunisales.platform.service.dto.PerformanceScoreDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link PerformanceScore} and its DTO {@link PerformanceScoreDTO}.
 */
@Mapper(componentModel = "spring")
public interface PerformanceScoreMapper extends EntityMapper<PerformanceScoreDTO, PerformanceScore> {}
