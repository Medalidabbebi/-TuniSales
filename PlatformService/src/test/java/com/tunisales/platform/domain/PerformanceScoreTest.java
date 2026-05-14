package com.tunisales.platform.domain;

import static org.assertj.core.api.Assertions.assertThat;

import com.tunisales.platform.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class PerformanceScoreTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(PerformanceScore.class);
        PerformanceScore performanceScore1 = new PerformanceScore();
        performanceScore1.setId(1L);
        PerformanceScore performanceScore2 = new PerformanceScore();
        performanceScore2.setId(performanceScore1.getId());
        assertThat(performanceScore1).isEqualTo(performanceScore2);
        performanceScore2.setId(2L);
        assertThat(performanceScore1).isNotEqualTo(performanceScore2);
        performanceScore1.setId(null);
        assertThat(performanceScore1).isNotEqualTo(performanceScore2);
    }
}
