import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Data, ParamMap, Router } from '@angular/router';
import { combineLatest, filter, Observable, switchMap, tap } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { IPerformanceScore } from '../performance-score.model';

import { ITEMS_PER_PAGE, PAGE_HEADER, TOTAL_COUNT_RESPONSE_HEADER } from 'app/config/pagination.constants';
import { ASC, DESC, SORT, ITEM_DELETED_EVENT, DEFAULT_SORT_DATA } from 'app/config/navigation.constants';
import { EntityArrayResponseType, PerformanceScoreService } from '../service/performance-score.service';
import { PerformanceScoreDeleteDialogComponent } from '../delete/performance-score-delete-dialog.component';
import { DataUtils } from 'app/core/util/data-util.service';

@Component({
  selector: 'jhi-performance-score',
  templateUrl: './performance-score.component.html',
  styleUrls: ['./performance-score.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PerformanceScoreComponent implements OnInit {
  performanceScores?: IPerformanceScore[];
  isLoading = false;

  predicate = 'id';
  ascending = true;

  itemsPerPage = ITEMS_PER_PAGE;
  totalItems = 0;
  page = 1;

  constructor(
    protected performanceScoreService: PerformanceScoreService,
    protected activatedRoute: ActivatedRoute,
    public router: Router,
    protected dataUtils: DataUtils,
    protected modalService: NgbModal
  ) {}

  trackId = (_index: number, item: IPerformanceScore): number => this.performanceScoreService.getPerformanceScoreIdentifier(item);

  get excellentCount(): number {
    return (this.performanceScores ?? []).filter(s => s.classification === 'EXCELLENT').length;
  }
  get goodCount(): number {
    return (this.performanceScores ?? []).filter(s => s.classification === 'GOOD').length;
  }
  get averageCount(): number {
    return (this.performanceScores ?? []).filter(s => s.classification === 'AVERAGE').length;
  }
  get poorCount(): number {
    return (this.performanceScores ?? []).filter(s => s.classification === 'POOR').length;
  }
  get avgScore(): number {
    const scores = (this.performanceScores ?? []).filter(s => s.score != null).map(s => s.score as number);
    if (!scores.length) return 0;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }

  getScoreBadgeClass(score: number | null | undefined): string {
    if (score == null) return 'ps-score--gray';
    if (score >= 80) return 'ps-score--green';
    if (score >= 60) return 'ps-score--blue';
    if (score >= 40) return 'ps-score--amber';
    return 'ps-score--red';
  }

  getClassLabel(cls: string | null | undefined): string {
    const map: Record<string, string> = {
      EXCELLENT: 'Excellent',
      GOOD:      'Bon',
      AVERAGE:   'Moyen',
      POOR:      'Faible',
    };
    return cls ? (map[cls] || cls) : '—';
  }

  getClassBadgeClass(cls: string | null | undefined): string {
    const map: Record<string, string> = {
      EXCELLENT: 'ps-badge--green',
      GOOD:      'ps-badge--blue',
      AVERAGE:   'ps-badge--amber',
      POOR:      'ps-badge--red',
    };
    return cls ? (map[cls] || 'ps-badge--gray') : 'ps-badge--gray';
  }

  getClassIcon(cls: string | null | undefined): any {
    const map: Record<string, string> = {
      EXCELLENT: 'trophy',
      GOOD:      'thumbs-up',
      AVERAGE:   'minus-circle',
      POOR:      'exclamation-triangle',
    };
    return cls ? (map[cls] || 'chart-bar') : 'chart-bar';
  }

  getDeltaClass(delta: number | null | undefined): string {
    if (delta == null) return 'ps-delta--neutral';
    if (delta > 0) return 'ps-delta--up';
    if (delta < 0) return 'ps-delta--down';
    return 'ps-delta--neutral';
  }

  getDeltaIcon(delta: number | null | undefined): any {
    if (delta == null || delta === 0) return 'minus';
    return delta > 0 ? 'arrow-up' : 'arrow-down';
  }

  ngOnInit(): void {
    this.load();
  }

  delete(performanceScore: IPerformanceScore): void {
    const modalRef = this.modalService.open(PerformanceScoreDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.performanceScore = performanceScore;
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
    this.performanceScores = dataFromBody;
  }

  protected fillComponentAttributesFromResponseBody(data: IPerformanceScore[] | null): IPerformanceScore[] {
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
      sort: this.getSortQueryParam(predicate, ascending),
    };
    return this.performanceScoreService.query(queryObject).pipe(tap(() => (this.isLoading = false)));
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
