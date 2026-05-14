import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject, from } from 'rxjs';

import { DeliveryFormService } from './delivery-form.service';
import { DeliveryService } from '../service/delivery.service';
import { IDelivery } from '../delivery.model';
import { IOrder } from 'app/entities/BusinessService/order/order.model';
import { OrderService } from 'app/entities/BusinessService/order/service/order.service';

import { DeliveryUpdateComponent } from './delivery-update.component';

describe('Delivery Management Update Component', () => {
  let comp: DeliveryUpdateComponent;
  let fixture: ComponentFixture<DeliveryUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let deliveryFormService: DeliveryFormService;
  let deliveryService: DeliveryService;
  let orderService: OrderService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      declarations: [DeliveryUpdateComponent],
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
      .overrideTemplate(DeliveryUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(DeliveryUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    deliveryFormService = TestBed.inject(DeliveryFormService);
    deliveryService = TestBed.inject(DeliveryService);
    orderService = TestBed.inject(OrderService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should call Order query and add missing value', () => {
      const delivery: IDelivery = { id: 456 };
      const order: IOrder = { id: 5576 };
      delivery.order = order;

      const orderCollection: IOrder[] = [{ id: 66076 }];
      jest.spyOn(orderService, 'query').mockReturnValue(of(new HttpResponse({ body: orderCollection })));
      const additionalOrders = [order];
      const expectedCollection: IOrder[] = [...additionalOrders, ...orderCollection];
      jest.spyOn(orderService, 'addOrderToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ delivery });
      comp.ngOnInit();

      expect(orderService.query).toHaveBeenCalled();
      expect(orderService.addOrderToCollectionIfMissing).toHaveBeenCalledWith(
        orderCollection,
        ...additionalOrders.map(expect.objectContaining)
      );
      expect(comp.ordersSharedCollection).toEqual(expectedCollection);
    });

    it('Should update editForm', () => {
      const delivery: IDelivery = { id: 456 };
      const order: IOrder = { id: 40943 };
      delivery.order = order;

      activatedRoute.data = of({ delivery });
      comp.ngOnInit();

      expect(comp.ordersSharedCollection).toContain(order);
      expect(comp.delivery).toEqual(delivery);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IDelivery>>();
      const delivery = { id: 123 };
      jest.spyOn(deliveryFormService, 'getDelivery').mockReturnValue(delivery);
      jest.spyOn(deliveryService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ delivery });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: delivery }));
      saveSubject.complete();

      // THEN
      expect(deliveryFormService.getDelivery).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(deliveryService.update).toHaveBeenCalledWith(expect.objectContaining(delivery));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IDelivery>>();
      const delivery = { id: 123 };
      jest.spyOn(deliveryFormService, 'getDelivery').mockReturnValue({ id: null });
      jest.spyOn(deliveryService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ delivery: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: delivery }));
      saveSubject.complete();

      // THEN
      expect(deliveryFormService.getDelivery).toHaveBeenCalled();
      expect(deliveryService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IDelivery>>();
      const delivery = { id: 123 };
      jest.spyOn(deliveryService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ delivery });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(deliveryService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('compareOrder', () => {
      it('Should forward to orderService', () => {
        const entity = { id: 123 };
        const entity2 = { id: 456 };
        jest.spyOn(orderService, 'compareOrder');
        comp.compareOrder(entity, entity2);
        expect(orderService.compareOrder).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
