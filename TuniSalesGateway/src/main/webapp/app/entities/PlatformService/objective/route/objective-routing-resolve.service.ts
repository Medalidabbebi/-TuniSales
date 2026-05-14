import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IObjective } from '../objective.model';
import { ObjectiveService } from '../service/objective.service';

@Injectable({ providedIn: 'root' })
export class ObjectiveRoutingResolveService implements Resolve<IObjective | null> {
  constructor(protected service: ObjectiveService, protected router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<IObjective | null | never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        mergeMap((objective: HttpResponse<IObjective>) => {
          if (objective.body) {
            return of(objective.body);
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
