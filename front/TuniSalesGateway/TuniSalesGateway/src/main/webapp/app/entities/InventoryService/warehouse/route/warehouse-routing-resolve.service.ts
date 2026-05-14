import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IWarehouse } from '../warehouse.model';
import { WarehouseService } from '../service/warehouse.service';

@Injectable({ providedIn: 'root' })
export class WarehouseRoutingResolveService implements Resolve<IWarehouse | null> {
  constructor(protected service: WarehouseService, protected router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<IWarehouse | null | never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        mergeMap((warehouse: HttpResponse<IWarehouse>) => {
          if (warehouse.body) {
            return of(warehouse.body);
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
