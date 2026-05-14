package com.tunisales.platform.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import com.tunisales.platform.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class ObjectiveDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(ObjectiveDTO.class);
        ObjectiveDTO objectiveDTO1 = new ObjectiveDTO();
        objectiveDTO1.setId(1L);
        ObjectiveDTO objectiveDTO2 = new ObjectiveDTO();
        assertThat(objectiveDTO1).isNotEqualTo(objectiveDTO2);
        objectiveDTO2.setId(objectiveDTO1.getId());
        assertThat(objectiveDTO1).isEqualTo(objectiveDTO2);
        objectiveDTO2.setId(2L);
        assertThat(objectiveDTO1).isNotEqualTo(objectiveDTO2);
        objectiveDTO1.setId(null);
        assertThat(objectiveDTO1).isNotEqualTo(objectiveDTO2);
    }
}
