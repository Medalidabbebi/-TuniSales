import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { ISwap, NewSwap } from '../swap.model';

export type PartialUpdateSwap = Partial<ISwap> & Pick<ISwap, 'id'>;

type RestOf<T extends ISwap | NewSwap> = Omit<T, 'createdAt' | 'resolvedAt' | 'updatedAt'> & {
  createdAt?: string | null;
  resolvedAt?: string | null;
  updatedAt?: string | null;
};

export type RestSwap = RestOf<ISwap>;

export type NewRestSwap = RestOf<NewSwap>;

export type PartialUpdateRestSwap = RestOf<PartialUpdateSwap>;

export type EntityResponseType = HttpResponse<ISwap>;
export type EntityArrayResponseType = HttpResponse<ISwap[]>;

@Injectable({ providedIn: 'root' })
export class SwapService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/swaps', 'inventoryservice');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(swap: NewSwap): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(swap);
    return this.http.post<RestSwap>(this.resourceUrl, copy, { observe: 'response' }).pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(swap: ISwap): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(swap);
    return this.http
      .put<RestSwap>(`${this.resourceUrl}/${this.getSwapIdentifier(swap)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(swap: PartialUpdateSwap): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(swap);
    return this.http
      .patch<RestSwap>(`${this.resourceUrl}/${this.getSwapIdentifier(swap)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestSwap>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestSwap[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getSwapIdentifier(swap: Pick<ISwap, 'id'>): number {
    return swap.id;
  }

  compareSwap(o1: Pick<ISwap, 'id'> | null, o2: Pick<ISwap, 'id'> | null): boolean {
    return o1 && o2 ? this.getSwapIdentifier(o1) === this.getSwapIdentifier(o2) : o1 === o2;
  }

  addSwapToCollectionIfMissing<Type extends Pick<ISwap, 'id'>>(
    swapCollection: Type[],
    ...swapsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const swaps: Type[] = swapsToCheck.filter(isPresent);
    if (swaps.length > 0) {
      const swapCollectionIdentifiers = swapCollection.map(swapItem => this.getSwapIdentifier(swapItem)!);
      const swapsToAdd = swaps.filter(swapItem => {
        const swapIdentifier = this.getSwapIdentifier(swapItem);
        if (swapCollectionIdentifiers.includes(swapIdentifier)) {
          return false;
        }
        swapCollectionIdentifiers.push(swapIdentifier);
        return true;
      });
      return [...swapsToAdd, ...swapCollection];
    }
    return swapCollection;
  }

  protected convertDateFromClient<T extends ISwap | NewSwap | PartialUpdateSwap>(swap: T): RestOf<T> {
    return {
      ...swap,
      createdAt: swap.createdAt?.toJSON() ?? null,
      resolvedAt: swap.resolvedAt?.toJSON() ?? null,
      updatedAt: swap.updatedAt?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restSwap: RestSwap): ISwap {
    return {
      ...restSwap,
      createdAt: restSwap.createdAt ? dayjs(restSwap.createdAt) : undefined,
      resolvedAt: restSwap.resolvedAt ? dayjs(restSwap.resolvedAt) : undefined,
      updatedAt: restSwap.updatedAt ? dayjs(restSwap.updatedAt) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestSwap>): HttpResponse<ISwap> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestSwap[]>): HttpResponse<ISwap[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
