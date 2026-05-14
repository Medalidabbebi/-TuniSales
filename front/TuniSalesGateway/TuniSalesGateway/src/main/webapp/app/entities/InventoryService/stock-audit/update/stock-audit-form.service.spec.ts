import { TestBed } from '@angular/core/testing';

import { sampleWithRequiredData, sampleWithNewData } from '../stock-audit.test-samples';

import { StockAuditFormService } from './stock-audit-form.service';

describe('StockAudit Form Service', () => {
  let service: StockAuditFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StockAuditFormService);
  });

  describe('Service methods', () => {
    describe('createStockAuditFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createStockAuditFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            tenantId: expect.any(Object),
            status: expect.any(Object),
            theoreticalCount: expect.any(Object),
            physicalCount: expect.any(Object),
            discrepancyCount: expect.any(Object),
            notes: expect.any(Object),
            auditorLogin: expect.any(Object),
            startedAt: expect.any(Object),
            closedAt: expect.any(Object),
            warehouse: expect.any(Object),
          })
        );
      });

      it('passing IStockAudit should create a new form with FormGroup', () => {
        const formGroup = service.createStockAuditFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            tenantId: expect.any(Object),
            status: expect.any(Object),
            theoreticalCount: expect.any(Object),
            physicalCount: expect.any(Object),
            discrepancyCount: expect.any(Object),
            notes: expect.any(Object),
            auditorLogin: expect.any(Object),
            startedAt: expect.any(Object),
            closedAt: expect.any(Object),
            warehouse: expect.any(Object),
          })
        );
      });
    });

    describe('getStockAudit', () => {
      it('should return NewStockAudit for default StockAudit initial value', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const formGroup = service.createStockAuditFormGroup(sampleWithNewData);

        const stockAudit = service.getStockAudit(formGroup) as any;

        expect(stockAudit).toMatchObject(sampleWithNewData);
      });

      it('should return NewStockAudit for empty StockAudit initial value', () => {
        const formGroup = service.createStockAuditFormGroup();

        const stockAudit = service.getStockAudit(formGroup) as any;

        expect(stockAudit).toMatchObject({});
      });

      it('should return IStockAudit', () => {
        const formGroup = service.createStockAuditFormGroup(sampleWithRequiredData);

        const stockAudit = service.getStockAudit(formGroup) as any;

        expect(stockAudit).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IStockAudit should not enable id FormControl', () => {
        const formGroup = service.createStockAuditFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewStockAudit should disable id FormControl', () => {
        const formGroup = service.createStockAuditFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
