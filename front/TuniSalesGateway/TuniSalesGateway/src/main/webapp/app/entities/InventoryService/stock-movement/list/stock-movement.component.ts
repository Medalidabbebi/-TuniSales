import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Data, ParamMap, Router } from '@angular/router';
import { combineLatest, filter, Observable, switchMap, tap } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { IStockMovement } from '../stock-movement.model';

import { ITEMS_PER_PAGE, PAGE_HEADER, TOTAL_COUNT_RESPONSE_HEADER } from 'app/config/pagination.constants';
import { ASC, DESC, SORT, ITEM_DELETED_EVENT, DEFAULT_SORT_DATA } from 'app/config/navigation.constants';
import { EntityArrayResponseType, StockMovementService } from '../service/stock-movement.service';
import { StockMovementDeleteDialogComponent } from '../delete/stock-movement-delete-dialog.component';

@Component({
  selector: 'jhi-stock-movement',
  templateUrl: './stock-movement.component.html',
  styleUrls: ['./stock-movement.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class StockMovementComponent implements OnInit {
  stockMovements?: IStockMovement[];
  isLoading = false;

  predicate = 'id';
  ascending = true;

  itemsPerPage = ITEMS_PER_PAGE;
  totalItems = 0;
  page = 1;

  constructor(
    protected stockMovementService: StockMovementService,
    protected activatedRoute: ActivatedRoute,
    public router: Router,
    protected modalService: NgbModal
  ) {}

  trackId = (_index: number, item: IStockMovement): number => this.stockMovementService.getStockMovementIdentifier(item);

  get inboundCount(): number {
    return this.stockMovements?.filter(m => m.movementType === 'INBOUND').length ?? 0;
  }
  get outboundCount(): number {
    return this.stockMovements?.filter(m => m.movementType === 'OUTBOUND').length ?? 0;
  }
  get transferCount(): number {
    return this.stockMovements?.filter(m => m.movementType === 'TRANSFER').length ?? 0;
  }
  get totalQty(): number {
    return this.stockMovements?.reduce((s, m) => s + (m.quantity ?? 0), 0) ?? 0;
  }

  getTypeLabel(type: string | null | undefined): string {
    const map: Record<string, string> = {
      INBOUND:              'Entrée',
      OUTBOUND:             'Sortie',
      TRANSFER:             'Transfert',
      RETURN:               'Retour',
      SWAP_OUT:             'Échange ↑',
      SWAP_IN:              'Échange ↓',
      INVENTORY_ADJUSTMENT: 'Ajustement',
    };
    return type ? (map[type] || type) : '—';
  }

  getTypeClass(type: string | null | undefined): string {
    const map: Record<string, string> = {
      INBOUND:              'sml-badge--green',
      OUTBOUND:             'sml-badge--red',
      TRANSFER:             'sml-badge--blue',
      RETURN:               'sml-badge--navy',
      SWAP_OUT:             'sml-badge--purple',
      SWAP_IN:              'sml-badge--teal',
      INVENTORY_ADJUSTMENT: 'sml-badge--orange',
    };
    return type ? (map[type] || 'sml-badge--gray') : 'sml-badge--gray';
  }

  getTypeIcon(type: string | null | undefined): any {
    const map: Record<string, string> = {
      INBOUND:              'arrow-down',
      OUTBOUND:             'arrow-up',
      TRANSFER:             'exchange-alt',
      RETURN:               'undo',
      SWAP_OUT:             'minus-circle',
      SWAP_IN:              'plus-circle',
      INVENTORY_ADJUSTMENT: 'sliders-h',
    };
    return type ? (map[type] || 'circle') : 'circle';
  }

  ngOnInit(): void {
    this.load();
  }

  delete(stockMovement: IStockMovement): void {
    const modalRef = this.modalService.open(StockMovementDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.stockMovement = stockMovement;
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
    this.stockMovements = dataFromBody;
  }

  protected fillComponentAttributesFromResponseBody(data: IStockMovement[] | null): IStockMovement[] {
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
    return this.stockMovementService.query(queryObject).pipe(tap(() => (this.isLoading = false)));
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
