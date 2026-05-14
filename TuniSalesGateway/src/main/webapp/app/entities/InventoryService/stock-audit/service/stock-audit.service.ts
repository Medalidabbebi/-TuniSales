import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IStockAudit, NewStockAudit } from '../stock-audit.model';

export type PartialUpdateStockAudit = Partial<IStockAudit> & Pick<IStockAudit, 'id'>;

type RestOf<T extends IStockAudit | NewStockAudit> = Omit<T, 'startedAt' | 'closedAt'> & {
  startedAt?: string | null;
  closedAt?: string | null;
};

export type RestStockAudit = RestOf<IStockAudit>;

export type NewRestStockAudit = RestOf<NewStockAudit>;

export type PartialUpdateRestStockAudit = RestOf<PartialUpdateStockAudit>;

export type EntityResponseType = HttpResponse<IStockAudit>;
export type EntityArrayResponseType = HttpResponse<IStockAudit[]>;

@Injectable({ providedIn: 'root' })
export class StockAuditService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/stock-audits', 'inventoryservice');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(stockAudit: NewStockAudit): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(stockAudit);
    return this.http
      .post<RestStockAudit>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(stockAudit: IStockAudit): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(stockAudit);
    return this.http
      .put<RestStockAudit>(`${this.resourceUrl}/${this.getStockAuditIdentifier(stockAudit)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(stockAudit: PartialUpdateStockAudit): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(stockAudit);
    return this.http
      .patch<RestStockAudit>(`${this.resourceUrl}/${this.getStockAuditIdentifier(stockAudit)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestStockAudit>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestStockAudit[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getStockAuditIdentifier(stockAudit: Pick<IStockAudit, 'id'>): number {
    return stockAudit.id;
  }

  compareStockAudit(o1: Pick<IStockAudit, 'id'> | null, o2: Pick<IStockAudit, 'id'> | null): boolean {
    return o1 && o2 ? this.getStockAuditIdentifier(o1) === this.getStockAuditIdentifier(o2) : o1 === o2;
  }

  addStockAuditToCollectionIfMissing<Type extends Pick<IStockAudit, 'id'>>(
    stockAuditCollection: Type[],
    ...stockAuditsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const stockAudits: Type[] = stockAuditsToCheck.filter(isPresent);
    if (stockAudits.length > 0) {
      const stockAuditCollectionIdentifiers = stockAuditCollection.map(stockAuditItem => this.getStockAuditIdentifier(stockAuditItem)!);
      const stockAuditsToAdd = stockAudits.filter(stockAuditItem => {
        const stockAuditIdentifier = this.getStockAuditIdentifier(stockAuditItem);
        if (stockAuditCollectionIdentifiers.includes(stockAuditIdentifier)) {
          return false;
        }
        stockAuditCollectionIdentifiers.push(stockAuditIdentifier);
        return true;
      });
      return [...stockAuditsToAdd, ...stockAuditCollection];
    }
    return stockAuditCollection;
  }

  protected convertDateFromClient<T extends IStockAudit | NewStockAudit | PartialUpdateStockAudit>(stockAudit: T): RestOf<T> {
    return {
      ...stockAudit,
      startedAt: stockAudit.startedAt?.toJSON() ?? null,
      closedAt: stockAudit.closedAt?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restStockAudit: RestStockAudit): IStockAudit {
    return {
      ...restStockAudit,
      startedAt: restStockAudit.startedAt ? dayjs(restStockAudit.startedAt) : undefined,
      closedAt: restStockAudit.closedAt ? dayjs(restStockAudit.closedAt) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestStockAudit>): HttpResponse<IStockAudit> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestStockAudit[]>): HttpResponse<IStockAudit[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
