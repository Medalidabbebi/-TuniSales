package com.tunisales.business.service.dto;

import com.tunisales.business.domain.enumeration.ClaimStatus;
import com.tunisales.business.domain.enumeration.ClaimType;
import java.io.Serializable;
import java.time.ZonedDateTime;
import java.util.Objects;
import javax.validation.constraints.*;

/**
 * A DTO for the {@link com.tunisales.business.domain.Claim} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class ClaimDTO implements Serializable {

    private Long id;

    private Long tenantId;

    @NotNull
    private ClaimType type;

    @NotNull
    @Size(max = 200)
    private String subject;

    @Size(max = 1000)
    private String description;

    private ClaimStatus status;

    @Size(max = 100)
    private String createdByLogin;

    private ZonedDateTime createdAt;

    private ZonedDateTime resolvedAt;

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

    public ClaimType getType() {
        return type;
    }

    public void setType(ClaimType type) {
        this.type = type;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public ClaimStatus getStatus() {
        return status;
    }

    public void setStatus(ClaimStatus status) {
        this.status = status;
    }

    public String getCreatedByLogin() {
        return createdByLogin;
    }

    public void setCreatedByLogin(String createdByLogin) {
        this.createdByLogin = createdByLogin;
    }

    public ZonedDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(ZonedDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public ZonedDateTime getResolvedAt() {
        return resolvedAt;
    }

    public void setResolvedAt(ZonedDateTime resolvedAt) {
        this.resolvedAt = resolvedAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof ClaimDTO)) {
            return false;
        }

        ClaimDTO claimDTO = (ClaimDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, claimDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "ClaimDTO{" +
            "id=" + getId() +
            ", tenantId=" + getTenantId() +
            ", type='" + getType() + "'" +
            ", subject='" + getSubject() + "'" +
            ", description='" + getDescription() + "'" +
            ", status='" + getStatus() + "'" +
            ", createdByLogin='" + getCreatedByLogin() + "'" +
            ", createdAt='" + getCreatedAt() + "'" +
            ", resolvedAt='" + getResolvedAt() + "'" +
            "}";
    }
}
