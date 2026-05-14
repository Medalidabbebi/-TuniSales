import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject, from } from 'rxjs';

import { StockAuditLineFormService } from './stock-audit-line-form.service';
import { StockAuditLineService } from '../service/stock-audit-line.service';
import { IStockAuditLine } from '../stock-audit-line.model';
import { IStockItem } from 'app/entities/InventoryService/stock-item/stock-item.model';
import { StockItemService } from 'app/entities/InventoryService/stock-item/service/stock-item.service';
import { IStockAudit } from 'app/entities/InventoryService/stock-audit/stock-audit.model';
import { StockAuditService } from 'app/entities/InventoryService/stock-audit/service/stock-audit.service';

import { StockAuditLineUpdateComponent } from './stock-audit-line-update.component';

describe('StockAuditLine Management Update Component', () => {
  let comp: StockAuditLineUpdateComponent;
  let fixture: ComponentFixture<StockAuditLineUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let stockAuditLineFormService: StockAuditLineFormService;
  let stockAuditLineService: StockAuditLineService;
  let stockItemService: StockItemService;
  let stockAuditService: StockAuditService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      declarations: [StockAuditLineUpdateComponent],
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
      .overrideTemplate(StockAuditLineUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(StockAuditLineUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    stockAuditLineFormService = TestBed.inject(StockAuditLineFormService);
    stockAuditLineService = TestBed.inject(StockAuditLineService);
    stockItemService = TestBed.inject(StockItemService);
    stockAuditService = TestBed.inject(StockAuditService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should call StockItem query and add missing value', () => {
      const stockAuditLine: IStockAuditLine = { id: 456 };
      const stockItem: IStockItem = { id: 61570 };
      stockAuditLine.stockItem = stockItem;

      const stockItemCollection: IStockItem[] = [{ id: 92035 }];
      jest.spyOn(stockItemService, 'query').mockReturnValue(of(new HttpResponse({ body: stockItemCollection })));
      const additionalStockItems = [stockItem];
      const expectedCollection: IStockItem[] = [...additionalStockItems, ...stockItemCollection];
      jest.spyOn(stockItemService, 'addStockItemToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ stockAuditLine });
      comp.ngOnInit();

      expect(stockItemService.query).toHaveBeenCalled();
      expect(stockItemService.addStockItemToCollectionIfMissing).toHaveBeenCalledWith(
        stockItemCollection,
        ...additionalStockItems.map(expect.objectContaining)
      );
      expect(comp.stockItemsSharedCollection).toEqual(expectedCollection);
    });

    it('Should call StockAudit query and add missing value', () => {
      const stockAuditLine: IStockAuditLine = { id: 456 };
      const audit: IStockAudit = { id: 40448 };
      stockAuditLine.audit = audit;

      const stockAuditCollection: IStockAudit[] = [{ id: 54095 }];
      jest.spyOn(stockAuditService, 'query').mockReturnValue(of(new HttpResponse({ body: stockAuditCollection })));
      const additionalStockAudits = [audit];
      const expectedCollection: IStockAudit[] = [...additionalStockAudits, ...stockAuditCollection];
      jest.spyOn(stockAuditService, 'addStockAuditToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ stockAuditLine });
      comp.ngOnInit();

      expect(stockAuditService.query).toHaveBeenCalled();
      expect(stockAuditService.addStockAuditToCollectionIfMissing).toHaveBeenCalledWith(
        stockAuditCollection,
        ...additionalStockAudits.map(expect.objectContaining)
      );
      expect(comp.stockAuditsSharedCollection).toEqual(expectedCollection);
    });

    it('Should update editForm', () => {
      const stockAuditLine: IStockAuditLine = { id: 456 };
      const stockItem: IStockItem = { id: 75773 };
      stockAuditLine.stockItem = stockItem;
      const audit: IStockAudit = { id: 29006 };
      stockAuditLine.audit = audit;

      activatedRoute.data = of({ stockAuditLine });
      comp.ngOnInit();

      expect(comp.stockItemsSharedCollection).toContain(stockItem);
      expect(comp.stockAuditsSharedCollection).toContain(audit);
      expect(comp.stockAuditLine).toEqual(stockAuditLine);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IStockAuditLine>>();
      const stockAuditLine = { id: 123 };
      jest.spyOn(stockAuditLineFormService, 'getStockAuditLine').mockReturnValue(stockAuditLine);
      jest.spyOn(stockAuditLineService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ stockAuditLine });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: stockAuditLine }));
      saveSubject.complete();

      // THEN
      expect(stockAuditLineFormService.getStockAuditLine).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(stockAuditLineService.update).toHaveBeenCalledWith(expect.objectContaining(stockAuditLine));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IStockAuditLine>>();
      const stockAuditLine = { id: 123 };
      jest.spyOn(stockAuditLineFormService, 'getStockAuditLine').mockReturnValue({ id: null });
      jest.spyOn(stockAuditLineService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ stockAuditLine: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: stockAuditLine }));
      saveSubject.complete();

      // THEN
      expect(stockAuditLineFormService.getStockAuditLine).toHaveBeenCalled();
      expect(stockAuditLineService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IStockAuditLine>>();
      const stockAuditLine = { id: 123 };
      jest.spyOn(stockAuditLineService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ stockAuditLine });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(stockAuditLineService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('compareStockItem', () => {
      it('Should forward to stockItemService', () => {
        const entity = { id: 123 };
        const entity2 = { id: 456 };
        jest.spyOn(stockItemService, 'compareStockItem');
        comp.compareStockItem(entity, entity2);
        expect(stockItemService.compareStockItem).toHaveBeenCalledWith(entity, entity2);
      });
    });

    describe('compareStockAudit', () => {
      it('Should forward to stockAuditService', () => {
        const entity = { id: 123 };
        const entity2 = { id: 456 };
        jest.spyOn(stockAuditService, 'compareStockAudit');
        comp.compareStockAudit(entity, entity2);
        expect(stockAuditService.compareStockAudit).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
