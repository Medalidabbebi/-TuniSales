import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { IObjective } from '../objective.model';
import { sampleWithRequiredData, sampleWithNewData, sampleWithPartialData, sampleWithFullData } from '../objective.test-samples';

import { ObjectiveService, RestObjective } from './objective.service';

const requireRestSample: RestObjective = {
  ...sampleWithRequiredData,
  createdAt: sampleWithRequiredData.createdAt?.toJSON(),
  updatedAt: sampleWithRequiredData.updatedAt?.toJSON(),
};

describe('Objective Service', () => {
  let service: ObjectiveService;
  let httpMock: HttpTestingController;
  let expectedResult: IObjective | IObjective[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    expectedResult = null;
    service = TestBed.inject(ObjectiveService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  describe('Service methods', () => {
    it('should find an element', () => {
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.find(123).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should create a Objective', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const objective = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(objective).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a Objective', () => {
      const objective = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(objective).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a Objective', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of Objective', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a Objective', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addObjectiveToCollectionIfMissing', () => {
      it('should add a Objective to an empty array', () => {
        const objective: IObjective = sampleWithRequiredData;
        expectedResult = service.addObjectiveToCollectionIfMissing([], objective);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(objective);
      });

      it('should not add a Objective to an array that contains it', () => {
        const objective: IObjective = sampleWithRequiredData;
        const objectiveCollection: IObjective[] = [
          {
            ...objective,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addObjectiveToCollectionIfMissing(objectiveCollection, objective);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a Objective to an array that doesn't contain it", () => {
        const objective: IObjective = sampleWithRequiredData;
        const objectiveCollection: IObjective[] = [sampleWithPartialData];
        expectedResult = service.addObjectiveToCollectionIfMissing(objectiveCollection, objective);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(objective);
      });

      it('should add only unique Objective to an array', () => {
        const objectiveArray: IObjective[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const objectiveCollection: IObjective[] = [sampleWithRequiredData];
        expectedResult = service.addObjectiveToCollectionIfMissing(objectiveCollection, ...objectiveArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const objective: IObjective = sampleWithRequiredData;
        const objective2: IObjective = sampleWithPartialData;
        expectedResult = service.addObjectiveToCollectionIfMissing([], objective, objective2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(objective);
        expect(expectedResult).toContain(objective2);
      });

      it('should accept null and undefined values', () => {
        const objective: IObjective = sampleWithRequiredData;
        expectedResult = service.addObjectiveToCollectionIfMissing([], null, objective, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(objective);
      });

      it('should return initial array if no Objective is added', () => {
        const objectiveCollection: IObjective[] = [sampleWithRequiredData];
        expectedResult = service.addObjectiveToCollectionIfMissing(objectiveCollection, undefined, null);
        expect(expectedResult).toEqual(objectiveCollection);
      });
    });

    describe('compareObjective', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareObjective(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: 123 };
        const entity2 = null;

        const compareResult1 = service.compareObjective(entity1, entity2);
        const compareResult2 = service.compareObjective(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 456 };

        const compareResult1 = service.compareObjective(entity1, entity2);
        const compareResult2 = service.compareObjective(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 123 };

        const compareResult1 = service.compareObjective(entity1, entity2);
        const compareResult2 = service.compareObjective(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
