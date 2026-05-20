import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Data, ParamMap, Router } from '@angular/router';
import { combineLatest, filter, Observable, switchMap, tap } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { IOrder } from '../order.model';
import { OrderStatus } from 'app/entities/enumerations/order-status.model';
import { SalesExcelService } from 'app/shared/service/sales-excel.service';

import { ITEMS_PER_PAGE, PAGE_HEADER, TOTAL_COUNT_RESPONSE_HEADER } from 'app/config/pagination.constants';
import { ASC, DESC, SORT, ITEM_DELETED_EVENT, DEFAULT_SORT_DATA } from 'app/config/navigation.constants';
import { EntityArrayResponseType, OrderService } from '../service/order.service';
import { OrderDeleteDialogComponent } from '../delete/order-delete-dialog.component';

@Component({
  selector: 'jhi-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class OrderComponent implements OnInit {
  orders?: IOrder[];
  isLoading = false;

  predicate = 'id';
  ascending = true;

  itemsPerPage = ITEMS_PER_PAGE;
  totalItems = 0;
  page = 1;

  constructor(
    protected orderService: OrderService,
    protected activatedRoute: ActivatedRoute,
    public router: Router,
    protected modalService: NgbModal,
    private excelService: SalesExcelService
  ) {}

  trackId = (_index: number, item: IOrder): number => this.orderService.getOrderIdentifier(item);

  exportExcel(): void {
    this.excelService.exportOrders(this.orders ?? []);
  }

  readonly orderStatus = OrderStatus;

  ngOnInit(): void {
    this.load();
  }

  delete(order: IOrder): void {
    const modalRef = this.modalService.open(OrderDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.order = order;
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
    this.orders = dataFromBody;
  }

  protected fillComponentAttributesFromResponseBody(data: IOrder[] | null): IOrder[] {
    return data ?? [];
  }

  protected fillComponentAttributesFromResponseHeader(headers: HttpHeaders): void {
    this.totalItems = Number(headers.get(TOTAL_COUNT_RESPONSE_HEADER));
  }

  countOrdersByStatus(status: OrderStatus): number {
    return this.orders?.filter(order => order.status === status).length ?? 0;
  }

  countByStatuses(statuses: string[]): number {
    return this.orders?.filter(o => statuses.includes(o.status ?? '')).length ?? 0;
  }

  getStatusClass(status: string | null | undefined): string {
    const map: Record<string, string> = {
      DRAFT:          'ol-badge--draft',
      SUBMITTED:      'ol-badge--submitted',
      UNDER_REVIEW:   'ol-badge--review',
      APPROVED:       'ol-badge--approved',
      IN_PREPARATION: 'ol-badge--preparation',
      SHIPPED:        'ol-badge--shipped',
      DELIVERED:      'ol-badge--delivered',
      INVOICED:       'ol-badge--invoiced',
      PAID:           'ol-badge--paid',
      REJECTED:       'ol-badge--rejected',
      CANCELLED:      'ol-badge--cancelled',
    };
    return map[status || ''] || 'ol-badge--draft';
  }

  getAvatarClass(status: string | null | undefined): string {
    const map: Record<string, string> = {
      SUBMITTED:      'ol-avatar--blue',
      UNDER_REVIEW:   'ol-avatar--orange',
      APPROVED:       'ol-avatar--green',
      IN_PREPARATION: 'ol-avatar--indigo',
      SHIPPED:        'ol-avatar--indigo',
      DELIVERED:      'ol-avatar--teal',
      INVOICED:       'ol-avatar--teal',
      PAID:           'ol-avatar--green',
      REJECTED:       'ol-avatar--red',
      CANCELLED:      'ol-avatar--red',
    };
    return map[status || ''] || 'ol-avatar--gray';
  }

  getStatusBadgeClass(status: OrderStatus | null | undefined): string {
    return this.getStatusClass(status as string);
  }

  getOrderAvatar(order: IOrder): string {
    return (order.orderNumber || order.id?.toString() || '?').charAt(0).toUpperCase();
  }

  getAmount(value: number | null | undefined): string {
    return value === null || value === undefined ? '—' : value.toLocaleString();
  }

  getClientName(order: IOrder): string {
    return order.client?.name || '—';
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
    return this.orderService.query(queryObject).pipe(tap(() => (this.isLoading = false)));
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
