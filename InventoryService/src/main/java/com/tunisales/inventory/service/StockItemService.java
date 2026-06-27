package com.tunisales.inventory.service;

import com.tunisales.inventory.domain.StockItem;
import com.tunisales.inventory.domain.Warehouse;
import com.tunisales.inventory.domain.enumeration.StockItemStatus;
import com.tunisales.inventory.repository.StockItemRepository;
import com.tunisales.inventory.repository.WarehouseRepository;
import com.tunisales.inventory.service.dto.StockItemDTO;
import com.tunisales.inventory.service.mapper.StockItemMapper;
import com.tunisales.inventory.web.rest.errors.BadRequestAlertException;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link StockItem}.
 */
@Service
@Transactional
public class StockItemService {

    private static final String ENTITY_NAME = "inventoryServiceStockItem";

    private final Logger log = LoggerFactory.getLogger(StockItemService.class);

    private final StockItemRepository stockItemRepository;

    private final WarehouseRepository warehouseRepository;

    private final StockItemMapper stockItemMapper;

    public StockItemService(StockItemRepository stockItemRepository, WarehouseRepository warehouseRepository, StockItemMapper stockItemMapper) {
        this.stockItemRepository = stockItemRepository;
        this.warehouseRepository = warehouseRepository;
        this.stockItemMapper = stockItemMapper;
    }

    /**
     * Save a stockItem.
     *
     * @param stockItemDTO the entity to save.
     * @return the persisted entity.
     */
    public StockItemDTO save(StockItemDTO stockItemDTO) {
        log.debug("Request to save StockItem : {}", stockItemDTO);
        validateImeiUniqueness(stockItemDTO);
        StockItem stockItem = stockItemMapper.toEntity(stockItemDTO);
        attachWarehouseReference(stockItem, stockItemDTO);
        stockItem = stockItemRepository.save(stockItem);
        return stockItemMapper.toDto(stockItem);
    }

    /**
     * Update a stockItem.
     *
     * @param stockItemDTO the entity to save.
     * @return the persisted entity.
     */
    public StockItemDTO update(StockItemDTO stockItemDTO) {
        log.debug("Request to update StockItem : {}", stockItemDTO);
        validateImeiUniqueness(stockItemDTO);
        StockItem stockItem = stockItemMapper.toEntity(stockItemDTO);
        attachWarehouseReference(stockItem, stockItemDTO);
        stockItem = stockItemRepository.save(stockItem);
        return stockItemMapper.toDto(stockItem);
    }

    /**
     * Partially update a stockItem.
     *
     * @param stockItemDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<StockItemDTO> partialUpdate(StockItemDTO stockItemDTO) {
        log.debug("Request to partially update StockItem : {}", stockItemDTO);

        return stockItemRepository
            .findById(stockItemDTO.getId())
            .map(existingStockItem -> {
                stockItemMapper.partialUpdate(existingStockItem, stockItemDTO);
                attachWarehouseReference(existingStockItem, stockItemDTO);
                validateImeiUniqueness(stockItemDTO, existingStockItem.getId());

                return existingStockItem;
            })
            .map(stockItemRepository::save)
            .map(stockItemMapper::toDto);
    }

    /**
     * Get all the stockItems.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<StockItemDTO> findAll(Pageable pageable) {
        log.debug("Request to get all StockItems");
        return stockItemRepository.findAll(pageable).map(stockItemMapper::toDto);
    }

    /**
     * Get all the stockItems with eager load of many-to-many relationships.
     *
     * @return the list of entities.
     */
    public Page<StockItemDTO> findAllWithEagerRelationships(Pageable pageable) {
        return stockItemRepository.findAllWithEagerRelationships(pageable).map(stockItemMapper::toDto);
    }

    /**
     * Get one stockItem by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<StockItemDTO> findOne(Long id) {
        log.debug("Request to get StockItem : {}", id);
        return stockItemRepository.findOneWithEagerRelationships(id).map(stockItemMapper::toDto);
    }

    /**
     * Delete the stockItem by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        log.debug("Request to delete StockItem : {}", id);
        stockItemRepository.deleteById(id);
    }

    public StockItemDTO declareMissing(Long id) {
        log.debug("Request to declare StockItem as MISSING : {}", id);
        return stockItemRepository.findById(id)
            .map(item -> {
                item.setStatus(StockItemStatus.MISSING);
                return stockItemMapper.toDto(stockItemRepository.save(item));
            })
            .orElseThrow(() -> new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound"));
    }

    public StockItemDTO declareLost(Long id) {
        log.debug("Request to declare StockItem as LOST (RETIRED) : {}", id);
        return stockItemRepository.findById(id)
            .map(item -> {
                item.setStatus(StockItemStatus.RETIRED);
                return stockItemMapper.toDto(stockItemRepository.save(item));
            })
            .orElseThrow(() -> new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound"));
    }

    public StockItemDTO recover(Long id) {
        log.debug("Request to recover StockItem : {}", id);
        return stockItemRepository.findById(id)
            .map(item -> {
                item.setStatus(StockItemStatus.AVAILABLE);
                return stockItemMapper.toDto(stockItemRepository.save(item));
            })
            .orElseThrow(() -> new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound"));
    }

    public StockItemDTO markSold(Long id) {
        log.debug("Request to mark StockItem as SOLD : {}", id);
        return stockItemRepository.findById(id)
            .map(item -> {
                item.setStatus(StockItemStatus.SOLD);
                return stockItemMapper.toDto(stockItemRepository.save(item));
            })
            .orElseThrow(() -> new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound"));
    }

    private void validateImeiUniqueness(StockItemDTO stockItemDTO) {
        validateImeiUniqueness(stockItemDTO, stockItemDTO.getId());
    }

    private void validateImeiUniqueness(StockItemDTO stockItemDTO, Long currentStockItemId) {
        if (stockItemDTO.getImei() == null) {
            return;
        }

        stockItemRepository.findOneByImei(stockItemDTO.getImei()).ifPresent(existingStockItem -> {
            if (currentStockItemId == null || !existingStockItem.getId().equals(currentStockItemId)) {
                throw new BadRequestAlertException("Stock item IMEI already exists", ENTITY_NAME, "imeialreadyexists");
            }
        });
    }

    private void attachWarehouseReference(StockItem stockItem, StockItemDTO stockItemDTO) {
        if (stockItemDTO.getWarehouse() == null || stockItemDTO.getWarehouse().getId() == null) {
            return;
        }

        Warehouse warehouseReference = warehouseRepository.getReferenceById(stockItemDTO.getWarehouse().getId());
        stockItem.setWarehouse(warehouseReference);
    }
}
