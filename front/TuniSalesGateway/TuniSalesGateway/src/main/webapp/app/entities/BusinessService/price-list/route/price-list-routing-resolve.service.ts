import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IPriceList } from '../price-list.model';
import { PriceListService } from '../service/price-list.service';

@Injectable({ providedIn: 'root' })
export class PriceListRoutingResolveService implements Resolve<IPriceList | null> {
  constructor(protected service: PriceListService, protected router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<IPriceList | null | never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        mergeMap((priceList: HttpResponse<IPriceList>) => {
          if (priceList.body) {
            return of(priceList.body);
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
