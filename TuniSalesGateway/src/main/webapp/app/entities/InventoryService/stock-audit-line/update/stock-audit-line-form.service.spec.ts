import { TestBed } from '@angular/core/testing';

import { sampleWithRequiredData, sampleWithNewData } from '../stock-audit-line.test-samples';

import { StockAuditLineFormService } from './stock-audit-line-form.service';

describe('StockAuditLine Form Service', () => {
  let service: StockAuditLineFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StockAuditLineFormService);
  });

  describe('Service methods', () => {
    describe('createStockAuditLineFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createStockAuditLineFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            foundPhysically: expect.any(Object),
            resolution: expect.any(Object),
            resolutionNote: expect.any(Object),
            createdAt: expect.any(Object),
            stockItem: expect.any(Object),
            audit: expect.any(Object),
          })
        );
      });

      it('passing IStockAuditLine should create a new form with FormGroup', () => {
        const formGroup = service.createStockAuditLineFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            foundPhysically: expect.any(Object),
            resolution: expect.any(Object),
            resolutionNote: expect.any(Object),
            createdAt: expect.any(Object),
            stockItem: expect.any(Object),
            audit: expect.any(Object),
          })
        );
      });
    });

    describe('getStockAuditLine', () => {
      it('should return NewStockAuditLine for default StockAuditLine initial value', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const formGroup = service.createStockAuditLineFormGroup(sampleWithNewData);

        const stockAuditLine = service.getStockAuditLine(formGroup) as any;

        expect(stockAuditLine).toMatchObject(sampleWithNewData);
      });

      it('should return NewStockAuditLine for empty StockAuditLine initial value', () => {
        const formGroup = service.createStockAuditLineFormGroup();

        const stockAuditLine = service.getStockAuditLine(formGroup) as any;

        expect(stockAuditLine).toMatchObject({});
      });

      it('should return IStockAuditLine', () => {
        const formGroup = service.createStockAuditLineFormGroup(sampleWithRequiredData);

        const stockAuditLine = service.getStockAuditLine(formGroup) as any;

        expect(stockAuditLine).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IStockAuditLine should not enable id FormControl', () => {
        const formGroup = service.createStockAuditLineFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewStockAuditLine should disable id FormControl', () => {
        const formGroup = service.createStockAuditLineFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
