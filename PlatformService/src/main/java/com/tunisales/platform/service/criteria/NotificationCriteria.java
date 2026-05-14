package com.tunisales.platform.service.criteria;

import com.tunisales.platform.domain.enumeration.NotificationType;
import java.io.Serializable;
import java.util.Objects;
import org.springdoc.api.annotations.ParameterObject;
import tech.jhipster.service.Criteria;
import tech.jhipster.service.filter.*;

/**
 * Criteria class for the {@link com.tunisales.platform.domain.Notification} entity. This class is used
 * in {@link com.tunisales.platform.web.rest.NotificationResource} to receive all the possible filtering options from
 * the Http GET request parameters.
 * For example the following could be a valid request:
 * {@code /notifications?id.greaterThan=5&attr1.contains=something&attr2.specified=false}
 * As Spring is unable to properly convert the types, unless specific {@link Filter} class are used, we need to use
 * fix type specific filters.
 */
@ParameterObject
@SuppressWarnings("common-java:DuplicatedBlocks")
public class NotificationCriteria implements Serializable, Criteria {

    /**
     * Class for filtering NotificationType
     */
    public static class NotificationTypeFilter extends Filter<NotificationType> {

        public NotificationTypeFilter() {}

        public NotificationTypeFilter(NotificationTypeFilter filter) {
            super(filter);
        }

        @Override
        public NotificationTypeFilter copy() {
            return new NotificationTypeFilter(this);
        }
    }

    private static final long serialVersionUID = 1L;

    private LongFilter id;

    private LongFilter tenantId;

    private StringFilter recipientLogin;

    private NotificationTypeFilter type;

    private StringFilter title;

    private StringFilter body;

    private BooleanFilter isRead;

    private ZonedDateTimeFilter readAt;

    private ZonedDateTimeFilter createdAt;

    private Boolean distinct;

    public NotificationCriteria() {}

    public NotificationCriteria(NotificationCriteria other) {
        this.id = other.id == null ? null : other.id.copy();
        this.tenantId = other.tenantId == null ? null : other.tenantId.copy();
        this.recipientLogin = other.recipientLogin == null ? null : other.recipientLogin.copy();
        this.type = other.type == null ? null : other.type.copy();
        this.title = other.title == null ? null : other.title.copy();
        this.body = other.body == null ? null : other.body.copy();
        this.isRead = other.isRead == null ? null : other.isRead.copy();
        this.readAt = other.readAt == null ? null : other.readAt.copy();
        this.createdAt = other.createdAt == null ? null : other.createdAt.copy();
        this.distinct = other.distinct;
    }

    @Override
    public NotificationCriteria copy() {
        return new NotificationCriteria(this);
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

    public StringFilter getRecipientLogin() {
        return recipientLogin;
    }

    public StringFilter recipientLogin() {
        if (recipientLogin == null) {
            recipientLogin = new StringFilter();
        }
        return recipientLogin;
    }

    public void setRecipientLogin(StringFilter recipientLogin) {
        this.recipientLogin = recipientLogin;
    }

    public NotificationTypeFilter getType() {
        return type;
    }

    public NotificationTypeFilter type() {
        if (type == null) {
            type = new NotificationTypeFilter();
        }
        return type;
    }

    public void setType(NotificationTypeFilter type) {
        this.type = type;
    }

    public StringFilter getTitle() {
        return title;
    }

    public StringFilter title() {
        if (title == null) {
            title = new StringFilter();
        }
        return title;
    }

    public void setTitle(StringFilter title) {
        this.title = title;
    }

    public StringFilter getBody() {
        return body;
    }

    public StringFilter body() {
        if (body == null) {
            body = new StringFilter();
        }
        return body;
    }

    public void setBody(StringFilter body) {
        this.body = body;
    }

    public BooleanFilter getIsRead() {
        return isRead;
    }

    public BooleanFilter isRead() {
        if (isRead == null) {
            isRead = new BooleanFilter();
        }
        return isRead;
    }

    public void setIsRead(BooleanFilter isRead) {
        this.isRead = isRead;
    }

    public ZonedDateTimeFilter getReadAt() {
        return readAt;
    }

    public ZonedDateTimeFilter readAt() {
        if (readAt == null) {
            readAt = new ZonedDateTimeFilter();
        }
        return readAt;
    }

    public void setReadAt(ZonedDateTimeFilter readAt) {
        this.readAt = readAt;
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
        final NotificationCriteria that = (NotificationCriteria) o;
        return (
            Objects.equals(id, that.id) &&
            Objects.equals(tenantId, that.tenantId) &&
            Objects.equals(recipientLogin, that.recipientLogin) &&
            Objects.equals(type, that.type) &&
            Objects.equals(title, that.title) &&
            Objects.equals(body, that.body) &&
            Objects.equals(isRead, that.isRead) &&
            Objects.equals(readAt, that.readAt) &&
            Objects.equals(createdAt, that.createdAt) &&
            Objects.equals(distinct, that.distinct)
        );
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, tenantId, recipientLogin, type, title, body, isRead, readAt, createdAt, distinct);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "NotificationCriteria{" +
            (id != null ? "id=" + id + ", " : "") +
            (tenantId != null ? "tenantId=" + tenantId + ", " : "") +
            (recipientLogin != null ? "recipientLogin=" + recipientLogin + ", " : "") +
            (type != null ? "type=" + type + ", " : "") +
            (title != null ? "title=" + title + ", " : "") +
            (body != null ? "body=" + body + ", " : "") +
            (isRead != null ? "isRead=" + isRead + ", " : "") +
            (readAt != null ? "readAt=" + readAt + ", " : "") +
            (createdAt != null ? "createdAt=" + createdAt + ", " : "") +
            (distinct != null ? "distinct=" + distinct + ", " : "") +
            "}";
    }
}
