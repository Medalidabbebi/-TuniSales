package com.tunisales.platform.service;

import com.tunisales.platform.domain.Objective;
import com.tunisales.platform.repository.ObjectiveRepository;
import com.tunisales.platform.service.dto.ObjectiveDTO;
import com.tunisales.platform.service.mapper.ObjectiveMapper;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link Objective}.
 */
@Service
@Transactional
public class ObjectiveService {

    private final Logger log = LoggerFactory.getLogger(ObjectiveService.class);

    private final ObjectiveRepository objectiveRepository;

    private final ObjectiveMapper objectiveMapper;

    public ObjectiveService(ObjectiveRepository objectiveRepository, ObjectiveMapper objectiveMapper) {
        this.objectiveRepository = objectiveRepository;
        this.objectiveMapper = objectiveMapper;
    }

    /**
     * Save a objective.
     *
     * @param objectiveDTO the entity to save.
     * @return the persisted entity.
     */
    public ObjectiveDTO save(ObjectiveDTO objectiveDTO) {
        log.debug("Request to save Objective : {}", objectiveDTO);
        Objective objective = objectiveMapper.toEntity(objectiveDTO);
        objective = objectiveRepository.save(objective);
        return objectiveMapper.toDto(objective);
    }

    /**
     * Update a objective.
     *
     * @param objectiveDTO the entity to save.
     * @return the persisted entity.
     */
    public ObjectiveDTO update(ObjectiveDTO objectiveDTO) {
        log.debug("Request to update Objective : {}", objectiveDTO);
        Objective objective = objectiveMapper.toEntity(objectiveDTO);
        objective = objectiveRepository.save(objective);
        return objectiveMapper.toDto(objective);
    }

    /**
     * Partially update a objective.
     *
     * @param objectiveDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<ObjectiveDTO> partialUpdate(ObjectiveDTO objectiveDTO) {
        log.debug("Request to partially update Objective : {}", objectiveDTO);

        return objectiveRepository
            .findById(objectiveDTO.getId())
            .map(existingObjective -> {
                objectiveMapper.partialUpdate(existingObjective, objectiveDTO);

                return existingObjective;
            })
            .map(objectiveRepository::save)
            .map(objectiveMapper::toDto);
    }

    /**
     * Get all the objectives.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<ObjectiveDTO> findAll(Pageable pageable) {
        log.debug("Request to get all Objectives");
        return objectiveRepository.findAll(pageable).map(objectiveMapper::toDto);
    }

    /**
     * Get one objective by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<ObjectiveDTO> findOne(Long id) {
        log.debug("Request to get Objective : {}", id);
        return objectiveRepository.findById(id).map(objectiveMapper::toDto);
    }

    /**
     * Delete the objective by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        log.debug("Request to delete Objective : {}", id);
        objectiveRepository.deleteById(id);
    }
}
