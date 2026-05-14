import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { ITenant } from '../tenant.model';
import { TenantService } from '../service/tenant.service';

@Injectable({ providedIn: 'root' })
export class TenantRoutingResolveService implements Resolve<ITenant | null> {
  constructor(protected service: TenantService, protected router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<ITenant | null | never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        mergeMap((tenant: HttpResponse<ITenant>) => {
          if (tenant.body) {
            return of(tenant.body);
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
