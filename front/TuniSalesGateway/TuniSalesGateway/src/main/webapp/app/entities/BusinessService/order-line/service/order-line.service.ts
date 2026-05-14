import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IOrderLine, NewOrderLine } from '../order-line.model';

export type PartialUpdateOrderLine = Partial<IOrderLine> & Pick<IOrderLine, 'id'>;

type RestOf<T extends IOrderLine | NewOrderLine> = Omit<T, 'createdAt'> & {
  createdAt?: string | null;
};

export type RestOrderLine = RestOf<IOrderLine>;

export type NewRestOrderLine = RestOf<NewOrderLine>;

export type PartialUpdateRestOrderLine = RestOf<PartialUpdateOrderLine>;

export type EntityResponseType = HttpResponse<IOrderLine>;
export type EntityArrayResponseType = HttpResponse<IOrderLine[]>;

@Injectable({ providedIn: 'root' })
export class OrderLineService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/order-lines', 'businessservice');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(orderLine: NewOrderLine): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(orderLine);
    return this.http
      .post<RestOrderLine>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(orderLine: IOrderLine): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(orderLine);
    return this.http
      .put<RestOrderLine>(`${this.resourceUrl}/${this.getOrderLineIdentifier(orderLine)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(orderLine: PartialUpdateOrderLine): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(orderLine);
    return this.http
      .patch<RestOrderLine>(`${this.resourceUrl}/${this.getOrderLineIdentifier(orderLine)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestOrderLine>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestOrderLine[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getOrderLineIdentifier(orderLine: Pick<IOrderLine, 'id'>): number {
    return orderLine.id;
  }

  compareOrderLine(o1: Pick<IOrderLine, 'id'> | null, o2: Pick<IOrderLine, 'id'> | null): boolean {
    return o1 && o2 ? this.getOrderLineIdentifier(o1) === this.getOrderLineIdentifier(o2) : o1 === o2;
  }

  addOrderLineToCollectionIfMissing<Type extends Pick<IOrderLine, 'id'>>(
    orderLineCollection: Type[],
    ...orderLinesToCheck: (Type | null | undefined)[]
  ): Type[] {
    const orderLines: Type[] = orderLinesToCheck.filter(isPresent);
    if (orderLines.length > 0) {
      const orderLineCollectionIdentifiers = orderLineCollection.map(orderLineItem => this.getOrderLineIdentifier(orderLineItem)!);
      const orderLinesToAdd = orderLines.filter(orderLineItem => {
        const orderLineIdentifier = this.getOrderLineIdentifier(orderLineItem);
        if (orderLineCollectionIdentifiers.includes(orderLineIdentifier)) {
          return false;
        }
        orderLineCollectionIdentifiers.push(orderLineIdentifier);
        return true;
      });
      return [...orderLinesToAdd, ...orderLineCollection];
    }
    return orderLineCollection;
  }

  protected convertDateFromClient<T extends IOrderLine | NewOrderLine | PartialUpdateOrderLine>(orderLine: T): RestOf<T> {
    return {
      ...orderLine,
      createdAt: orderLine.createdAt?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restOrderLine: RestOrderLine): IOrderLine {
    return {
      ...restOrderLine,
      createdAt: restOrderLine.createdAt ? dayjs(restOrderLine.createdAt) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestOrderLine>): HttpResponse<IOrderLine> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestOrderLine[]>): HttpResponse<IOrderLine[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
