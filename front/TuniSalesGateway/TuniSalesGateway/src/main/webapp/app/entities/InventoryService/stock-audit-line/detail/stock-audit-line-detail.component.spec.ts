import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { StockAuditLineDetailComponent } from './stock-audit-line-detail.component';

describe('StockAuditLine Management Detail Component', () => {
  let comp: StockAuditLineDetailComponent;
  let fixture: ComponentFixture<StockAuditLineDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StockAuditLineDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { data: of({ stockAuditLine: { id: 123 } }) },
        },
      ],
    })
      .overrideTemplate(StockAuditLineDetailComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(StockAuditLineDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('Should load stockAuditLine on init', () => {
      // WHEN
      comp.ngOnInit();

      // THEN
      expect(comp.stockAuditLine).toEqual(expect.objectContaining({ id: 123 }));
    });
  });
});
