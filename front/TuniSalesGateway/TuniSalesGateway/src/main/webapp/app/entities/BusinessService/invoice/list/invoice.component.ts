import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Data, ParamMap, Router } from '@angular/router';
import { combineLatest, filter, Observable, switchMap, tap } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { IInvoice } from '../invoice.model';
import { InvoiceStatus } from 'app/entities/enumerations/invoice-status.model';
import { InvoicePdfService } from '../service/invoice-pdf.service';
import { SalesExcelService } from 'app/shared/service/sales-excel.service';

import { ITEMS_PER_PAGE, PAGE_HEADER, TOTAL_COUNT_RESPONSE_HEADER } from 'app/config/pagination.constants';
import { ASC, DESC, SORT, ITEM_DELETED_EVENT, DEFAULT_SORT_DATA } from 'app/config/navigation.constants';
import { EntityArrayResponseType, InvoiceService } from '../service/invoice.service';
import { InvoiceDeleteDialogComponent } from '../delete/invoice-delete-dialog.component';

@Component({
  selector: 'jhi-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class InvoiceComponent implements OnInit {
  invoices?: IInvoice[];
  isLoading = false;

  predicate = 'id';
  ascending = true;

  itemsPerPage = ITEMS_PER_PAGE;
  totalItems = 0;
  page = 1;

  readonly invoiceStatus = InvoiceStatus;

  constructor(
    protected invoiceService: InvoiceService,
    protected activatedRoute: ActivatedRoute,
    public router: Router,
    protected modalService: NgbModal,
    private pdfService: InvoicePdfService,
    private excelService: SalesExcelService
  ) {}

  trackId = (_index: number, item: IInvoice): number => this.invoiceService.getInvoiceIdentifier(item);

  filterClient   = '';
  filterStatus   = '';
  filterDateFrom = '';
  filterDateTo   = '';

  readonly INV_STATUS_LABELS: { value: string; label: string }[] = [
    { value: 'DRAFT',          label: 'Brouillon' },
    { value: 'ISSUED',         label: 'Émise' },
    { value: 'PARTIALLY_PAID', label: 'Partiellement payée' },
    { value: 'PAID',           label: 'Payée' },
    { value: 'OVERDUE',        label: 'En retard' },
    { value: 'CANCELLED',      label: 'Annulée' },
  ];

  get filteredInvoices(): IInvoice[] {
    const cl = this.filterClient.trim().toLowerCase();
    const st = this.filterStatus;
    const df = this.filterDateFrom ? new Date(this.filterDateFrom).getTime() : null;
    const dt = this.filterDateTo   ? new Date(this.filterDateTo + 'T23:59:59').getTime() : null;
    return (this.invoices ?? []).filter(inv => {
      if (cl && !(inv.client?.name ?? '').toLowerCase().includes(cl)) return false;
      if (st && inv.status !== st) return false;
      if (df != null) {
        const v = inv.issueDate?.valueOf() ?? inv.createdAt?.valueOf() ?? 0;
        if (v < df) return false;
      }
      if (dt != null) {
        const v = inv.issueDate?.valueOf() ?? inv.createdAt?.valueOf() ?? 0;
        if (v > dt) return false;
      }
      return true;
    });
  }

  resetFilters(): void {
    this.filterClient   = '';
    this.filterStatus   = '';
    this.filterDateFrom = '';
    this.filterDateTo   = '';
  }

  downloadPdf(invoice: IInvoice): void {
    this.pdfService.generate(invoice);
  }

  exportExcel(): void {
    this.excelService.exportInvoices(this.filteredInvoices);
  }

  exportCsv(): void {
    const headers = ['N° Facture', 'Client', 'Montant HT', 'TVA', 'Montant TTC', 'Statut', 'Date échéance'];
    const rows = this.filteredInvoices.map(inv => [
      inv.invoiceNumber ?? '',
      inv.client?.name ?? '',
      inv.amountHt ?? 0,
      inv.taxAmount ?? 0,
      inv.amountTtc ?? 0,
      inv.status ?? '',
      inv.dueDate ? inv.dueDate.format('DD/MM/YYYY') : '',
    ]);
    const csvContent = [headers, ...rows]
      .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(';'))
      .join('\n');
    const blob = new Blob(['﻿' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `factures-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  exportPdf(): void {
    if (!this.filteredInvoices.length) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const rows = this.filteredInvoices.map(inv => `
      <tr>
        <td>${inv.invoiceNumber ?? ''}</td>
        <td>${inv.client?.name ?? ''}</td>
        <td style="text-align:right">${(inv.amountTtc ?? 0).toFixed(2)} TND</td>
        <td>${inv.status ?? ''}</td>
        <td>${inv.dueDate ? inv.dueDate.format('DD/MM/YYYY') : ''}</td>
      </tr>`).join('');
    printWindow.document.write(`
      <html><head><title>Factures</title>
      <style>
        body{font-family:Arial,sans-serif;font-size:12px;padding:20px}
        h2{color:#1e3a5f}
        table{width:100%;border-collapse:collapse;margin-top:16px}
        th{background:#1e3a5f;color:white;padding:8px;text-align:left}
        td{padding:6px 8px;border-bottom:1px solid #e2e8f0}
        tr:nth-child(even){background:#f8fafc}
      </style></head><body>
      <h2>Gestion des Factures</h2>
      <p>Exporté le ${new Date().toLocaleDateString('fr-FR')} — ${this.filteredInvoices.length} facture(s)</p>
      <table><thead><tr>
        <th>N° Facture</th><th>Client</th><th>Montant TTC</th><th>Statut</th><th>Échéance</th>
      </tr></thead><tbody>${rows}</tbody></table>
      </body></html>`);
    printWindow.document.close();
    printWindow.print();
  }

  ngOnInit(): void {
    this.load();
  }

  delete(invoice: IInvoice): void {
    const modalRef = this.modalService.open(InvoiceDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.invoice = invoice;
    // unsubscribe not needed because closed completes on modal close
    modalRef.closed
      .pipe(
        filter(reason => reason === ITEM_DELETED_EVENT),
        switchMap(() => this.loadFromBackendWithRouteInformations())
      )
      .subscribe({
        next: (res: EntityArrayResponseType) => {
          this.onResponseSuccess(res);
        },
      });
  }

  load(): void {
    this.loadFromBackendWithRouteInformations().subscribe({
      next: (res: EntityArrayResponseType) => {
        this.onResponseSuccess(res);
      },
    });
  }

  navigateToWithComponentValues(): void {
    this.handleNavigation(this.page, this.predicate, this.ascending);
  }

  navigateToPage(page = this.page): void {
    this.handleNavigation(page, this.predicate, this.ascending);
  }

  protected loadFromBackendWithRouteInformations(): Observable<EntityArrayResponseType> {
    return combineLatest([this.activatedRoute.queryParamMap, this.activatedRoute.data]).pipe(
      tap(([params, data]) => this.fillComponentAttributeFromRoute(params, data)),
      switchMap(() => this.queryBackend(this.page, this.predicate, this.ascending))
    );
  }

  protected fillComponentAttributeFromRoute(params: ParamMap, data: Data): void {
    const page = params.get(PAGE_HEADER);
    this.page = +(page ?? 1);
    const sort = (params.get(SORT) ?? data[DEFAULT_SORT_DATA]).split(',');
    this.predicate = sort[0];
    this.ascending = sort[1] === ASC;
  }

  protected onResponseSuccess(response: EntityArrayResponseType): void {
    this.fillComponentAttributesFromResponseHeader(response.headers);
    const dataFromBody = this.fillComponentAttributesFromResponseBody(response.body);
    this.invoices = dataFromBody;
  }

  protected fillComponentAttributesFromResponseBody(data: IInvoice[] | null): IInvoice[] {
    return data ?? [];
  }

  protected fillComponentAttributesFromResponseHeader(headers: HttpHeaders): void {
    this.totalItems = Number(headers.get(TOTAL_COUNT_RESPONSE_HEADER));
  }

  countInvoicesByStatus(status: InvoiceStatus): number {
    return this.invoices?.filter(invoice => invoice.status === status).length ?? 0;
  }

  getStatusBadgeClass(status: InvoiceStatus | null | undefined): string {
    const map: Record<string, string> = {
      DRAFT: 'tsg-badge--draft',
      ISSUED: 'tsg-badge--issued',
      PARTIALLY_PAID: 'tsg-badge--warning',
      PAID: 'tsg-badge--success',
      OVERDUE: 'tsg-badge--danger',
      CANCELLED: 'tsg-badge--danger',
    };
    return map[status || ''] || 'tsg-badge--neutral';
  }

  getInvoiceAvatar(invoice: IInvoice): string {
    return (invoice.invoiceNumber || invoice.id?.toString() || '?').charAt(0).toUpperCase();
  }

  getAmount(value: number | null | undefined): string {
    return value === null || value === undefined ? '—' : value.toLocaleString();
  }

  getClientName(invoice: IInvoice): string {
    return invoice.client?.name || 'Unassigned';
  }

  getOrderNumber(invoice: IInvoice): string {
    return invoice.order?.orderNumber || '—';
  }

  protected queryBackend(page?: number, predicate?: string, ascending?: boolean): Observable<EntityArrayResponseType> {
    this.isLoading = true;
    const pageToLoad: number = page ?? 1;
    const queryObject = {
      page: pageToLoad - 1,
      size: this.itemsPerPage,
      eagerload: true,
      sort: this.getSortQueryParam(predicate, ascending),
    };
    return this.invoiceService.query(queryObject).pipe(tap(() => (this.isLoading = false)));
  }

  protected handleNavigation(page = this.page, predicate?: string, ascending?: boolean): void {
    const queryParamsObj = {
      page,
      size: this.itemsPerPage,
      sort: this.getSortQueryParam(predicate, ascending),
    };

    this.router.navigate(['./'], {
      relativeTo: this.activatedRoute,
      queryParams: queryParamsObj,
    });
  }

  protected getSortQueryParam(predicate = this.predicate, ascending = this.ascending): string[] {
    const ascendingQueryParam = ascending ? ASC : DESC;
    if (predicate === '') {
      return [];
    } else {
      return [predicate + ',' + ascendingQueryParam];
    }
  }
}
