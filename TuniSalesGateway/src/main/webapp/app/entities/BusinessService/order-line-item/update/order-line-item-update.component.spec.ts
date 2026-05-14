import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject, from } from 'rxjs';

import { OrderLineItemFormService } from './order-line-item-form.service';
import { OrderLineItemService } from '../service/order-line-item.service';
import { IOrderLineItem } from '../order-line-item.model';
import { IOrderLine } from 'app/entities/BusinessService/order-line/order-line.model';
import { OrderLineService } from 'app/entities/BusinessService/order-line/service/order-line.service';

import { OrderLineItemUpdateComponent } from './order-line-item-update.component';

describe('OrderLineItem Management Update Component', () => {
  let comp: OrderLineItemUpdateComponent;
  let fixture: ComponentFixture<OrderLineItemUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let orderLineItemFormService: OrderLineItemFormService;
  let orderLineItemService: OrderLineItemService;
  let orderLineService: OrderLineService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      declarations: [OrderLineItemUpdateComponent],
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
      .overrideTemplate(OrderLineItemUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(OrderLineItemUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    orderLineItemFormService = TestBed.inject(OrderLineItemFormService);
    orderLineItemService = TestBed.inject(OrderLineItemService);
    orderLineService = TestBed.inject(OrderLineService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should call OrderLine query and add missing value', () => {
      const orderLineItem: IOrderLineItem = { id: 456 };
      const orderLine: IOrderLine = { id: 24466 };
      orderLineItem.orderLine = orderLine;

      const orderLineCollection: IOrderLine[] = [{ id: 79798 }];
      jest.spyOn(orderLineService, 'query').mockReturnValue(of(new HttpResponse({ body: orderLineCollection })));
      const additionalOrderLines = [orderLine];
      const expectedCollection: IOrderLine[] = [...additionalOrderLines, ...orderLineCollection];
      jest.spyOn(orderLineService, 'addOrderLineToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ orderLineItem });
      comp.ngOnInit();

      expect(orderLineService.query).toHaveBeenCalled();
      expect(orderLineService.addOrderLineToCollectionIfMissing).toHaveBeenCalledWith(
        orderLineCollection,
        ...additionalOrderLines.map(expect.objectContaining)
      );
      expect(comp.orderLinesSharedCollection).toEqual(expectedCollection);
    });

    it('Should update editForm', () => {
      const orderLineItem: IOrderLineItem = { id: 456 };
      const orderLine: IOrderLine = { id: 4236 };
      orderLineItem.orderLine = orderLine;

      activatedRoute.data = of({ orderLineItem });
      comp.ngOnInit();

      expect(comp.orderLinesSharedCollection).toContain(orderLine);
      expect(comp.orderLineItem).toEqual(orderLineItem);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IOrderLineItem>>();
      const orderLineItem = { id: 123 };
      jest.spyOn(orderLineItemFormService, 'getOrderLineItem').mockReturnValue(orderLineItem);
      jest.spyOn(orderLineItemService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ orderLineItem });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: orderLineItem }));
      saveSubject.complete();

      // THEN
      expect(orderLineItemFormService.getOrderLineItem).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(orderLineItemService.update).toHaveBeenCalledWith(expect.objectContaining(orderLineItem));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IOrderLineItem>>();
      const orderLineItem = { id: 123 };
      jest.spyOn(orderLineItemFormService, 'getOrderLineItem').mockReturnValue({ id: null });
      jest.spyOn(orderLineItemService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ orderLineItem: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: orderLineItem }));
      saveSubject.complete();

      // THEN
      expect(orderLineItemFormService.getOrderLineItem).toHaveBeenCalled();
      expect(orderLineItemService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IOrderLineItem>>();
      const orderLineItem = { id: 123 };
      jest.spyOn(orderLineItemService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ orderLineItem });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(orderLineItemService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('compareOrderLine', () => {
      it('Should forward to orderLineService', () => {
        const entity = { id: 123 };
        const entity2 = { id: 456 };
        jest.spyOn(orderLineService, 'compareOrderLine');
        comp.compareOrderLine(entity, entity2);
        expect(orderLineService.compareOrderLine).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
