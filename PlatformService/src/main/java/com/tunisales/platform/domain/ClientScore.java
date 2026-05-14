package com.tunisales.platform.domain;

import com.tunisales.platform.domain.enumeration.ScoreClassification;
import java.io.Serializable;
import java.time.ZonedDateTime;
import javax.persistence.*;
import javax.validation.constraints.*;
import org.hibernate.annotations.Type;

/**
 * A ClientScore.
 */
@Entity
@Table(name = "client_score")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class ClientScore implements Serializable {

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
    @Column(name = "client_id", nullable = false)
    private Long clientId;

    @Size(max = 255)
    @Column(name = "client_name", length = 255)
    private String clientName;

    @NotNull
    @Size(max = 7)
    @Column(name = "period", length = 7, nullable = false)
    private String period;

    @NotNull
    @Min(value = 0)
    @Max(value = 100)
    @Column(name = "score", nullable = false)
    private Integer score;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "classification", nullable = false)
    private ScoreClassification classification;

    @Lob
    @Type(type = "org.hibernate.type.TextType")
    @Column(name = "breakdown_json")
    private String breakdownJson;

    @NotNull
    @Column(name = "calculated_at", nullable = false)
    private ZonedDateTime calculatedAt;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public ClientScore id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getTenantId() {
        return this.tenantId;
    }

    public ClientScore tenantId(Long tenantId) {
        this.setTenantId(tenantId);
        return this;
    }

    public void setTenantId(Long tenantId) {
        this.tenantId = tenantId;
    }

    public Long getClientId() {
        return this.clientId;
    }

    public ClientScore clientId(Long clientId) {
        this.setClientId(clientId);
        return this;
    }

    public void setClientId(Long clientId) {
        this.clientId = clientId;
    }

    public String getClientName() {
        return this.clientName;
    }

    public ClientScore clientName(String clientName) {
        this.setClientName(clientName);
        return this;
    }

    public void setClientName(String clientName) {
        this.clientName = clientName;
    }

    public String getPeriod() {
        return this.period;
    }

    public ClientScore period(String period) {
        this.setPeriod(period);
        return this;
    }

    public void setPeriod(String period) {
        this.period = period;
    }

    public Integer getScore() {
        return this.score;
    }

    public ClientScore score(Integer score) {
        this.setScore(score);
        return this;
    }

    public void setScore(Integer score) {
        this.score = score;
    }

    public ScoreClassification getClassification() {
        return this.classification;
    }

    public ClientScore classification(ScoreClassification classification) {
        this.setClassification(classification);
        return this;
    }

    public void setClassification(ScoreClassification classification) {
        this.classification = classification;
    }

    public String getBreakdownJson() {
        return this.breakdownJson;
    }

    public ClientScore breakdownJson(String breakdownJson) {
        this.setBreakdownJson(breakdownJson);
        return this;
    }

    public void setBreakdownJson(String breakdownJson) {
        this.breakdownJson = breakdownJson;
    }

    public ZonedDateTime getCalculatedAt() {
        return this.calculatedAt;
    }

    public ClientScore calculatedAt(ZonedDateTime calculatedAt) {
        this.setCalculatedAt(calculatedAt);
        return this;
    }

    public void setCalculatedAt(ZonedDateTime calculatedAt) {
        this.calculatedAt = calculatedAt;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof ClientScore)) {
            return false;
        }
        return id != null && id.equals(((ClientScore) o).id);
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "ClientScore{" +
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
