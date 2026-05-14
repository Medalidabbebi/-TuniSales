package com.tunisales.platform.domain;

import com.tunisales.platform.domain.enumeration.DocumentEntityType;
import com.tunisales.platform.domain.enumeration.DocumentType;
import java.io.Serializable;
import java.time.ZonedDateTime;
import javax.persistence.*;
import javax.validation.constraints.*;

/**
 * A Document.
 */
@Entity
@Table(name = "document")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Document implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @Column(name = "tenant_id")
    private Long tenantId;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "entity_type", nullable = false)
    private DocumentEntityType entityType;

    @NotNull
    @Size(max = 36)
    @Column(name = "entity_id", length = 36, nullable = false)
    private String entityId;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "doc_type", nullable = false)
    private DocumentType docType;

    @NotNull
    @Size(max = 255)
    @Column(name = "filename", length = 255, nullable = false)
    private String filename;

    @NotNull
    @Size(max = 1000)
    @Column(name = "storage_url", length = 1000, nullable = false)
    private String storageUrl;

    @Size(max = 100)
    @Column(name = "mime_type", length = 100)
    private String mimeType;

    @Min(value = 0L)
    @Column(name = "size_bytes")
    private Long sizeBytes;

    @Size(max = 100)
    @Column(name = "uploaded_by_login", length = 100)
    private String uploadedByLogin;

    @NotNull
    @Column(name = "created_at", nullable = false)
    private ZonedDateTime createdAt;

    @Column(name = "updated_at")
    private ZonedDateTime updatedAt;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public Document id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getTenantId() {
        return this.tenantId;
    }

    public Document tenantId(Long tenantId) {
        this.setTenantId(tenantId);
        return this;
    }

    public void setTenantId(Long tenantId) {
        this.tenantId = tenantId;
    }

    public DocumentEntityType getEntityType() {
        return this.entityType;
    }

    public Document entityType(DocumentEntityType entityType) {
        this.setEntityType(entityType);
        return this;
    }

    public void setEntityType(DocumentEntityType entityType) {
        this.entityType = entityType;
    }

    public String getEntityId() {
        return this.entityId;
    }

    public Document entityId(String entityId) {
        this.setEntityId(entityId);
        return this;
    }

    public void setEntityId(String entityId) {
        this.entityId = entityId;
    }

    public DocumentType getDocType() {
        return this.docType;
    }

    public Document docType(DocumentType docType) {
        this.setDocType(docType);
        return this;
    }

    public void setDocType(DocumentType docType) {
        this.docType = docType;
    }

    public String getFilename() {
        return this.filename;
    }

    public Document filename(String filename) {
        this.setFilename(filename);
        return this;
    }

    public void setFilename(String filename) {
        this.filename = filename;
    }

    public String getStorageUrl() {
        return this.storageUrl;
    }

    public Document storageUrl(String storageUrl) {
        this.setStorageUrl(storageUrl);
        return this;
    }

    public void setStorageUrl(String storageUrl) {
        this.storageUrl = storageUrl;
    }

    public String getMimeType() {
        return this.mimeType;
    }

    public Document mimeType(String mimeType) {
        this.setMimeType(mimeType);
        return this;
    }

    public void setMimeType(String mimeType) {
        this.mimeType = mimeType;
    }

    public Long getSizeBytes() {
        return this.sizeBytes;
    }

    public Document sizeBytes(Long sizeBytes) {
        this.setSizeBytes(sizeBytes);
        return this;
    }

    public void setSizeBytes(Long sizeBytes) {
        this.sizeBytes = sizeBytes;
    }

    public String getUploadedByLogin() {
        return this.uploadedByLogin;
    }

    public Document uploadedByLogin(String uploadedByLogin) {
        this.setUploadedByLogin(uploadedByLogin);
        return this;
    }

    public void setUploadedByLogin(String uploadedByLogin) {
        this.uploadedByLogin = uploadedByLogin;
    }

    public ZonedDateTime getCreatedAt() {
        return this.createdAt;
    }

    public Document createdAt(ZonedDateTime createdAt) {
        this.setCreatedAt(createdAt);
        return this;
    }

    public void setCreatedAt(ZonedDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public ZonedDateTime getUpdatedAt() {
        return this.updatedAt;
    }

    public Document updatedAt(ZonedDateTime updatedAt) {
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
        if (!(o instanceof Document)) {
            return false;
        }
        return id != null && id.equals(((Document) o).id);
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Document{" +
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
