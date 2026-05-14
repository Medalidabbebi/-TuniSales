package com.tunisales.platform.service.criteria;

import com.tunisales.platform.domain.enumeration.ScoreClassification;
import java.io.Serializable;
import java.util.Objects;
import org.springdoc.api.annotations.ParameterObject;
import tech.jhipster.service.Criteria;
import tech.jhipster.service.filter.*;

/**
 * Criteria class for the {@link com.tunisales.platform.domain.ClientScore} entity. This class is used
 * in {@link com.tunisales.platform.web.rest.ClientScoreResource} to receive all the possible filtering options from
 * the Http GET request parameters.
 * For example the following could be a valid request:
 * {@code /client-scores?id.greaterThan=5&attr1.contains=something&attr2.specified=false}
 * As Spring is unable to properly convert the types, unless specific {@link Filter} class are used, we need to use
 * fix type specific filters.
 */
@ParameterObject
@SuppressWarnings("common-java:DuplicatedBlocks")
public class ClientScoreCriteria implements Serializable, Criteria {

    /**
     * Class for filtering ScoreClassification
     */
    public static class ScoreClassificationFilter extends Filter<ScoreClassification> {

        public ScoreClassificationFilter() {}

        public ScoreClassificationFilter(ScoreClassificationFilter filter) {
            super(filter);
        }

        @Override
        public ScoreClassificationFilter copy() {
            return new ScoreClassificationFilter(this);
        }
    }

    private static final long serialVersionUID = 1L;

    private LongFilter id;

    private LongFilter tenantId;

    private LongFilter clientId;

    private StringFilter clientName;

    private StringFilter period;

    private IntegerFilter score;

    private ScoreClassificationFilter classification;

    private ZonedDateTimeFilter calculatedAt;

    private Boolean distinct;

    public ClientScoreCriteria() {}

    public ClientScoreCriteria(ClientScoreCriteria other) {
        this.id = other.id == null ? null : other.id.copy();
        this.tenantId = other.tenantId == null ? null : other.tenantId.copy();
        this.clientId = other.clientId == null ? null : other.clientId.copy();
        this.clientName = other.clientName == null ? null : other.clientName.copy();
        this.period = other.period == null ? null : other.period.copy();
        this.score = other.score == null ? null : other.score.copy();
        this.classification = other.classification == null ? null : other.classification.copy();
        this.calculatedAt = other.calculatedAt == null ? null : other.calculatedAt.copy();
        this.distinct = other.distinct;
    }

    @Override
    public ClientScoreCriteria copy() {
        return new ClientScoreCriteria(this);
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

    public LongFilter getClientId() {
        return clientId;
    }

    public LongFilter clientId() {
        if (clientId == null) {
            clientId = new LongFilter();
        }
        return clientId;
    }

    public void setClientId(LongFilter clientId) {
        this.clientId = clientId;
    }

    public StringFilter getClientName() {
        return clientName;
    }

    public StringFilter clientName() {
        if (clientName == null) {
            clientName = new StringFilter();
        }
        return clientName;
    }

    public void setClientName(StringFilter clientName) {
        this.clientName = clientName;
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

    public IntegerFilter getScore() {
        return score;
    }

    public IntegerFilter score() {
        if (score == null) {
            score = new IntegerFilter();
        }
        return score;
    }

    public void setScore(IntegerFilter score) {
        this.score = score;
    }

    public ScoreClassificationFilter getClassification() {
        return classification;
    }

    public ScoreClassificationFilter classification() {
        if (classification == null) {
            classification = new ScoreClassificationFilter();
        }
        return classification;
    }

    public void setClassification(ScoreClassificationFilter classification) {
        this.classification = classification;
    }

    public ZonedDateTimeFilter getCalculatedAt() {
        return calculatedAt;
    }

    public ZonedDateTimeFilter calculatedAt() {
        if (calculatedAt == null) {
            calculatedAt = new ZonedDateTimeFilter();
        }
        return calculatedAt;
    }

    public void setCalculatedAt(ZonedDateTimeFilter calculatedAt) {
        this.calculatedAt = calculatedAt;
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
        final ClientScoreCriteria that = (ClientScoreCriteria) o;
        return (
            Objects.equals(id, that.id) &&
            Objects.equals(tenantId, that.tenantId) &&
            Objects.equals(clientId, that.clientId) &&
            Objects.equals(clientName, that.clientName) &&
            Objects.equals(period, that.period) &&
            Objects.equals(score, that.score) &&
            Objects.equals(classification, that.classification) &&
            Objects.equals(calculatedAt, that.calculatedAt) &&
            Objects.equals(distinct, that.distinct)
        );
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, tenantId, clientId, clientName, period, score, classification, calculatedAt, distinct);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "ClientScoreCriteria{" +
            (id != null ? "id=" + id + ", " : "") +
            (tenantId != null ? "tenantId=" + tenantId + ", " : "") +
            (clientId != null ? "clientId=" + clientId + ", " : "") +
            (clientName != null ? "clientName=" + clientName + ", " : "") +
            (period != null ? "period=" + period + ", " : "") +
            (score != null ? "score=" + score + ", " : "") +
            (classification != null ? "classification=" + classification + ", " : "") +
            (calculatedAt != null ? "calculatedAt=" + calculatedAt + ", " : "") +
            (distinct != null ? "distinct=" + distinct + ", " : "") +
            "}";
    }
}
