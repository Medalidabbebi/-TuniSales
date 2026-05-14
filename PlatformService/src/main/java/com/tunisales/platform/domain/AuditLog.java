package com.tunisales.platform.domain;

import com.tunisales.platform.domain.enumeration.AuditAction;
import java.io.Serializable;
import java.time.ZonedDateTime;
import javax.persistence.*;
import javax.validation.constraints.*;
import org.hibernate.annotations.Type;

/**
 * A AuditLog.
 */
@Entity
@Table(name = "audit_log")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class AuditLog implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @Column(name = "tenant_id")
    private Long tenantId;

    @NotNull
    @Size(max = 100)
    @Column(name = "entity_type", length = 100, nullable = false)
    private String entityType;

    @Size(max = 36)
    @Column(name = "entity_id", length = 36)
    private String entityId;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "action", nullable = false)
    private AuditAction action;

    @Lob
    @Type(type = "org.hibernate.type.TextType")
    @Column(name = "before_json")
    private String beforeJson;

    @Lob
    @Type(type = "org.hibernate.type.TextType")
    @Column(name = "after_json")
    private String afterJson;

    @Size(max = 45)
    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Size(max = 500)
    @Column(name = "user_agent", length = 500)
    private String userAgent;

    @Size(max = 100)
    @Column(name = "performed_by_login", length = 100)
    private String performedByLogin;

    @NotNull
    @Column(name = "created_at", nullable = false)
    private ZonedDateTime createdAt;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public AuditLog id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getTenantId() {
        return this.tenantId;
    }

    public AuditLog tenantId(Long tenantId) {
        this.setTenantId(tenantId);
        return this;
    }

    public void setTenantId(Long tenantId) {
        this.tenantId = tenantId;
    }

    public String getEntityType() {
        return this.entityType;
    }

    public AuditLog entityType(String entityType) {
        this.setEntityType(entityType);
        return this;
    }

    public void setEntityType(String entityType) {
        this.entityType = entityType;
    }

    public String getEntityId() {
        return this.entityId;
    }

    public AuditLog entityId(String entityId) {
        this.setEntityId(entityId);
        return this;
    }

    public void setEntityId(String entityId) {
        this.entityId = entityId;
    }

    public AuditAction getAction() {
        return this.action;
    }

    public AuditLog action(AuditAction action) {
        this.setAction(action);
        return this;
    }

    public void setAction(AuditAction action) {
        this.action = action;
    }

    public String getBeforeJson() {
        return this.beforeJson;
    }

    public AuditLog beforeJson(String beforeJson) {
        this.setBeforeJson(beforeJson);
        return this;
    }

    public void setBeforeJson(String beforeJson) {
        this.beforeJson = beforeJson;
    }

    public String getAfterJson() {
        return this.afterJson;
    }

    public AuditLog afterJson(String afterJson) {
        this.setAfterJson(afterJson);
        return this;
    }

    public void setAfterJson(String afterJson) {
        this.afterJson = afterJson;
    }

    public String getIpAddress() {
        return this.ipAddress;
    }

    public AuditLog ipAddress(String ipAddress) {
        this.setIpAddress(ipAddress);
        return this;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    public String getUserAgent() {
        return this.userAgent;
    }

    public AuditLog userAgent(String userAgent) {
        this.setUserAgent(userAgent);
        return this;
    }

    public void setUserAgent(String userAgent) {
        this.userAgent = userAgent;
    }

    public String getPerformedByLogin() {
        return this.performedByLogin;
    }

    public AuditLog performedByLogin(String performedByLogin) {
        this.setPerformedByLogin(performedByLogin);
        return this;
    }

    public void setPerformedByLogin(String performedByLogin) {
        this.performedByLogin = performedByLogin;
    }

    public ZonedDateTime getCreatedAt() {
        return this.createdAt;
    }

    public AuditLog createdAt(ZonedDateTime createdAt) {
        this.setCreatedAt(createdAt);
        return this;
    }

    public void setCreatedAt(ZonedDateTime createdAt) {
        this.createdAt = createdAt;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof AuditLog)) {
            return false;
        }
        return id != null && id.equals(((AuditLog) o).id);
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "AuditLog{" +
            "id=" + getId() +
            ", tenantId=" + getTenantId() +
            ", entityType='" + getEntityType() + "'" +
            ", entityId='" + getEntityId() + "'" +
            ", action='" + getAction() + "'" +
            ", beforeJson='" + getBeforeJson() + "'" +
            ", afterJson='" + getAfterJson() + "'" +
            ", ipAddress='" + getIpAddress() + "'" +
            ", userAgent='" + getUserAgent() + "'" +
            ", performedByLogin='" + getPerformedByLogin() + "'" +
            ", createdAt='" + getCreatedAt() + "'" +
            "}";
    }
}
