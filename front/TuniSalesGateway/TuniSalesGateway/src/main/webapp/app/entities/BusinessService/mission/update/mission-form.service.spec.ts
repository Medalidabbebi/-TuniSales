import { TestBed } from '@angular/core/testing';

import { sampleWithRequiredData, sampleWithNewData } from '../mission.test-samples';

import { MissionFormService } from './mission-form.service';

describe('Mission Form Service', () => {
  let service: MissionFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MissionFormService);
  });

  describe('Service methods', () => {
    describe('createMissionFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createMissionFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            tenantId: expect.any(Object),
            assignedToLogin: expect.any(Object),
            title: expect.any(Object),
            description: expect.any(Object),
            missionDate: expect.any(Object),
            status: expect.any(Object),
            createdAt: expect.any(Object),
            updatedAt: expect.any(Object),
          })
        );
      });

      it('passing IMission should create a new form with FormGroup', () => {
        const formGroup = service.createMissionFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            tenantId: expect.any(Object),
            assignedToLogin: expect.any(Object),
            title: expect.any(Object),
            description: expect.any(Object),
            missionDate: expect.any(Object),
            status: expect.any(Object),
            createdAt: expect.any(Object),
            updatedAt: expect.any(Object),
          })
        );
      });
    });

    describe('getMission', () => {
      it('should return NewMission for default Mission initial value', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const formGroup = service.createMissionFormGroup(sampleWithNewData);

        const mission = service.getMission(formGroup) as any;

        expect(mission).toMatchObject(sampleWithNewData);
      });

      it('should return NewMission for empty Mission initial value', () => {
        const formGroup = service.createMissionFormGroup();

        const mission = service.getMission(formGroup) as any;

        expect(mission).toMatchObject({});
      });

      it('should return IMission', () => {
        const formGroup = service.createMissionFormGroup(sampleWithRequiredData);

        const mission = service.getMission(formGroup) as any;

        expect(mission).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IMission should not enable id FormControl', () => {
        const formGroup = service.createMissionFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewMission should disable id FormControl', () => {
        const formGroup = service.createMissionFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
