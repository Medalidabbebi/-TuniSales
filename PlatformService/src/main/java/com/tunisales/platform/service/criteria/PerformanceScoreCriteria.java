package com.tunisales.platform.service.criteria;

import com.tunisales.platform.domain.enumeration.ScoreClassification;
import java.io.Serializable;
import java.util.Objects;
import org.springdoc.api.annotations.ParameterObject;
import tech.jhipster.service.Criteria;
import tech.jhipster.service.filter.*;

/**
 * Criteria class for the {@link com.tunisales.platform.domain.PerformanceScore} entity. This class is used
 * in {@link com.tunisales.platform.web.rest.PerformanceScoreResource} to receive all the possible filtering options from
 * the Http GET request parameters.
 * For example the following could be a valid request:
 * {@code /performance-scores?id.greaterThan=5&attr1.contains=something&attr2.specified=false}
 * As Spring is unable to properly convert the types, unless specific {@link Filter} class are used, we need to use
 * fix type specific filters.
 */
@ParameterObject
@SuppressWarnings("common-java:DuplicatedBlocks")
public class PerformanceScoreCriteria implements Serializable, Criteria {

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

    private StringFilter userLogin;

    private StringFilter period;

    private IntegerFilter score;

    private ScoreClassificationFilter classification;

    private IntegerFilter deltaVsPrevious;

    private ZonedDateTimeFilter calculatedAt;

    private Boolean distinct;

    public PerformanceScoreCriteria() {}

    public PerformanceScoreCriteria(PerformanceScoreCriteria other) {
        this.id = other.id == null ? null : other.id.copy();
        this.tenantId = other.tenantId == null ? null : other.tenantId.copy();
        this.userLogin = other.userLogin == null ? null : other.userLogin.copy();
        this.period = other.period == null ? null : other.period.copy();
        this.score = other.score == null ? null : other.score.copy();
        this.classification = other.classification == null ? null : other.classification.copy();
        this.deltaVsPrevious = other.deltaVsPrevious == null ? null : other.deltaVsPrevious.copy();
        this.calculatedAt = other.calculatedAt == null ? null : other.calculatedAt.copy();
        this.distinct = other.distinct;
    }

    @Override
    public PerformanceScoreCriteria copy() {
        return new PerformanceScoreCriteria(this);
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

    public StringFilter getUserLogin() {
        return userLogin;
    }

    public StringFilter userLogin() {
        if (userLogin == null) {
            userLogin = new StringFilter();
        }
        return userLogin;
    }

    public void setUserLogin(StringFilter userLogin) {
        this.userLogin = userLogin;
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

    public IntegerFilter getDeltaVsPrevious() {
        return deltaVsPrevious;
    }

    public IntegerFilter deltaVsPrevious() {
        if (deltaVsPrevious == null) {
            deltaVsPrevious = new IntegerFilter();
        }
        return deltaVsPrevious;
    }

    public void setDeltaVsPrevious(IntegerFilter deltaVsPrevious) {
        this.deltaVsPrevious = deltaVsPrevious;
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
        final PerformanceScoreCriteria that = (PerformanceScoreCriteria) o;
        return (
            Objects.equals(id, that.id) &&
            Objects.equals(tenantId, that.tenantId) &&
            Objects.equals(userLogin, that.userLogin) &&
            Objects.equals(period, that.period) &&
            Objects.equals(score, that.score) &&
            Objects.equals(classification, that.classification) &&
            Objects.equals(deltaVsPrevious, that.deltaVsPrevious) &&
            Objects.equals(calculatedAt, that.calculatedAt) &&
            Objects.equals(distinct, that.distinct)
        );
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, tenantId, userLogin, period, score, classification, deltaVsPrevious, calculatedAt, distinct);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "PerformanceScoreCriteria{" +
            (id != null ? "id=" + id + ", " : "") +
            (tenantId != null ? "tenantId=" + tenantId + ", " : "") +
            (userLogin != null ? "userLogin=" + userLogin + ", " : "") +
            (period != null ? "period=" + period + ", " : "") +
            (score != null ? "score=" + score + ", " : "") +
            (classification != null ? "classification=" + classification + ", " : "") +
            (deltaVsPrevious != null ? "deltaVsPrevious=" + deltaVsPrevious + ", " : "") +
            (calculatedAt != null ? "calculatedAt=" + calculatedAt + ", " : "") +
            (distinct != null ? "distinct=" + distinct + ", " : "") +
            "}";
    }
}
