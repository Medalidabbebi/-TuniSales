package com.tunisales.platform.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import com.tunisales.platform.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class ClientScoreDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(ClientScoreDTO.class);
        ClientScoreDTO clientScoreDTO1 = new ClientScoreDTO();
        clientScoreDTO1.setId(1L);
        ClientScoreDTO clientScoreDTO2 = new ClientScoreDTO();
        assertThat(clientScoreDTO1).isNotEqualTo(clientScoreDTO2);
        clientScoreDTO2.setId(clientScoreDTO1.getId());
        assertThat(clientScoreDTO1).isEqualTo(clientScoreDTO2);
        clientScoreDTO2.setId(2L);
        assertThat(clientScoreDTO1).isNotEqualTo(clientScoreDTO2);
        clientScoreDTO1.setId(null);
        assertThat(clientScoreDTO1).isNotEqualTo(clientScoreDTO2);
    }
}
