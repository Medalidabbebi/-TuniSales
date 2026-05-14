import { TestBed } from '@angular/core/testing';

import { sampleWithRequiredData, sampleWithNewData } from '../price-list.test-samples';

import { PriceListFormService } from './price-list-form.service';

describe('PriceList Form Service', () => {
  let service: PriceListFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PriceListFormService);
  });

  describe('Service methods', () => {
    describe('createPriceListFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createPriceListFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            unitPrice: expect.any(Object),
            maxDiscountPct: expect.any(Object),
            validFrom: expect.any(Object),
            validTo: expect.any(Object),
            isActive: expect.any(Object),
            createdAt: expect.any(Object),
            product: expect.any(Object),
            client: expect.any(Object),
          })
        );
      });

      it('passing IPriceList should create a new form with FormGroup', () => {
        const formGroup = service.createPriceListFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            unitPrice: expect.any(Object),
            maxDiscountPct: expect.any(Object),
            validFrom: expect.any(Object),
            validTo: expect.any(Object),
            isActive: expect.any(Object),
            createdAt: expect.any(Object),
            product: expect.any(Object),
            client: expect.any(Object),
          })
        );
      });
    });

    describe('getPriceList', () => {
      it('should return NewPriceList for default PriceList initial value', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const formGroup = service.createPriceListFormGroup(sampleWithNewData);

        const priceList = service.getPriceList(formGroup) as any;

        expect(priceList).toMatchObject(sampleWithNewData);
      });

      it('should return NewPriceList for empty PriceList initial value', () => {
        const formGroup = service.createPriceListFormGroup();

        const priceList = service.getPriceList(formGroup) as any;

        expect(priceList).toMatchObject({});
      });

      it('should return IPriceList', () => {
        const formGroup = service.createPriceListFormGroup(sampleWithRequiredData);

        const priceList = service.getPriceList(formGroup) as any;

        expect(priceList).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IPriceList should not enable id FormControl', () => {
        const formGroup = service.createPriceListFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewPriceList should disable id FormControl', () => {
        const formGroup = service.createPriceListFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
