import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IMission } from '../mission.model';
import { MissionService } from '../service/mission.service';

@Injectable({ providedIn: 'root' })
export class MissionRoutingResolveService implements Resolve<IMission | null> {
  constructor(protected service: MissionService, protected router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<IMission | null | never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        mergeMap((mission: HttpResponse<IMission>) => {
          if (mission.body) {
            return of(mission.body);
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
