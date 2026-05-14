import { TestBed } from '@angular/core/testing';

import { sampleWithRequiredData, sampleWithNewData } from '../performance-score.test-samples';

import { PerformanceScoreFormService } from './performance-score-form.service';

describe('PerformanceScore Form Service', () => {
  let service: PerformanceScoreFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PerformanceScoreFormService);
  });

  describe('Service methods', () => {
    describe('createPerformanceScoreFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createPerformanceScoreFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            tenantId: expect.any(Object),
            userLogin: expect.any(Object),
            period: expect.any(Object),
            score: expect.any(Object),
            classification: expect.any(Object),
            breakdownJson: expect.any(Object),
            deltaVsPrevious: expect.any(Object),
            calculatedAt: expect.any(Object),
          })
        );
      });

      it('passing IPerformanceScore should create a new form with FormGroup', () => {
        const formGroup = service.createPerformanceScoreFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            tenantId: expect.any(Object),
            userLogin: expect.any(Object),
            period: expect.any(Object),
            score: expect.any(Object),
            classification: expect.any(Object),
            breakdownJson: expect.any(Object),
            deltaVsPrevious: expect.any(Object),
            calculatedAt: expect.any(Object),
          })
        );
      });
    });

    describe('getPerformanceScore', () => {
      it('should return NewPerformanceScore for default PerformanceScore initial value', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const formGroup = service.createPerformanceScoreFormGroup(sampleWithNewData);

        const performanceScore = service.getPerformanceScore(formGroup) as any;

        expect(performanceScore).toMatchObject(sampleWithNewData);
      });

      it('should return NewPerformanceScore for empty PerformanceScore initial value', () => {
        const formGroup = service.createPerformanceScoreFormGroup();

        const performanceScore = service.getPerformanceScore(formGroup) as any;

        expect(performanceScore).toMatchObject({});
      });

      it('should return IPerformanceScore', () => {
        const formGroup = service.createPerformanceScoreFormGroup(sampleWithRequiredData);

        const performanceScore = service.getPerformanceScore(formGroup) as any;

        expect(performanceScore).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IPerformanceScore should not enable id FormControl', () => {
        const formGroup = service.createPerformanceScoreFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewPerformanceScore should disable id FormControl', () => {
        const formGroup = service.createPerformanceScoreFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
