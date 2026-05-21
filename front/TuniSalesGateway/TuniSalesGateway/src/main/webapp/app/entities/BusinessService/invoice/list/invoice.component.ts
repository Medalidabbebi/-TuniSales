import { Component, OnInit, TemplateRef, ViewEncapsulation } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Data, ParamMap, Router } from '@angular/router';
import { combineLatest, filter, Observable, switchMap, tap } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { IInvoice } from '../invoice.model';
import { InvoiceStatus } from 'app/entities/enumerations/invoice-status.model';
import { InvoicePdfService } from '../service/invoice-pdf.service';
import { SalesExcelService, ExportInvoiceOptions } from 'app/shared/service/sales-excel.service';

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

  readonly exportColumnList = [
    { key: 'invoiceNumber', label: 'N° Facture' },
    { key: 'client',        label: 'Client' },
    { key: 'order',         label: 'Commande liée' },
    { key: 'status',        label: 'Statut' },
    { key: 'amountHt',      label: 'Montant HT' },
    { key: 'taxAmount',     label: 'TVA' },
    { key: 'amountTtc',     label: 'Montant TTC' },
    { key: 'issueDate',     label: "Date d'émission" },
    { key: 'dueDate',       label: "Date d'échéance" },
    { key: 'paidAt',        label: 'Payée le' },
    { key: 'createdAt',     label: 'Créée le' },
  ];

  exportOptions: {
    scope: 'filtered' | 'all';
    includeStats: boolean;
    filename: string;
    columns: Record<string, boolean>;
  } = {
    scope: 'filtered',
    includeStats: true,
    filename: 'factures-ventes',
    columns: {
      invoiceNumber: true, client: true, order: true, status: true,
      amountHt: true, taxAmount: true, amountTtc: true,
      issueDate: true, dueDate: true, paidAt: true, createdAt: true,
    },
  };

  get selectedColumnCount(): number {
    return this.exportColumnList.filter(c => this.exportOptions.columns[c.key]).length;
  }

  get exportPreviewCount(): number {
    return this.exportOptions.scope === 'filtered' ? this.filteredInvoices.length : (this.invoices?.length ?? 0);
  }

  openExportModal(content: TemplateRef<unknown>): void {
    this.modalService.open(content, { size: 'lg', centered: true, scrollable: true });
  }

  confirmExport(modal: { close: () => void }): void {
    const data = this.exportOptions.scope === 'filtered' ? this.filteredInvoices : (this.invoices ?? []);
    const opts: ExportInvoiceOptions = {
      includeStats: this.exportOptions.includeStats,
      columns: this.exportOptions.columns,
    };
    this.excelService.exportInvoices(data, this.exportOptions.filename || 'factures-ventes', opts);
    modal.close();
  }

  selectAllColumns(value: boolean): void {
    this.exportColumnList.forEach(c => { this.exportOptions.columns[c.key] = value; });
  }

  downloadPdf(invoice: IInvoice): void {
    this.pdfService.generate(invoice);
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
