import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Data, ParamMap, Router } from '@angular/router';
import { combineLatest, filter, Observable, switchMap, tap } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { IObjective } from '../objective.model';

import { ITEMS_PER_PAGE, PAGE_HEADER, TOTAL_COUNT_RESPONSE_HEADER } from 'app/config/pagination.constants';
import { ASC, DESC, SORT, ITEM_DELETED_EVENT, DEFAULT_SORT_DATA } from 'app/config/navigation.constants';
import { EntityArrayResponseType, ObjectiveService } from '../service/objective.service';
import { ObjectiveDeleteDialogComponent } from '../delete/objective-delete-dialog.component';

@Component({
  selector: 'jhi-objective',
  templateUrl: './objective.component.html',
  styleUrls: ['./objective.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ObjectiveComponent implements OnInit {
  objectives?: IObjective[];
  isLoading = false;

  predicate = 'id';
  ascending = true;

  itemsPerPage = ITEMS_PER_PAGE;
  totalItems = 0;
  page = 1;

  constructor(
    protected objectiveService: ObjectiveService,
    protected activatedRoute: ActivatedRoute,
    public router: Router,
    protected modalService: NgbModal
  ) {}

  trackId = (_index: number, item: IObjective): number => this.objectiveService.getObjectiveIdentifier(item);

  get achievedCount(): number {
    return (this.objectives ?? []).filter(o => this.getProgress(o) >= 100).length;
  }
  get onTrackCount(): number {
    return (this.objectives ?? []).filter(o => { const p = this.getProgress(o); return p >= 70 && p < 100; }).length;
  }
  get atRiskCount(): number {
    return (this.objectives ?? []).filter(o => { const p = this.getProgress(o); return p > 0 && p < 70; }).length;
  }
  get notStartedCount(): number {
    return (this.objectives ?? []).filter(o => this.getProgress(o) === 0).length;
  }

  getProgress(obj: IObjective): number {
    if (!obj.targetValue || obj.targetValue === 0) return 0;
    const pct = ((obj.achievedValue ?? 0) / obj.targetValue) * 100;
    return Math.min(Math.round(pct), 999);
  }

  getProgressClass(obj: IObjective): string {
    const p = this.getProgress(obj);
    if (p >= 100) return 'ol-prog--green';
    if (p >= 70)  return 'ol-prog--blue';
    if (p > 0)    return 'ol-prog--amber';
    return 'ol-prog--red';
  }

  getStatusLabel(obj: IObjective): string {
    const p = this.getProgress(obj);
    if (p >= 100) return 'Atteint';
    if (p >= 70)  return 'En bonne voie';
    if (p > 0)    return 'À risque';
    return 'Non démarré';
  }

  getStatusClass(obj: IObjective): string {
    const p = this.getProgress(obj);
    if (p >= 100) return 'ol-badge--green';
    if (p >= 70)  return 'ol-badge--blue';
    if (p > 0)    return 'ol-badge--amber';
    return 'ol-badge--red';
  }

  getMetricLabel(type: string | null | undefined): string {
    const map: Record<string, string> = {
      CONVERSION_RATE: 'Taux conv.',
      REVENUE:         'Chiffre d\'affaires',
      UNIT_VOLUME:     'Volume',
      VISIT_COUNT:     'Visites',
    };
    return type ? (map[type] || type) : '—';
  }

  getMetricClass(type: string | null | undefined): string {
    const map: Record<string, string> = {
      CONVERSION_RATE: 'ol-metric--blue',
      REVENUE:         'ol-metric--green',
      UNIT_VOLUME:     'ol-metric--orange',
      VISIT_COUNT:     'ol-metric--purple',
    };
    return type ? (map[type] || 'ol-metric--gray') : 'ol-metric--gray';
  }

  getMetricIcon(type: string | null | undefined): any {
    const map: Record<string, string> = {
      CONVERSION_RATE: 'percent',
      REVENUE:         'money-bill-wave',
      UNIT_VOLUME:     'boxes',
      VISIT_COUNT:     'road',
    };
    return type ? (map[type] || 'bullseye') : 'bullseye';
  }

  ngOnInit(): void {
    this.load();
  }

  delete(objective: IObjective): void {
    const modalRef = this.modalService.open(ObjectiveDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.objective = objective;
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
    this.objectives = dataFromBody;
  }

  protected fillComponentAttributesFromResponseBody(data: IObjective[] | null): IObjective[] {
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
    return this.objectiveService.query(queryObject).pipe(tap(() => (this.isLoading = false)));
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
