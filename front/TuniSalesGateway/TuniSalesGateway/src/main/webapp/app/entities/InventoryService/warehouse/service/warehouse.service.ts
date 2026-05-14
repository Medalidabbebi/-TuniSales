import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IWarehouse, NewWarehouse } from '../warehouse.model';

export type PartialUpdateWarehouse = Partial<IWarehouse> & Pick<IWarehouse, 'id'>;

type RestOf<T extends IWarehouse | NewWarehouse> = Omit<T, 'createdAt' | 'updatedAt'> & {
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type RestWarehouse = RestOf<IWarehouse>;

export type NewRestWarehouse = RestOf<NewWarehouse>;

export type PartialUpdateRestWarehouse = RestOf<PartialUpdateWarehouse>;

export type EntityResponseType = HttpResponse<IWarehouse>;
export type EntityArrayResponseType = HttpResponse<IWarehouse[]>;

@Injectable({ providedIn: 'root' })
export class WarehouseService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/warehouses', 'inventoryservice');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(warehouse: NewWarehouse): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(warehouse);
    return this.http
      .post<RestWarehouse>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(warehouse: IWarehouse): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(warehouse);
    return this.http
      .put<RestWarehouse>(`${this.resourceUrl}/${this.getWarehouseIdentifier(warehouse)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(warehouse: PartialUpdateWarehouse): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(warehouse);
    return this.http
      .patch<RestWarehouse>(`${this.resourceUrl}/${this.getWarehouseIdentifier(warehouse)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestWarehouse>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestWarehouse[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getWarehouseIdentifier(warehouse: Pick<IWarehouse, 'id'>): number {
    return warehouse.id;
  }

  compareWarehouse(o1: Pick<IWarehouse, 'id'> | null, o2: Pick<IWarehouse, 'id'> | null): boolean {
    return o1 && o2 ? this.getWarehouseIdentifier(o1) === this.getWarehouseIdentifier(o2) : o1 === o2;
  }

  addWarehouseToCollectionIfMissing<Type extends Pick<IWarehouse, 'id'>>(
    warehouseCollection: Type[],
    ...warehousesToCheck: (Type | null | undefined)[]
  ): Type[] {
    const warehouses: Type[] = warehousesToCheck.filter(isPresent);
    if (warehouses.length > 0) {
      const warehouseCollectionIdentifiers = warehouseCollection.map(warehouseItem => this.getWarehouseIdentifier(warehouseItem)!);
      const warehousesToAdd = warehouses.filter(warehouseItem => {
        const warehouseIdentifier = this.getWarehouseIdentifier(warehouseItem);
        if (warehouseCollectionIdentifiers.includes(warehouseIdentifier)) {
          return false;
        }
        warehouseCollectionIdentifiers.push(warehouseIdentifier);
        return true;
      });
      return [...warehousesToAdd, ...warehouseCollection];
    }
    return warehouseCollection;
  }

  protected convertDateFromClient<T extends IWarehouse | NewWarehouse | PartialUpdateWarehouse>(warehouse: T): RestOf<T> {
    return {
      ...warehouse,
      createdAt: warehouse.createdAt?.toJSON() ?? null,
      updatedAt: warehouse.updatedAt?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restWarehouse: RestWarehouse): IWarehouse {
    return {
      ...restWarehouse,
      createdAt: restWarehouse.createdAt ? dayjs(restWarehouse.createdAt) : undefined,
      updatedAt: restWarehouse.updatedAt ? dayjs(restWarehouse.updatedAt) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestWarehouse>): HttpResponse<IWarehouse> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestWarehouse[]>): HttpResponse<IWarehouse[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
