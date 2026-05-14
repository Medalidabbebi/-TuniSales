import { TestBed } from '@angular/core/testing';

import { sampleWithRequiredData, sampleWithNewData } from '../stock-item.test-samples';

import { StockItemFormService } from './stock-item-form.service';

describe('StockItem Form Service', () => {
  let service: StockItemFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StockItemFormService);
  });

  describe('Service methods', () => {
    describe('createStockItemFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createStockItemFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            tenantId: expect.any(Object),
            productId: expect.any(Object),
            productName: expect.any(Object),
            imei: expect.any(Object),
            status: expect.any(Object),
            isDeleted: expect.any(Object),
            acquiredAt: expect.any(Object),
            updatedAt: expect.any(Object),
            warehouse: expect.any(Object),
          })
        );
      });

      it('passing IStockItem should create a new form with FormGroup', () => {
        const formGroup = service.createStockItemFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            tenantId: expect.any(Object),
            productId: expect.any(Object),
            productName: expect.any(Object),
            imei: expect.any(Object),
            status: expect.any(Object),
            isDeleted: expect.any(Object),
            acquiredAt: expect.any(Object),
            updatedAt: expect.any(Object),
            warehouse: expect.any(Object),
          })
        );
      });
    });

    describe('getStockItem', () => {
      it('should return NewStockItem for default StockItem initial value', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const formGroup = service.createStockItemFormGroup(sampleWithNewData);

        const stockItem = service.getStockItem(formGroup) as any;

        expect(stockItem).toMatchObject(sampleWithNewData);
      });

      it('should return NewStockItem for empty StockItem initial value', () => {
        const formGroup = service.createStockItemFormGroup();

        const stockItem = service.getStockItem(formGroup) as any;

        expect(stockItem).toMatchObject({});
      });

      it('should return IStockItem', () => {
        const formGroup = service.createStockItemFormGroup(sampleWithRequiredData);

        const stockItem = service.getStockItem(formGroup) as any;

        expect(stockItem).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IStockItem should not enable id FormControl', () => {
        const formGroup = service.createStockItemFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewStockItem should disable id FormControl', () => {
        const formGroup = service.createStockItemFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
