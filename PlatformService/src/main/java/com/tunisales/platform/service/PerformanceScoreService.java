package com.tunisales.platform.service;

import com.tunisales.platform.domain.PerformanceScore;
import com.tunisales.platform.repository.PerformanceScoreRepository;
import com.tunisales.platform.service.dto.PerformanceScoreDTO;
import com.tunisales.platform.service.mapper.PerformanceScoreMapper;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link PerformanceScore}.
 */
@Service
@Transactional
public class PerformanceScoreService {

    private final Logger log = LoggerFactory.getLogger(PerformanceScoreService.class);

    private final PerformanceScoreRepository performanceScoreRepository;

    private final PerformanceScoreMapper performanceScoreMapper;

    public PerformanceScoreService(PerformanceScoreRepository performanceScoreRepository, PerformanceScoreMapper performanceScoreMapper) {
        this.performanceScoreRepository = performanceScoreRepository;
        this.performanceScoreMapper = performanceScoreMapper;
    }

    /**
     * Save a performanceScore.
     *
     * @param performanceScoreDTO the entity to save.
     * @return the persisted entity.
     */
    public PerformanceScoreDTO save(PerformanceScoreDTO performanceScoreDTO) {
        log.debug("Request to save PerformanceScore : {}", performanceScoreDTO);
        PerformanceScore performanceScore = performanceScoreMapper.toEntity(performanceScoreDTO);
        performanceScore = performanceScoreRepository.save(performanceScore);
        return performanceScoreMapper.toDto(performanceScore);
    }

    /**
     * Update a performanceScore.
     *
     * @param performanceScoreDTO the entity to save.
     * @return the persisted entity.
     */
    public PerformanceScoreDTO update(PerformanceScoreDTO performanceScoreDTO) {
        log.debug("Request to update PerformanceScore : {}", performanceScoreDTO);
        PerformanceScore performanceScore = performanceScoreMapper.toEntity(performanceScoreDTO);
        performanceScore = performanceScoreRepository.save(performanceScore);
        return performanceScoreMapper.toDto(performanceScore);
    }

    /**
     * Partially update a performanceScore.
     *
     * @param performanceScoreDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<PerformanceScoreDTO> partialUpdate(PerformanceScoreDTO performanceScoreDTO) {
        log.debug("Request to partially update PerformanceScore : {}", performanceScoreDTO);

        return performanceScoreRepository
            .findById(performanceScoreDTO.getId())
            .map(existingPerformanceScore -> {
                performanceScoreMapper.partialUpdate(existingPerformanceScore, performanceScoreDTO);

                return existingPerformanceScore;
            })
            .map(performanceScoreRepository::save)
            .map(performanceScoreMapper::toDto);
    }

    /**
     * Get all the performanceScores.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<PerformanceScoreDTO> findAll(Pageable pageable) {
        log.debug("Request to get all PerformanceScores");
        return performanceScoreRepository.findAll(pageable).map(performanceScoreMapper::toDto);
    }

    /**
     * Get one performanceScore by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<PerformanceScoreDTO> findOne(Long id) {
        log.debug("Request to get PerformanceScore : {}", id);
        return performanceScoreRepository.findById(id).map(performanceScoreMapper::toDto);
    }

    /**
     * Delete the performanceScore by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        log.debug("Request to delete PerformanceScore : {}", id);
        performanceScoreRepository.deleteById(id);
    }
}
