package com.tunisales.business.service.mapper;

import com.tunisales.business.domain.Claim;
import com.tunisales.business.service.dto.ClaimDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link Claim} and its DTO {@link ClaimDTO}.
 */
@Mapper(componentModel = "spring")
public interface ClaimMapper extends EntityMapper<ClaimDTO, Claim> {}
