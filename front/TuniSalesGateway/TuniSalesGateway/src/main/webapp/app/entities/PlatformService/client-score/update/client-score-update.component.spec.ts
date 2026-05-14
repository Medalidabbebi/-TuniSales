import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject, from } from 'rxjs';

import { ClientScoreFormService } from './client-score-form.service';
import { ClientScoreService } from '../service/client-score.service';
import { IClientScore } from '../client-score.model';

import { ClientScoreUpdateComponent } from './client-score-update.component';

describe('ClientScore Management Update Component', () => {
  let comp: ClientScoreUpdateComponent;
  let fixture: ComponentFixture<ClientScoreUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let clientScoreFormService: ClientScoreFormService;
  let clientScoreService: ClientScoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      declarations: [ClientScoreUpdateComponent],
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
      .overrideTemplate(ClientScoreUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(ClientScoreUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    clientScoreFormService = TestBed.inject(ClientScoreFormService);
    clientScoreService = TestBed.inject(ClientScoreService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should update editForm', () => {
      const clientScore: IClientScore = { id: 456 };

      activatedRoute.data = of({ clientScore });
      comp.ngOnInit();

      expect(comp.clientScore).toEqual(clientScore);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IClientScore>>();
      const clientScore = { id: 123 };
      jest.spyOn(clientScoreFormService, 'getClientScore').mockReturnValue(clientScore);
      jest.spyOn(clientScoreService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ clientScore });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: clientScore }));
      saveSubject.complete();

      // THEN
      expect(clientScoreFormService.getClientScore).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(clientScoreService.update).toHaveBeenCalledWith(expect.objectContaining(clientScore));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IClientScore>>();
      const clientScore = { id: 123 };
      jest.spyOn(clientScoreFormService, 'getClientScore').mockReturnValue({ id: null });
      jest.spyOn(clientScoreService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ clientScore: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: clientScore }));
      saveSubject.complete();

      // THEN
      expect(clientScoreFormService.getClientScore).toHaveBeenCalled();
      expect(clientScoreService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IClientScore>>();
      const clientScore = { id: 123 };
      jest.spyOn(clientScoreService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ clientScore });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(clientScoreService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });
});
