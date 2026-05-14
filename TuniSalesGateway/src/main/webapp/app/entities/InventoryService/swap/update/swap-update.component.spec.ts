import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject, from } from 'rxjs';

import { SwapFormService } from './swap-form.service';
import { SwapService } from '../service/swap.service';
import { ISwap } from '../swap.model';
import { IStockItem } from 'app/entities/InventoryService/stock-item/stock-item.model';
import { StockItemService } from 'app/entities/InventoryService/stock-item/service/stock-item.service';

import { SwapUpdateComponent } from './swap-update.component';

describe('Swap Management Update Component', () => {
  let comp: SwapUpdateComponent;
  let fixture: ComponentFixture<SwapUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let swapFormService: SwapFormService;
  let swapService: SwapService;
  let stockItemService: StockItemService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      declarations: [SwapUpdateComponent],
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
      .overrideTemplate(SwapUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(SwapUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    swapFormService = TestBed.inject(SwapFormService);
    swapService = TestBed.inject(SwapService);
    stockItemService = TestBed.inject(StockItemService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should call StockItem query and add missing value', () => {
      const swap: ISwap = { id: 456 };
      const outgoingItem: IStockItem = { id: 42947 };
      swap.outgoingItem = outgoingItem;
      const incomingItem: IStockItem = { id: 16365 };
      swap.incomingItem = incomingItem;

      const stockItemCollection: IStockItem[] = [{ id: 24632 }];
      jest.spyOn(stockItemService, 'query').mockReturnValue(of(new HttpResponse({ body: stockItemCollection })));
      const additionalStockItems = [outgoingItem, incomingItem];
      const expectedCollection: IStockItem[] = [...additionalStockItems, ...stockItemCollection];
      jest.spyOn(stockItemService, 'addStockItemToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ swap });
      comp.ngOnInit();

      expect(stockItemService.query).toHaveBeenCalled();
      expect(stockItemService.addStockItemToCollectionIfMissing).toHaveBeenCalledWith(
        stockItemCollection,
        ...additionalStockItems.map(expect.objectContaining)
      );
      expect(comp.stockItemsSharedCollection).toEqual(expectedCollection);
    });

    it('Should update editForm', () => {
      const swap: ISwap = { id: 456 };
      const outgoingItem: IStockItem = { id: 29561 };
      swap.outgoingItem = outgoingItem;
      const incomingItem: IStockItem = { id: 17050 };
      swap.incomingItem = incomingItem;

      activatedRoute.data = of({ swap });
      comp.ngOnInit();

      expect(comp.stockItemsSharedCollection).toContain(outgoingItem);
      expect(comp.stockItemsSharedCollection).toContain(incomingItem);
      expect(comp.swap).toEqual(swap);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ISwap>>();
      const swap = { id: 123 };
      jest.spyOn(swapFormService, 'getSwap').mockReturnValue(swap);
      jest.spyOn(swapService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ swap });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: swap }));
      saveSubject.complete();

      // THEN
      expect(swapFormService.getSwap).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(swapService.update).toHaveBeenCalledWith(expect.objectContaining(swap));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ISwap>>();
      const swap = { id: 123 };
      jest.spyOn(swapFormService, 'getSwap').mockReturnValue({ id: null });
      jest.spyOn(swapService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ swap: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: swap }));
      saveSubject.complete();

      // THEN
      expect(swapFormService.getSwap).toHaveBeenCalled();
      expect(swapService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ISwap>>();
      const swap = { id: 123 };
      jest.spyOn(swapService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ swap });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(swapService.update).toHaveBeenCalled();
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
  });
});
