import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject, from } from 'rxjs';

import { VisitFormService } from './visit-form.service';
import { VisitService } from '../service/visit.service';
import { IVisit } from '../visit.model';
import { IClient } from 'app/entities/BusinessService/client/client.model';
import { ClientService } from 'app/entities/BusinessService/client/service/client.service';
import { IMission } from 'app/entities/BusinessService/mission/mission.model';
import { MissionService } from 'app/entities/BusinessService/mission/service/mission.service';

import { VisitUpdateComponent } from './visit-update.component';

describe('Visit Management Update Component', () => {
  let comp: VisitUpdateComponent;
  let fixture: ComponentFixture<VisitUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let visitFormService: VisitFormService;
  let visitService: VisitService;
  let clientService: ClientService;
  let missionService: MissionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      declarations: [VisitUpdateComponent],
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
      .overrideTemplate(VisitUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(VisitUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    visitFormService = TestBed.inject(VisitFormService);
    visitService = TestBed.inject(VisitService);
    clientService = TestBed.inject(ClientService);
    missionService = TestBed.inject(MissionService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should call Client query and add missing value', () => {
      const visit: IVisit = { id: 456 };
      const client: IClient = { id: 8683 };
      visit.client = client;

      const clientCollection: IClient[] = [{ id: 96286 }];
      jest.spyOn(clientService, 'query').mockReturnValue(of(new HttpResponse({ body: clientCollection })));
      const additionalClients = [client];
      const expectedCollection: IClient[] = [...additionalClients, ...clientCollection];
      jest.spyOn(clientService, 'addClientToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ visit });
      comp.ngOnInit();

      expect(clientService.query).toHaveBeenCalled();
      expect(clientService.addClientToCollectionIfMissing).toHaveBeenCalledWith(
        clientCollection,
        ...additionalClients.map(expect.objectContaining)
      );
      expect(comp.clientsSharedCollection).toEqual(expectedCollection);
    });

    it('Should call Mission query and add missing value', () => {
      const visit: IVisit = { id: 456 };
      const mission: IMission = { id: 84821 };
      visit.mission = mission;

      const missionCollection: IMission[] = [{ id: 32196 }];
      jest.spyOn(missionService, 'query').mockReturnValue(of(new HttpResponse({ body: missionCollection })));
      const additionalMissions = [mission];
      const expectedCollection: IMission[] = [...additionalMissions, ...missionCollection];
      jest.spyOn(missionService, 'addMissionToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ visit });
      comp.ngOnInit();

      expect(missionService.query).toHaveBeenCalled();
      expect(missionService.addMissionToCollectionIfMissing).toHaveBeenCalledWith(
        missionCollection,
        ...additionalMissions.map(expect.objectContaining)
      );
      expect(comp.missionsSharedCollection).toEqual(expectedCollection);
    });

    it('Should update editForm', () => {
      const visit: IVisit = { id: 456 };
      const client: IClient = { id: 17208 };
      visit.client = client;
      const mission: IMission = { id: 92506 };
      visit.mission = mission;

      activatedRoute.data = of({ visit });
      comp.ngOnInit();

      expect(comp.clientsSharedCollection).toContain(client);
      expect(comp.missionsSharedCollection).toContain(mission);
      expect(comp.visit).toEqual(visit);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IVisit>>();
      const visit = { id: 123 };
      jest.spyOn(visitFormService, 'getVisit').mockReturnValue(visit);
      jest.spyOn(visitService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ visit });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: visit }));
      saveSubject.complete();

      // THEN
      expect(visitFormService.getVisit).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(visitService.update).toHaveBeenCalledWith(expect.objectContaining(visit));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IVisit>>();
      const visit = { id: 123 };
      jest.spyOn(visitFormService, 'getVisit').mockReturnValue({ id: null });
      jest.spyOn(visitService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ visit: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: visit }));
      saveSubject.complete();

      // THEN
      expect(visitFormService.getVisit).toHaveBeenCalled();
      expect(visitService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IVisit>>();
      const visit = { id: 123 };
      jest.spyOn(visitService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ visit });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(visitService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('compareClient', () => {
      it('Should forward to clientService', () => {
        const entity = { id: 123 };
        const entity2 = { id: 456 };
        jest.spyOn(clientService, 'compareClient');
        comp.compareClient(entity, entity2);
        expect(clientService.compareClient).toHaveBeenCalledWith(entity, entity2);
      });
    });

    describe('compareMission', () => {
      it('Should forward to missionService', () => {
        const entity = { id: 123 };
        const entity2 = { id: 456 };
        jest.spyOn(missionService, 'compareMission');
        comp.compareMission(entity, entity2);
        expect(missionService.compareMission).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
