package com.tunisales.platform.service;

import com.tunisales.platform.domain.ClientScore;
import com.tunisales.platform.repository.ClientScoreRepository;
import com.tunisales.platform.service.dto.ClientScoreDTO;
import com.tunisales.platform.service.mapper.ClientScoreMapper;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link ClientScore}.
 */
@Service
@Transactional
public class ClientScoreService {

    private final Logger log = LoggerFactory.getLogger(ClientScoreService.class);

    private final ClientScoreRepository clientScoreRepository;

    private final ClientScoreMapper clientScoreMapper;

    public ClientScoreService(ClientScoreRepository clientScoreRepository, ClientScoreMapper clientScoreMapper) {
        this.clientScoreRepository = clientScoreRepository;
        this.clientScoreMapper = clientScoreMapper;
    }

    /**
     * Save a clientScore.
     *
     * @param clientScoreDTO the entity to save.
     * @return the persisted entity.
     */
    public ClientScoreDTO save(ClientScoreDTO clientScoreDTO) {
        log.debug("Request to save ClientScore : {}", clientScoreDTO);
        ClientScore clientScore = clientScoreMapper.toEntity(clientScoreDTO);
        clientScore = clientScoreRepository.save(clientScore);
        return clientScoreMapper.toDto(clientScore);
    }

    /**
     * Update a clientScore.
     *
     * @param clientScoreDTO the entity to save.
     * @return the persisted entity.
     */
    public ClientScoreDTO update(ClientScoreDTO clientScoreDTO) {
        log.debug("Request to update ClientScore : {}", clientScoreDTO);
        ClientScore clientScore = clientScoreMapper.toEntity(clientScoreDTO);
        clientScore = clientScoreRepository.save(clientScore);
        return clientScoreMapper.toDto(clientScore);
    }

    /**
     * Partially update a clientScore.
     *
     * @param clientScoreDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<ClientScoreDTO> partialUpdate(ClientScoreDTO clientScoreDTO) {
        log.debug("Request to partially update ClientScore : {}", clientScoreDTO);

        return clientScoreRepository
            .findById(clientScoreDTO.getId())
            .map(existingClientScore -> {
                clientScoreMapper.partialUpdate(existingClientScore, clientScoreDTO);

                return existingClientScore;
            })
            .map(clientScoreRepository::save)
            .map(clientScoreMapper::toDto);
    }

    /**
     * Get all the clientScores.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<ClientScoreDTO> findAll(Pageable pageable) {
        log.debug("Request to get all ClientScores");
        return clientScoreRepository.findAll(pageable).map(clientScoreMapper::toDto);
    }

    /**
     * Get one clientScore by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<ClientScoreDTO> findOne(Long id) {
        log.debug("Request to get ClientScore : {}", id);
        return clientScoreRepository.findById(id).map(clientScoreMapper::toDto);
    }

    /**
     * Delete the clientScore by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        log.debug("Request to delete ClientScore : {}", id);
        clientScoreRepository.deleteById(id);
    }
}
