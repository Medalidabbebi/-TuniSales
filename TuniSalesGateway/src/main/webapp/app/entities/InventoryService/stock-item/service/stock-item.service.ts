import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IStockItem, NewStockItem } from '../stock-item.model';

export type PartialUpdateStockItem = Partial<IStockItem> & Pick<IStockItem, 'id'>;

type RestOf<T extends IStockItem | NewStockItem> = Omit<T, 'acquiredAt' | 'updatedAt'> & {
  acquiredAt?: string | null;
  updatedAt?: string | null;
};

export type RestStockItem = RestOf<IStockItem>;

export type NewRestStockItem = RestOf<NewStockItem>;

export type PartialUpdateRestStockItem = RestOf<PartialUpdateStockItem>;

export type EntityResponseType = HttpResponse<IStockItem>;
export type EntityArrayResponseType = HttpResponse<IStockItem[]>;

@Injectable({ providedIn: 'root' })
export class StockItemService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/stock-items', 'inventoryservice');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(stockItem: NewStockItem): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(stockItem);
    return this.http
      .post<RestStockItem>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(stockItem: IStockItem): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(stockItem);
    return this.http
      .put<RestStockItem>(`${this.resourceUrl}/${this.getStockItemIdentifier(stockItem)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(stockItem: PartialUpdateStockItem): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(stockItem);
    return this.http
      .patch<RestStockItem>(`${this.resourceUrl}/${this.getStockItemIdentifier(stockItem)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestStockItem>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestStockItem[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getStockItemIdentifier(stockItem: Pick<IStockItem, 'id'>): number {
    return stockItem.id;
  }

  compareStockItem(o1: Pick<IStockItem, 'id'> | null, o2: Pick<IStockItem, 'id'> | null): boolean {
    return o1 && o2 ? this.getStockItemIdentifier(o1) === this.getStockItemIdentifier(o2) : o1 === o2;
  }

  addStockItemToCollectionIfMissing<Type extends Pick<IStockItem, 'id'>>(
    stockItemCollection: Type[],
    ...stockItemsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const stockItems: Type[] = stockItemsToCheck.filter(isPresent);
    if (stockItems.length > 0) {
      const stockItemCollectionIdentifiers = stockItemCollection.map(stockItemItem => this.getStockItemIdentifier(stockItemItem)!);
      const stockItemsToAdd = stockItems.filter(stockItemItem => {
        const stockItemIdentifier = this.getStockItemIdentifier(stockItemItem);
        if (stockItemCollectionIdentifiers.includes(stockItemIdentifier)) {
          return false;
        }
        stockItemCollectionIdentifiers.push(stockItemIdentifier);
        return true;
      });
      return [...stockItemsToAdd, ...stockItemCollection];
    }
    return stockItemCollection;
  }

  protected convertDateFromClient<T extends IStockItem | NewStockItem | PartialUpdateStockItem>(stockItem: T): RestOf<T> {
    return {
      ...stockItem,
      acquiredAt: stockItem.acquiredAt?.toJSON() ?? null,
      updatedAt: stockItem.updatedAt?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restStockItem: RestStockItem): IStockItem {
    return {
      ...restStockItem,
      acquiredAt: restStockItem.acquiredAt ? dayjs(restStockItem.acquiredAt) : undefined,
      updatedAt: restStockItem.updatedAt ? dayjs(restStockItem.updatedAt) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestStockItem>): HttpResponse<IStockItem> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestStockItem[]>): HttpResponse<IStockItem[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
