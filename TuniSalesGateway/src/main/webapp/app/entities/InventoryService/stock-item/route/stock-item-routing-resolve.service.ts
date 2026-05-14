import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IStockItem } from '../stock-item.model';
import { StockItemService } from '../service/stock-item.service';

@Injectable({ providedIn: 'root' })
export class StockItemRoutingResolveService implements Resolve<IStockItem | null> {
  constructor(protected service: StockItemService, protected router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<IStockItem | null | never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        mergeMap((stockItem: HttpResponse<IStockItem>) => {
          if (stockItem.body) {
            return of(stockItem.body);
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
