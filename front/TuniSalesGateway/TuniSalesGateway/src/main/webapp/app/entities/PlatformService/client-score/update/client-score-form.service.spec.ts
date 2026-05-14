import { TestBed } from '@angular/core/testing';

import { sampleWithRequiredData, sampleWithNewData } from '../client-score.test-samples';

import { ClientScoreFormService } from './client-score-form.service';

describe('ClientScore Form Service', () => {
  let service: ClientScoreFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClientScoreFormService);
  });

  describe('Service methods', () => {
    describe('createClientScoreFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createClientScoreFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            tenantId: expect.any(Object),
            clientId: expect.any(Object),
            clientName: expect.any(Object),
            period: expect.any(Object),
            score: expect.any(Object),
            classification: expect.any(Object),
            breakdownJson: expect.any(Object),
            calculatedAt: expect.any(Object),
          })
        );
      });

      it('passing IClientScore should create a new form with FormGroup', () => {
        const formGroup = service.createClientScoreFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            tenantId: expect.any(Object),
            clientId: expect.any(Object),
            clientName: expect.any(Object),
            period: expect.any(Object),
            score: expect.any(Object),
            classification: expect.any(Object),
            breakdownJson: expect.any(Object),
            calculatedAt: expect.any(Object),
          })
        );
      });
    });

    describe('getClientScore', () => {
      it('should return NewClientScore for default ClientScore initial value', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const formGroup = service.createClientScoreFormGroup(sampleWithNewData);

        const clientScore = service.getClientScore(formGroup) as any;

        expect(clientScore).toMatchObject(sampleWithNewData);
      });

      it('should return NewClientScore for empty ClientScore initial value', () => {
        const formGroup = service.createClientScoreFormGroup();

        const clientScore = service.getClientScore(formGroup) as any;

        expect(clientScore).toMatchObject({});
      });

      it('should return IClientScore', () => {
        const formGroup = service.createClientScoreFormGroup(sampleWithRequiredData);

        const clientScore = service.getClientScore(formGroup) as any;

        expect(clientScore).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IClientScore should not enable id FormControl', () => {
        const formGroup = service.createClientScoreFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewClientScore should disable id FormControl', () => {
        const formGroup = service.createClientScoreFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
