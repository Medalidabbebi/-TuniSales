import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IOrderLineItem } from '../order-line-item.model';
import { OrderLineItemService } from '../service/order-line-item.service';

@Injectable({ providedIn: 'root' })
export class OrderLineItemRoutingResolveService implements Resolve<IOrderLineItem | null> {
  constructor(protected service: OrderLineItemService, protected router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<IOrderLineItem | null | never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        mergeMap((orderLineItem: HttpResponse<IOrderLineItem>) => {
          if (orderLineItem.body) {
            return of(orderLineItem.body);
          } else {
            this.router.navigate(['404']);
            return EMPTY;
          }
        })
      );
    }
    return of(null);
  }
}
