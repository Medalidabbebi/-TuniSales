import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { StockAuditDetailComponent } from './stock-audit-detail.component';

describe('StockAudit Management Detail Component', () => {
  let comp: StockAuditDetailComponent;
  let fixture: ComponentFixture<StockAuditDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StockAuditDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { data: of({ stockAudit: { id: 123 } }) },
        },
      ],
    })
      .overrideTemplate(StockAuditDetailComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(StockAuditDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('Should load stockAudit on init', () => {
      // WHEN
      comp.ngOnInit();

      // THEN
      expect(comp.stockAudit).toEqual(expect.objectContaining({ id: 123 }));
    });
  });
});
