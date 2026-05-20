import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface EmailSendResult {
  success: boolean;
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class EmailSenderService {
  constructor(private http: HttpClient) {}

  sendEmail(to: string, subject: string, body: string): Observable<EmailSendResult> {
    if (!to) return of({ success: false, error: 'Adresse email manquante.' });
    return this.http
      .post<EmailSendResult>('/api/email/send', { to, subject, body })
      .pipe(catchError(err => of({ success: false, error: err?.error?.error ?? 'Erreur réseau' })));
  }
}
