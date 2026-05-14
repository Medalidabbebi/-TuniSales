import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IPriceList, NewPriceList } from '../price-list.model';

export type PartialUpdatePriceList = Partial<IPriceList> & Pick<IPriceList, 'id'>;

type RestOf<T extends IPriceList | NewPriceList> = Omit<T, 'validFrom' | 'validTo' | 'createdAt'> & {
  validFrom?: string | null;
  validTo?: string | null;
  createdAt?: string | null;
};

export type RestPriceList = RestOf<IPriceList>;

export type NewRestPriceList = RestOf<NewPriceList>;

export type PartialUpdateRestPriceList = RestOf<PartialUpdatePriceList>;

export type EntityResponseType = HttpResponse<IPriceList>;
export type EntityArrayResponseType = HttpResponse<IPriceList[]>;

@Injectable({ providedIn: 'root' })
export class PriceListService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/price-lists', 'businessservice');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(priceList: NewPriceList): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(priceList);
    return this.http
      .post<RestPriceList>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(priceList: IPriceList): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(priceList);
    return this.http
      .put<RestPriceList>(`${this.resourceUrl}/${this.getPriceListIdentifier(priceList)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(priceList: PartialUpdatePriceList): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(priceList);
    return this.http
      .patch<RestPriceList>(`${this.resourceUrl}/${this.getPriceListIdentifier(priceList)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestPriceList>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestPriceList[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getPriceListIdentifier(priceList: Pick<IPriceList, 'id'>): number {
    return priceList.id;
  }

  comparePriceList(o1: Pick<IPriceList, 'id'> | null, o2: Pick<IPriceList, 'id'> | null): boolean {
    return o1 && o2 ? this.getPriceListIdentifier(o1) === this.getPriceListIdentifier(o2) : o1 === o2;
  }

  addPriceListToCollectionIfMissing<Type extends Pick<IPriceList, 'id'>>(
    priceListCollection: Type[],
    ...priceListsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const priceLists: Type[] = priceListsToCheck.filter(isPresent);
    if (priceLists.length > 0) {
      const priceListCollectionIdentifiers = priceListCollection.map(priceListItem => this.getPriceListIdentifier(priceListItem)!);
      const priceListsToAdd = priceLists.filter(priceListItem => {
        const priceListIdentifier = this.getPriceListIdentifier(priceListItem);
        if (priceListCollectionIdentifiers.includes(priceListIdentifier)) {
          return false;
        }
        priceListCollectionIdentifiers.push(priceListIdentifier);
        return true;
      });
      return [...priceListsToAdd, ...priceListCollection];
    }
    return priceListCollection;
  }

  protected convertDateFromClient<T extends IPriceList | NewPriceList | PartialUpdatePriceList>(priceList: T): RestOf<T> {
    return {
      ...priceList,
      validFrom: priceList.validFrom?.toJSON() ?? null,
      validTo: priceList.validTo?.toJSON() ?? null,
      createdAt: priceList.createdAt?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restPriceList: RestPriceList): IPriceList {
    return {
      ...restPriceList,
      validFrom: restPriceList.validFrom ? dayjs(restPriceList.validFrom) : undefined,
      validTo: restPriceList.validTo ? dayjs(restPriceList.validTo) : undefined,
      createdAt: restPriceList.createdAt ? dayjs(restPriceList.createdAt) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestPriceList>): HttpResponse<IPriceList> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestPriceList[]>): HttpResponse<IPriceList[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
