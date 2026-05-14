package com.tunisales.platform.service.mapper;

import com.tunisales.platform.domain.Document;
import com.tunisales.platform.service.dto.DocumentDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link Document} and its DTO {@link DocumentDTO}.
 */
@Mapper(componentModel = "spring")
public interface DocumentMapper extends EntityMapper<DocumentDTO, Document> {}
