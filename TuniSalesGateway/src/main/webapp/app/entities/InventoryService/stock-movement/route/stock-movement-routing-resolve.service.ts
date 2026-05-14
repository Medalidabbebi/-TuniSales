import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IStockMovement } from '../stock-movement.model';
import { StockMovementService } from '../service/stock-movement.service';

@Injectable({ providedIn: 'root' })
export class StockMovementRoutingResolveService implements Resolve<IStockMovement | null> {
  constructor(protected service: StockMovementService, protected router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<IStockMovement | null | never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        mergeMap((stockMovement: HttpResponse<IStockMovement>) => {
          if (stockMovement.body) {
            return of(stockMovement.body);
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
