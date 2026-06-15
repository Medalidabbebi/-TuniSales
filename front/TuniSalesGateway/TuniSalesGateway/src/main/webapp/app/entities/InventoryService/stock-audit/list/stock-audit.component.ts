import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Data, ParamMap, Router } from '@angular/router';
import { combineLatest, filter, Observable, switchMap, tap } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { IStockAudit } from '../stock-audit.model';

import { ITEMS_PER_PAGE, PAGE_HEADER, TOTAL_COUNT_RESPONSE_HEADER } from 'app/config/pagination.constants';
import { ASC, DESC, SORT, ITEM_DELETED_EVENT, DEFAULT_SORT_DATA } from 'app/config/navigation.constants';
import { EntityArrayResponseType, StockAuditService } from '../service/stock-audit.service';
import { StockAuditDeleteDialogComponent } from '../delete/stock-audit-delete-dialog.component';

@Component({
  selector: 'jhi-stock-audit',
  templateUrl: './stock-audit.component.html',
  styleUrls: ['./stock-audit.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class StockAuditComponent implements OnInit {
  stockAudits?: IStockAudit[];
  isLoading = false;

  predicate = 'id';
  ascending = true;

  itemsPerPage = ITEMS_PER_PAGE;
  totalItems = 0;
  page = 1;

  constructor(
    protected stockAuditService: StockAuditService,
    protected activatedRoute: ActivatedRoute,
    public router: Router,
    protected modalService: NgbModal
  ) {}

  trackId = (_index: number, item: IStockAudit): number => this.stockAuditService.getStockAuditIdentifier(item);

  get inProgressCount(): number { return (this.stockAudits ?? []).filter(a => a.status === 'IN_PROGRESS').length; }
  get closedCount(): number     { return (this.stockAudits ?? []).filter(a => a.status === 'CLOSED').length; }
  get cancelledCount(): number  { return (this.stockAudits ?? []).filter(a => a.status === 'CANCELLED').length; }
  get totalDiscrepancies(): number {
    return (this.stockAudits ?? []).reduce((sum, a) => sum + (a.discrepancyCount ?? 0), 0);
  }

  getStatusLabel(status: string | null | undefined): string {
    const map: Record<string, string> = {
      IN_PROGRESS: 'En cours',
      CLOSED:      'Clôturé',
      CANCELLED:   'Annulé',
    };
    return status ? (map[status] || status) : '—';
  }

  getStatusClass(status: string | null | undefined): string {
    const map: Record<string, string> = {
      IN_PROGRESS: 'sal-badge--blue',
      CLOSED:      'sal-badge--green',
      CANCELLED:   'sal-badge--red',
    };
    return status ? (map[status] || 'sal-badge--gray') : 'sal-badge--gray';
  }

  getStatusIcon(status: string | null | undefined): any {
    const map: Record<string, string> = {
      IN_PROGRESS: 'spinner',
      CLOSED:      'check-circle',
      CANCELLED:   'times-circle',
    };
    return status ? (map[status] || 'clipboard-check') : 'clipboard-check';
  }

  ngOnInit(): void {
    this.load();
  }

  delete(stockAudit: IStockAudit): void {
    const modalRef = this.modalService.open(StockAuditDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.stockAudit = stockAudit;
    modalRef.closed
      .pipe(
        filter(reason => reason === ITEM_DELETED_EVENT),
        switchMap(() => this.loadFromBackendWithRouteInformations())
      )
      .subscribe({
        next: (res: EntityArrayResponseType) => { this.onResponseSuccess(res); },
      });
  }

  load(): void {
    this.loadFromBackendWithRouteInformations().subscribe({
      next: (res: EntityArrayResponseType) => { this.onResponseSuccess(res); },
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
    this.stockAudits = dataFromBody;
  }

  protected fillComponentAttributesFromResponseBody(data: IStockAudit[] | null): IStockAudit[] {
    return data ?? [];
  }

  protected fillComponentAttributesFromResponseHeader(headers: HttpHeaders): void {
    this.totalItems = Number(headers.get(TOTAL_COUNT_RESPONSE_HEADER));
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
    return this.stockAuditService.query(queryObject).pipe(tap(() => (this.isLoading = false)));
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
