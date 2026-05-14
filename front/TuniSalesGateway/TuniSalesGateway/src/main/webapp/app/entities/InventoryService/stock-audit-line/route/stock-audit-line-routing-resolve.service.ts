import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IStockAuditLine } from '../stock-audit-line.model';
import { StockAuditLineService } from '../service/stock-audit-line.service';

@Injectable({ providedIn: 'root' })
export class StockAuditLineRoutingResolveService implements Resolve<IStockAuditLine | null> {
  constructor(protected service: StockAuditLineService, protected router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<IStockAuditLine | null | never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        mergeMap((stockAuditLine: HttpResponse<IStockAuditLine>) => {
          if (stockAuditLine.body) {
            return of(stockAuditLine.body);
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
