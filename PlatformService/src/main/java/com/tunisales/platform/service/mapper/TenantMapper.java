package com.tunisales.platform.service.mapper;

import com.tunisales.platform.domain.Tenant;
import com.tunisales.platform.service.dto.TenantDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link Tenant} and its DTO {@link TenantDTO}.
 */
@Mapper(componentModel = "spring")
public interface TenantMapper extends EntityMapper<TenantDTO, Tenant> {}
