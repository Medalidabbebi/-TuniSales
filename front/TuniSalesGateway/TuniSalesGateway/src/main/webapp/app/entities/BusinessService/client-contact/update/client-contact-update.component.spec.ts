import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject, from } from 'rxjs';

import { ClientContactFormService } from './client-contact-form.service';
import { ClientContactService } from '../service/client-contact.service';
import { IClientContact } from '../client-contact.model';
import { IClient } from 'app/entities/BusinessService/client/client.model';
import { ClientService } from 'app/entities/BusinessService/client/service/client.service';

import { ClientContactUpdateComponent } from './client-contact-update.component';

describe('ClientContact Management Update Component', () => {
  let comp: ClientContactUpdateComponent;
  let fixture: ComponentFixture<ClientContactUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let clientContactFormService: ClientContactFormService;
  let clientContactService: ClientContactService;
  let clientService: ClientService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      declarations: [ClientContactUpdateComponent],
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
      .overrideTemplate(ClientContactUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(ClientContactUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    clientContactFormService = TestBed.inject(ClientContactFormService);
    clientContactService = TestBed.inject(ClientContactService);
    clientService = TestBed.inject(ClientService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should call Client query and add missing value', () => {
      const clientContact: IClientContact = { id: 456 };
      const client: IClient = { id: 76303 };
      clientContact.client = client;

      const clientCollection: IClient[] = [{ id: 99428 }];
      jest.spyOn(clientService, 'query').mockReturnValue(of(new HttpResponse({ body: clientCollection })));
      const additionalClients = [client];
      const expectedCollection: IClient[] = [...additionalClients, ...clientCollection];
      jest.spyOn(clientService, 'addClientToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ clientContact });
      comp.ngOnInit();

      expect(clientService.query).toHaveBeenCalled();
      expect(clientService.addClientToCollectionIfMissing).toHaveBeenCalledWith(
        clientCollection,
        ...additionalClients.map(expect.objectContaining)
      );
      expect(comp.clientsSharedCollection).toEqual(expectedCollection);
    });

    it('Should update editForm', () => {
      const clientContact: IClientContact = { id: 456 };
      const client: IClient = { id: 70785 };
      clientContact.client = client;

      activatedRoute.data = of({ clientContact });
      comp.ngOnInit();

      expect(comp.clientsSharedCollection).toContain(client);
      expect(comp.clientContact).toEqual(clientContact);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IClientContact>>();
      const clientContact = { id: 123 };
      jest.spyOn(clientContactFormService, 'getClientContact').mockReturnValue(clientContact);
      jest.spyOn(clientContactService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ clientContact });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: clientContact }));
      saveSubject.complete();

      // THEN
      expect(clientContactFormService.getClientContact).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(clientContactService.update).toHaveBeenCalledWith(expect.objectContaining(clientContact));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IClientContact>>();
      const clientContact = { id: 123 };
      jest.spyOn(clientContactFormService, 'getClientContact').mockReturnValue({ id: null });
      jest.spyOn(clientContactService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ clientContact: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: clientContact }));
      saveSubject.complete();

      // THEN
      expect(clientContactFormService.getClientContact).toHaveBeenCalled();
      expect(clientContactService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IClientContact>>();
      const clientContact = { id: 123 };
      jest.spyOn(clientContactService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ clientContact });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(clientContactService.update).toHaveBeenCalled();
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
  });
});
