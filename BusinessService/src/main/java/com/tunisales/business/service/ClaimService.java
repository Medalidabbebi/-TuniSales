package com.tunisales.business.service;

import com.tunisales.business.domain.Claim;
import com.tunisales.business.domain.enumeration.ClaimStatus;
import com.tunisales.business.repository.ClaimRepository;
import com.tunisales.business.service.dto.ClaimDTO;
import com.tunisales.business.service.mapper.ClaimMapper;
import java.time.ZonedDateTime;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link Claim} (réclamation / demande de récupération).
 */
@Service
@Transactional
public class ClaimService {

    private final Logger log = LoggerFactory.getLogger(ClaimService.class);

    private final ClaimRepository claimRepository;

    private final ClaimMapper claimMapper;

    public ClaimService(ClaimRepository claimRepository, ClaimMapper claimMapper) {
        this.claimRepository = claimRepository;
        this.claimMapper = claimMapper;
    }

    public ClaimDTO save(ClaimDTO claimDTO) {
        log.debug("Request to save Claim : {}", claimDTO);
        Claim claim = claimMapper.toEntity(claimDTO);
        claim = claimRepository.save(claim);
        return claimMapper.toDto(claim);
    }

    public Optional<ClaimDTO> partialUpdate(ClaimDTO claimDTO) {
        log.debug("Request to partially update Claim : {}", claimDTO);

        return claimRepository
            .findById(claimDTO.getId())
            .map(existingClaim -> {
                claimMapper.partialUpdate(existingClaim, claimDTO);
                if (
                    claimDTO.getStatus() != null &&
                    (claimDTO.getStatus() == ClaimStatus.RESOLVED || claimDTO.getStatus() == ClaimStatus.REJECTED) &&
                    existingClaim.getResolvedAt() == null
                ) {
                    existingClaim.setResolvedAt(ZonedDateTime.now());
                }
                return existingClaim;
            })
            .map(claimRepository::save)
            .map(claimMapper::toDto);
    }

    @Transactional(readOnly = true)
    public Page<ClaimDTO> findAll(Pageable pageable) {
        log.debug("Request to get all Claims");
        return claimRepository.findAll(pageable).map(claimMapper::toDto);
    }

    @Transactional(readOnly = true)
    public Optional<ClaimDTO> findOne(Long id) {
        log.debug("Request to get Claim : {}", id);
        return claimRepository.findById(id).map(claimMapper::toDto);
    }

    public void delete(Long id) {
        log.debug("Request to delete Claim : {}", id);
        claimRepository.deleteById(id);
    }
}
