import { Injectable } from '@angular/core';
import { HttpContextToken, HttpInterceptor, HttpRequest, HttpErrorResponse, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';

/** Set this token to true on requests that should NOT broadcast HTTP errors globally. */
export const SKIP_ERROR_HANDLER = new HttpContextToken<boolean>(() => false);

@Injectable()
export class ErrorHandlerInterceptor implements HttpInterceptor {
  constructor(private eventManager: EventManager) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      tap({
        error: (err: HttpErrorResponse) => {
          if (request.context.get(SKIP_ERROR_HANDLER)) return;
          if (!(err.status === 401 && (err.message === '' || err.url?.includes('api/account')))) {
            this.eventManager.broadcast(new EventWithContent('tuniSalesGatewayApp.httpError', err));
          }
        },
      })
    );
  }
}
