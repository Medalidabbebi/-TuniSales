import { TestBed } from '@angular/core/testing';

import { sampleWithRequiredData, sampleWithNewData } from '../order-line-item.test-samples';

import { OrderLineItemFormService } from './order-line-item-form.service';

describe('OrderLineItem Form Service', () => {
  let service: OrderLineItemFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrderLineItemFormService);
  });

  describe('Service methods', () => {
    describe('createOrderLineItemFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createOrderLineItemFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            stockItemId: expect.any(Object),
            stockItemImei: expect.any(Object),
            assignedAt: expect.any(Object),
            orderLine: expect.any(Object),
          })
        );
      });

      it('passing IOrderLineItem should create a new form with FormGroup', () => {
        const formGroup = service.createOrderLineItemFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            stockItemId: expect.any(Object),
            stockItemImei: expect.any(Object),
            assignedAt: expect.any(Object),
            orderLine: expect.any(Object),
          })
        );
      });
    });

    describe('getOrderLineItem', () => {
      it('should return NewOrderLineItem for default OrderLineItem initial value', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const formGroup = service.createOrderLineItemFormGroup(sampleWithNewData);

        const orderLineItem = service.getOrderLineItem(formGroup) as any;

        expect(orderLineItem).toMatchObject(sampleWithNewData);
      });

      it('should return NewOrderLineItem for empty OrderLineItem initial value', () => {
        const formGroup = service.createOrderLineItemFormGroup();

        const orderLineItem = service.getOrderLineItem(formGroup) as any;

        expect(orderLineItem).toMatchObject({});
      });

      it('should return IOrderLineItem', () => {
        const formGroup = service.createOrderLineItemFormGroup(sampleWithRequiredData);

        const orderLineItem = service.getOrderLineItem(formGroup) as any;

        expect(orderLineItem).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IOrderLineItem should not enable id FormControl', () => {
        const formGroup = service.createOrderLineItemFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewOrderLineItem should disable id FormControl', () => {
        const formGroup = service.createOrderLineItemFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
