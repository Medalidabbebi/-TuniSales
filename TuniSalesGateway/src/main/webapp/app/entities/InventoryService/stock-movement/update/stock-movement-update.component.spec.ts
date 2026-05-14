import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject, from } from 'rxjs';

import { StockMovementFormService } from './stock-movement-form.service';
import { StockMovementService } from '../service/stock-movement.service';
import { IStockMovement } from '../stock-movement.model';
import { IWarehouse } from 'app/entities/InventoryService/warehouse/warehouse.model';
import { WarehouseService } from 'app/entities/InventoryService/warehouse/service/warehouse.service';
import { IStockItem } from 'app/entities/InventoryService/stock-item/stock-item.model';
import { StockItemService } from 'app/entities/InventoryService/stock-item/service/stock-item.service';

import { StockMovementUpdateComponent } from './stock-movement-update.component';

describe('StockMovement Management Update Component', () => {
  let comp: StockMovementUpdateComponent;
  let fixture: ComponentFixture<StockMovementUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let stockMovementFormService: StockMovementFormService;
  let stockMovementService: StockMovementService;
  let warehouseService: WarehouseService;
  let stockItemService: StockItemService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      declarations: [StockMovementUpdateComponent],
      providers: [
        FormBuilder,
        {
          provide: ActivatedRoute,
          useValue: {
            params: from([{}]),
          },
        },
      ],
    })
      .overrideTemplate(StockMovementUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(StockMovementUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    stockMovementFormService = TestBed.inject(StockMovementFormService);
    stockMovementService = TestBed.inject(StockMovementService);
    warehouseService = TestBed.inject(WarehouseService);
    stockItemService = TestBed.inject(StockItemService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should call Warehouse query and add missing value', () => {
      const stockMovement: IStockMovement = { id: 456 };
      const fromWarehouse: IWarehouse = { id: 21477 };
      stockMovement.fromWarehouse = fromWarehouse;
      const toWarehouse: IWarehouse = { id: 53300 };
      stockMovement.toWarehouse = toWarehouse;

      const warehouseCollection: IWarehouse[] = [{ id: 10475 }];
      jest.spyOn(warehouseService, 'query').mockReturnValue(of(new HttpResponse({ body: warehouseCollection })));
      const additionalWarehouses = [fromWarehouse, toWarehouse];
      const expectedCollection: IWarehouse[] = [...additionalWarehouses, ...warehouseCollection];
      jest.spyOn(warehouseService, 'addWarehouseToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ stockMovement });
      comp.ngOnInit();

      expect(warehouseService.query).toHaveBeenCalled();
      expect(warehouseService.addWarehouseToCollectionIfMissing).toHaveBeenCalledWith(
        warehouseCollection,
        ...additionalWarehouses.map(expect.objectContaining)
      );
      expect(comp.warehousesSharedCollection).toEqual(expectedCollection);
    });

    it('Should call StockItem query and add missing value', () => {
      const stockMovement: IStockMovement = { id: 456 };
      const stockItem: IStockItem = { id: 27686 };
      stockMovement.stockItem = stockItem;

      const stockItemCollection: IStockItem[] = [{ id: 68562 }];
      jest.spyOn(stockItemService, 'query').mockReturnValue(of(new HttpResponse({ body: stockItemCollection })));
      const additionalStockItems = [stockItem];
      const expectedCollection: IStockItem[] = [...additionalStockItems, ...stockItemCollection];
      jest.spyOn(stockItemService, 'addStockItemToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ stockMovement });
      comp.ngOnInit();

      expect(stockItemService.query).toHaveBeenCalled();
      expect(stockItemService.addStockItemToCollectionIfMissing).toHaveBeenCalledWith(
        stockItemCollection,
        ...additionalStockItems.map(expect.objectContaining)
      );
      expect(comp.stockItemsSharedCollection).toEqual(expectedCollection);
    });

    it('Should update editForm', () => {
      const stockMovement: IStockMovement = { id: 456 };
      const fromWarehouse: IWarehouse = { id: 2708 };
      stockMovement.fromWarehouse = fromWarehouse;
      const toWarehouse: IWarehouse = { id: 43069 };
      stockMovement.toWarehouse = toWarehouse;
      const stockItem: IStockItem = { id: 11702 };
      stockMovement.stockItem = stockItem;

      activatedRoute.data = of({ stockMovement });
      comp.ngOnInit();

      expect(comp.warehousesSharedCollection).toContain(fromWarehouse);
      expect(comp.warehousesSharedCollection).toContain(toWarehouse);
      expect(comp.stockItemsSharedCollection).toContain(stockItem);
      expect(comp.stockMovement).toEqual(stockMovement);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IStockMovement>>();
      const stockMovement = { id: 123 };
      jest.spyOn(stockMovementFormService, 'getStockMovement').mockReturnValue(stockMovement);
      jest.spyOn(stockMovementService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ stockMovement });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: stockMovement }));
      saveSubject.complete();

      // THEN
      expect(stockMovementFormService.getStockMovement).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(stockMovementService.update).toHaveBeenCalledWith(expect.objectContaining(stockMovement));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IStockMovement>>();
      const stockMovement = { id: 123 };
      jest.spyOn(stockMovementFormService, 'getStockMovement').mockReturnValue({ id: null });
      jest.spyOn(stockMovementService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ stockMovement: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: stockMovement }));
      saveSubject.complete();

      // THEN
      expect(stockMovementFormService.getStockMovement).toHaveBeenCalled();
      expect(stockMovementService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IStockMovement>>();
      const stockMovement = { id: 123 };
      jest.spyOn(stockMovementService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ stockMovement });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(stockMovementService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('compareWarehouse', () => {
      it('Should forward to warehouseService', () => {
        const entity = { id: 123 };
        const entity2 = { id: 456 };
        jest.spyOn(warehouseService, 'compareWarehouse');
        comp.compareWarehouse(entity, entity2);
        expect(warehouseService.compareWarehouse).toHaveBeenCalledWith(entity, entity2);
      });
    });

    describe('compareStockItem', () => {
      it('Should forward to stockItemService', () => {
        const entity = { id: 123 };
        const entity2 = { id: 456 };
        jest.spyOn(stockItemService, 'compareStockItem');
        comp.compareStockItem(entity, entity2);
        expect(stockItemService.compareStockItem).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
