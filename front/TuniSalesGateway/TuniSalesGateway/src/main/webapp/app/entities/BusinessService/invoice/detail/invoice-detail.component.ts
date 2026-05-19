import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IInvoice } from '../invoice.model';
import { InvoicePdfService } from '../service/invoice-pdf.service';

@Component({
  selector: 'jhi-invoice-detail',
  templateUrl: './invoice-detail.component.html',
  styleUrls: ['./invoice-detail.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class InvoiceDetailComponent implements OnInit {
  invoice: IInvoice | null = null;

  constructor(protected activatedRoute: ActivatedRoute, private pdfService: InvoicePdfService) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ invoice }) => {
      this.invoice = invoice;
    });
  }

  previousState(): void {
    window.history.back();
  }

  downloadPdf(): void {
    if (this.invoice) {
      this.pdfService.generate(this.invoice);
    }
  }

  getStatusClass(status: string | null | undefined): string {
    const map: Record<string, string> = {
      DRAFT:          'id-status--draft',
      ISSUED:         'id-status--issued',
      PARTIALLY_PAID: 'id-status--partial',
      PAID:           'id-status--paid',
      OVERDUE:        'id-status--overdue',
      CANCELLED:      'id-status--cancelled',
    };
    return map[status ?? ''] || 'id-status--draft';
  }

  getStatusLabel(status: string | null | undefined): string {
    const map: Record<string, string> = {
      DRAFT:          'Brouillon',
      ISSUED:         'Émise',
      PARTIALLY_PAID: 'Part. payée',
      PAID:           'Payée',
      OVERDUE:        'En retard',
      CANCELLED:      'Annulée',
    };
    return map[status ?? ''] || '—';
  }
}
