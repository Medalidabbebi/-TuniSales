package com.tunisales.platform.service.criteria;

import com.tunisales.platform.domain.enumeration.MetricType;
import java.io.Serializable;
import java.util.Objects;
import org.springdoc.api.annotations.ParameterObject;
import tech.jhipster.service.Criteria;
import tech.jhipster.service.filter.*;

/**
 * Criteria class for the {@link com.tunisales.platform.domain.Objective} entity. This class is used
 * in {@link com.tunisales.platform.web.rest.ObjectiveResource} to receive all the possible filtering options from
 * the Http GET request parameters.
 * For example the following could be a valid request:
 * {@code /objectives?id.greaterThan=5&attr1.contains=something&attr2.specified=false}
 * As Spring is unable to properly convert the types, unless specific {@link Filter} class are used, we need to use
 * fix type specific filters.
 */
@ParameterObject
@SuppressWarnings("common-java:DuplicatedBlocks")
public class ObjectiveCriteria implements Serializable, Criteria {

    /**
     * Class for filtering MetricType
     */
    public static class MetricTypeFilter extends Filter<MetricType> {

        public MetricTypeFilter() {}

        public MetricTypeFilter(MetricTypeFilter filter) {
            super(filter);
        }

        @Override
        public MetricTypeFilter copy() {
            return new MetricTypeFilter(this);
        }
    }

    private static final long serialVersionUID = 1L;

    private LongFilter id;

    private LongFilter tenantId;

    private StringFilter assignedToLogin;

    private StringFilter period;

    private MetricTypeFilter metricType;

    private BigDecimalFilter targetValue;

    private BigDecimalFilter achievedValue;

    private ZonedDateTimeFilter createdAt;

    private ZonedDateTimeFilter updatedAt;

    private Boolean distinct;

    public ObjectiveCriteria() {}

    public ObjectiveCriteria(ObjectiveCriteria other) {
        this.id = other.id == null ? null : other.id.copy();
        this.tenantId = other.tenantId == null ? null : other.tenantId.copy();
        this.assignedToLogin = other.assignedToLogin == null ? null : other.assignedToLogin.copy();
        this.period = other.period == null ? null : other.period.copy();
        this.metricType = other.metricType == null ? null : other.metricType.copy();
        this.targetValue = other.targetValue == null ? null : other.targetValue.copy();
        this.achievedValue = other.achievedValue == null ? null : other.achievedValue.copy();
        this.createdAt = other.createdAt == null ? null : other.createdAt.copy();
        this.updatedAt = other.updatedAt == null ? null : other.updatedAt.copy();
        this.distinct = other.distinct;
    }

    @Override
    public ObjectiveCriteria copy() {
        return new ObjectiveCriteria(this);
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

    public StringFilter getAssignedToLogin() {
        return assignedToLogin;
    }

    public StringFilter assignedToLogin() {
        if (assignedToLogin == null) {
            assignedToLogin = new StringFilter();
        }
        return assignedToLogin;
    }

    public void setAssignedToLogin(StringFilter assignedToLogin) {
        this.assignedToLogin = assignedToLogin;
    }

    public StringFilter getPeriod() {
        return period;
    }

    public StringFilter period() {
        if (period == null) {
            period = new StringFilter();
        }
        return period;
    }

    public void setPeriod(StringFilter period) {
        this.period = period;
    }

    public MetricTypeFilter getMetricType() {
        return metricType;
    }

    public MetricTypeFilter metricType() {
        if (metricType == null) {
            metricType = new MetricTypeFilter();
        }
        return metricType;
    }

    public void setMetricType(MetricTypeFilter metricType) {
        this.metricType = metricType;
    }

    public BigDecimalFilter getTargetValue() {
        return targetValue;
    }

    public BigDecimalFilter targetValue() {
        if (targetValue == null) {
            targetValue = new BigDecimalFilter();
        }
        return targetValue;
    }

    public void setTargetValue(BigDecimalFilter targetValue) {
        this.targetValue = targetValue;
    }

    public BigDecimalFilter getAchievedValue() {
        return achievedValue;
    }

    public BigDecimalFilter achievedValue() {
        if (achievedValue == null) {
            achievedValue = new BigDecimalFilter();
        }
        return achievedValue;
    }

    public void setAchievedValue(BigDecimalFilter achievedValue) {
        this.achievedValue = achievedValue;
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

    public ZonedDateTimeFilter getUpdatedAt() {
        return updatedAt;
    }

    public ZonedDateTimeFilter updatedAt() {
        if (updatedAt == null) {
            updatedAt = new ZonedDateTimeFilter();
        }
        return updatedAt;
    }

    public void setUpdatedAt(ZonedDateTimeFilter updatedAt) {
        this.updatedAt = updatedAt;
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
        final ObjectiveCriteria that = (ObjectiveCriteria) o;
        return (
            Objects.equals(id, that.id) &&
            Objects.equals(tenantId, that.tenantId) &&
            Objects.equals(assignedToLogin, that.assignedToLogin) &&
            Objects.equals(period, that.period) &&
            Objects.equals(metricType, that.metricType) &&
            Objects.equals(targetValue, that.targetValue) &&
            Objects.equals(achievedValue, that.achievedValue) &&
            Objects.equals(createdAt, that.createdAt) &&
            Objects.equals(updatedAt, that.updatedAt) &&
            Objects.equals(distinct, that.distinct)
        );
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, tenantId, assignedToLogin, period, metricType, targetValue, achievedValue, createdAt, updatedAt, distinct);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "ObjectiveCriteria{" +
            (id != null ? "id=" + id + ", " : "") +
            (tenantId != null ? "tenantId=" + tenantId + ", " : "") +
            (assignedToLogin != null ? "assignedToLogin=" + assignedToLogin + ", " : "") +
            (period != null ? "period=" + period + ", " : "") +
            (metricType != null ? "metricType=" + metricType + ", " : "") +
            (targetValue != null ? "targetValue=" + targetValue + ", " : "") +
            (achievedValue != null ? "achievedValue=" + achievedValue + ", " : "") +
            (createdAt != null ? "createdAt=" + createdAt + ", " : "") +
            (updatedAt != null ? "updatedAt=" + updatedAt + ", " : "") +
            (distinct != null ? "distinct=" + distinct + ", " : "") +
            "}";
    }
}
