package com.tunisales.platform.service.mapper;

import com.tunisales.platform.domain.AuditLog;
import com.tunisales.platform.service.dto.AuditLogDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link AuditLog} and its DTO {@link AuditLogDTO}.
 */
@Mapper(componentModel = "spring")
public interface AuditLogMapper extends EntityMapper<AuditLogDTO, AuditLog> {}
