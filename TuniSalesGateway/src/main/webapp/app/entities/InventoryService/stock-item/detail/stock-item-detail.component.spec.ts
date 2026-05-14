import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { StockItemDetailComponent } from './stock-item-detail.component';

describe('StockItem Management Detail Component', () => {
  let comp: StockItemDetailComponent;
  let fixture: ComponentFixture<StockItemDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StockItemDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { data: of({ stockItem: { id: 123 } }) },
        },
      ],
    })
      .overrideTemplate(StockItemDetailComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(StockItemDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('Should load stockItem on init', () => {
      // WHEN
      comp.ngOnInit();

      // THEN
      expect(comp.stockItem).toEqual(expect.objectContaining({ id: 123 }));
    });
  });
});
