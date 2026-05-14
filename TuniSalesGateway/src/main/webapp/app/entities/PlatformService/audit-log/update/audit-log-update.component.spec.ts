import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject, from } from 'rxjs';

import { AuditLogFormService } from './audit-log-form.service';
import { AuditLogService } from '../service/audit-log.service';
import { IAuditLog } from '../audit-log.model';

import { AuditLogUpdateComponent } from './audit-log-update.component';

describe('AuditLog Management Update Component', () => {
  let comp: AuditLogUpdateComponent;
  let fixture: ComponentFixture<AuditLogUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let auditLogFormService: AuditLogFormService;
  let auditLogService: AuditLogService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      declarations: [AuditLogUpdateComponent],
      providers: [
        FormBuilder,
        {
          provide: ActivatedRoute,
          useValue: {
            params: from([{}]),
          },
        },
      ],
    })
      .overrideTemplate(AuditLogUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(AuditLogUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    auditLogFormService = TestBed.inject(AuditLogFormService);
    auditLogService = TestBed.inject(AuditLogService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should update editForm', () => {
      const auditLog: IAuditLog = { id: 456 };

      activatedRoute.data = of({ auditLog });
      comp.ngOnInit();

      expect(comp.auditLog).toEqual(auditLog);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IAuditLog>>();
      const auditLog = { id: 123 };
      jest.spyOn(auditLogFormService, 'getAuditLog').mockReturnValue(auditLog);
      jest.spyOn(auditLogService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ auditLog });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: auditLog }));
      saveSubject.complete();

      // THEN
      expect(auditLogFormService.getAuditLog).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(auditLogService.update).toHaveBeenCalledWith(expect.objectContaining(auditLog));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IAuditLog>>();
      const auditLog = { id: 123 };
      jest.spyOn(auditLogFormService, 'getAuditLog').mockReturnValue({ id: null });
      jest.spyOn(auditLogService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ auditLog: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: auditLog }));
      saveSubject.complete();

      // THEN
      expect(auditLogFormService.getAuditLog).toHaveBeenCalled();
      expect(auditLogService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IAuditLog>>();
      const auditLog = { id: 123 };
      jest.spyOn(auditLogService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ auditLog });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(auditLogService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });
});
