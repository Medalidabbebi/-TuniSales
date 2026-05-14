package com.tunisales.platform.service.dto;

import com.tunisales.platform.domain.enumeration.MetricType;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.Objects;
import javax.validation.constraints.*;

/**
 * A DTO for the {@link com.tunisales.platform.domain.Objective} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class ObjectiveDTO implements Serializable {

    private Long id;

    @NotNull
    private Long tenantId;

    @NotNull
    @Size(max = 100)
    private String assignedToLogin;

    @NotNull
    @Size(max = 7)
    private String period;

    @NotNull
    private MetricType metricType;

    @NotNull
    @DecimalMin(value = "0")
    private BigDecimal targetValue;

    @DecimalMin(value = "0")
    private BigDecimal achievedValue;

    @NotNull
    private ZonedDateTime createdAt;

    private ZonedDateTime updatedAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getTenantId() {
        return tenantId;
    }

    public void setTenantId(Long tenantId) {
        this.tenantId = tenantId;
    }

    public String getAssignedToLogin() {
        return assignedToLogin;
    }

    public void setAssignedToLogin(String assignedToLogin) {
        this.assignedToLogin = assignedToLogin;
    }

    public String getPeriod() {
        return period;
    }

    public void setPeriod(String period) {
        this.period = period;
    }

    public MetricType getMetricType() {
        return metricType;
    }

    public void setMetricType(MetricType metricType) {
        this.metricType = metricType;
    }

    public BigDecimal getTargetValue() {
        return targetValue;
    }

    public void setTargetValue(BigDecimal targetValue) {
        this.targetValue = targetValue;
    }

    public BigDecimal getAchievedValue() {
        return achievedValue;
    }

    public void setAchievedValue(BigDecimal achievedValue) {
        this.achievedValue = achievedValue;
    }

    public ZonedDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(ZonedDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public ZonedDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(ZonedDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof ObjectiveDTO)) {
            return false;
        }

        ObjectiveDTO objectiveDTO = (ObjectiveDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, objectiveDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "ObjectiveDTO{" +
            "id=" + getId() +
            ", tenantId=" + getTenantId() +
            ", assignedToLogin='" + getAssignedToLogin() + "'" +
            ", period='" + getPeriod() + "'" +
            ", metricType='" + getMetricType() + "'" +
            ", targetValue=" + getTargetValue() +
            ", achievedValue=" + getAchievedValue() +
            ", createdAt='" + getCreatedAt() + "'" +
            ", updatedAt='" + getUpdatedAt() + "'" +
            "}";
    }
}
