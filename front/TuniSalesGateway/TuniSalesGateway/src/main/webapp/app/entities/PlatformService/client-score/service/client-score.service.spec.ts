import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { IClientScore } from '../client-score.model';
import { sampleWithRequiredData, sampleWithNewData, sampleWithPartialData, sampleWithFullData } from '../client-score.test-samples';

import { ClientScoreService, RestClientScore } from './client-score.service';

const requireRestSample: RestClientScore = {
  ...sampleWithRequiredData,
  calculatedAt: sampleWithRequiredData.calculatedAt?.toJSON(),
};

describe('ClientScore Service', () => {
  let service: ClientScoreService;
  let httpMock: HttpTestingController;
  let expectedResult: IClientScore | IClientScore[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    expectedResult = null;
    service = TestBed.inject(ClientScoreService);
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

    it('should create a ClientScore', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const clientScore = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(clientScore).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a ClientScore', () => {
      const clientScore = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(clientScore).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a ClientScore', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of ClientScore', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a ClientScore', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addClientScoreToCollectionIfMissing', () => {
      it('should add a ClientScore to an empty array', () => {
        const clientScore: IClientScore = sampleWithRequiredData;
        expectedResult = service.addClientScoreToCollectionIfMissing([], clientScore);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(clientScore);
      });

      it('should not add a ClientScore to an array that contains it', () => {
        const clientScore: IClientScore = sampleWithRequiredData;
        const clientScoreCollection: IClientScore[] = [
          {
            ...clientScore,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addClientScoreToCollectionIfMissing(clientScoreCollection, clientScore);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a ClientScore to an array that doesn't contain it", () => {
        const clientScore: IClientScore = sampleWithRequiredData;
        const clientScoreCollection: IClientScore[] = [sampleWithPartialData];
        expectedResult = service.addClientScoreToCollectionIfMissing(clientScoreCollection, clientScore);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(clientScore);
      });

      it('should add only unique ClientScore to an array', () => {
        const clientScoreArray: IClientScore[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const clientScoreCollection: IClientScore[] = [sampleWithRequiredData];
        expectedResult = service.addClientScoreToCollectionIfMissing(clientScoreCollection, ...clientScoreArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const clientScore: IClientScore = sampleWithRequiredData;
        const clientScore2: IClientScore = sampleWithPartialData;
        expectedResult = service.addClientScoreToCollectionIfMissing([], clientScore, clientScore2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(clientScore);
        expect(expectedResult).toContain(clientScore2);
      });

      it('should accept null and undefined values', () => {
        const clientScore: IClientScore = sampleWithRequiredData;
        expectedResult = service.addClientScoreToCollectionIfMissing([], null, clientScore, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(clientScore);
      });

      it('should return initial array if no ClientScore is added', () => {
        const clientScoreCollection: IClientScore[] = [sampleWithRequiredData];
        expectedResult = service.addClientScoreToCollectionIfMissing(clientScoreCollection, undefined, null);
        expect(expectedResult).toEqual(clientScoreCollection);
      });
    });

    describe('compareClientScore', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareClientScore(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: 123 };
        const entity2 = null;

        const compareResult1 = service.compareClientScore(entity1, entity2);
        const compareResult2 = service.compareClientScore(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 456 };

        const compareResult1 = service.compareClientScore(entity1, entity2);
        const compareResult2 = service.compareClientScore(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 123 };

        const compareResult1 = service.compareClientScore(entity1, entity2);
        const compareResult2 = service.compareClientScore(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
