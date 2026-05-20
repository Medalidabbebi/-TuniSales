import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface SmsSendResult {
  success: boolean;
  sid?: string;
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class TwilioSmsService {
  constructor(private http: HttpClient) {}

  sendSms(to: string, body: string): Observable<SmsSendResult> {
    const phone = to.replace(/\s+/g, '');
    if (!phone) {
      return of({ success: false, error: 'Numéro de téléphone manquant.' });
    }

    return this.http
      .post<SmsSendResult>('/api/sms/send', { to: phone, body })
      .pipe(
        map(res => res),
        catchError(err => {
          const msg = err?.error?.error ?? err?.message ?? 'Erreur réseau';
          return of({ success: false, error: msg });
        })
      );
  }
}
