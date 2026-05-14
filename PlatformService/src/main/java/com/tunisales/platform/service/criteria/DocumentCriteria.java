package com.tunisales.platform.service.criteria;

import com.tunisales.platform.domain.enumeration.DocumentEntityType;
import com.tunisales.platform.domain.enumeration.DocumentType;
import java.io.Serializable;
import java.util.Objects;
import org.springdoc.api.annotations.ParameterObject;
import tech.jhipster.service.Criteria;
import tech.jhipster.service.filter.*;

/**
 * Criteria class for the {@link com.tunisales.platform.domain.Document} entity. This class is used
 * in {@link com.tunisales.platform.web.rest.DocumentResource} to receive all the possible filtering options from
 * the Http GET request parameters.
 * For example the following could be a valid request:
 * {@code /documents?id.greaterThan=5&attr1.contains=something&attr2.specified=false}
 * As Spring is unable to properly convert the types, unless specific {@link Filter} class are used, we need to use
 * fix type specific filters.
 */
@ParameterObject
@SuppressWarnings("common-java:DuplicatedBlocks")
public class DocumentCriteria implements Serializable, Criteria {

    /**
     * Class for filtering DocumentEntityType
     */
    public static class DocumentEntityTypeFilter extends Filter<DocumentEntityType> {

        public DocumentEntityTypeFilter() {}

        public DocumentEntityTypeFilter(DocumentEntityTypeFilter filter) {
            super(filter);
        }

        @Override
        public DocumentEntityTypeFilter copy() {
            return new DocumentEntityTypeFilter(this);
        }
    }

    /**
     * Class for filtering DocumentType
     */
    public static class DocumentTypeFilter extends Filter<DocumentType> {

        public DocumentTypeFilter() {}

        public DocumentTypeFilter(DocumentTypeFilter filter) {
            super(filter);
        }

        @Override
        public DocumentTypeFilter copy() {
            return new DocumentTypeFilter(this);
        }
    }

    private static final long serialVersionUID = 1L;

    private LongFilter id;

    private LongFilter tenantId;

    private DocumentEntityTypeFilter entityType;

    private StringFilter entityId;

    private DocumentTypeFilter docType;

    private StringFilter filename;

    private StringFilter storageUrl;

    private StringFilter mimeType;

    private LongFilter sizeBytes;

    private StringFilter uploadedByLogin;

    private ZonedDateTimeFilter createdAt;

    private ZonedDateTimeFilter updatedAt;

    private Boolean distinct;

    public DocumentCriteria() {}

    public DocumentCriteria(DocumentCriteria other) {
        this.id = other.id == null ? null : other.id.copy();
        this.tenantId = other.tenantId == null ? null : other.tenantId.copy();
        this.entityType = other.entityType == null ? null : other.entityType.copy();
        this.entityId = other.entityId == null ? null : other.entityId.copy();
        this.docType = other.docType == null ? null : other.docType.copy();
        this.filename = other.filename == null ? null : other.filename.copy();
        this.storageUrl = other.storageUrl == null ? null : other.storageUrl.copy();
        this.mimeType = other.mimeType == null ? null : other.mimeType.copy();
        this.sizeBytes = other.sizeBytes == null ? null : other.sizeBytes.copy();
        this.uploadedByLogin = other.uploadedByLogin == null ? null : other.uploadedByLogin.copy();
        this.createdAt = other.createdAt == null ? null : other.createdAt.copy();
        this.updatedAt = other.updatedAt == null ? null : other.updatedAt.copy();
        this.distinct = other.distinct;
    }

    @Override
    public DocumentCriteria copy() {
        return new DocumentCriteria(this);
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

    public DocumentEntityTypeFilter getEntityType() {
        return entityType;
    }

    public DocumentEntityTypeFilter entityType() {
        if (entityType == null) {
            entityType = new DocumentEntityTypeFilter();
        }
        return entityType;
    }

    public void setEntityType(DocumentEntityTypeFilter entityType) {
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

    public DocumentTypeFilter getDocType() {
        return docType;
    }

    public DocumentTypeFilter docType() {
        if (docType == null) {
            docType = new DocumentTypeFilter();
        }
        return docType;
    }

    public void setDocType(DocumentTypeFilter docType) {
        this.docType = docType;
    }

    public StringFilter getFilename() {
        return filename;
    }

    public StringFilter filename() {
        if (filename == null) {
            filename = new StringFilter();
        }
        return filename;
    }

    public void setFilename(StringFilter filename) {
        this.filename = filename;
    }

    public StringFilter getStorageUrl() {
        return storageUrl;
    }

    public StringFilter storageUrl() {
        if (storageUrl == null) {
            storageUrl = new StringFilter();
        }
        return storageUrl;
    }

    public void setStorageUrl(StringFilter storageUrl) {
        this.storageUrl = storageUrl;
    }

    public StringFilter getMimeType() {
        return mimeType;
    }

    public StringFilter mimeType() {
        if (mimeType == null) {
            mimeType = new StringFilter();
        }
        return mimeType;
    }

    public void setMimeType(StringFilter mimeType) {
        this.mimeType = mimeType;
    }

    public LongFilter getSizeBytes() {
        return sizeBytes;
    }

    public LongFilter sizeBytes() {
        if (sizeBytes == null) {
            sizeBytes = new LongFilter();
        }
        return sizeBytes;
    }

    public void setSizeBytes(LongFilter sizeBytes) {
        this.sizeBytes = sizeBytes;
    }

    public StringFilter getUploadedByLogin() {
        return uploadedByLogin;
    }

    public StringFilter uploadedByLogin() {
        if (uploadedByLogin == null) {
            uploadedByLogin = new StringFilter();
        }
        return uploadedByLogin;
    }

    public void setUploadedByLogin(StringFilter uploadedByLogin) {
        this.uploadedByLogin = uploadedByLogin;
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
        final DocumentCriteria that = (DocumentCriteria) o;
        return (
            Objects.equals(id, that.id) &&
            Objects.equals(tenantId, that.tenantId) &&
            Objects.equals(entityType, that.entityType) &&
            Objects.equals(entityId, that.entityId) &&
            Objects.equals(docType, that.docType) &&
            Objects.equals(filename, that.filename) &&
            Objects.equals(storageUrl, that.storageUrl) &&
            Objects.equals(mimeType, that.mimeType) &&
            Objects.equals(sizeBytes, that.sizeBytes) &&
            Objects.equals(uploadedByLogin, that.uploadedByLogin) &&
            Objects.equals(createdAt, that.createdAt) &&
            Objects.equals(updatedAt, that.updatedAt) &&
            Objects.equals(distinct, that.distinct)
        );
    }

    @Override
    public int hashCode() {
        return Objects.hash(
            id,
            tenantId,
            entityType,
            entityId,
            docType,
            filename,
            storageUrl,
            mimeType,
            sizeBytes,
            uploadedByLogin,
            createdAt,
            updatedAt,
            distinct
        );
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "DocumentCriteria{" +
            (id != null ? "id=" + id + ", " : "") +
            (tenantId != null ? "tenantId=" + tenantId + ", " : "") +
            (entityType != null ? "entityType=" + entityType + ", " : "") +
            (entityId != null ? "entityId=" + entityId + ", " : "") +
            (docType != null ? "docType=" + docType + ", " : "") +
            (filename != null ? "filename=" + filename + ", " : "") +
            (storageUrl != null ? "storageUrl=" + storageUrl + ", " : "") +
            (mimeType != null ? "mimeType=" + mimeType + ", " : "") +
            (sizeBytes != null ? "sizeBytes=" + sizeBytes + ", " : "") +
            (uploadedByLogin != null ? "uploadedByLogin=" + uploadedByLogin + ", " : "") +
            (createdAt != null ? "createdAt=" + createdAt + ", " : "") +
            (updatedAt != null ? "updatedAt=" + updatedAt + ", " : "") +
            (distinct != null ? "distinct=" + distinct + ", " : "") +
            "}";
    }
}
