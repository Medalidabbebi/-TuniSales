package com.tunisales.platform.domain;

import com.tunisales.platform.domain.enumeration.MetricType;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.ZonedDateTime;
import javax.persistence.*;
import javax.validation.constraints.*;

/**
 * A Objective.
 */
@Entity
@Table(name = "objective")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Objective implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    @NotNull
    @Size(max = 100)
    @Column(name = "assigned_to_login", length = 100, nullable = false)
    private String assignedToLogin;

    @NotNull
    @Size(max = 7)
    @Column(name = "period", length = 7, nullable = false)
    private String period;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "metric_type", nullable = false)
    private MetricType metricType;

    @NotNull
    @DecimalMin(value = "0")
    @Column(name = "target_value", precision = 21, scale = 2, nullable = false)
    private BigDecimal targetValue;

    @DecimalMin(value = "0")
    @Column(name = "achieved_value", precision = 21, scale = 2)
    private BigDecimal achievedValue;

    @NotNull
    @Column(name = "created_at", nullable = false)
    private ZonedDateTime createdAt;

    @Column(name = "updated_at")
    private ZonedDateTime updatedAt;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public Objective id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getTenantId() {
        return this.tenantId;
    }

    public Objective tenantId(Long tenantId) {
        this.setTenantId(tenantId);
        return this;
    }

    public void setTenantId(Long tenantId) {
        this.tenantId = tenantId;
    }

    public String getAssignedToLogin() {
        return this.assignedToLogin;
    }

    public Objective assignedToLogin(String assignedToLogin) {
        this.setAssignedToLogin(assignedToLogin);
        return this;
    }

    public void setAssignedToLogin(String assignedToLogin) {
        this.assignedToLogin = assignedToLogin;
    }

    public String getPeriod() {
        return this.period;
    }

    public Objective period(String period) {
        this.setPeriod(period);
        return this;
    }

    public void setPeriod(String period) {
        this.period = period;
    }

    public MetricType getMetricType() {
        return this.metricType;
    }

    public Objective metricType(MetricType metricType) {
        this.setMetricType(metricType);
        return this;
    }

    public void setMetricType(MetricType metricType) {
        this.metricType = metricType;
    }

    public BigDecimal getTargetValue() {
        return this.targetValue;
    }

    public Objective targetValue(BigDecimal targetValue) {
        this.setTargetValue(targetValue);
        return this;
    }

    public void setTargetValue(BigDecimal targetValue) {
        this.targetValue = targetValue;
    }

    public BigDecimal getAchievedValue() {
        return this.achievedValue;
    }

    public Objective achievedValue(BigDecimal achievedValue) {
        this.setAchievedValue(achievedValue);
        return this;
    }

    public void setAchievedValue(BigDecimal achievedValue) {
        this.achievedValue = achievedValue;
    }

    public ZonedDateTime getCreatedAt() {
        return this.createdAt;
    }

    public Objective createdAt(ZonedDateTime createdAt) {
        this.setCreatedAt(createdAt);
        return this;
    }

    public void setCreatedAt(ZonedDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public ZonedDateTime getUpdatedAt() {
        return this.updatedAt;
    }

    public Objective updatedAt(ZonedDateTime updatedAt) {
        this.setUpdatedAt(updatedAt);
        return this;
    }

    public void setUpdatedAt(ZonedDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Objective)) {
            return false;
        }
        return id != null && id.equals(((Objective) o).id);
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Objective{" +
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
