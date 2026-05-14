import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IStockAudit } from '../stock-audit.model';
import { StockAuditService } from '../service/stock-audit.service';

@Injectable({ providedIn: 'root' })
export class StockAuditRoutingResolveService implements Resolve<IStockAudit | null> {
  constructor(protected service: StockAuditService, protected router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<IStockAudit | null | never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        mergeMap((stockAudit: HttpResponse<IStockAudit>) => {
          if (stockAudit.body) {
            return of(stockAudit.body);
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
