package com.tunisales.platform.domain;

import static org.assertj.core.api.Assertions.assertThat;

import com.tunisales.platform.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class ClientScoreTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(ClientScore.class);
        ClientScore clientScore1 = new ClientScore();
        clientScore1.setId(1L);
        ClientScore clientScore2 = new ClientScore();
        clientScore2.setId(clientScore1.getId());
        assertThat(clientScore1).isEqualTo(clientScore2);
        clientScore2.setId(2L);
        assertThat(clientScore1).isNotEqualTo(clientScore2);
        clientScore1.setId(null);
        assertThat(clientScore1).isNotEqualTo(clientScore2);
    }
}
