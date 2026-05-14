import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { StockMovementDetailComponent } from './stock-movement-detail.component';

describe('StockMovement Management Detail Component', () => {
  let comp: StockMovementDetailComponent;
  let fixture: ComponentFixture<StockMovementDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StockMovementDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { data: of({ stockMovement: { id: 123 } }) },
        },
      ],
    })
      .overrideTemplate(StockMovementDetailComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(StockMovementDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('Should load stockMovement on init', () => {
      // WHEN
      comp.ngOnInit();

      // THEN
      expect(comp.stockMovement).toEqual(expect.objectContaining({ id: 123 }));
    });
  });
});
