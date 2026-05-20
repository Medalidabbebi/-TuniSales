import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Data, ParamMap, Router } from '@angular/router';
import { combineLatest, filter, Observable, switchMap, tap } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { IStockItem } from '../stock-item.model';
import { StockItemStatus } from 'app/entities/enumerations/stock-item-status.model';
import { AiSummaryService } from 'app/shared/service/ai-summary.service';

import { ITEMS_PER_PAGE, PAGE_HEADER, TOTAL_COUNT_RESPONSE_HEADER } from 'app/config/pagination.constants';
import { ASC, DESC, SORT, ITEM_DELETED_EVENT, DEFAULT_SORT_DATA } from 'app/config/navigation.constants';
import { EntityArrayResponseType, StockItemService } from '../service/stock-item.service';
import { StockItemDeleteDialogComponent } from '../delete/stock-item-delete-dialog.component';

export interface StockGroup {
  representative: IStockItem;
  count: number;
}

@Component({
  selector: 'jhi-stock-item',
  templateUrl: './stock-item.component.html',
  styleUrls: ['./stock-item.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class StockItemComponent implements OnInit {
  stockItems?: IStockItem[];
  groupedItems: StockGroup[] = [];
  isLoading = false;

  predicate = 'id';
  ascending = true;

  itemsPerPage = ITEMS_PER_PAGE;
  totalItems = 0;
  page = 1;

  // ── AI Analytics ──────────────────────────────────────────────────────────
  stockInsight: string | null = null;
  isLoadingInsight = false;
  stockChatMessages: Array<{ role: 'user' | 'assistant'; content: string }> = [];
  chatInput = '';
  isChatLoading = false;
  private stockContext = '';

  constructor(
    protected stockItemService: StockItemService,
    protected activatedRoute: ActivatedRoute,
    public router: Router,
    protected modalService: NgbModal,
    private aiSummaryService: AiSummaryService,
  ) {}

  trackId = (_index: number, item: IStockItem): number => this.stockItemService.getStockItemIdentifier(item);

  ngOnInit(): void {
    this.load();
  }

  delete(stockItem: IStockItem): void {
    const modalRef = this.modalService.open(StockItemDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.stockItem = stockItem;
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

  getStatusClass(status: string | null | undefined): string {
    const map: Record<string, string> = {
      AVAILABLE:    'bg-success',
      RESERVED:     'bg-info text-dark',
      ALLOCATED:    'bg-primary',
      IN_TRANSIT:   'bg-warning text-dark',
      DEPLOYED:     'bg-secondary',
      DEFECTIVE:    'bg-danger',
      MISSING:      'bg-danger',
      SOLD:         'bg-dark',
      RETIRED:      'bg-secondary',
    };
    return map[status ?? ''] ?? 'bg-secondary';
  }

  statusSummary(): Array<{ label: string; count: number; colorClass: string }> {
    const items = this.stockItems ?? [];
    return [
      { label: 'Disponible',  count: items.filter(i => i.status === StockItemStatus.AVAILABLE).length,  colorClass: 'text-success' },
      { label: 'Vendu',       count: items.filter(i => i.status === StockItemStatus.SOLD).length,        colorClass: 'text-dark' },
      { label: 'Défectueux',  count: items.filter(i => i.status === StockItemStatus.DEFECTIVE).length,   colorClass: 'text-danger' },
      { label: 'Manquant',    count: items.filter(i => i.status === StockItemStatus.MISSING).length,     colorClass: 'text-warning' },
    ];
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
    this.stockItems = dataFromBody;
    this.groupedItems = this.computeGroups(dataFromBody);
    if (dataFromBody.length > 0) {
      this.loadStockInsights(dataFromBody);
    }
  }

  private computeGroups(items: IStockItem[]): StockGroup[] {
    const map = new Map<string, StockGroup>();
    for (const item of items) {
      const sec = item.acquiredAt ? item.acquiredAt.format('YYYY-MM-DDTHH:mm:ss') : 'unknown';
      const key = `${item.productId}_${sec}_${item.status ?? ''}_${item.warehouse?.id ?? 0}`;
      if (map.has(key)) {
        map.get(key)!.count++;
      } else {
        map.set(key, { representative: item, count: 1 });
      }
    }
    return Array.from(map.values());
  }

  protected fillComponentAttributesFromResponseBody(data: IStockItem[] | null): IStockItem[] {
    return (data ?? []).sort((a, b) => {
      const da = a.acquiredAt?.valueOf() ?? 0;
      const db = b.acquiredAt?.valueOf() ?? 0;
      return db - da;
    });
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
    return this.stockItemService.query(queryObject).pipe(tap(() => (this.isLoading = false)));
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

  // ─── AI Analytics ─────────────────────────────────────────────────────────

  private loadStockInsights(items: IStockItem[]): void {
    const count = (s: StockItemStatus) => items.filter(i => i.status === s).length;
    const available  = count(StockItemStatus.AVAILABLE);
    const sold       = count(StockItemStatus.SOLD);
    const defective  = count(StockItemStatus.DEFECTIVE);
    const missing    = count(StockItemStatus.MISSING);
    const inTransit  = count(StockItemStatus.IN_TRANSIT);
    const reserved   = count(StockItemStatus.RESERVED);

    const productCounts: Record<string, number> = {};
    const warehouseIds = new Set<number>();
    for (const item of items) {
      const p = item.productName ?? 'Inconnu';
      productCounts[p] = (productCounts[p] ?? 0) + 1;
      if (item.warehouse?.id) warehouseIds.add(item.warehouse.id);
    }
    const topEntry = Object.entries(productCounts).sort(([,a],[,b]) => b - a)[0];
    const topProduct = topEntry?.[0] ?? '—';
    const topProductCount = topEntry?.[1] ?? 0;

    this.stockContext =
      `Stock: ${items.length} articles. Disponibles: ${available}, Vendus: ${sold}, ` +
      `Défectueux: ${defective}, Manquants: ${missing}, En transit: ${inTransit}, Réservés: ${reserved}. ` +
      `Entrepôts: ${warehouseIds.size}. Produit principal: ${topProduct} (${topProductCount} unités).`;

    this.isLoadingInsight = true;
    this.aiSummaryService.generateStockInsights({
      total: items.length, available, sold, defective, missing,
      inTransit, reserved, topProduct, topProductCount, warehouseCount: warehouseIds.size,
    }).subscribe({
      next: text => { this.stockInsight = text; this.isLoadingInsight = false; },
      error: ()   => { this.isLoadingInsight = false; },
    });
  }

  refreshInsights(): void {
    this.stockInsight = null;
    if (this.stockItems?.length) {
      this.loadStockInsights(this.stockItems);
    }
  }

  sendChat(): void {
    const msg = this.chatInput.trim();
    if (!msg || this.isChatLoading) return;
    this.chatInput = '';
    this.stockChatMessages.push({ role: 'user', content: msg });
    this.isChatLoading = true;

    this.aiSummaryService.chat([...this.stockChatMessages], this.stockContext).subscribe({
      next: reply => {
        this.stockChatMessages.push({ role: 'assistant', content: reply });
        this.isChatLoading = false;
      },
      error: () => {
        this.stockChatMessages.push({ role: 'assistant', content: 'Service IA non disponible.' });
        this.isChatLoading = false;
      },
    });
  }

  onChatKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendChat();
    }
  }
}
