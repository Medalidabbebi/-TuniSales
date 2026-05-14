package com.tunisales.platform.domain;

import static org.assertj.core.api.Assertions.assertThat;

import com.tunisales.platform.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class AuditLogTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(AuditLog.class);
        AuditLog auditLog1 = new AuditLog();
        auditLog1.setId(1L);
        AuditLog auditLog2 = new AuditLog();
        auditLog2.setId(auditLog1.getId());
        assertThat(auditLog1).isEqualTo(auditLog2);
        auditLog2.setId(2L);
        assertThat(auditLog1).isNotEqualTo(auditLog2);
        auditLog1.setId(null);
        assertThat(auditLog1).isNotEqualTo(auditLog2);
    }
}
