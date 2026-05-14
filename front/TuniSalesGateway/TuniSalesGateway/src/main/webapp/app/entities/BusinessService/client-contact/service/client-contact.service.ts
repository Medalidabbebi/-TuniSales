import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IClientContact, NewClientContact } from '../client-contact.model';

export type PartialUpdateClientContact = Partial<IClientContact> & Pick<IClientContact, 'id'>;

type RestOf<T extends IClientContact | NewClientContact> = Omit<T, 'createdAt'> & {
  createdAt?: string | null;
};

export type RestClientContact = RestOf<IClientContact>;

export type NewRestClientContact = RestOf<NewClientContact>;

export type PartialUpdateRestClientContact = RestOf<PartialUpdateClientContact>;

export type EntityResponseType = HttpResponse<IClientContact>;
export type EntityArrayResponseType = HttpResponse<IClientContact[]>;

@Injectable({ providedIn: 'root' })
export class ClientContactService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/client-contacts', 'businessservice');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(clientContact: NewClientContact): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(clientContact);
    return this.http
      .post<RestClientContact>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(clientContact: IClientContact): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(clientContact);
    return this.http
      .put<RestClientContact>(`${this.resourceUrl}/${this.getClientContactIdentifier(clientContact)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(clientContact: PartialUpdateClientContact): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(clientContact);
    return this.http
      .patch<RestClientContact>(`${this.resourceUrl}/${this.getClientContactIdentifier(clientContact)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestClientContact>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestClientContact[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getClientContactIdentifier(clientContact: Pick<IClientContact, 'id'>): number {
    return clientContact.id;
  }

  compareClientContact(o1: Pick<IClientContact, 'id'> | null, o2: Pick<IClientContact, 'id'> | null): boolean {
    return o1 && o2 ? this.getClientContactIdentifier(o1) === this.getClientContactIdentifier(o2) : o1 === o2;
  }

  addClientContactToCollectionIfMissing<Type extends Pick<IClientContact, 'id'>>(
    clientContactCollection: Type[],
    ...clientContactsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const clientContacts: Type[] = clientContactsToCheck.filter(isPresent);
    if (clientContacts.length > 0) {
      const clientContactCollectionIdentifiers = clientContactCollection.map(
        clientContactItem => this.getClientContactIdentifier(clientContactItem)!
      );
      const clientContactsToAdd = clientContacts.filter(clientContactItem => {
        const clientContactIdentifier = this.getClientContactIdentifier(clientContactItem);
        if (clientContactCollectionIdentifiers.includes(clientContactIdentifier)) {
          return false;
        }
        clientContactCollectionIdentifiers.push(clientContactIdentifier);
        return true;
      });
      return [...clientContactsToAdd, ...clientContactCollection];
    }
    return clientContactCollection;
  }

  protected convertDateFromClient<T extends IClientContact | NewClientContact | PartialUpdateClientContact>(clientContact: T): RestOf<T> {
    return {
      ...clientContact,
      createdAt: clientContact.createdAt?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restClientContact: RestClientContact): IClientContact {
    return {
      ...restClientContact,
      createdAt: restClientContact.createdAt ? dayjs(restClientContact.createdAt) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestClientContact>): HttpResponse<IClientContact> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestClientContact[]>): HttpResponse<IClientContact[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
