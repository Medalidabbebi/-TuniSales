import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IOrderLineItem, NewOrderLineItem } from '../order-line-item.model';

export type PartialUpdateOrderLineItem = Partial<IOrderLineItem> & Pick<IOrderLineItem, 'id'>;

type RestOf<T extends IOrderLineItem | NewOrderLineItem> = Omit<T, 'assignedAt'> & {
  assignedAt?: string | null;
};

export type RestOrderLineItem = RestOf<IOrderLineItem>;

export type NewRestOrderLineItem = RestOf<NewOrderLineItem>;

export type PartialUpdateRestOrderLineItem = RestOf<PartialUpdateOrderLineItem>;

export type EntityResponseType = HttpResponse<IOrderLineItem>;
export type EntityArrayResponseType = HttpResponse<IOrderLineItem[]>;

@Injectable({ providedIn: 'root' })
export class OrderLineItemService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/order-line-items', 'businessservice');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(orderLineItem: NewOrderLineItem): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(orderLineItem);
    return this.http
      .post<RestOrderLineItem>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(orderLineItem: IOrderLineItem): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(orderLineItem);
    return this.http
      .put<RestOrderLineItem>(`${this.resourceUrl}/${this.getOrderLineItemIdentifier(orderLineItem)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(orderLineItem: PartialUpdateOrderLineItem): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(orderLineItem);
    return this.http
      .patch<RestOrderLineItem>(`${this.resourceUrl}/${this.getOrderLineItemIdentifier(orderLineItem)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestOrderLineItem>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestOrderLineItem[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getOrderLineItemIdentifier(orderLineItem: Pick<IOrderLineItem, 'id'>): number {
    return orderLineItem.id;
  }

  compareOrderLineItem(o1: Pick<IOrderLineItem, 'id'> | null, o2: Pick<IOrderLineItem, 'id'> | null): boolean {
    return o1 && o2 ? this.getOrderLineItemIdentifier(o1) === this.getOrderLineItemIdentifier(o2) : o1 === o2;
  }

  addOrderLineItemToCollectionIfMissing<Type extends Pick<IOrderLineItem, 'id'>>(
    orderLineItemCollection: Type[],
    ...orderLineItemsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const orderLineItems: Type[] = orderLineItemsToCheck.filter(isPresent);
    if (orderLineItems.length > 0) {
      const orderLineItemCollectionIdentifiers = orderLineItemCollection.map(
        orderLineItemItem => this.getOrderLineItemIdentifier(orderLineItemItem)!
      );
      const orderLineItemsToAdd = orderLineItems.filter(orderLineItemItem => {
        const orderLineItemIdentifier = this.getOrderLineItemIdentifier(orderLineItemItem);
        if (orderLineItemCollectionIdentifiers.includes(orderLineItemIdentifier)) {
          return false;
        }
        orderLineItemCollectionIdentifiers.push(orderLineItemIdentifier);
        return true;
      });
      return [...orderLineItemsToAdd, ...orderLineItemCollection];
    }
    return orderLineItemCollection;
  }

  protected convertDateFromClient<T extends IOrderLineItem | NewOrderLineItem | PartialUpdateOrderLineItem>(orderLineItem: T): RestOf<T> {
    return {
      ...orderLineItem,
      assignedAt: orderLineItem.assignedAt?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restOrderLineItem: RestOrderLineItem): IOrderLineItem {
    return {
      ...restOrderLineItem,
      assignedAt: restOrderLineItem.assignedAt ? dayjs(restOrderLineItem.assignedAt) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestOrderLineItem>): HttpResponse<IOrderLineItem> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestOrderLineItem[]>): HttpResponse<IOrderLineItem[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
