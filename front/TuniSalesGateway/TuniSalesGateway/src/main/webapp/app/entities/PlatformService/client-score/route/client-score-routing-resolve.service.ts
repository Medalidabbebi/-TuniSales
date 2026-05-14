import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IClientScore } from '../client-score.model';
import { ClientScoreService } from '../service/client-score.service';

@Injectable({ providedIn: 'root' })
export class ClientScoreRoutingResolveService implements Resolve<IClientScore | null> {
  constructor(protected service: ClientScoreService, protected router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<IClientScore | null | never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        mergeMap((clientScore: HttpResponse<IClientScore>) => {
          if (clientScore.body) {
            return of(clientScore.body);
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
