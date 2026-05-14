import { TestBed } from '@angular/core/testing';

import { sampleWithRequiredData, sampleWithNewData } from '../objective.test-samples';

import { ObjectiveFormService } from './objective-form.service';

describe('Objective Form Service', () => {
  let service: ObjectiveFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ObjectiveFormService);
  });

  describe('Service methods', () => {
    describe('createObjectiveFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createObjectiveFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            tenantId: expect.any(Object),
            assignedToLogin: expect.any(Object),
            period: expect.any(Object),
            metricType: expect.any(Object),
            targetValue: expect.any(Object),
            achievedValue: expect.any(Object),
            createdAt: expect.any(Object),
            updatedAt: expect.any(Object),
          })
        );
      });

      it('passing IObjective should create a new form with FormGroup', () => {
        const formGroup = service.createObjectiveFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            tenantId: expect.any(Object),
            assignedToLogin: expect.any(Object),
            period: expect.any(Object),
            metricType: expect.any(Object),
            targetValue: expect.any(Object),
            achievedValue: expect.any(Object),
            createdAt: expect.any(Object),
            updatedAt: expect.any(Object),
          })
        );
      });
    });

    describe('getObjective', () => {
      it('should return NewObjective for default Objective initial value', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const formGroup = service.createObjectiveFormGroup(sampleWithNewData);

        const objective = service.getObjective(formGroup) as any;

        expect(objective).toMatchObject(sampleWithNewData);
      });

      it('should return NewObjective for empty Objective initial value', () => {
        const formGroup = service.createObjectiveFormGroup();

        const objective = service.getObjective(formGroup) as any;

        expect(objective).toMatchObject({});
      });

      it('should return IObjective', () => {
        const formGroup = service.createObjectiveFormGroup(sampleWithRequiredData);

        const objective = service.getObjective(formGroup) as any;

        expect(objective).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IObjective should not enable id FormControl', () => {
        const formGroup = service.createObjectiveFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewObjective should disable id FormControl', () => {
        const formGroup = service.createObjectiveFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
