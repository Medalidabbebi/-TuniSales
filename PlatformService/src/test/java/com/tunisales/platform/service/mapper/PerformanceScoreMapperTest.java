package com.tunisales.platform.service.mapper;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class PerformanceScoreMapperTest {

    private PerformanceScoreMapper performanceScoreMapper;

    @BeforeEach
    public void setUp() {
        performanceScoreMapper = new PerformanceScoreMapperImpl();
    }
}
