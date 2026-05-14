package com.tunisales.platform.service.dto;

import com.tunisales.platform.domain.enumeration.ScoreClassification;
import java.io.Serializable;
import java.time.ZonedDateTime;
import java.util.Objects;
import javax.persistence.Lob;
import javax.validation.constraints.*;

/**
 * A DTO for the {@link com.tunisales.platform.domain.PerformanceScore} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class PerformanceScoreDTO implements Serializable {

    private Long id;

    @NotNull
    private Long tenantId;

    @NotNull
    @Size(max = 100)
    private String userLogin;

    @NotNull
    @Size(max = 7)
    private String period;

    @NotNull
    @Min(value = 0)
    @Max(value = 100)
    private Integer score;

    @NotNull
    private ScoreClassification classification;

    @Lob
    private String breakdownJson;

    private Integer deltaVsPrevious;

    @NotNull
    private ZonedDateTime calculatedAt;

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

    public String getUserLogin() {
        return userLogin;
    }

    public void setUserLogin(String userLogin) {
        this.userLogin = userLogin;
    }

    public String getPeriod() {
        return period;
    }

    public void setPeriod(String period) {
        this.period = period;
    }

    public Integer getScore() {
        return score;
    }

    public void setScore(Integer score) {
        this.score = score;
    }

    public ScoreClassification getClassification() {
        return classification;
    }

    public void setClassification(ScoreClassification classification) {
        this.classification = classification;
    }

    public String getBreakdownJson() {
        return breakdownJson;
    }

    public void setBreakdownJson(String breakdownJson) {
        this.breakdownJson = breakdownJson;
    }

    public Integer getDeltaVsPrevious() {
        return deltaVsPrevious;
    }

    public void setDeltaVsPrevious(Integer deltaVsPrevious) {
        this.deltaVsPrevious = deltaVsPrevious;
    }

    public ZonedDateTime getCalculatedAt() {
        return calculatedAt;
    }

    public void setCalculatedAt(ZonedDateTime calculatedAt) {
        this.calculatedAt = calculatedAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof PerformanceScoreDTO)) {
            return false;
        }

        PerformanceScoreDTO performanceScoreDTO = (PerformanceScoreDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, performanceScoreDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "PerformanceScoreDTO{" +
            "id=" + getId() +
            ", tenantId=" + getTenantId() +
            ", userLogin='" + getUserLogin() + "'" +
            ", period='" + getPeriod() + "'" +
            ", score=" + getScore() +
            ", classification='" + getClassification() + "'" +
            ", breakdownJson='" + getBreakdownJson() + "'" +
            ", deltaVsPrevious=" + getDeltaVsPrevious() +
            ", calculatedAt='" + getCalculatedAt() + "'" +
            "}";
    }
}
