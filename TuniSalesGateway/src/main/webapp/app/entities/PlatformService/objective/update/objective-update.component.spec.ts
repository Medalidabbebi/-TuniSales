import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject, from } from 'rxjs';

import { ObjectiveFormService } from './objective-form.service';
import { ObjectiveService } from '../service/objective.service';
import { IObjective } from '../objective.model';

import { ObjectiveUpdateComponent } from './objective-update.component';

describe('Objective Management Update Component', () => {
  let comp: ObjectiveUpdateComponent;
  let fixture: ComponentFixture<ObjectiveUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let objectiveFormService: ObjectiveFormService;
  let objectiveService: ObjectiveService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      declarations: [ObjectiveUpdateComponent],
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
      .overrideTemplate(ObjectiveUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(ObjectiveUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    objectiveFormService = TestBed.inject(ObjectiveFormService);
    objectiveService = TestBed.inject(ObjectiveService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should update editForm', () => {
      const objective: IObjective = { id: 456 };

      activatedRoute.data = of({ objective });
      comp.ngOnInit();

      expect(comp.objective).toEqual(objective);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IObjective>>();
      const objective = { id: 123 };
      jest.spyOn(objectiveFormService, 'getObjective').mockReturnValue(objective);
      jest.spyOn(objectiveService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ objective });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: objective }));
      saveSubject.complete();

      // THEN
      expect(objectiveFormService.getObjective).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(objectiveService.update).toHaveBeenCalledWith(expect.objectContaining(objective));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IObjective>>();
      const objective = { id: 123 };
      jest.spyOn(objectiveFormService, 'getObjective').mockReturnValue({ id: null });
      jest.spyOn(objectiveService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ objective: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: objective }));
      saveSubject.complete();

      // THEN
      expect(objectiveFormService.getObjective).toHaveBeenCalled();
      expect(objectiveService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IObjective>>();
      const objective = { id: 123 };
      jest.spyOn(objectiveService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ objective });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(objectiveService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });
});
