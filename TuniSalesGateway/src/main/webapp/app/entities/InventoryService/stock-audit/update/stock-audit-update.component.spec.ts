import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject, from } from 'rxjs';

import { StockAuditFormService } from './stock-audit-form.service';
import { StockAuditService } from '../service/stock-audit.service';
import { IStockAudit } from '../stock-audit.model';
import { IWarehouse } from 'app/entities/InventoryService/warehouse/warehouse.model';
import { WarehouseService } from 'app/entities/InventoryService/warehouse/service/warehouse.service';

import { StockAuditUpdateComponent } from './stock-audit-update.component';

describe('StockAudit Management Update Component', () => {
  let comp: StockAuditUpdateComponent;
  let fixture: ComponentFixture<StockAuditUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let stockAuditFormService: StockAuditFormService;
  let stockAuditService: StockAuditService;
  let warehouseService: WarehouseService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      declarations: [StockAuditUpdateComponent],
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
      .overrideTemplate(StockAuditUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(StockAuditUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    stockAuditFormService = TestBed.inject(StockAuditFormService);
    stockAuditService = TestBed.inject(StockAuditService);
    warehouseService = TestBed.inject(WarehouseService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should call Warehouse query and add missing value', () => {
      const stockAudit: IStockAudit = { id: 456 };
      const warehouse: IWarehouse = { id: 95202 };
      stockAudit.warehouse = warehouse;

      const warehouseCollection: IWarehouse[] = [{ id: 96364 }];
      jest.spyOn(warehouseService, 'query').mockReturnValue(of(new HttpResponse({ body: warehouseCollection })));
      const additionalWarehouses = [warehouse];
      const expectedCollection: IWarehouse[] = [...additionalWarehouses, ...warehouseCollection];
      jest.spyOn(warehouseService, 'addWarehouseToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ stockAudit });
      comp.ngOnInit();

      expect(warehouseService.query).toHaveBeenCalled();
      expect(warehouseService.addWarehouseToCollectionIfMissing).toHaveBeenCalledWith(
        warehouseCollection,
        ...additionalWarehouses.map(expect.objectContaining)
      );
      expect(comp.warehousesSharedCollection).toEqual(expectedCollection);
    });

    it('Should update editForm', () => {
      const stockAudit: IStockAudit = { id: 456 };
      const warehouse: IWarehouse = { id: 51565 };
      stockAudit.warehouse = warehouse;

      activatedRoute.data = of({ stockAudit });
      comp.ngOnInit();

      expect(comp.warehousesSharedCollection).toContain(warehouse);
      expect(comp.stockAudit).toEqual(stockAudit);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IStockAudit>>();
      const stockAudit = { id: 123 };
      jest.spyOn(stockAuditFormService, 'getStockAudit').mockReturnValue(stockAudit);
      jest.spyOn(stockAuditService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ stockAudit });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: stockAudit }));
      saveSubject.complete();

      // THEN
      expect(stockAuditFormService.getStockAudit).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(stockAuditService.update).toHaveBeenCalledWith(expect.objectContaining(stockAudit));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IStockAudit>>();
      const stockAudit = { id: 123 };
      jest.spyOn(stockAuditFormService, 'getStockAudit').mockReturnValue({ id: null });
      jest.spyOn(stockAuditService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ stockAudit: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: stockAudit }));
      saveSubject.complete();

      // THEN
      expect(stockAuditFormService.getStockAudit).toHaveBeenCalled();
      expect(stockAuditService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IStockAudit>>();
      const stockAudit = { id: 123 };
      jest.spyOn(stockAuditService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ stockAudit });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(stockAuditService.update).toHaveBeenCalled();
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
  });
});
