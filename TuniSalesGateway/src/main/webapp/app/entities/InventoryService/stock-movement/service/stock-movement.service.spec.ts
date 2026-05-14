import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { IStockMovement } from '../stock-movement.model';
import { sampleWithRequiredData, sampleWithNewData, sampleWithPartialData, sampleWithFullData } from '../stock-movement.test-samples';

import { StockMovementService, RestStockMovement } from './stock-movement.service';

const requireRestSample: RestStockMovement = {
  ...sampleWithRequiredData,
  createdAt: sampleWithRequiredData.createdAt?.toJSON(),
};

describe('StockMovement Service', () => {
  let service: StockMovementService;
  let httpMock: HttpTestingController;
  let expectedResult: IStockMovement | IStockMovement[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    expectedResult = null;
    service = TestBed.inject(StockMovementService);
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

    it('should create a StockMovement', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const stockMovement = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(stockMovement).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a StockMovement', () => {
      const stockMovement = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(stockMovement).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a StockMovement', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of StockMovement', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a StockMovement', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addStockMovementToCollectionIfMissing', () => {
      it('should add a StockMovement to an empty array', () => {
        const stockMovement: IStockMovement = sampleWithRequiredData;
        expectedResult = service.addStockMovementToCollectionIfMissing([], stockMovement);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(stockMovement);
      });

      it('should not add a StockMovement to an array that contains it', () => {
        const stockMovement: IStockMovement = sampleWithRequiredData;
        const stockMovementCollection: IStockMovement[] = [
          {
            ...stockMovement,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addStockMovementToCollectionIfMissing(stockMovementCollection, stockMovement);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a StockMovement to an array that doesn't contain it", () => {
        const stockMovement: IStockMovement = sampleWithRequiredData;
        const stockMovementCollection: IStockMovement[] = [sampleWithPartialData];
        expectedResult = service.addStockMovementToCollectionIfMissing(stockMovementCollection, stockMovement);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(stockMovement);
      });

      it('should add only unique StockMovement to an array', () => {
        const stockMovementArray: IStockMovement[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const stockMovementCollection: IStockMovement[] = [sampleWithRequiredData];
        expectedResult = service.addStockMovementToCollectionIfMissing(stockMovementCollection, ...stockMovementArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const stockMovement: IStockMovement = sampleWithRequiredData;
        const stockMovement2: IStockMovement = sampleWithPartialData;
        expectedResult = service.addStockMovementToCollectionIfMissing([], stockMovement, stockMovement2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(stockMovement);
        expect(expectedResult).toContain(stockMovement2);
      });

      it('should accept null and undefined values', () => {
        const stockMovement: IStockMovement = sampleWithRequiredData;
        expectedResult = service.addStockMovementToCollectionIfMissing([], null, stockMovement, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(stockMovement);
      });

      it('should return initial array if no StockMovement is added', () => {
        const stockMovementCollection: IStockMovement[] = [sampleWithRequiredData];
        expectedResult = service.addStockMovementToCollectionIfMissing(stockMovementCollection, undefined, null);
        expect(expectedResult).toEqual(stockMovementCollection);
      });
    });

    describe('compareStockMovement', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareStockMovement(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: 123 };
        const entity2 = null;

        const compareResult1 = service.compareStockMovement(entity1, entity2);
        const compareResult2 = service.compareStockMovement(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 456 };

        const compareResult1 = service.compareStockMovement(entity1, entity2);
        const compareResult2 = service.compareStockMovement(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 123 };

        const compareResult1 = service.compareStockMovement(entity1, entity2);
        const compareResult2 = service.compareStockMovement(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
