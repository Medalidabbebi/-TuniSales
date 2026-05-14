import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject, from } from 'rxjs';

import { PerformanceScoreFormService } from './performance-score-form.service';
import { PerformanceScoreService } from '../service/performance-score.service';
import { IPerformanceScore } from '../performance-score.model';

import { PerformanceScoreUpdateComponent } from './performance-score-update.component';

describe('PerformanceScore Management Update Component', () => {
  let comp: PerformanceScoreUpdateComponent;
  let fixture: ComponentFixture<PerformanceScoreUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let performanceScoreFormService: PerformanceScoreFormService;
  let performanceScoreService: PerformanceScoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      declarations: [PerformanceScoreUpdateComponent],
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
      .overrideTemplate(PerformanceScoreUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(PerformanceScoreUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    performanceScoreFormService = TestBed.inject(PerformanceScoreFormService);
    performanceScoreService = TestBed.inject(PerformanceScoreService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should update editForm', () => {
      const performanceScore: IPerformanceScore = { id: 456 };

      activatedRoute.data = of({ performanceScore });
      comp.ngOnInit();

      expect(comp.performanceScore).toEqual(performanceScore);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IPerformanceScore>>();
      const performanceScore = { id: 123 };
      jest.spyOn(performanceScoreFormService, 'getPerformanceScore').mockReturnValue(performanceScore);
      jest.spyOn(performanceScoreService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ performanceScore });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: performanceScore }));
      saveSubject.complete();

      // THEN
      expect(performanceScoreFormService.getPerformanceScore).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(performanceScoreService.update).toHaveBeenCalledWith(expect.objectContaining(performanceScore));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IPerformanceScore>>();
      const performanceScore = { id: 123 };
      jest.spyOn(performanceScoreFormService, 'getPerformanceScore').mockReturnValue({ id: null });
      jest.spyOn(performanceScoreService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ performanceScore: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: performanceScore }));
      saveSubject.complete();

      // THEN
      expect(performanceScoreFormService.getPerformanceScore).toHaveBeenCalled();
      expect(performanceScoreService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IPerformanceScore>>();
      const performanceScore = { id: 123 };
      jest.spyOn(performanceScoreService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ performanceScore });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(performanceScoreService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });
});
