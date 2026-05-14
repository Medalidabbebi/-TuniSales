import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IObjective, NewObjective } from '../objective.model';

export type PartialUpdateObjective = Partial<IObjective> & Pick<IObjective, 'id'>;

type RestOf<T extends IObjective | NewObjective> = Omit<T, 'createdAt' | 'updatedAt'> & {
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type RestObjective = RestOf<IObjective>;

export type NewRestObjective = RestOf<NewObjective>;

export type PartialUpdateRestObjective = RestOf<PartialUpdateObjective>;

export type EntityResponseType = HttpResponse<IObjective>;
export type EntityArrayResponseType = HttpResponse<IObjective[]>;

@Injectable({ providedIn: 'root' })
export class ObjectiveService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/objectives', 'platformservice');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(objective: NewObjective): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(objective);
    return this.http
      .post<RestObjective>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(objective: IObjective): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(objective);
    return this.http
      .put<RestObjective>(`${this.resourceUrl}/${this.getObjectiveIdentifier(objective)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(objective: PartialUpdateObjective): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(objective);
    return this.http
      .patch<RestObjective>(`${this.resourceUrl}/${this.getObjectiveIdentifier(objective)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestObjective>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestObjective[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getObjectiveIdentifier(objective: Pick<IObjective, 'id'>): number {
    return objective.id;
  }

  compareObjective(o1: Pick<IObjective, 'id'> | null, o2: Pick<IObjective, 'id'> | null): boolean {
    return o1 && o2 ? this.getObjectiveIdentifier(o1) === this.getObjectiveIdentifier(o2) : o1 === o2;
  }

  addObjectiveToCollectionIfMissing<Type extends Pick<IObjective, 'id'>>(
    objectiveCollection: Type[],
    ...objectivesToCheck: (Type | null | undefined)[]
  ): Type[] {
    const objectives: Type[] = objectivesToCheck.filter(isPresent);
    if (objectives.length > 0) {
      const objectiveCollectionIdentifiers = objectiveCollection.map(objectiveItem => this.getObjectiveIdentifier(objectiveItem)!);
      const objectivesToAdd = objectives.filter(objectiveItem => {
        const objectiveIdentifier = this.getObjectiveIdentifier(objectiveItem);
        if (objectiveCollectionIdentifiers.includes(objectiveIdentifier)) {
          return false;
        }
        objectiveCollectionIdentifiers.push(objectiveIdentifier);
        return true;
      });
      return [...objectivesToAdd, ...objectiveCollection];
    }
    return objectiveCollection;
  }

  protected convertDateFromClient<T extends IObjective | NewObjective | PartialUpdateObjective>(objective: T): RestOf<T> {
    return {
      ...objective,
      createdAt: objective.createdAt?.toJSON() ?? null,
      updatedAt: objective.updatedAt?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restObjective: RestObjective): IObjective {
    return {
      ...restObjective,
      createdAt: restObjective.createdAt ? dayjs(restObjective.createdAt) : undefined,
      updatedAt: restObjective.updatedAt ? dayjs(restObjective.updatedAt) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestObjective>): HttpResponse<IObjective> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestObjective[]>): HttpResponse<IObjective[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
