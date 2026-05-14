import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IClientContact } from '../client-contact.model';
import { ClientContactService } from '../service/client-contact.service';

@Injectable({ providedIn: 'root' })
export class ClientContactRoutingResolveService implements Resolve<IClientContact | null> {
  constructor(protected service: ClientContactService, protected router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<IClientContact | null | never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        mergeMap((clientContact: HttpResponse<IClientContact>) => {
          if (clientContact.body) {
            return of(clientContact.body);
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
