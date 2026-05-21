import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ISwap } from '../swap.model';

@Component({
  selector: 'jhi-swap-detail',
  templateUrl: './swap-detail.component.html',
  styleUrls: ['./swap-detail.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SwapDetailComponent implements OnInit {
  swap: ISwap | null = null;

  constructor(protected activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ swap }) => {
      this.swap = swap;
    });
  }

  previousState(): void {
    window.history.back();
  }

  getStatusLabel(status: string | null | undefined): string {
    const map: Record<string, string> = {
      PENDING:     'En attente',
      IN_PROGRESS: 'En cours',
      RESOLVED:    'Résolu',
      CANCELLED:   'Annulé',
    };
    return status ? (map[status] || status) : '—';
  }

  getStatusClass(status: string | null | undefined): string {
    const map: Record<string, string> = {
      PENDING:     'swd-status--amber',
      IN_PROGRESS: 'swd-status--blue',
      RESOLVED:    'swd-status--green',
      CANCELLED:   'swd-status--red',
    };
    return status ? (map[status] || 'swd-status--gray') : 'swd-status--gray';
  }

  getStatusIcon(status: string | null | undefined): any {
    const map: Record<string, string> = {
      PENDING:     'clock',
      IN_PROGRESS: 'spinner',
      RESOLVED:    'check-circle',
      CANCELLED:   'times-circle',
    };
    return status ? (map[status] || 'question-circle') : 'question-circle';
  }
}
