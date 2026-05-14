import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IPerformanceScore } from '../performance-score.model';
import { PerformanceScoreService } from '../service/performance-score.service';

@Injectable({ providedIn: 'root' })
export class PerformanceScoreRoutingResolveService implements Resolve<IPerformanceScore | null> {
  constructor(protected service: PerformanceScoreService, protected router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<IPerformanceScore | null | never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        mergeMap((performanceScore: HttpResponse<IPerformanceScore>) => {
          if (performanceScore.body) {
            return of(performanceScore.body);
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
