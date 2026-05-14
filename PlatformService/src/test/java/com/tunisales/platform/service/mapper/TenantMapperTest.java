package com.tunisales.platform.service.mapper;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class TenantMapperTest {

    private TenantMapper tenantMapper;

    @BeforeEach
    public void setUp() {
        tenantMapper = new TenantMapperImpl();
    }
}
