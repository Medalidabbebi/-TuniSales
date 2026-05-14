package com.tunisales.platform.service.mapper;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class ObjectiveMapperTest {

    private ObjectiveMapper objectiveMapper;

    @BeforeEach
    public void setUp() {
        objectiveMapper = new ObjectiveMapperImpl();
    }
}
