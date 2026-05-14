package com.tunisales.platform.service.mapper;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class ClientScoreMapperTest {

    private ClientScoreMapper clientScoreMapper;

    @BeforeEach
    public void setUp() {
        clientScoreMapper = new ClientScoreMapperImpl();
    }
}
