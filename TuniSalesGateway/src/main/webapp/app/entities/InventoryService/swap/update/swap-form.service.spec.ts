import { TestBed } from '@angular/core/testing';

import { sampleWithRequiredData, sampleWithNewData } from '../swap.test-samples';

import { SwapFormService } from './swap-form.service';

describe('Swap Form Service', () => {
  let service: SwapFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SwapFormService);
  });

  describe('Service methods', () => {
    describe('createSwapFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createSwapFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            tenantId: expect.any(Object),
            clientId: expect.any(Object),
            clientName: expect.any(Object),
            status: expect.any(Object),
            reason: expect.any(Object),
            createdAt: expect.any(Object),
            resolvedAt: expect.any(Object),
            updatedAt: expect.any(Object),
            outgoingItem: expect.any(Object),
            incomingItem: expect.any(Object),
          })
        );
      });

      it('passing ISwap should create a new form with FormGroup', () => {
        const formGroup = service.createSwapFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            tenantId: expect.any(Object),
            clientId: expect.any(Object),
            clientName: expect.any(Object),
            status: expect.any(Object),
            reason: expect.any(Object),
            createdAt: expect.any(Object),
            resolvedAt: expect.any(Object),
            updatedAt: expect.any(Object),
            outgoingItem: expect.any(Object),
            incomingItem: expect.any(Object),
          })
        );
      });
    });

    describe('getSwap', () => {
      it('should return NewSwap for default Swap initial value', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const formGroup = service.createSwapFormGroup(sampleWithNewData);

        const swap = service.getSwap(formGroup) as any;

        expect(swap).toMatchObject(sampleWithNewData);
      });

      it('should return NewSwap for empty Swap initial value', () => {
        const formGroup = service.createSwapFormGroup();

        const swap = service.getSwap(formGroup) as any;

        expect(swap).toMatchObject({});
      });

      it('should return ISwap', () => {
        const formGroup = service.createSwapFormGroup(sampleWithRequiredData);

        const swap = service.getSwap(formGroup) as any;

        expect(swap).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing ISwap should not enable id FormControl', () => {
        const formGroup = service.createSwapFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewSwap should disable id FormControl', () => {
        const formGroup = service.createSwapFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
