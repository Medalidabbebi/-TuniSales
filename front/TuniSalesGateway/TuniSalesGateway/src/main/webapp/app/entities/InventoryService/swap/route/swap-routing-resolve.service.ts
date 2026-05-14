import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { ISwap } from '../swap.model';
import { SwapService } from '../service/swap.service';

@Injectable({ providedIn: 'root' })
export class SwapRoutingResolveService implements Resolve<ISwap | null> {
  constructor(protected service: SwapService, protected router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<ISwap | null | never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        mergeMap((swap: HttpResponse<ISwap>) => {
          if (swap.body) {
            return of(swap.body);
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
