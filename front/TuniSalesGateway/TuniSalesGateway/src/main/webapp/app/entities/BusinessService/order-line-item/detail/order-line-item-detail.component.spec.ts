import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { OrderLineItemDetailComponent } from './order-line-item-detail.component';

describe('OrderLineItem Management Detail Component', () => {
  let comp: OrderLineItemDetailComponent;
  let fixture: ComponentFixture<OrderLineItemDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OrderLineItemDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { data: of({ orderLineItem: { id: 123 } }) },
        },
      ],
    })
      .overrideTemplate(OrderLineItemDetailComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(OrderLineItemDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('Should load orderLineItem on init', () => {
      // WHEN
      comp.ngOnInit();

      // THEN
      expect(comp.orderLineItem).toEqual(expect.objectContaining({ id: 123 }));
    });
  });
});
