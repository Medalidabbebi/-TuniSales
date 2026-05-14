import { TestBed } from '@angular/core/testing';

import { sampleWithRequiredData, sampleWithNewData } from '../client-contact.test-samples';

import { ClientContactFormService } from './client-contact-form.service';

describe('ClientContact Form Service', () => {
  let service: ClientContactFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClientContactFormService);
  });

  describe('Service methods', () => {
    describe('createClientContactFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createClientContactFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            fullName: expect.any(Object),
            email: expect.any(Object),
            phone: expect.any(Object),
            role: expect.any(Object),
            isPrimary: expect.any(Object),
            createdAt: expect.any(Object),
            client: expect.any(Object),
          })
        );
      });

      it('passing IClientContact should create a new form with FormGroup', () => {
        const formGroup = service.createClientContactFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            fullName: expect.any(Object),
            email: expect.any(Object),
            phone: expect.any(Object),
            role: expect.any(Object),
            isPrimary: expect.any(Object),
            createdAt: expect.any(Object),
            client: expect.any(Object),
          })
        );
      });
    });

    describe('getClientContact', () => {
      it('should return NewClientContact for default ClientContact initial value', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const formGroup = service.createClientContactFormGroup(sampleWithNewData);

        const clientContact = service.getClientContact(formGroup) as any;

        expect(clientContact).toMatchObject(sampleWithNewData);
      });

      it('should return NewClientContact for empty ClientContact initial value', () => {
        const formGroup = service.createClientContactFormGroup();

        const clientContact = service.getClientContact(formGroup) as any;

        expect(clientContact).toMatchObject({});
      });

      it('should return IClientContact', () => {
        const formGroup = service.createClientContactFormGroup(sampleWithRequiredData);

        const clientContact = service.getClientContact(formGroup) as any;

        expect(clientContact).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IClientContact should not enable id FormControl', () => {
        const formGroup = service.createClientContactFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewClientContact should disable id FormControl', () => {
        const formGroup = service.createClientContactFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
