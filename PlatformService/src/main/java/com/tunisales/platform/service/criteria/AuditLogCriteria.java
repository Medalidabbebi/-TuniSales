package com.tunisales.platform.service.criteria;

import com.tunisales.platform.domain.enumeration.AuditAction;
import java.io.Serializable;
import java.util.Objects;
import org.springdoc.api.annotations.ParameterObject;
import tech.jhipster.service.Criteria;
import tech.jhipster.service.filter.*;

/**
 * Criteria class for the {@link com.tunisales.platform.domain.AuditLog} entity. This class is used
 * in {@link com.tunisales.platform.web.rest.AuditLogResource} to receive all the possible filtering options from
 * the Http GET request parameters.
 * For example the following could be a valid request:
 * {@code /audit-logs?id.greaterThan=5&attr1.contains=something&attr2.specified=false}
 * As Spring is unable to properly convert the types, unless specific {@link Filter} class are used, we need to use
 * fix type specific filters.
 */
@ParameterObject
@SuppressWarnings("common-java:DuplicatedBlocks")
public class AuditLogCriteria implements Serializable, Criteria {

    /**
     * Class for filtering AuditAction
     */
    public static class AuditActionFilter extends Filter<AuditAction> {

        public AuditActionFilter() {}

        public AuditActionFilter(AuditActionFilter filter) {
            super(filter);
        }

        @Override
        public AuditActionFilter copy() {
            return new AuditActionFilter(this);
        }
    }

    private static final long serialVersionUID = 1L;

    private LongFilter id;

    private LongFilter tenantId;

    private StringFilter entityType;

    private StringFilter entityId;

    private AuditActionFilter action;

    private StringFilter ipAddress;

    private StringFilter userAgent;

    private StringFilter performedByLogin;

    private ZonedDateTimeFilter createdAt;

    private Boolean distinct;

    public AuditLogCriteria() {}

    public AuditLogCriteria(AuditLogCriteria other) {
        this.id = other.id == null ? null : other.id.copy();
        this.tenantId = other.tenantId == null ? null : other.tenantId.copy();
        this.entityType = other.entityType == null ? null : other.entityType.copy();
        this.entityId = other.entityId == null ? null : other.entityId.copy();
        this.action = other.action == null ? null : other.action.copy();
        this.ipAddress = other.ipAddress == null ? null : other.ipAddress.copy();
        this.userAgent = other.userAgent == null ? null : other.userAgent.copy();
        this.performedByLogin = other.performedByLogin == null ? null : other.performedByLogin.copy();
        this.createdAt = other.createdAt == null ? null : other.createdAt.copy();
        this.distinct = other.distinct;
    }

    @Override
    public AuditLogCriteria copy() {
        return new AuditLogCriteria(this);
    }

    public LongFilter getId() {
        return id;
    }

    public LongFilter id() {
        if (id == null) {
            id = new LongFilter();
        }
        return id;
    }

    public void setId(LongFilter id) {
        this.id = id;
    }

    public LongFilter getTenantId() {
        return tenantId;
    }

    public LongFilter tenantId() {
        if (tenantId == null) {
            tenantId = new LongFilter();
        }
        return tenantId;
    }

    public void setTenantId(LongFilter tenantId) {
        this.tenantId = tenantId;
    }

    public StringFilter getEntityType() {
        return entityType;
    }

    public StringFilter entityType() {
        if (entityType == null) {
            entityType = new StringFilter();
        }
        return entityType;
    }

    public void setEntityType(StringFilter entityType) {
        this.entityType = entityType;
    }

    public StringFilter getEntityId() {
        return entityId;
    }

    public StringFilter entityId() {
        if (entityId == null) {
            entityId = new StringFilter();
        }
        return entityId;
    }

    public void setEntityId(StringFilter entityId) {
        this.entityId = entityId;
    }

    public AuditActionFilter getAction() {
        return action;
    }

    public AuditActionFilter action() {
        if (action == null) {
            action = new AuditActionFilter();
        }
        return action;
    }

    public void setAction(AuditActionFilter action) {
        this.action = action;
    }

    public StringFilter getIpAddress() {
        return ipAddress;
    }

    public StringFilter ipAddress() {
        if (ipAddress == null) {
            ipAddress = new StringFilter();
        }
        return ipAddress;
    }

    public void setIpAddress(StringFilter ipAddress) {
        this.ipAddress = ipAddress;
    }

    public StringFilter getUserAgent() {
        return userAgent;
    }

    public StringFilter userAgent() {
        if (userAgent == null) {
            userAgent = new StringFilter();
        }
        return userAgent;
    }

    public void setUserAgent(StringFilter userAgent) {
        this.userAgent = userAgent;
    }

    public StringFilter getPerformedByLogin() {
        return performedByLogin;
    }

    public StringFilter performedByLogin() {
        if (performedByLogin == null) {
            performedByLogin = new StringFilter();
        }
        return performedByLogin;
    }

    public void setPerformedByLogin(StringFilter performedByLogin) {
        this.performedByLogin = performedByLogin;
    }

    public ZonedDateTimeFilter getCreatedAt() {
        return createdAt;
    }

    public ZonedDateTimeFilter createdAt() {
        if (createdAt == null) {
            createdAt = new ZonedDateTimeFilter();
        }
        return createdAt;
    }

    public void setCreatedAt(ZonedDateTimeFilter createdAt) {
        this.createdAt = createdAt;
    }

    public Boolean getDistinct() {
        return distinct;
    }

    public void setDistinct(Boolean distinct) {
        this.distinct = distinct;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        final AuditLogCriteria that = (AuditLogCriteria) o;
        return (
            Objects.equals(id, that.id) &&
            Objects.equals(tenantId, that.tenantId) &&
            Objects.equals(entityType, that.entityType) &&
            Objects.equals(entityId, that.entityId) &&
            Objects.equals(action, that.action) &&
            Objects.equals(ipAddress, that.ipAddress) &&
            Objects.equals(userAgent, that.userAgent) &&
            Objects.equals(performedByLogin, that.performedByLogin) &&
            Objects.equals(createdAt, that.createdAt) &&
            Objects.equals(distinct, that.distinct)
        );
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, tenantId, entityType, entityId, action, ipAddress, userAgent, performedByLogin, createdAt, distinct);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "AuditLogCriteria{" +
            (id != null ? "id=" + id + ", " : "") +
            (tenantId != null ? "tenantId=" + tenantId + ", " : "") +
            (entityType != null ? "entityType=" + entityType + ", " : "") +
            (entityId != null ? "entityId=" + entityId + ", " : "") +
            (action != null ? "action=" + action + ", " : "") +
            (ipAddress != null ? "ipAddress=" + ipAddress + ", " : "") +
            (userAgent != null ? "userAgent=" + userAgent + ", " : "") +
            (performedByLogin != null ? "performedByLogin=" + performedByLogin + ", " : "") +
            (createdAt != null ? "createdAt=" + createdAt + ", " : "") +
            (distinct != null ? "distinct=" + distinct + ", " : "") +
            "}";
    }
}
