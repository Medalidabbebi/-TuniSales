import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Data, ParamMap, Router } from '@angular/router';
import { combineLatest, filter, Observable, switchMap, tap } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { IClientScore } from '../client-score.model';

import { ITEMS_PER_PAGE, PAGE_HEADER, TOTAL_COUNT_RESPONSE_HEADER } from 'app/config/pagination.constants';
import { ASC, DESC, SORT, ITEM_DELETED_EVENT, DEFAULT_SORT_DATA } from 'app/config/navigation.constants';
import { EntityArrayResponseType, ClientScoreService } from '../service/client-score.service';
import { ClientScoreDeleteDialogComponent } from '../delete/client-score-delete-dialog.component';
import { DataUtils } from 'app/core/util/data-util.service';

@Component({
  selector: 'jhi-client-score',
  templateUrl: './client-score.component.html',
  styleUrls: ['./client-score.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ClientScoreComponent implements OnInit {
  clientScores?: IClientScore[];
  isLoading = false;

  predicate = 'id';
  ascending = true;

  itemsPerPage = ITEMS_PER_PAGE;
  totalItems = 0;
  page = 1;

  constructor(
    protected clientScoreService: ClientScoreService,
    protected activatedRoute: ActivatedRoute,
    public router: Router,
    protected dataUtils: DataUtils,
    protected modalService: NgbModal
  ) {}

  trackId = (_index: number, item: IClientScore): number => this.clientScoreService.getClientScoreIdentifier(item);

  get excellentCount(): number {
    return (this.clientScores ?? []).filter(s => s.classification === 'EXCELLENT').length;
  }
  get goodCount(): number {
    return (this.clientScores ?? []).filter(s => s.classification === 'GOOD').length;
  }
  get averageCount(): number {
    return (this.clientScores ?? []).filter(s => s.classification === 'AVERAGE').length;
  }
  get poorCount(): number {
    return (this.clientScores ?? []).filter(s => s.classification === 'POOR').length;
  }
  get avgScore(): number {
    const scores = (this.clientScores ?? []).filter(s => s.score != null).map(s => s.score as number);
    if (!scores.length) return 0;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }

  getScoreBubbleClass(score: number | null | undefined): string {
    if (score == null) return 'cs-bubble--gray';
    if (score >= 80) return 'cs-bubble--green';
    if (score >= 60) return 'cs-bubble--blue';
    if (score >= 40) return 'cs-bubble--amber';
    return 'cs-bubble--red';
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
      EXCELLENT: 'cs-badge--green',
      GOOD:      'cs-badge--blue',
      AVERAGE:   'cs-badge--amber',
      POOR:      'cs-badge--red',
    };
    return cls ? (map[cls] || 'cs-badge--gray') : 'cs-badge--gray';
  }

  getClassIcon(cls: string | null | undefined): any {
    const map: Record<string, string> = {
      EXCELLENT: 'trophy',
      GOOD:      'thumbs-up',
      AVERAGE:   'minus-circle',
      POOR:      'exclamation-triangle',
    };
    return cls ? (map[cls] || 'star') : 'star';
  }

  ngOnInit(): void {
    this.load();
  }

  byteSize(base64String: string): string {
    return this.dataUtils.byteSize(base64String);
  }

  openFile(base64String: string, contentType: string | null | undefined): void {
    return this.dataUtils.openFile(base64String, contentType);
  }

  delete(clientScore: IClientScore): void {
    const modalRef = this.modalService.open(ClientScoreDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.clientScore = clientScore;
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
    this.clientScores = dataFromBody;
  }

  protected fillComponentAttributesFromResponseBody(data: IClientScore[] | null): IClientScore[] {
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
    return this.clientScoreService.query(queryObject).pipe(tap(() => (this.isLoading = false)));
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
