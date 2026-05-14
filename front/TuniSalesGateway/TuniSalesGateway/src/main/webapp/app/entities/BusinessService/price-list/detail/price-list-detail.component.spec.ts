import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { PriceListDetailComponent } from './price-list-detail.component';

describe('PriceList Management Detail Component', () => {
  let comp: PriceListDetailComponent;
  let fixture: ComponentFixture<PriceListDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PriceListDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { data: of({ priceList: { id: 123 } }) },
        },
      ],
    })
      .overrideTemplate(PriceListDetailComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(PriceListDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('Should load priceList on init', () => {
      // WHEN
      comp.ngOnInit();

      // THEN
      expect(comp.priceList).toEqual(expect.objectContaining({ id: 123 }));
    });
  });
});
