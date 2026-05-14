import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { IPerformanceScore } from '../performance-score.model';
import { sampleWithRequiredData, sampleWithNewData, sampleWithPartialData, sampleWithFullData } from '../performance-score.test-samples';

import { PerformanceScoreService, RestPerformanceScore } from './performance-score.service';

const requireRestSample: RestPerformanceScore = {
  ...sampleWithRequiredData,
  calculatedAt: sampleWithRequiredData.calculatedAt?.toJSON(),
};

describe('PerformanceScore Service', () => {
  let service: PerformanceScoreService;
  let httpMock: HttpTestingController;
  let expectedResult: IPerformanceScore | IPerformanceScore[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    expectedResult = null;
    service = TestBed.inject(PerformanceScoreService);
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

    it('should create a PerformanceScore', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const performanceScore = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(performanceScore).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a PerformanceScore', () => {
      const performanceScore = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(performanceScore).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a PerformanceScore', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of PerformanceScore', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a PerformanceScore', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addPerformanceScoreToCollectionIfMissing', () => {
      it('should add a PerformanceScore to an empty array', () => {
        const performanceScore: IPerformanceScore = sampleWithRequiredData;
        expectedResult = service.addPerformanceScoreToCollectionIfMissing([], performanceScore);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(performanceScore);
      });

      it('should not add a PerformanceScore to an array that contains it', () => {
        const performanceScore: IPerformanceScore = sampleWithRequiredData;
        const performanceScoreCollection: IPerformanceScore[] = [
          {
            ...performanceScore,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addPerformanceScoreToCollectionIfMissing(performanceScoreCollection, performanceScore);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a PerformanceScore to an array that doesn't contain it", () => {
        const performanceScore: IPerformanceScore = sampleWithRequiredData;
        const performanceScoreCollection: IPerformanceScore[] = [sampleWithPartialData];
        expectedResult = service.addPerformanceScoreToCollectionIfMissing(performanceScoreCollection, performanceScore);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(performanceScore);
      });

      it('should add only unique PerformanceScore to an array', () => {
        const performanceScoreArray: IPerformanceScore[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const performanceScoreCollection: IPerformanceScore[] = [sampleWithRequiredData];
        expectedResult = service.addPerformanceScoreToCollectionIfMissing(performanceScoreCollection, ...performanceScoreArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const performanceScore: IPerformanceScore = sampleWithRequiredData;
        const performanceScore2: IPerformanceScore = sampleWithPartialData;
        expectedResult = service.addPerformanceScoreToCollectionIfMissing([], performanceScore, performanceScore2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(performanceScore);
        expect(expectedResult).toContain(performanceScore2);
      });

      it('should accept null and undefined values', () => {
        const performanceScore: IPerformanceScore = sampleWithRequiredData;
        expectedResult = service.addPerformanceScoreToCollectionIfMissing([], null, performanceScore, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(performanceScore);
      });

      it('should return initial array if no PerformanceScore is added', () => {
        const performanceScoreCollection: IPerformanceScore[] = [sampleWithRequiredData];
        expectedResult = service.addPerformanceScoreToCollectionIfMissing(performanceScoreCollection, undefined, null);
        expect(expectedResult).toEqual(performanceScoreCollection);
      });
    });

    describe('comparePerformanceScore', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.comparePerformanceScore(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: 123 };
        const entity2 = null;

        const compareResult1 = service.comparePerformanceScore(entity1, entity2);
        const compareResult2 = service.comparePerformanceScore(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 456 };

        const compareResult1 = service.comparePerformanceScore(entity1, entity2);
        const compareResult2 = service.comparePerformanceScore(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 123 };

        const compareResult1 = service.comparePerformanceScore(entity1, entity2);
        const compareResult2 = service.comparePerformanceScore(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
