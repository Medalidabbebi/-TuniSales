import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IAuditLog } from '../audit-log.model';
import { AuditLogService } from '../service/audit-log.service';

@Injectable({ providedIn: 'root' })
export class AuditLogRoutingResolveService implements Resolve<IAuditLog | null> {
  constructor(protected service: AuditLogService, protected router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<IAuditLog | null | never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        mergeMap((auditLog: HttpResponse<IAuditLog>) => {
          if (auditLog.body) {
            return of(auditLog.body);
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
