import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IPerformanceScore, NewPerformanceScore } from '../performance-score.model';

export type PartialUpdatePerformanceScore = Partial<IPerformanceScore> & Pick<IPerformanceScore, 'id'>;

type RestOf<T extends IPerformanceScore | NewPerformanceScore> = Omit<T, 'calculatedAt'> & {
  calculatedAt?: string | null;
};

export type RestPerformanceScore = RestOf<IPerformanceScore>;

export type NewRestPerformanceScore = RestOf<NewPerformanceScore>;

export type PartialUpdateRestPerformanceScore = RestOf<PartialUpdatePerformanceScore>;

export type EntityResponseType = HttpResponse<IPerformanceScore>;
export type EntityArrayResponseType = HttpResponse<IPerformanceScore[]>;

@Injectable({ providedIn: 'root' })
export class PerformanceScoreService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/performance-scores', 'platformservice');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(performanceScore: NewPerformanceScore): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(performanceScore);
    return this.http
      .post<RestPerformanceScore>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(performanceScore: IPerformanceScore): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(performanceScore);
    return this.http
      .put<RestPerformanceScore>(`${this.resourceUrl}/${this.getPerformanceScoreIdentifier(performanceScore)}`, copy, {
        observe: 'response',
      })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(performanceScore: PartialUpdatePerformanceScore): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(performanceScore);
    return this.http
      .patch<RestPerformanceScore>(`${this.resourceUrl}/${this.getPerformanceScoreIdentifier(performanceScore)}`, copy, {
        observe: 'response',
      })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestPerformanceScore>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestPerformanceScore[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getPerformanceScoreIdentifier(performanceScore: Pick<IPerformanceScore, 'id'>): number {
    return performanceScore.id;
  }

  comparePerformanceScore(o1: Pick<IPerformanceScore, 'id'> | null, o2: Pick<IPerformanceScore, 'id'> | null): boolean {
    return o1 && o2 ? this.getPerformanceScoreIdentifier(o1) === this.getPerformanceScoreIdentifier(o2) : o1 === o2;
  }

  addPerformanceScoreToCollectionIfMissing<Type extends Pick<IPerformanceScore, 'id'>>(
    performanceScoreCollection: Type[],
    ...performanceScoresToCheck: (Type | null | undefined)[]
  ): Type[] {
    const performanceScores: Type[] = performanceScoresToCheck.filter(isPresent);
    if (performanceScores.length > 0) {
      const performanceScoreCollectionIdentifiers = performanceScoreCollection.map(
        performanceScoreItem => this.getPerformanceScoreIdentifier(performanceScoreItem)!
      );
      const performanceScoresToAdd = performanceScores.filter(performanceScoreItem => {
        const performanceScoreIdentifier = this.getPerformanceScoreIdentifier(performanceScoreItem);
        if (performanceScoreCollectionIdentifiers.includes(performanceScoreIdentifier)) {
          return false;
        }
        performanceScoreCollectionIdentifiers.push(performanceScoreIdentifier);
        return true;
      });
      return [...performanceScoresToAdd, ...performanceScoreCollection];
    }
    return performanceScoreCollection;
  }

  protected convertDateFromClient<T extends IPerformanceScore | NewPerformanceScore | PartialUpdatePerformanceScore>(
    performanceScore: T
  ): RestOf<T> {
    return {
      ...performanceScore,
      calculatedAt: performanceScore.calculatedAt?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restPerformanceScore: RestPerformanceScore): IPerformanceScore {
    return {
      ...restPerformanceScore,
      calculatedAt: restPerformanceScore.calculatedAt ? dayjs(restPerformanceScore.calculatedAt) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestPerformanceScore>): HttpResponse<IPerformanceScore> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestPerformanceScore[]>): HttpResponse<IPerformanceScore[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
