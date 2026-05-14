import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IStockMovement, NewStockMovement } from '../stock-movement.model';

export type PartialUpdateStockMovement = Partial<IStockMovement> & Pick<IStockMovement, 'id'>;

type RestOf<T extends IStockMovement | NewStockMovement> = Omit<T, 'createdAt'> & {
  createdAt?: string | null;
};

export type RestStockMovement = RestOf<IStockMovement>;

export type NewRestStockMovement = RestOf<NewStockMovement>;

export type PartialUpdateRestStockMovement = RestOf<PartialUpdateStockMovement>;

export type EntityResponseType = HttpResponse<IStockMovement>;
export type EntityArrayResponseType = HttpResponse<IStockMovement[]>;

@Injectable({ providedIn: 'root' })
export class StockMovementService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/stock-movements', 'inventoryservice');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(stockMovement: NewStockMovement): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(stockMovement);
    return this.http
      .post<RestStockMovement>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(stockMovement: IStockMovement): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(stockMovement);
    return this.http
      .put<RestStockMovement>(`${this.resourceUrl}/${this.getStockMovementIdentifier(stockMovement)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(stockMovement: PartialUpdateStockMovement): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(stockMovement);
    return this.http
      .patch<RestStockMovement>(`${this.resourceUrl}/${this.getStockMovementIdentifier(stockMovement)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestStockMovement>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestStockMovement[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getStockMovementIdentifier(stockMovement: Pick<IStockMovement, 'id'>): number {
    return stockMovement.id;
  }

  compareStockMovement(o1: Pick<IStockMovement, 'id'> | null, o2: Pick<IStockMovement, 'id'> | null): boolean {
    return o1 && o2 ? this.getStockMovementIdentifier(o1) === this.getStockMovementIdentifier(o2) : o1 === o2;
  }

  addStockMovementToCollectionIfMissing<Type extends Pick<IStockMovement, 'id'>>(
    stockMovementCollection: Type[],
    ...stockMovementsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const stockMovements: Type[] = stockMovementsToCheck.filter(isPresent);
    if (stockMovements.length > 0) {
      const stockMovementCollectionIdentifiers = stockMovementCollection.map(
        stockMovementItem => this.getStockMovementIdentifier(stockMovementItem)!
      );
      const stockMovementsToAdd = stockMovements.filter(stockMovementItem => {
        const stockMovementIdentifier = this.getStockMovementIdentifier(stockMovementItem);
        if (stockMovementCollectionIdentifiers.includes(stockMovementIdentifier)) {
          return false;
        }
        stockMovementCollectionIdentifiers.push(stockMovementIdentifier);
        return true;
      });
      return [...stockMovementsToAdd, ...stockMovementCollection];
    }
    return stockMovementCollection;
  }

  protected convertDateFromClient<T extends IStockMovement | NewStockMovement | PartialUpdateStockMovement>(stockMovement: T): RestOf<T> {
    return {
      ...stockMovement,
      createdAt: stockMovement.createdAt?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restStockMovement: RestStockMovement): IStockMovement {
    return {
      ...restStockMovement,
      createdAt: restStockMovement.createdAt ? dayjs(restStockMovement.createdAt) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestStockMovement>): HttpResponse<IStockMovement> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestStockMovement[]>): HttpResponse<IStockMovement[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
