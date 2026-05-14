import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { OrderLineItemService } from '../service/order-line-item.service';

import { OrderLineItemComponent } from './order-line-item.component';

describe('OrderLineItem Management Component', () => {
  let comp: OrderLineItemComponent;
  let fixture: ComponentFixture<OrderLineItemComponent>;
  let service: OrderLineItemService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([{ path: 'order-line-item', component: OrderLineItemComponent }]), HttpClientTestingModule],
      declarations: [OrderLineItemComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            data: of({
              defaultSort: 'id,asc',
            }),
            queryParamMap: of(
              jest.requireActual('@angular/router').convertToParamMap({
                page: '1',
                size: '1',
                sort: 'id,desc',
              })
            ),
            snapshot: { queryParams: {} },
          },
        },
      ],
    })
      .overrideTemplate(OrderLineItemComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(OrderLineItemComponent);
    comp = fixture.componentInstance;
    service = TestBed.inject(OrderLineItemService);

    const headers = new HttpHeaders();
    jest.spyOn(service, 'query').mockReturnValue(
      of(
        new HttpResponse({
          body: [{ id: 123 }],
          headers,
        })
      )
    );
  });

  it('Should call load all on init', () => {
    // WHEN
    comp.ngOnInit();

    // THEN
    expect(service.query).toHaveBeenCalled();
    expect(comp.orderLineItems?.[0]).toEqual(expect.objectContaining({ id: 123 }));
  });

  describe('trackId', () => {
    it('Should forward to orderLineItemService', () => {
      const entity = { id: 123 };
      jest.spyOn(service, 'getOrderLineItemIdentifier');
      const id = comp.trackId(0, entity);
      expect(service.getOrderLineItemIdentifier).toHaveBeenCalledWith(entity);
      expect(id).toBe(entity.id);
    });
  });
});
