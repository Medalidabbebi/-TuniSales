package com.tunisales.platform.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import com.tunisales.platform.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class PerformanceScoreDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(PerformanceScoreDTO.class);
        PerformanceScoreDTO performanceScoreDTO1 = new PerformanceScoreDTO();
        performanceScoreDTO1.setId(1L);
        PerformanceScoreDTO performanceScoreDTO2 = new PerformanceScoreDTO();
        assertThat(performanceScoreDTO1).isNotEqualTo(performanceScoreDTO2);
        performanceScoreDTO2.setId(performanceScoreDTO1.getId());
        assertThat(performanceScoreDTO1).isEqualTo(performanceScoreDTO2);
        performanceScoreDTO2.setId(2L);
        assertThat(performanceScoreDTO1).isNotEqualTo(performanceScoreDTO2);
        performanceScoreDTO1.setId(null);
        assertThat(performanceScoreDTO1).isNotEqualTo(performanceScoreDTO2);
    }
}
