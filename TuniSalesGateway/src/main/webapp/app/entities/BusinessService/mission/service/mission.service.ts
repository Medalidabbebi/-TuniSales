import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IMission, NewMission } from '../mission.model';

export type PartialUpdateMission = Partial<IMission> & Pick<IMission, 'id'>;

type RestOf<T extends IMission | NewMission> = Omit<T, 'missionDate' | 'createdAt' | 'updatedAt'> & {
  missionDate?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type RestMission = RestOf<IMission>;

export type NewRestMission = RestOf<NewMission>;

export type PartialUpdateRestMission = RestOf<PartialUpdateMission>;

export type EntityResponseType = HttpResponse<IMission>;
export type EntityArrayResponseType = HttpResponse<IMission[]>;

@Injectable({ providedIn: 'root' })
export class MissionService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/missions', 'businessservice');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(mission: NewMission): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(mission);
    return this.http
      .post<RestMission>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(mission: IMission): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(mission);
    return this.http
      .put<RestMission>(`${this.resourceUrl}/${this.getMissionIdentifier(mission)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(mission: PartialUpdateMission): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(mission);
    return this.http
      .patch<RestMission>(`${this.resourceUrl}/${this.getMissionIdentifier(mission)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestMission>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestMission[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getMissionIdentifier(mission: Pick<IMission, 'id'>): number {
    return mission.id;
  }

  compareMission(o1: Pick<IMission, 'id'> | null, o2: Pick<IMission, 'id'> | null): boolean {
    return o1 && o2 ? this.getMissionIdentifier(o1) === this.getMissionIdentifier(o2) : o1 === o2;
  }

  addMissionToCollectionIfMissing<Type extends Pick<IMission, 'id'>>(
    missionCollection: Type[],
    ...missionsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const missions: Type[] = missionsToCheck.filter(isPresent);
    if (missions.length > 0) {
      const missionCollectionIdentifiers = missionCollection.map(missionItem => this.getMissionIdentifier(missionItem)!);
      const missionsToAdd = missions.filter(missionItem => {
        const missionIdentifier = this.getMissionIdentifier(missionItem);
        if (missionCollectionIdentifiers.includes(missionIdentifier)) {
          return false;
        }
        missionCollectionIdentifiers.push(missionIdentifier);
        return true;
      });
      return [...missionsToAdd, ...missionCollection];
    }
    return missionCollection;
  }

  protected convertDateFromClient<T extends IMission | NewMission | PartialUpdateMission>(mission: T): RestOf<T> {
    return {
      ...mission,
      missionDate: mission.missionDate?.toJSON() ?? null,
      createdAt: mission.createdAt?.toJSON() ?? null,
      updatedAt: mission.updatedAt?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restMission: RestMission): IMission {
    return {
      ...restMission,
      missionDate: restMission.missionDate ? dayjs(restMission.missionDate) : undefined,
      createdAt: restMission.createdAt ? dayjs(restMission.createdAt) : undefined,
      updatedAt: restMission.updatedAt ? dayjs(restMission.updatedAt) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestMission>): HttpResponse<IMission> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestMission[]>): HttpResponse<IMission[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
