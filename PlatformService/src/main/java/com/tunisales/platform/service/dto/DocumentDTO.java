package com.tunisales.platform.service.dto;

import com.tunisales.platform.domain.enumeration.DocumentEntityType;
import com.tunisales.platform.domain.enumeration.DocumentType;
import java.io.Serializable;
import java.time.ZonedDateTime;
import java.util.Objects;
import javax.validation.constraints.*;

/**
 * A DTO for the {@link com.tunisales.platform.domain.Document} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class DocumentDTO implements Serializable {

    private Long id;

    private Long tenantId;

    @NotNull
    private DocumentEntityType entityType;

    @NotNull
    @Size(max = 36)
    private String entityId;

    @NotNull
    private DocumentType docType;

    @NotNull
    @Size(max = 255)
    private String filename;

    @NotNull
    @Size(max = 1000)
    private String storageUrl;

    @Size(max = 100)
    private String mimeType;

    @Min(value = 0L)
    private Long sizeBytes;

    @Size(max = 100)
    private String uploadedByLogin;

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

    public DocumentEntityType getEntityType() {
        return entityType;
    }

    public void setEntityType(DocumentEntityType entityType) {
        this.entityType = entityType;
    }

    public String getEntityId() {
        return entityId;
    }

    public void setEntityId(String entityId) {
        this.entityId = entityId;
    }

    public DocumentType getDocType() {
        return docType;
    }

    public void setDocType(DocumentType docType) {
        this.docType = docType;
    }

    public String getFilename() {
        return filename;
    }

    public void setFilename(String filename) {
        this.filename = filename;
    }

    public String getStorageUrl() {
        return storageUrl;
    }

    public void setStorageUrl(String storageUrl) {
        this.storageUrl = storageUrl;
    }

    public String getMimeType() {
        return mimeType;
    }

    public void setMimeType(String mimeType) {
        this.mimeType = mimeType;
    }

    public Long getSizeBytes() {
        return sizeBytes;
    }

    public void setSizeBytes(Long sizeBytes) {
        this.sizeBytes = sizeBytes;
    }

    public String getUploadedByLogin() {
        return uploadedByLogin;
    }

    public void setUploadedByLogin(String uploadedByLogin) {
        this.uploadedByLogin = uploadedByLogin;
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
        if (!(o instanceof DocumentDTO)) {
            return false;
        }

        DocumentDTO documentDTO = (DocumentDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, documentDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "DocumentDTO{" +
            "id=" + getId() +
            ", tenantId=" + getTenantId() +
            ", entityType='" + getEntityType() + "'" +
            ", entityId='" + getEntityId() + "'" +
            ", docType='" + getDocType() + "'" +
            ", filename='" + getFilename() + "'" +
            ", storageUrl='" + getStorageUrl() + "'" +
            ", mimeType='" + getMimeType() + "'" +
            ", sizeBytes=" + getSizeBytes() +
            ", uploadedByLogin='" + getUploadedByLogin() + "'" +
            ", createdAt='" + getCreatedAt() + "'" +
            ", updatedAt='" + getUpdatedAt() + "'" +
            "}";
    }
}
