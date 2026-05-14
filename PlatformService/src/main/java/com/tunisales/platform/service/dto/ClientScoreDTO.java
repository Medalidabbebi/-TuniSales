package com.tunisales.platform.service.dto;

import com.tunisales.platform.domain.enumeration.ScoreClassification;
import java.io.Serializable;
import java.time.ZonedDateTime;
import java.util.Objects;
import javax.persistence.Lob;
import javax.validation.constraints.*;

/**
 * A DTO for the {@link com.tunisales.platform.domain.ClientScore} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class ClientScoreDTO implements Serializable {

    private Long id;

    @NotNull
    private Long tenantId;

    @NotNull
    private Long clientId;

    @Size(max = 255)
    private String clientName;

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

    public Long getClientId() {
        return clientId;
    }

    public void setClientId(Long clientId) {
        this.clientId = clientId;
    }

    public String getClientName() {
        return clientName;
    }

    public void setClientName(String clientName) {
        this.clientName = clientName;
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
        if (!(o instanceof ClientScoreDTO)) {
            return false;
        }

        ClientScoreDTO clientScoreDTO = (ClientScoreDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, clientScoreDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "ClientScoreDTO{" +
            "id=" + getId() +
            ", tenantId=" + getTenantId() +
            ", clientId=" + getClientId() +
            ", clientName='" + getClientName() + "'" +
            ", period='" + getPeriod() + "'" +
            ", score=" + getScore() +
            ", classification='" + getClassification() + "'" +
            ", breakdownJson='" + getBreakdownJson() + "'" +
            ", calculatedAt='" + getCalculatedAt() + "'" +
            "}";
    }
}
