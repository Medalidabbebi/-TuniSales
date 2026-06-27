import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import dayjs from 'dayjs/esm';

import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IClaim, NewClaim } from '../claim.model';

export type PartialUpdateClaim = Partial<IClaim> & Pick<IClaim, 'id'>;

type RestOf<T extends IClaim | NewClaim> = Omit<T, 'createdAt' | 'resolvedAt'> & {
  createdAt?: string | null;
  resolvedAt?: string | null;
};

export type RestClaim = RestOf<IClaim>;
export type NewRestClaim = RestOf<NewClaim>;
export type PartialUpdateRestClaim = RestOf<PartialUpdateClaim>;

export type EntityResponseType = HttpResponse<IClaim>;
export type EntityArrayResponseType = HttpResponse<IClaim[]>;

@Injectable({ providedIn: 'root' })
export class ClaimService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/claims', 'businessservice');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(claim: NewClaim): Observable<EntityResponseType> {
    return this.http
      .post<RestClaim>(this.resourceUrl, claim, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(claim: PartialUpdateClaim): Observable<EntityResponseType> {
    return this.http
      .patch<RestClaim>(`${this.resourceUrl}/${claim.id}`, claim, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestClaim>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestClaim[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  protected convertDateFromServer(restClaim: RestClaim): IClaim {
    return {
      ...restClaim,
      createdAt: restClaim.createdAt ? dayjs(restClaim.createdAt) : undefined,
      resolvedAt: restClaim.resolvedAt ? dayjs(restClaim.resolvedAt) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestClaim>): HttpResponse<IClaim> {
    return res.clone({ body: res.body ? this.convertDateFromServer(res.body) : null });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestClaim[]>): HttpResponse<IClaim[]> {
    return res.clone({ body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null });
  }
}
