import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IStockAuditLine, NewStockAuditLine } from '../stock-audit-line.model';

export type PartialUpdateStockAuditLine = Partial<IStockAuditLine> & Pick<IStockAuditLine, 'id'>;

type RestOf<T extends IStockAuditLine | NewStockAuditLine> = Omit<T, 'createdAt'> & {
  createdAt?: string | null;
};

export type RestStockAuditLine = RestOf<IStockAuditLine>;

export type NewRestStockAuditLine = RestOf<NewStockAuditLine>;

export type PartialUpdateRestStockAuditLine = RestOf<PartialUpdateStockAuditLine>;

export type EntityResponseType = HttpResponse<IStockAuditLine>;
export type EntityArrayResponseType = HttpResponse<IStockAuditLine[]>;

@Injectable({ providedIn: 'root' })
export class StockAuditLineService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/stock-audit-lines', 'inventoryservice');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(stockAuditLine: NewStockAuditLine): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(stockAuditLine);
    return this.http
      .post<RestStockAuditLine>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(stockAuditLine: IStockAuditLine): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(stockAuditLine);
    return this.http
      .put<RestStockAuditLine>(`${this.resourceUrl}/${this.getStockAuditLineIdentifier(stockAuditLine)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(stockAuditLine: PartialUpdateStockAuditLine): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(stockAuditLine);
    return this.http
      .patch<RestStockAuditLine>(`${this.resourceUrl}/${this.getStockAuditLineIdentifier(stockAuditLine)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestStockAuditLine>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestStockAuditLine[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getStockAuditLineIdentifier(stockAuditLine: Pick<IStockAuditLine, 'id'>): number {
    return stockAuditLine.id;
  }

  compareStockAuditLine(o1: Pick<IStockAuditLine, 'id'> | null, o2: Pick<IStockAuditLine, 'id'> | null): boolean {
    return o1 && o2 ? this.getStockAuditLineIdentifier(o1) === this.getStockAuditLineIdentifier(o2) : o1 === o2;
  }

  addStockAuditLineToCollectionIfMissing<Type extends Pick<IStockAuditLine, 'id'>>(
    stockAuditLineCollection: Type[],
    ...stockAuditLinesToCheck: (Type | null | undefined)[]
  ): Type[] {
    const stockAuditLines: Type[] = stockAuditLinesToCheck.filter(isPresent);
    if (stockAuditLines.length > 0) {
      const stockAuditLineCollectionIdentifiers = stockAuditLineCollection.map(
        stockAuditLineItem => this.getStockAuditLineIdentifier(stockAuditLineItem)!
      );
      const stockAuditLinesToAdd = stockAuditLines.filter(stockAuditLineItem => {
        const stockAuditLineIdentifier = this.getStockAuditLineIdentifier(stockAuditLineItem);
        if (stockAuditLineCollectionIdentifiers.includes(stockAuditLineIdentifier)) {
          return false;
        }
        stockAuditLineCollectionIdentifiers.push(stockAuditLineIdentifier);
        return true;
      });
      return [...stockAuditLinesToAdd, ...stockAuditLineCollection];
    }
    return stockAuditLineCollection;
  }

  protected convertDateFromClient<T extends IStockAuditLine | NewStockAuditLine | PartialUpdateStockAuditLine>(
    stockAuditLine: T
  ): RestOf<T> {
    return {
      ...stockAuditLine,
      createdAt: stockAuditLine.createdAt?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restStockAuditLine: RestStockAuditLine): IStockAuditLine {
    return {
      ...restStockAuditLine,
      createdAt: restStockAuditLine.createdAt ? dayjs(restStockAuditLine.createdAt) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestStockAuditLine>): HttpResponse<IStockAuditLine> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestStockAuditLine[]>): HttpResponse<IStockAuditLine[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
