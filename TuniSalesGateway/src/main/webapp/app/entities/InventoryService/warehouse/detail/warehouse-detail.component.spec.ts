import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { WarehouseDetailComponent } from './warehouse-detail.component';

describe('Warehouse Management Detail Component', () => {
  let comp: WarehouseDetailComponent;
  let fixture: ComponentFixture<WarehouseDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WarehouseDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { data: of({ warehouse: { id: 123 } }) },
        },
      ],
    })
      .overrideTemplate(WarehouseDetailComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(WarehouseDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('Should load warehouse on init', () => {
      // WHEN
      comp.ngOnInit();

      // THEN
      expect(comp.warehouse).toEqual(expect.objectContaining({ id: 123 }));
    });
  });
});
