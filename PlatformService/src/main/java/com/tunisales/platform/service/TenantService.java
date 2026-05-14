package com.tunisales.platform.service;

import com.tunisales.platform.domain.Tenant;
import com.tunisales.platform.repository.TenantRepository;
import com.tunisales.platform.service.dto.TenantDTO;
import com.tunisales.platform.service.mapper.TenantMapper;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link Tenant}.
 */
@Service
@Transactional
public class TenantService {

    private final Logger log = LoggerFactory.getLogger(TenantService.class);

    private final TenantRepository tenantRepository;

    private final TenantMapper tenantMapper;

    public TenantService(TenantRepository tenantRepository, TenantMapper tenantMapper) {
        this.tenantRepository = tenantRepository;
        this.tenantMapper = tenantMapper;
    }

    /**
     * Save a tenant.
     *
     * @param tenantDTO the entity to save.
     * @return the persisted entity.
     */
    public TenantDTO save(TenantDTO tenantDTO) {
        log.debug("Request to save Tenant : {}", tenantDTO);
        Tenant tenant = tenantMapper.toEntity(tenantDTO);
        tenant = tenantRepository.save(tenant);
        return tenantMapper.toDto(tenant);
    }

    /**
     * Update a tenant.
     *
     * @param tenantDTO the entity to save.
     * @return the persisted entity.
     */
    public TenantDTO update(TenantDTO tenantDTO) {
        log.debug("Request to update Tenant : {}", tenantDTO);
        Tenant tenant = tenantMapper.toEntity(tenantDTO);
        tenant = tenantRepository.save(tenant);
        return tenantMapper.toDto(tenant);
    }

    /**
     * Partially update a tenant.
     *
     * @param tenantDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<TenantDTO> partialUpdate(TenantDTO tenantDTO) {
        log.debug("Request to partially update Tenant : {}", tenantDTO);

        return tenantRepository
            .findById(tenantDTO.getId())
            .map(existingTenant -> {
                tenantMapper.partialUpdate(existingTenant, tenantDTO);

                return existingTenant;
            })
            .map(tenantRepository::save)
            .map(tenantMapper::toDto);
    }

    /**
     * Get all the tenants.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<TenantDTO> findAll(Pageable pageable) {
        log.debug("Request to get all Tenants");
        return tenantRepository.findAll(pageable).map(tenantMapper::toDto);
    }

    /**
     * Get one tenant by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<TenantDTO> findOne(Long id) {
        log.debug("Request to get Tenant : {}", id);
        return tenantRepository.findById(id).map(tenantMapper::toDto);
    }

    /**
     * Delete the tenant by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        log.debug("Request to delete Tenant : {}", id);
        tenantRepository.deleteById(id);
    }
}
