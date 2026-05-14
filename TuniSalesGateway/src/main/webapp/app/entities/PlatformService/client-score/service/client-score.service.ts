import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IClientScore, NewClientScore } from '../client-score.model';

export type PartialUpdateClientScore = Partial<IClientScore> & Pick<IClientScore, 'id'>;

type RestOf<T extends IClientScore | NewClientScore> = Omit<T, 'calculatedAt'> & {
  calculatedAt?: string | null;
};

export type RestClientScore = RestOf<IClientScore>;

export type NewRestClientScore = RestOf<NewClientScore>;

export type PartialUpdateRestClientScore = RestOf<PartialUpdateClientScore>;

export type EntityResponseType = HttpResponse<IClientScore>;
export type EntityArrayResponseType = HttpResponse<IClientScore[]>;

@Injectable({ providedIn: 'root' })
export class ClientScoreService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/client-scores', 'platformservice');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(clientScore: NewClientScore): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(clientScore);
    return this.http
      .post<RestClientScore>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(clientScore: IClientScore): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(clientScore);
    return this.http
      .put<RestClientScore>(`${this.resourceUrl}/${this.getClientScoreIdentifier(clientScore)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(clientScore: PartialUpdateClientScore): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(clientScore);
    return this.http
      .patch<RestClientScore>(`${this.resourceUrl}/${this.getClientScoreIdentifier(clientScore)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestClientScore>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestClientScore[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getClientScoreIdentifier(clientScore: Pick<IClientScore, 'id'>): number {
    return clientScore.id;
  }

  compareClientScore(o1: Pick<IClientScore, 'id'> | null, o2: Pick<IClientScore, 'id'> | null): boolean {
    return o1 && o2 ? this.getClientScoreIdentifier(o1) === this.getClientScoreIdentifier(o2) : o1 === o2;
  }

  addClientScoreToCollectionIfMissing<Type extends Pick<IClientScore, 'id'>>(
    clientScoreCollection: Type[],
    ...clientScoresToCheck: (Type | null | undefined)[]
  ): Type[] {
    const clientScores: Type[] = clientScoresToCheck.filter(isPresent);
    if (clientScores.length > 0) {
      const clientScoreCollectionIdentifiers = clientScoreCollection.map(
        clientScoreItem => this.getClientScoreIdentifier(clientScoreItem)!
      );
      const clientScoresToAdd = clientScores.filter(clientScoreItem => {
        const clientScoreIdentifier = this.getClientScoreIdentifier(clientScoreItem);
        if (clientScoreCollectionIdentifiers.includes(clientScoreIdentifier)) {
          return false;
        }
        clientScoreCollectionIdentifiers.push(clientScoreIdentifier);
        return true;
      });
      return [...clientScoresToAdd, ...clientScoreCollection];
    }
    return clientScoreCollection;
  }

  protected convertDateFromClient<T extends IClientScore | NewClientScore | PartialUpdateClientScore>(clientScore: T): RestOf<T> {
    return {
      ...clientScore,
      calculatedAt: clientScore.calculatedAt?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restClientScore: RestClientScore): IClientScore {
    return {
      ...restClientScore,
      calculatedAt: restClientScore.calculatedAt ? dayjs(restClientScore.calculatedAt) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestClientScore>): HttpResponse<IClientScore> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestClientScore[]>): HttpResponse<IClientScore[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
