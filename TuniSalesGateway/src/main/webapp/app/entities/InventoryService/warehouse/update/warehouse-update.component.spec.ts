import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject, from } from 'rxjs';

import { WarehouseFormService } from './warehouse-form.service';
import { WarehouseService } from '../service/warehouse.service';
import { IWarehouse } from '../warehouse.model';

import { WarehouseUpdateComponent } from './warehouse-update.component';

describe('Warehouse Management Update Component', () => {
  let comp: WarehouseUpdateComponent;
  let fixture: ComponentFixture<WarehouseUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let warehouseFormService: WarehouseFormService;
  let warehouseService: WarehouseService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      declarations: [WarehouseUpdateComponent],
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
      .overrideTemplate(WarehouseUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(WarehouseUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    warehouseFormService = TestBed.inject(WarehouseFormService);
    warehouseService = TestBed.inject(WarehouseService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should update editForm', () => {
      const warehouse: IWarehouse = { id: 456 };

      activatedRoute.data = of({ warehouse });
      comp.ngOnInit();

      expect(comp.warehouse).toEqual(warehouse);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IWarehouse>>();
      const warehouse = { id: 123 };
      jest.spyOn(warehouseFormService, 'getWarehouse').mockReturnValue(warehouse);
      jest.spyOn(warehouseService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ warehouse });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: warehouse }));
      saveSubject.complete();

      // THEN
      expect(warehouseFormService.getWarehouse).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(warehouseService.update).toHaveBeenCalledWith(expect.objectContaining(warehouse));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IWarehouse>>();
      const warehouse = { id: 123 };
      jest.spyOn(warehouseFormService, 'getWarehouse').mockReturnValue({ id: null });
      jest.spyOn(warehouseService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ warehouse: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: warehouse }));
      saveSubject.complete();

      // THEN
      expect(warehouseFormService.getWarehouse).toHaveBeenCalled();
      expect(warehouseService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IWarehouse>>();
      const warehouse = { id: 123 };
      jest.spyOn(warehouseService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ warehouse });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(warehouseService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });
});
